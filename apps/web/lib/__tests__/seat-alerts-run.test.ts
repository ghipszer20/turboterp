import { describe, expect, it } from "vitest";
import { runSeatAlerts, type RunDeps } from "../seat-alerts/run";
import type { SeatState, Watch } from "../seat-alerts/logic";

const now = new Date("2026-10-09T18:00:00Z");
const watch = (p: Partial<Watch> = {}): Watch => ({ id: "w1", userId: "u1", term: "202701", courseId: "CMSC351", sectionId: "0201", lastAlertAt: null, doneAt: null, ...p });
const section = (courseId: string, id: string, open: number, waitlist = 0) => ({ id, courseId, seats: { open, waitlist, holdfile: 0 } }) as never;

function setup(over: { watches?: Watch[]; states?: SeatState[]; fetchSections?: RunDeps["fetchSections"]; push?: RunDeps["push"]; cursor?: string | null; clock?: () => number } = {}) {
  const log = { fetched: [] as string[][], saved: [] as SeatState[], marked: [] as string[], deleted: [] as string[], pushed: [] as string[], cursor: undefined as string | null | undefined, slept: 0 };
  const states = new Map((over.states ?? []).map((s) => [`${s.courseId}-${s.sectionId}`, s]));
  const deps: RunDeps = {
    term: async () => "202701",
    store: {
      listActiveWatches: async () => over.watches ?? [],
      getStates: async () => states,
      saveStates: async (_t, s) => { log.saved.push(...s); },
      markAlerted: async (ids) => { log.marked.push(...ids); },
      subscriptionsFor: async (ids) => ids.flatMap((u) => [1, 2].map((n) => ({ userId: u, endpoint: `https://push/${u}/${n}`, p256dh: "k", auth: "a" }))),
      deleteSubscription: async (e) => { log.deleted.push(e); },
      getCursor: async () => over.cursor ?? null,
      setCursor: async (c) => { log.cursor = c; },
    },
    fetchSections: over.fetchSections ?? (async (_t, ids) => { log.fetched.push(ids); return ids.map((c) => section(c, "0201", 1)); }),
    push: over.push ?? (async (sub) => { log.pushed.push(sub.endpoint); return "ok"; }),
    sleep: async () => { log.slept++; },
    clock: over.clock ?? (() => 0),
  };
  return { deps, log };
}
const prior = (open: number): SeatState => ({ courseId: "CMSC351", sectionId: "0201", open, waitlist: 0, holdfile: 0, checkedAt: "x" });

describe("runSeatAlerts", () => {
  it("does not fetch when nobody watches anything", async () => {
    const { deps, log } = setup();
    const r = await runSeatAlerts(deps, now);
    expect(log.fetched).toEqual([]);
    expect(r).toMatchObject({ watches: 0, courses: 0, requests: 0, alerts: 0 });
  });

  it("alerts both of the user's devices once and marks the watch", async () => {
    const { deps, log } = setup({ watches: [watch(), watch({ id: "w2", sectionId: null })], states: [prior(0)] });
    const r = await runSeatAlerts(deps, now);
    expect(log.fetched).toEqual([["CMSC351"]]);
    expect(log.pushed.sort()).toEqual(["https://push/u1/1", "https://push/u1/2"]);
    expect(log.marked).toEqual(["w1"]);
    expect(r).toMatchObject({ openings: 1, alerts: 2, requests: 1 });
  });

  it("first sightings only set a baseline", async () => {
    const { deps, log } = setup({ watches: [watch()] });
    const r = await runSeatAlerts(deps, now);
    expect(log.pushed).toEqual([]);
    expect(log.saved).toHaveLength(1);
    expect(r.alerts).toBe(0);
  });

  it("deletes a gone device and carries on with the others", async () => {
    const { deps, log } = setup({ watches: [watch()], states: [prior(0)], push: async (s) => { log.pushed.push(s.endpoint); return s.endpoint.endsWith("/1") ? "gone" : "ok"; } });
    const r = await runSeatAlerts(deps, now);
    expect(log.deleted).toEqual(["https://push/u1/1"]);
    expect(log.pushed).toHaveLength(2);
    expect(r).toMatchObject({ gone: 1, alerts: 1 });
    expect(log.marked).toEqual(["w1"]);
  });

  it("retries a failed batch once, then skips it without saving state", async () => {
    let n = 0;
    const { deps, log } = setup({ watches: [watch()], states: [prior(0)], fetchSections: async () => { n++; throw new Error("down"); } });
    const r = await runSeatAlerts(deps, now);
    expect(n).toBe(2);
    expect(r).toMatchObject({ failedBatches: 1, alerts: 0 });
    expect(log.saved).toEqual([]);
  });

  it("waits 300 ms between batches", async () => {
    const watches = Array.from({ length: 45 }, (_, i) => watch({ id: `w${i}`, courseId: `CMSC${100 + i}` }));
    const { deps, log } = setup({ watches });
    const r = await runSeatAlerts(deps, now);
    expect(r.requests).toBe(2);
    expect(log.slept).toBe(1);
  });

  it("stops at the 50 s budget and sets the cursor to the first unchecked course", async () => {
    const watches = Array.from({ length: 85 }, (_, i) => watch({ id: `w${i}`, courseId: `CMSC${100 + i}` }));
    let t = 0;
    const { deps, log } = setup({ watches, clock: () => t, fetchSections: async (_t, ids) => { log.fetched.push(ids); t += 51_000; return []; } });
    const r = await runSeatAlerts(deps, now);
    expect(log.fetched).toHaveLength(1);
    expect(log.cursor).toBe("CMSC140");
    expect(r.cursor).toBe("CMSC140");
  });

  it("resumes from the cursor and clears it when the pass completes", async () => {
    const watches = Array.from({ length: 45 }, (_, i) => watch({ id: `w${i}`, courseId: `CMSC${100 + i}` }));
    const { deps, log } = setup({ watches, cursor: "CMSC140" });
    await runSeatAlerts(deps, now);
    expect(log.fetched[0]![0]).toBe("CMSC140");
    expect(log.fetched[0]).toHaveLength(5);
    expect(log.cursor).toBeNull();
  });
});
