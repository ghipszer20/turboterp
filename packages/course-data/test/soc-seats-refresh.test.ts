import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { FileSnapshotStore } from "@turboterp/campus-data/snapshots";
import { refreshSections, refreshSeats, type RefreshDeps } from "../src/soc-refresh.ts";
import { decodeDepartmentSections } from "../src/schedule-files.ts";
import type { Course, SeatRow, Section } from "../src/soc.ts";

const course = (id: string): Course => ({
  id, department: id.slice(0, 4), title: id, credits: { min: 3, max: 3 }, genEd: [], genEdText: "",
  permissionRequired: false, texts: {} as Course["texts"], description: "",
});
const section = (courseId: string, open: number): Section => ({
  id: "0101", courseId, instructors: ["Ann Lee"], seats: { total: 30, open, waitlist: 0, holdfile: 0 }, delivery: "f2f", meetings: [], notes: null,
});
const rows = (sections: Section[]): SeatRow[] =>
  sections.map((s) => [s.courseId, s.id, s.seats.total, s.seats.open, s.seats.waitlist, s.seats.holdfile]);

let store: FileSnapshotStore;
let calls: string[][];
const NOW = new Date("2026-10-04T12:00:00Z");

const deps = (over: Partial<RefreshDeps> = {}): RefreshDeps => {
  const d: RefreshDeps = {
    fetchSections: async (_t, ids) => {
      calls.push(ids);
      return ids.map((id) => section(id, 7));
    },
    fetchSeats: async (t, ids) => rows(await d.fetchSections(t, ids)),
    fetchPage: async (t, ids) => {
      const sections = await d.fetchSections(t, ids);
      return { sections, scanned: rows(sections) };
    },
    fetchCourses: async () => [],
    fetchTermsAndDepartments: async () => ({ departments: [] }),
    pause: async () => {},
    clock: () => 0,
    budgetMs: 240_000,
    batchSize: 40,
    ...over,
  };
  return d;
};

const put = (key: string, data: unknown) => store.put(key, { updatedAt: "2026-10-01T00:00:00Z", data });
const get = async <T>(key: string) => (await store.get<T>(key))?.data;
type SeatsData = { seats: Record<string, number[]> };
type SeatsFile = SeatsData & { scanBroken?: { at: string; mismatches: number }; next?: string; generatedAt: string };

beforeEach(async () => {
  store = new FileSnapshotStore(mkdtempSync(join(tmpdir(), "soc-seats-")));
  calls = [];
  await put("schedule/current", { term: "202701" });
  await put("schedule/202701/courses", { term: "202701", courses: [course("CMSC131"), course("MATH140")] });
});

/** The store with every call counted. */
function counting() {
  const log: string[] = [];
  const spy: typeof store = {
    get: (k) => { log.push(`get ${k}`); return store.get(k); },
    put: (k, v) => { log.push(`put ${k}`); return store.put(k, v); },
    list: (p) => { log.push(`list ${p}`); return store.list(p); },
    delete: (k) => { log.push(`delete ${k}`); return store.delete(k); },
  } as typeof store;
  return { log, spy };
}
const seatsRow = (seats: Record<string, number[]>, extra: object = {}) => ({ v: 1, term: "202701", generatedAt: "2026-10-01T00:00:00.000Z", seats, ...extra });

