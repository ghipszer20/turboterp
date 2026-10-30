import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { FileSnapshotStore } from "@turboterp/campus-data/snapshots";
import { refreshSections, refreshSeats, seatRefreshIntervalMinutes, type RefreshDeps } from "../src/soc-refresh.ts";
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

beforeEach(async () => {
  store = new FileSnapshotStore(mkdtempSync(join(tmpdir(), "soc-seats-")));
  calls = [];
  await put("schedule/current", { term: "202701" });
  await put("schedule/202701/courses", { term: "202701", courses: [course("CMSC131"), course("MATH140")] });
});

describe("refreshSeats (seats only)", () => {
  it("writes one whole-term seats file and nothing else", async () => {
    const report = await refreshSeats(store, deps(), NOW);
    expect(report).toMatchObject({ job: "soc-seats", done: true, failed: 0 });
    expect(await get("schedule/202701/seats")).toEqual({
      v: 1,
      term: "202701",
      generatedAt: NOW.toISOString(),
      seats: { "CMSC131-0101": [7, 0, 0, 30], "MATH140-0101": [7, 0, 0, 30] },
    });
    expect(await store.get("schedule/202701/sections/CMSC")).toBeNull();
    expect(await store.get("schedule/202701/index")).toBeNull();
    expect(await store.get("schedule/202701/ratings")).toBeNull();
  });

  it("keeps a failed department's entries and drops vanished sections of a refreshed one", async () => {
    await put("schedule/202701/seats", {
      v: 1, term: "202701", generatedAt: "x",
      seats: { "CMSC131-0101": [1, 2, 3, 4], "CMSC131-9999": [1, 1, 1, 1], "MATH140-0101": [9, 0, 0, 30] },
    });
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

  it("uses the full parse while the scanner is flagged broken", async () => {
    await put("schedule/202701/seats-scan-broken", { at: "x" });
    let scans = 0;
    const report = await refreshSeats(store, deps({ fetchSeats: async () => { scans++; return []; } }), NOW);
    expect(scans).toBe(0);
    expect(report.usedFullParse).toBe(true);
    expect((await get<SeatsData>("schedule/202701/seats"))!.seats["CMSC131-0101"]).toEqual([7, 0, 0, 30]);
  });

  it("is due every 5 minutes", async () => {
    expect(seatRefreshIntervalMinutes()).toBe(5);
    await refreshSeats(store, deps(), NOW);
    calls = [];
    const at = (min: number) => new Date(NOW.getTime() + min * 60_000);
    expect((await refreshSeats(store, deps(), at(3))).skipped).toBe("not due");
    expect(calls).toEqual([]);
    expect((await refreshSeats(store, deps(), at(5))).skipped).toBeUndefined();
  });

  it("always continues from a saved cursor", async () => {
    await put("schedule/202701/refresh", { next: "MATH", completedAt: NOW.toISOString() });
    const r = await refreshSeats(store, deps(), new Date(NOW.getTime() + 60_000));
    expect(r.skipped).toBeUndefined();
    expect(calls).toEqual([["MATH140"]]);
  });
});

describe("refreshSections cross-check and ratings key", () => {
  it("flags the scanner as broken when its counts differ from the full parse", async () => {
    const report = await refreshSections(
      store,
      deps({ fetchPage: async (_t, ids) => ({ sections: ids.map((id) => section(id, 7)), scanned: [["CMSC131", "0101", 30, 6, 0, 0]] }) }),
      NOW,
    );
    expect(report.scanMismatches).toBeGreaterThan(0);
    expect(await store.get("schedule/202701/seats-scan-broken")).not.toBeNull();
  });

  it("clears the flag after a whole clean pass", async () => {
    await put("schedule/202701/seats-scan-broken", { at: "x" });
    const report = await refreshSections(store, deps(), NOW);
    expect(report.scanMismatches).toBe(0);
    expect(await store.get("schedule/202701/seats-scan-broken")).toBeNull();
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
