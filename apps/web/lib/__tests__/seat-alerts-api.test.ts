import { describe, expect, it } from "vitest";
import {
  handleSubscriptionDelete, handleSubscriptionSave, handleTestAlert, handleWatchCreate, handleWatchDelete, handleWatchDone, handleWatchesGet,
  lookupInDeptFile, signWatchToken, verifyWatchToken, type SeatApiDeps,
} from "../seat-alerts/api";
import type { Watch } from "../seat-alerts/logic";

const TERM = "202701";
const SECRET = "s3cret";
const now = new Date("2026-10-09T12:00:00Z");
const ID1 = "11111111-1111-4111-8111-111111111111";
const ID2 = "22222222-2222-4222-8222-222222222222";
const watch = (p: Partial<Watch> = {}): Watch => ({ id: ID1, userId: "u1", term: TERM, courseId: "CMSC351", sectionId: "0201", lastAlertAt: null, doneAt: null, ...p });

function setup(over: { watches?: Watch[]; user?: { id: string; email: string } | null; term?: string | null; lookup?: SeatApiDeps["lookup"]; states?: Map<string, never>; vapid?: boolean; push?: SeatApiDeps["push"]; subs?: { userId: string; endpoint: string; p256dh: string; auth: string }[] } = {}) {
  const db = { watches: [...(over.watches ?? [])], created: [] as Watch[], done: [] as string[], deleted: [] as string[], upserts: [] as unknown[], subDeleted: [] as unknown[], goneDeleted: [] as string[], pushed: [] as string[] };
  const deps: SeatApiDeps = {
    getUser: async (t) => (t === "good" ? (over.user === undefined ? { id: "u1", email: "a@b.c" } : over.user) : null),
    term: async () => (over.term === undefined ? TERM : over.term),
    lookup: over.lookup ?? (async () => ({ courseExists: true, sectionOpen: 0 })),
    store: {
      listWatches: async (u) => db.watches.filter((w) => w.userId === u),
      getWatch: async (id) => db.watches.find((w) => w.id === id) ?? null,
      createWatch: async (u, term, courseId, sectionId) => { const w = watch({ id: ID2, userId: u, term, courseId, sectionId }); db.created.push(w); return w; },
      markDone: async (id) => { db.done.push(id); },
      deleteWatch: async (id) => { db.deleted.push(id); },
      getStates: async () => (over.states ?? new Map()) as never,
      upsertSubscription: async (u, s) => { db.upserts.push({ u, s }); },
      deleteSubscriptionFor: async (u, e) => { db.subDeleted.push({ u, e }); },
      subscriptionsFor: async () => over.subs ?? [],
      deleteSubscription: async (e) => { db.goneDeleted.push(e); },
    },
    push: over.push ?? (async (s) => { db.pushed.push(s.endpoint); return "ok"; }),
    vapidConfigured: () => over.vapid ?? true,
    secret: SECRET,
    now: () => now,
  };
  return { deps, db };
}
const req = (method: string, body?: unknown, auth: string | null = "Bearer good", url = "https://x/api/seat-alerts/y") =>
  new Request(url, { method, headers: { ...(auth ? { authorization: auth } : {}), "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const j = async (r: Response) => r.json() as Promise<any>;

describe("auth shared by every route", () => {
  it("401 without or with a bad token, 503 when auth is down, no-store", async () => {
    const { deps } = setup();
    for (const r of [await handleWatchesGet(req("GET", undefined, null), deps), await handleWatchesGet(req("GET", undefined, "Bearer bad"), deps)]) {
      expect(r.status).toBe(401);
      expect(r.headers.get("cache-control")).toBe("no-store");
    }
    const down = { ...deps, getUser: async () => { throw new Error("x"); } };
    expect((await handleWatchCreate(req("POST", {}), down)).status).toBe(503);
  });
  it("503 when there is no current term", async () => {
    const { deps } = setup({ term: null });
    expect((await handleWatchesGet(req("GET"), deps)).status).toBe(503);
  });
});

describe("GET watches", () => {
  it("returns this term's active watches with status, done ones, and the count of ended older-term ones", async () => {
    const states = new Map([["CMSC351-0201", { courseId: "CMSC351", sectionId: "0201", open: 0, waitlist: 4, holdfile: 0, checkedAt: "t" }]]);
    const { deps } = setup({
      watches: [watch(), watch({ id: ID2, sectionId: null }), watch({ id: "d", doneAt: "x" }), watch({ id: "o", term: "202608" }), watch({ id: "o2", term: "202608", doneAt: "x" }), watch({ id: "z", userId: "u2" })],
      states: states as never,
    });
    const r = await handleWatchesGet(req("GET"), deps);
    expect(r.status).toBe(200);
    const b = await j(r);
    expect(b.term).toBe(TERM);
    expect(b.watches.map((w: Watch) => w.id)).toEqual([ID1, ID2]);
    expect(b.watches[0].status).toEqual({ open: 0, waitlist: 4, checkedAt: "t" });
    expect(b.watches[1].status).toBeNull();
    expect(b.done.map((w: Watch) => w.id)).toEqual(["d"]);
    expect(b.ended).toBe(1);
  });
});

describe("POST watches", () => {
  it("400 for a bad body or format", async () => {
    const { deps } = setup();
    for (const body of [{}, { courseId: "cmsc351", sectionId: null }, { courseId: "CMSC351", sectionId: "toolongsection" }, { courseId: "CMSC351" }, "x"]) {
      expect((await handleWatchCreate(req("POST", body), deps)).status).toBe(400);
    }
  });
  it("404 for a course or section not in the current term", async () => {
    const a = setup({ lookup: async () => ({ courseExists: false, sectionOpen: null }) });
    expect((await handleWatchCreate(req("POST", { courseId: "CMSC351", sectionId: null }), a.deps)).status).toBe(404);
    const b = setup({ lookup: async () => ({ courseExists: true, sectionOpen: null }) });
    expect((await handleWatchCreate(req("POST", { courseId: "CMSC351", sectionId: "0999" }), b.deps)).status).toBe(404);
  });
  it("creates a section watch on a full section", async () => {
    const { deps, db } = setup();
    const r = await handleWatchCreate(req("POST", { courseId: "CMSC351", sectionId: "0201" }), deps);
    expect(r.status).toBe(201);
    expect((await j(r)).watch.id).toBe(ID2);
    expect(db.created).toHaveLength(1);
    expect(db.created[0]).toMatchObject({ userId: "u1", term: TERM, courseId: "CMSC351", sectionId: "0201" });
  });
  it("creates an any-section watch even when some section is open", async () => {
    const { deps } = setup({ lookup: async () => ({ courseExists: true, sectionOpen: null }) });
    expect((await handleWatchCreate(req("POST", { courseId: "CMSC351", sectionId: null }), deps)).status).toBe(201);
  });
  it("409 open-now using seat_state first", async () => {
    const states = new Map([["CMSC351-0201", { courseId: "CMSC351", sectionId: "0201", open: 2, waitlist: 0, holdfile: 0, checkedAt: "t" }]]);
    const { deps, db } = setup({ states: states as never, lookup: async () => ({ courseExists: true, sectionOpen: 0 }) });
    const r = await handleWatchCreate(req("POST", { courseId: "CMSC351", sectionId: "0201" }), deps);
    expect(r.status).toBe(409);
    expect(await j(r)).toEqual({ error: "open-now" });
    expect(db.created).toHaveLength(0);
  });
  it("409 open-now from the snapshot when there is no seat_state", async () => {
    const { deps } = setup({ lookup: async () => ({ courseExists: true, sectionOpen: 3 }) });
    expect((await j(await handleWatchCreate(req("POST", { courseId: "CMSC351", sectionId: "0201" }), deps))).error).toBe("open-now");
  });
  it("seat_state wins over a stale snapshot that says open", async () => {
    const states = new Map([["CMSC351-0201", { courseId: "CMSC351", sectionId: "0201", open: 0, waitlist: 0, holdfile: 0, checkedAt: "t" }]]);
    const { deps } = setup({ states: states as never, lookup: async () => ({ courseExists: true, sectionOpen: 5 }) });
    expect((await handleWatchCreate(req("POST", { courseId: "CMSC351", sectionId: "0201" }), deps)).status).toBe(201);
  });
  it("409 limit at 20 active watches this term", async () => {
    const many = Array.from({ length: 20 }, (_, i) => watch({ id: `w${i}`, courseId: `CMSC${100 + i}` }));
    const { deps, db } = setup({ watches: many });
    const r = await handleWatchCreate(req("POST", { courseId: "CMSC351", sectionId: "0201" }), deps);
    expect(r.status).toBe(409);
    expect(await j(r)).toEqual({ error: "limit" });
    expect(db.created).toHaveLength(0);
  });
  it("duplicate returns 200 with the existing watch, even at the limit", async () => {
    const many = [watch(), ...Array.from({ length: 19 }, (_, i) => watch({ id: `w${i}`, courseId: `CMSC${100 + i}` }))];
    const { deps, db } = setup({ watches: many });
    const r = await handleWatchCreate(req("POST", { courseId: "CMSC351", sectionId: "0201" }), deps);
    expect(r.status).toBe(200);
    expect((await j(r)).watch.id).toBe(ID1);
    expect(db.created).toHaveLength(0);
  });
});

describe("done and remove", () => {
  it("done marks the owner's watch", async () => {
    const { deps, db } = setup({ watches: [watch()] });
    const r = await handleWatchDone(req("POST"), ID1, deps);
    expect(r.status).toBe(200);
    expect(db.done).toEqual([ID1]);
  });
  it("another user's watch, an unknown id and a malformed id are 404", async () => {
    const { deps, db } = setup({ watches: [watch({ userId: "u2" })] });
    expect((await handleWatchDone(req("POST"), ID1, deps)).status).toBe(404);
    expect((await handleWatchDelete(req("DELETE"), ID1, deps)).status).toBe(404);
    expect((await handleWatchDone(req("POST"), ID2, deps)).status).toBe(404);
    expect((await handleWatchDone(req("POST"), "not-a-uuid", deps)).status).toBe(404);
    expect(db.done).toEqual([]);
    expect(db.deleted).toEqual([]);
  });
  it("remove deletes the owner's watch", async () => {
    const { deps, db } = setup({ watches: [watch()] });
    expect((await handleWatchDelete(req("DELETE"), ID1, deps)).status).toBe(200);
    expect(db.deleted).toEqual([ID1]);
  });
  it("done with no credentials is 401", async () => {
    const { deps } = setup({ watches: [watch()] });
    expect((await handleWatchDone(req("POST", undefined, null), ID1, deps)).status).toBe(401);
  });
});

describe("signed 'I got it' token", () => {
  it("accepts a valid token without a bearer header", async () => {
    const { deps, db } = setup({ watches: [watch({ userId: "other" })] });
    const token = signWatchToken(ID1, SECRET, now);
    const r = await handleWatchDone(req("POST", undefined, null, `https://x/done?token=${encodeURIComponent(token)}`), ID1, deps);
    expect(r.status).toBe(200);
    expect(db.done).toEqual([ID1]);
  });
  it("rejects a token for a different watch id", async () => {
    const { deps, db } = setup({ watches: [watch()] });
    const token = signWatchToken(ID2, SECRET, now);
    const r = await handleWatchDone(req("POST", undefined, null, `https://x/done?token=${encodeURIComponent(token)}`), ID1, deps);
    expect(r.status).toBe(401);
    expect(db.done).toEqual([]);
  });
  it("rejects an expired token and a tampered one", async () => {
    const { deps } = setup({ watches: [watch()] });
    const old = signWatchToken(ID1, SECRET, new Date(now.getTime() - 8 * 86_400_000));
    expect((await handleWatchDone(req("POST", undefined, null, `https://x/done?token=${old}`), ID1, deps)).status).toBe(401);
    const t = signWatchToken(ID1, SECRET, now);
    const bad = `${t.slice(0, -1)}${t.endsWith("0") ? "1" : "0"}`;
    expect((await handleWatchDone(req("POST", undefined, null, `https://x/done?token=${bad}`), ID1, deps)).status).toBe(401);
  });
  it("verify: valid within 7 days, expired after, wrong secret, garbage", () => {
    const t = signWatchToken(ID1, SECRET, now);
    expect(verifyWatchToken(ID1, t, SECRET, new Date(now.getTime() + 6 * 86_400_000))).toBe(true);
    expect(verifyWatchToken(ID1, t, SECRET, new Date(now.getTime() + 8 * 86_400_000))).toBe(false);
    expect(verifyWatchToken(ID1, t, "other", now)).toBe(false);
    expect(verifyWatchToken(ID1, "garbage", SECRET, now)).toBe(false);
  });
  it("a token with no CRON_SECRET configured never verifies", async () => {
    const { deps } = setup({ watches: [watch()] });
    const t = signWatchToken(ID1, SECRET, now);
    const r = await handleWatchDone(req("POST", undefined, null, `https://x/done?token=${encodeURIComponent(t)}`), ID1, { ...deps, secret: undefined });
    expect(r.status).toBe(401);
  });
});

describe("subscription", () => {
  const sub = { endpoint: "https://push.example/abc", keys: { p256dh: "k", auth: "a" } };
  it("upserts for the user", async () => {
    const { deps, db } = setup();
    const r = await handleSubscriptionSave(req("POST", sub), deps);
    expect(r.status).toBe(200);
    expect(db.upserts).toEqual([{ u: "u1", s: { endpoint: sub.endpoint, p256dh: "k", auth: "a" } }]);
  });
  it("400 for a bad subscription (non-https, missing keys)", async () => {
    const { deps } = setup();
    for (const b of [{}, { ...sub, endpoint: "http://x" }, { endpoint: sub.endpoint, keys: {} }]) expect((await handleSubscriptionSave(req("POST", b), deps)).status).toBe(400);
  });
  it("401 without a token", async () => {
    const { deps } = setup();
    expect((await handleSubscriptionSave(req("POST", sub, null), deps)).status).toBe(401);
  });
  it("delete removes only the user's endpoint", async () => {
    const { deps, db } = setup();
    expect((await handleSubscriptionDelete(req("DELETE", { endpoint: sub.endpoint }), deps)).status).toBe(200);
    expect(db.subDeleted).toEqual([{ u: "u1", e: sub.endpoint }]);
    expect((await handleSubscriptionDelete(req("DELETE", {}), deps)).status).toBe(400);
  });
});

describe("test alert", () => {
  const subs = [1, 2, 3].map((n) => ({ userId: "u1", endpoint: `https://p/${n}`, p256dh: "k", auth: "a" }));
  it("503 when push is not configured", async () => {
    const { deps } = setup({ vapid: false });
    expect((await handleTestAlert(req("POST"), deps)).status).toBe(503);
  });
  it("sends to every device, counts sent and gone, prunes gone ones", async () => {
    const { deps, db } = setup({ subs, push: async (s) => (s.endpoint.endsWith("/2") ? "gone" : "ok") });
    const r = await handleTestAlert(req("POST"), deps);
    expect(r.status).toBe(200);
    expect(await j(r)).toEqual({ sent: 2, gone: 1 });
    expect(db.goneDeleted).toEqual(["https://p/2"]);
  });
  it("uses the title 'Seat Alerts are on'", async () => {
    const seen: string[] = [];
    const { deps } = setup({ subs: subs.slice(0, 1), push: async (_s, p) => { seen.push(p.title); return "ok"; } });
    await handleTestAlert(req("POST"), deps);
    expect(seen).toEqual(["Seat Alerts are on"]);
  });
  it("no devices gives sent 0", async () => {
    const { deps } = setup();
    expect(await j(await handleTestAlert(req("POST"), deps))).toEqual({ sent: 0, gone: 0 });
  });
});

describe("lookupInDeptFile", () => {
  const file = { v: 1, term: TERM, dept: "CMSC", courses: { CMSC351: { t: "A", cr: [3, 3], s: [["0101", [], 5, 150, 0, 0, "f2f", []], ["0201", [], 0, 40, 2, 0, "f2f", []]] } } };
  it("finds the course, the section and its open count", () => {
    expect(lookupInDeptFile(file, "CMSC351", "0201")).toEqual({ courseExists: true, sectionOpen: 0 });
    expect(lookupInDeptFile(file, "CMSC351", "0101")).toEqual({ courseExists: true, sectionOpen: 5 });
    expect(lookupInDeptFile(file, "CMSC351", "0999")).toEqual({ courseExists: true, sectionOpen: null });
    expect(lookupInDeptFile(file, "CMSC351", null)).toEqual({ courseExists: true, sectionOpen: null });
    expect(lookupInDeptFile(file, "CMSC999", null)).toEqual({ courseExists: false, sectionOpen: null });
    expect(lookupInDeptFile(null, "CMSC351", null)).toEqual({ courseExists: false, sectionOpen: null });
  });
});