describe("refreshSeats (one call, seats row is the state)", () => {
  it("with a seats row it makes exactly 3 store requests: current term, row, row written", async () => {
    await put("schedule/202701/seats", seatsRow({ "CMSC131-0101": [1, 0, 0, 30], "MATH140-0101": [1, 0, 0, 30] }));
    const { log, spy } = counting();
    const report = await refreshSeats(spy, deps(), NOW);
    expect(log).toEqual(["get schedule/current", "get schedule/202701/seats", "put schedule/202701/seats"]);
    expect(report).toMatchObject({ job: "soc-seats", done: true, failed: 0, ok: 2 });
    expect((await get<SeatsData>("schedule/202701/seats"))!.seats).toEqual({ "CMSC131-0101": [7, 0, 0, 30], "MATH140-0101": [7, 0, 0, 30] });
  });

  it("with no row yet it reads the course list once and writes the whole-term row", async () => {
    const { log, spy } = counting();
    await refreshSeats(spy, deps(), NOW);
    expect(log.filter((l) => l.startsWith("put"))).toEqual(["put schedule/202701/seats"]);
    expect(log.length).toBeLessThanOrEqual(4);
    expect(await get("schedule/202701/seats")).toEqual({
      v: 1, term: "202701", generatedAt: NOW.toISOString(),
      seats: { "CMSC131-0101": [7, 0, 0, 30], "MATH140-0101": [7, 0, 0, 30] },
    });
    expect(await store.get("schedule/202701/sections/CMSC")).toBeNull();
  });

  it("keeps a failed department's entries and drops vanished sections of a refreshed one", async () => {
    await put("schedule/202701/seats", seatsRow({ "CMSC131-0101": [1, 2, 3, 4], "CMSC131-9999": [1, 1, 1, 1], "MATH140-0101": [9, 0, 0, 30] }));
    const report = await refreshSeats(
      store,
      deps({ fetchSeats: async (_t, ids) => { if (ids[0]!.startsWith("MATH")) throw new Error("boom"); return rows(ids.map((id) => section(id, 5))); } }),
      NOW,
    );
    expect(report.failed).toBe(1);
    const seats = (await get<SeatsData>("schedule/202701/seats"))!.seats;
    expect(seats["CMSC131-0101"]).toEqual([5, 0, 0, 30]);
    expect(seats["CMSC131-9999"]).toBeUndefined();
    expect(seats["MATH140-0101"]).toEqual([9, 0, 0, 30]);
  });

  it("uses the full parse while the row carries the scanBroken flag, and keeps the flag", async () => {
    await put("schedule/202701/seats", seatsRow({ "CMSC131-0101": [0, 0, 0, 30] }, { scanBroken: { at: "x", mismatches: 2 } }));
    let scans = 0;
    const report = await refreshSeats(store, deps({ fetchSeats: async () => { scans++; return []; } }), NOW);
    expect(scans).toBe(0);
    expect(report.usedFullParse).toBe(true);
    const row = (await get<SeatsFile>("schedule/202701/seats"))!;
    expect(row.seats["CMSC131-0101"]).toEqual([7, 0, 0, 30]);
    expect(row.scanBroken).toEqual({ at: "x", mismatches: 2 });
  });

  it("fetches up to deps.concurrency departments at once", async () => {
    await put("schedule/202701/seats", seatsRow({ "AAAA100-0101": [0, 0, 0, 1], "BBBB100-0101": [0, 0, 0, 1], "CCCC100-0101": [0, 0, 0, 1], "DDDD100-0101": [0, 0, 0, 1], "EEEE100-0101": [0, 0, 0, 1] }));
    let live = 0, peak = 0;
    const slow = deps({
      concurrency: 3,
      fetchSeats: async (_t, ids) => { live++; peak = Math.max(peak, live); await new Promise((r) => setTimeout(r, 5)); live--; return ids.map((id): SeatRow => [id, "0101", 1, 1, 0, 0]); },
    });
    const report = await refreshSeats(store, slow, NOW);
    expect(peak).toBe(3);
    expect(report.ok).toBe(5);
    expect(Object.keys((await get<SeatsData>("schedule/202701/seats"))!.seats)).toHaveLength(5);
  });

  it("stops at the time budget with a cursor in the row, and the next run continues from it", async () => {
    await put("schedule/202701/seats", seatsRow({ "AAAA100-0101": [0, 0, 0, 1], "BBBB100-0101": [0, 0, 0, 1], "CCCC100-0101": [0, 0, 0, 1] }));
    let now = 0;
    const d = deps({ clock: () => now, budgetMs: 10, fetchSeats: async (_t, ids) => { now += 20; return ids.map((id): SeatRow => [id, "0101", 1, 1, 0, 0]); } });
    const r1 = await refreshSeats(store, d, NOW);
    expect(r1).toMatchObject({ done: false, processed: 1 });
    expect((await get<SeatsFile>("schedule/202701/seats"))!.next).toBe("BBBB");
    const r2 = await refreshSeats(store, d, NOW);
    expect(r2.processed).toBe(1);
    expect((await get<SeatsFile>("schedule/202701/seats"))!.next).toBe("CCCC");
    const r3 = await refreshSeats(store, d, NOW);
    expect(r3).toMatchObject({ done: true, processed: 1 });
    const row = (await get<SeatsFile>("schedule/202701/seats"))!;
    expect(row.next).toBeUndefined();
    expect(Object.values(row.seats).map((v) => v[0])).toEqual([1, 1, 1]);
  });
});

describe("refreshSections cross-check and ratings key", () => {
  it("flags the scanner as broken when its counts differ from the full parse", async () => {
    await put("schedule/202701/seats", { v: 1, term: "202701", generatedAt: "x", seats: {} });
    const report = await refreshSections(
      store,
      deps({ fetchPage: async (_t, ids) => ({ sections: ids.map((id) => section(id, 7)), scanned: [["CMSC131", "0101", 30, 6, 0, 0]] }) }),
      NOW,
    );
    expect(report.scanMismatches).toBeGreaterThan(0);
    expect((await get<SeatsFile>("schedule/202701/seats"))?.scanBroken).toMatchObject({ mismatches: expect.any(Number) });
  });

  it("lays the parsed counts into the seats row, so new courses join it, and keeps its cursor", async () => {
    await put("schedule/202701/seats", { v: 1, term: "202701", generatedAt: "g", seats: { "CMSC131-0101": [1, 0, 0, 30] }, next: "CMSC" });
    await refreshSections(store, deps(), NOW);
    const row = (await get<SeatsFile>("schedule/202701/seats"))!;
    expect(row.seats).toEqual({ "CMSC131-0101": [7, 0, 0, 30], "MATH140-0101": [7, 0, 0, 30] });
    expect(row.generatedAt).toBe("g");
    expect(row.next).toBe("CMSC");
  });

  it("clears the flag after a whole clean pass", async () => {
    await put("schedule/202701/seats", { v: 1, term: "202701", generatedAt: "x", seats: {}, scanBroken: { at: "x", mismatches: 1 } });
    const report = await refreshSections(store, deps(), NOW);
    expect(report.scanMismatches).toBe(0);
    expect((await get<SeatsFile>("schedule/202701/seats"))?.scanBroken).toBeUndefined();
  });

  it("stores the ratings key on the first run, then reads ratings from it", async () => {
    await put("schedule/202701/sections/ENGL", { v: 1, term: "202701", dept: "ENGL", generatedAt: "x", courses: {}, ratings: { "Ann Lee": 4.5 }, reviews: ["Ann Lee"] });
    await refreshSections(store, deps(), NOW);
    expect(await get("schedule/202701/ratings")).toEqual({ v: 1, term: "202701", ratings: { "Ann Lee": 4.5 }, reviews: ["Ann Lee"] });
    await put("schedule/202701/ratings", { v: 1, term: "202701", ratings: { "Ann Lee": 2 }, reviews: [] });
    await refreshSections(store, deps(), NOW);
    expect(decodeDepartmentSections(await get("schedule/202701/sections/CMSC")).ratings).toEqual({ "Ann Lee": 2 });
  });
});
