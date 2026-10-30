import { createHash, createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  handleDeviceDelete, handleDeviceRegister, handleWatchCreate, handleWatchDelete, handleWatchDone, handleWatchesGet,
  lookupInDeptFile, parseDeviceToken, signWatchToken, TEST_ALERT, verifyWatchToken, type SeatApiDeps,
} from "../seat-alerts/api";
import type { Watch } from "../seat-alerts/logic";
import type { SendStore } from "../email/rate-limit";

const TERM = "202701";
const SECRET = "s3cret";
const now = new Date("2026-10-09T12:00:00Z");
const ID1 = "11111111-1111-4111-8111-111111111111";
const ID2 = "22222222-2222-4222-8222-222222222222";
const DEV_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const DEV_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const SEC_A = "secretAsecretAsecretAsecretA1234";
const SEC_B = "secretBsecretBsecretBsecretB1234";
const sha = (x: string) => createHash("sha256").update(x).digest("hex");
const AUTH_A = `Device ${DEV_A}.${SEC_A}`;
const watch = (p: Partial<Watch> = {}): Watch => ({ id: ID1, deviceId: DEV_A, term: TERM, courseId: "CMSC351", sectionId: "0201", lastAlertAt: null, doneAt: null, ...p });

type Dev = { id: string; secretHash: string; endpoint: string; p256dh: string; auth: string };

function setup(over: { watches?: Watch[]; term?: string | null; lookup?: SeatApiDeps["lookup"]; states?: Map<string, never>; vapid?: boolean; push?: SeatApiDeps["push"]; devices?: Dev[] } = {}) {
  const db = {
    watches: [...(over.watches ?? [])],
    devices: over.devices ?? [
      { id: DEV_A, secretHash: sha(SEC_A), endpoint: "https://web.push.apple.com/a", p256dh: "k", auth: "a" },
      { id: DEV_B, secretHash: sha(SEC_B), endpoint: "https://web.push.apple.com/b", p256dh: "k", auth: "a" },
    ] as Dev[],
    created: [] as Watch[], done: [] as string[], deleted: [] as string[], pushed: [] as { endpoint: string; title: string; body: string; url: string }[], writes: 0,
  };
  const deps: SeatApiDeps = {
    term: async () => (over.term === undefined ? TERM : over.term),
    lookup: over.lookup ?? (async () => ({ courseExists: true, sectionOpen: 0 })),
    store: {
      listWatches: async (d) => db.watches.filter((w) => w.deviceId === d),
      getWatch: async (id) => db.watches.find((w) => w.id === id) ?? null,
      createWatch: async (d, term, courseId, sectionId) => { const w = watch({ id: ID2, deviceId: d, term, courseId, sectionId }); db.created.push(w); return w; },
      markDone: async (id) => { db.done.push(id); },
      deleteWatch: async (id) => { db.deleted.push(id); },
      getStates: async () => (over.states ?? new Map()) as never,
      createDevice: async ({ secretHash, sub }) => { db.writes++; const id = `cccccccc-cccc-4ccc-8ccc-${String(db.devices.length).padStart(12, "0")}`; db.devices.push({ id, secretHash, ...sub }); return id; },
      getDevice: async (id) => { const d = db.devices.find((x) => x.id === id); return d ? { id: d.id, secretHash: d.secretHash } : null; },
      updateDeviceSub: async (id, sub) => { db.writes++; const d = db.devices.find((x) => x.id === id); if (d) Object.assign(d, sub); },
      deleteDevice: async (id) => { db.writes++; db.devices = db.devices.filter((d) => d.id !== id); db.watches = db.watches.filter((w) => w.deviceId !== id); },
      deleteDeviceByEndpoint: async (e, except) => { db.writes++; const gone = db.devices.filter((d) => d.endpoint === e && d.id !== except).map((d) => d.id); db.devices = db.devices.filter((d) => !gone.includes(d.id)); db.watches = db.watches.filter((w) => !gone.includes(w.deviceId)); },
    },
    push: over.push ?? (async (s, p) => { db.pushed.push({ endpoint: s.endpoint, ...p } as never); return "ok"; }),
    vapidConfigured: () => over.vapid ?? true,
    secret: SECRET,
    now: () => now,
  };
  return { deps, db };
}
const req = (method: string, body?: unknown, auth: string | null = AUTH_A, url = "https://x/api/seat-alerts/y") =>
  new Request(url, { method, headers: { ...(auth ? { authorization: auth } : {}), "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const j = async (r: Response) => r.json() as Promise<any>;

describe("auth shared by every route", () => {
  it("auth: missing header, \"Bearer x\", \"Device nodot\", unknown id, wrong secret, another device's secret -> 401 on GET watches", async () => {
    const { deps } = setup({ watches: [watch(), watch({ id: ID2, deviceId: DEV_B })] });
    const bad: (string | null)[] = [null, "Bearer x", "Device nodot", `Device ${ID1}.${SEC_A}`, `Device ${DEV_A}.wrongsecretwrongsecret`, `Device ${DEV_A}.${SEC_B}`, `Device ${DEV_A}.`];
    for (const a of bad) {
      const r = await handleWatchesGet(req("GET", undefined, a), deps);
      expect(r.status).toBe(401);
      expect(r.headers.get("cache-control")).toBe("no-store");
      expect(await j(r)).toEqual({ error: "unauthorized" });
    }
  });
  it("503 when the store is down during auth", async () => {
    const { deps } = setup();
    const down = { ...deps, store: { ...deps.store, getDevice: async () => { throw new Error("x"); } } };
    expect((await handleWatchCreate(req("POST", {}), down)).status).toBe(503);
  });
  it("503 when there is no current term", async () => {
    const { deps } = setup({ term: null });
    expect((await handleWatchesGet(req("GET"), deps)).status).toBe(503);
  });
  it("parseDeviceToken accepts only 'Device <uuid>.<secret>'", () => {
    expect(parseDeviceToken(AUTH_A)).toEqual({ deviceId: DEV_A, secret: SEC_A });
    expect(parseDeviceToken("Device nodot")).toBeNull();
    expect(parseDeviceToken(null)).toBeNull();
  });
});

describe("GET watches", () => {
  it("returns this term's active watches with status, done ones, and the count of ended older-term ones", async () => {
    const states = new Map([["CMSC351-0201", { courseId: "CMSC351", sectionId: "0201", open: 0, waitlist: 4, holdfile: 0, checkedAt: "t" }]]);
    const { deps } = setup({
      watches: [watch(), watch({ id: ID2, sectionId: null }), watch({ id: "d", doneAt: "x" }), watch({ id: "o", term: "202608" }), watch({ id: "o2", term: "202608", doneAt: "x" }), watch({ id: "z", deviceId: DEV_B })],
      states: states as never,
    });
    const r = await handleWatchesGet(req("GET"), deps);
    expect(r.status).toBe(200);
    const b = await j(r);
    expect(b.term).toBe(TERM);
    expect(b.watches.map((w: Watch) => w.id)).toEqual([ID1, ID2]);
    expect(b.watches[0].status).toEqual({ open: 0, waitlist: 4, checkedAt: "t" });
    expect(b.watches[1].status).toEqual({ open: 0, waitlist: 4, checkedAt: "t" });
    expect(b.done.map((w: Watch) => w.id)).toEqual(["d"]);
    expect(b.ended).toBe(1);
  });

  it("gives an any-section watch the course's totals across its sections, checked at the latest time", async () => {
    const st = (sectionId: string, open: number, waitlist: number, checkedAt: string) => [`CMSC351-${sectionId}`, { courseId: "CMSC351", sectionId, open, waitlist, holdfile: 0, checkedAt }] as const;
    const states = new Map([st("0101", 0, 2, "2026-10-09T11:58:00Z"), st("0201", 3, 0, "2026-10-09T11:59:00Z"), ["CMSC330-0101", { courseId: "CMSC330", sectionId: "0101", open: 9, waitlist: 0, holdfile: 0, checkedAt: "x" }]]);
    const { deps } = setup({ watches: [watch({ sectionId: null }), watch({ id: ID2, courseId: "MATH999", sectionId: null })], states: states as never });
    const b = await j(await handleWatchesGet(req("GET"), deps));
    expect(b.watches[0].status).toEqual({ open: 3, waitlist: 2, checkedAt: "2026-10-09T11:59:00Z" });
    expect(b.watches[1].status).toBeNull();
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
    expect(db.created[0]).toMatchObject({ deviceId: DEV_A, term: TERM, courseId: "CMSC351", sectionId: "0201" });
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
  it("device A's token can't done/delete device B's watch (404); an unknown id and a malformed id are 404", async () => {
    const { deps, db } = setup({ watches: [watch({ deviceId: DEV_B })] });
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
    const { deps, db } = setup({ watches: [watch({ deviceId: DEV_B })] });
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
  it("verify: the token key is derived from CRON_SECRET, so an HMAC made with the raw secret is refused", () => {
    const exp = now.getTime() + 86_400_000;
    const raw = `${exp}.${createHmac("sha256", SECRET).update(`${ID1}.${exp}`).digest("hex")}`;
    expect(verifyWatchToken(ID1, raw, SECRET, now)).toBe(false);
  });
  it("a token with no CRON_SECRET configured never verifies", async () => {
    const { deps } = setup({ watches: [watch()] });
    const t = signWatchToken(ID1, SECRET, now);
    const r = await handleWatchDone(req("POST", undefined, null, `https://x/done?token=${encodeURIComponent(t)}`), ID1, { ...deps, secret: undefined });
    expect(r.status).toBe(401);
  });
});

describe("device registration", () => {
  const SUB = { endpoint: "https://web.push.apple.com/new", keys: { p256dh: "k2", auth: "a2" } };
  it("device create: no token -> 201 with \"<uuid>.<secret>\" token, one test push with TEST_ALERT, secret stored only as sha256", async () => {
    const { deps, db } = setup();
    const r = await handleDeviceRegister(req("POST", SUB, null), deps);
    expect(r.status).toBe(201);
    const b = await j(r);
    expect(b.test).toBe("ok");
    const m = /^([0-9a-f-]{36})\.([A-Za-z0-9_-]{43})$/.exec(b.token);
    expect(m).not.toBeNull();
    const dev = db.devices.find((d) => d.id === m![1])!;
    expect(dev.secretHash).toBe(sha(m![2]!));
    expect(JSON.stringify(dev)).not.toContain(m![2]!);
    expect(db.pushed).toEqual([{ endpoint: SUB.endpoint, ...TEST_ALERT }]);
    expect(TEST_ALERT).toEqual({ title: "Test: this is what a Seat Alert looks like", body: "When a seat opens in a class you watch, you'll get one like this.", url: "/alerts" });
    // The new token works.
    expect((await handleWatchesGet(req("GET", undefined, `Device ${b.token}`), deps)).status).toBe(200);
  });
  it("device create: endpoint already on another device -> that device deleted, new one created", async () => {
    const { deps, db } = setup({ watches: [watch()] });
    const r = await handleDeviceRegister(req("POST", { ...SUB, endpoint: "https://web.push.apple.com/a" }, null), deps);
    expect(r.status).toBe(201);
    expect(db.devices.some((d) => d.id === DEV_A)).toBe(false);
    expect(db.devices.filter((d) => d.endpoint === "https://web.push.apple.com/a")).toHaveLength(1);
    expect(db.watches).toEqual([]);
  });
  it("device create: a stale or forged token is treated as no token", async () => {
    const { deps } = setup();
    const r = await handleDeviceRegister(req("POST", SUB, `Device ${DEV_A}.wrongsecretwrongsecret`), deps);
    expect(r.status).toBe(201);
  });
  it("device re-register: valid token + new endpoint -> 200 same token, endpoint and keys updated, no push, watches kept", async () => {
    const { deps, db } = setup({ watches: [watch()] });
    const r = await handleDeviceRegister(req("POST", SUB), deps);
    expect(r.status).toBe(200);
    expect(await j(r)).toEqual({ token: `${DEV_A}.${SEC_A}` });
    expect(db.devices.find((d) => d.id === DEV_A)).toMatchObject({ endpoint: SUB.endpoint, p256dh: "k2", auth: "a2" });
    expect(db.pushed).toEqual([]);
    expect(db.watches).toHaveLength(1);
  });
  it("device re-register with the same endpoint keeps the device", async () => {
    const { deps, db } = setup({ watches: [watch()] });
    const r = await handleDeviceRegister(req("POST", { ...SUB, endpoint: "https://web.push.apple.com/a" }), deps);
    expect(r.status).toBe(200);
    expect(db.devices.some((d) => d.id === DEV_A)).toBe(true);
    expect(db.watches).toHaveLength(1);
  });
  it("device create: known push hosts accepted; http, other hosts and look-alikes -> 400", async () => {
    const ok = ["https://web.push.apple.com/x", "https://fcm.googleapis.com/fcm/send/x", "https://updates.push.services.mozilla.com/wpush/v2/x", "https://wns2-par02p.notify.windows.com/?token=x"];
    for (const endpoint of ok) {
      const { deps } = setup();
      expect((await handleDeviceRegister(req("POST", { ...SUB, endpoint }, null), deps)).status).toBe(201);
    }
    const bad = ["http://web.push.apple.com/x", "https://evil.example/x", "https://web.push.apple.com.evil.example/x", "https://evilnotify.windows.com/x", "https://notify.windows.com.evil.example/x", "not a url"];
    for (const endpoint of bad) {
      const { deps, db } = setup();
      const r = await handleDeviceRegister(req("POST", { ...SUB, endpoint }, null), deps);
      expect(r.status).toBe(400);
      expect(await j(r)).toEqual({ error: "bad-request" });
      expect(db.writes).toBe(0);
    }
  });
  // In-memory send store: counts every recorded new device; `fail` makes it throw like a missing table.
  const limitStore = (fail = false) => {
    const rows: { key: string; at: Date }[] = [];
    const store: SendStore = {
      count: async (kind, key, since) => { if (fail) throw new Error("down"); expect(kind).toBe("device"); return rows.filter((r) => r.key === key && r.at >= since).length; },
      record: async (_kind, key, at) => { rows.push({ key, at }); },
    };
    return { store, rows };
  };
  const fromIp = (ip: string, auth: string | null = null) =>
    new Request("https://x/api/seat-alerts/device", { method: "POST", headers: { "x-forwarded-for": `${ip}, 10.0.0.1`, ...(auth ? { authorization: auth } : {}) }, body: JSON.stringify(SUB) });
  it("device create: at most 20 new devices per IP an hour, keyed by a hash of the IP; other IPs unaffected", async () => {
    const { deps, db } = setup();
    const { store, rows } = limitStore();
    const limited = { ...deps, limits: store };
    for (let i = 0; i < 20; i++) expect((await handleDeviceRegister(fromIp("1.2.3.4"), limited)).status).toBe(201);
    const before = db.devices.length;
    const r = await handleDeviceRegister(fromIp("1.2.3.4"), limited);
    expect(r.status).toBe(429);
    expect(await j(r)).toEqual({ error: "rate-limited" });
    expect(db.devices.length).toBe(before);
    expect(rows.every((x) => x.key === sha("1.2.3.4"))).toBe(true);
    expect((await handleDeviceRegister(fromIp("5.6.7.8"), limited)).status).toBe(201);
  });
  it("device re-register (a known device rotating its endpoint) is never limited", async () => {
    const { deps } = setup();
    const { store, rows } = limitStore();
    for (let i = 0; i < 25; i++) expect((await handleDeviceRegister(fromIp("1.2.3.4", AUTH_A), { ...deps, limits: store })).status).toBe(200);
    expect(rows).toEqual([]);
  });
  it("device create: the limit store failing lets sign-ups through (abuse damping, not access control)", async () => {
    const { deps } = setup();
    expect((await handleDeviceRegister(fromIp("1.2.3.4"), { ...deps, limits: limitStore(true).store })).status).toBe(201);
  });
  it("400 for missing keys", async () => {
    const { deps } = setup();
    for (const b of [{}, { endpoint: SUB.endpoint, keys: {} }, "x"]) expect((await handleDeviceRegister(req("POST", b, null), deps)).status).toBe(400);
  });
  it("device create: vapid not configured -> 503, nothing written", async () => {
    const { deps, db } = setup({ vapid: false });
    const r = await handleDeviceRegister(req("POST", SUB, null), deps);
    expect(r.status).toBe(503);
    expect(await j(r)).toEqual({ error: "not-configured" });
    expect(db.writes).toBe(0);
  });
  it("device create: test push fails -> 201 with test \"failed\"; test push gone -> device deleted, 201 test \"failed\"", async () => {
    const a = setup({ push: async () => "failed" });
    const ra = await handleDeviceRegister(req("POST", SUB, null), a.deps);
    expect(ra.status).toBe(201);
    expect((await j(ra)).test).toBe("failed");
    expect(a.db.devices).toHaveLength(3);
    const b = setup({ push: async () => "gone" });
    const rb = await handleDeviceRegister(req("POST", SUB, null), b.deps);
    expect(rb.status).toBe(201);
    expect((await j(rb)).test).toBe("failed");
    expect(b.db.devices).toHaveLength(2);
  });
  it("device delete: valid token -> device and its watches deleted; bad token -> 401", async () => {
    const { deps, db } = setup({ watches: [watch(), watch({ id: ID2, deviceId: DEV_B })] });
    expect((await handleDeviceDelete(req("DELETE", undefined, `Device ${DEV_A}.${SEC_B}`), deps)).status).toBe(401);
    expect(db.devices).toHaveLength(2);
    const r = await handleDeviceDelete(req("DELETE"), deps);
    expect(r.status).toBe(200);
    expect(db.devices.map((d) => d.id)).toEqual([DEV_B]);
    expect(db.watches.map((w) => w.id)).toEqual([ID2]);
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
