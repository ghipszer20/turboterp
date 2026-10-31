import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { FileSnapshotStore } from "@turboterp/campus-data/snapshots";
import { assignSeatChunks, refreshSeats, refreshSeatsChunk, type RefreshDeps } from "../src/soc-refresh.ts";
import type { Course, SeatRow, Section } from "../src/soc.ts";

const course = (id: string): Course => ({
  id, department: id.slice(0, 4), title: id, credits: { min: 3, max: 3 }, genEd: [], genEdText: "",
  permissionRequired: false, texts: {} as Course["texts"], description: "",
});
const DEPTS = ["AAAA", "BBBB", "CCCC", "DDDD", "EEEE", "FFFF"];
const COURSES = DEPTS.flatMap((d) => [`${d}100`, `${d}200`]);
const section = (courseId: string, open: number): Section => ({
  id: "0101", courseId, instructors: [], seats: { total: 30, open, waitlist: 1, holdfile: 2 }, delivery: "f2f", meetings: [], notes: null,
});

let store: FileSnapshotStore;
let open: number;
let failDept: string | null;
const NOW = new Date("2026-10-04T12:00:00Z");
const at = (min: number) => new Date(NOW.getTime() + min * 60_000);

const deps = (over: Partial<RefreshDeps> = {}): RefreshDeps => ({
  fetchSections: async (_t, ids) => ids.map((id) => section(id, open + 100)), // distinguishable: full parse
  fetchSeats: async (_t, ids): Promise<SeatRow[]> => {
    if (failDept && ids.some((i) => i.startsWith(failDept!))) throw new Error("boom");
    return ids.map((id) => [id, "0101", 30, open, 1, 2]);
  },
  fetchPage: async () => ({ sections: [], scanned: [] }),
  fetchCourses: async () => [],
  fetchTermsAndDepartments: async () => ({ departments: [] }),
  pause: async () => {},
  clock: () => 0,
  budgetMs: 100_000,
  batchSize: 40,
  ...over,
});

const put = (key: string, data: unknown) => store.put(key, { updatedAt: "2026-10-01T00:00:00Z", data });
type SeatsData = { generatedAt: string; seats: Record<string, number[]> };
const seats = async () => (await store.get<SeatsData>("schedule/202701/seats"))?.data;

beforeEach(async () => {
  store = new FileSnapshotStore(mkdtempSync(join(tmpdir(), "soc-chunks-")));
  open = 7;
  failDept = null;
  await put("schedule/current", { term: "202701" });
  await put("schedule/202701/courses", { term: "202701", courses: COURSES.map(course) });
});

describe("assignSeatChunks", () => {
  it("puts every department in exactly one chunk, balanced by request count", () => {
    const sizes = new Map([["BIG", 100], ["MID", 60], ["S1", 20], ["S2", 20], ["S3", 20], ["S4", 20]]);
    const chunks = assignSeatChunks(sizes, 4, 40); // 3, 2, 1, 1, 1, 1 requests
    expect(chunks.flat().sort()).toEqual(["BIG", "MID", "S1", "S2", "S3", "S4"]);
    expect(chunks[0]).toEqual(["BIG"]);
    expect(chunks.map((c) => c.length)).toEqual([1, 1, 2, 2]);
  });
  it("is deterministic and tolerates more chunks than departments", () => {
    const sizes = new Map([["A", 1], ["B", 1]]);
    expect(assignSeatChunks(sizes, 4, 40)).toEqual(assignSeatChunks(sizes, 4, 40));
    expect(assignSeatChunks(sizes, 4, 40).flat().sort()).toEqual(["A", "B"]);
  });
});

describe("refreshSeatsChunk", () => {
  it("four chunks together produce the same seats file as refreshSeats", async () => {
    for (let c = 0; c < 4; c++) await refreshSeatsChunk(store, deps(), at(0), c);
    const merged = await seats();
    await refreshSeats(store, deps(), at(10));
    const whole = await seats();
    expect(Object.keys(merged!.seats).sort()).toEqual(COURSES.map((c) => `${c}-0101`).sort());
    expect(merged!.seats).toEqual(whole!.seats);
  });

  it("one chunk alone leaves the other departments' entries from the earlier file untouched", async () => {
    for (let c = 0; c < 4; c++) await refreshSeatsChunk(store, deps(), at(0), c);
    open = 3;
    const report = await refreshSeatsChunk(store, deps(), at(5), 0);
    expect(report).toMatchObject({ job: "soc-seats", chunk: 0, failed: 0 });
    const s = (await seats())!.seats;
    const mine = assignSeatChunks(new Map(DEPTS.map((d) => [d, 2])), 4, 40)[0]!;
    for (const id of COURSES) expect(s[`${id}-0101`]![0]).toBe(mine.includes(id.slice(0, 4)) ? 3 : 7);
    expect(Object.keys(s)).toHaveLength(COURSES.length);
  });

  it("concurrent chunks cannot clobber each other: the final file is whole and current", async () => {
    await Promise.all([0, 1, 2, 3].map((c) => refreshSeatsChunk(store, deps(), at(0), c)));
    const s = (await seats())!.seats;
    expect(Object.keys(s).sort()).toEqual(COURSES.map((c) => `${c}-0101`).sort());
    expect(Object.values(s).every((v) => v[0] === 7)).toBe(true);
  });

  it("a department that fails keeps its previous counts and is reported", async () => {
    for (let c = 0; c < 4; c++) await refreshSeatsChunk(store, deps(), at(0), c);
    open = 1;
    failDept = "CCCC";
    const reports = [];
    for (let c = 0; c < 4; c++) reports.push(await refreshSeatsChunk(store, deps(), at(5), c));
    expect(reports.flatMap((r) => r.failures.map((f) => f.key))).toEqual(["CCCC"]);
    const s = (await seats())!.seats;
    expect(s["CCCC100-0101"]![0]).toBe(7);
    expect(s["AAAA100-0101"]![0]).toBe(1);
  });

  it("skips a chunk that ran less than 4.5 minutes ago", async () => {
    await refreshSeatsChunk(store, deps(), at(0), 1);
    expect((await refreshSeatsChunk(store, deps(), at(3), 1)).skipped).toBe("not due");
    expect((await refreshSeatsChunk(store, deps(), at(5), 1)).skipped).toBeUndefined();
  });

  it("uses the full parse while the scanner is flagged broken", async () => {
    await put("schedule/202701/seats-scan-broken", { at: "x" });
    const r = await refreshSeatsChunk(store, deps(), at(0), 0);
    expect(r.usedFullParse).toBe(true);
    expect(Object.values((await seats())!.seats).some((v) => v[0] === 107)).toBe(true);
  });

  it("stops at the time budget, merges what it has, and resumes from its cursor", async () => {
    let now = 0;
    const d = deps({ clock: () => now, budgetMs: 10, fetchSeats: async (_t, ids) => { now += 20; return ids.map((id): SeatRow => [id, "0101", 30, open, 1, 2]); } });
    const first = await refreshSeatsChunk(store, d, at(0), 3, 2); // 2 chunks: 3 is out of range -> no work
    expect(first.processed).toBe(0);
    const r1 = await refreshSeatsChunk(store, d, at(0), 0, 2); // 3 departments
    expect(r1).toMatchObject({ done: false, processed: 1 });
    const r2 = await refreshSeatsChunk(store, d, at(0.1), 0, 2);
    expect(r2.processed).toBe(1); // continued despite the interval (cursor), next department
    const r3 = await refreshSeatsChunk(store, d, at(0.2), 0, 2);
    expect(r3).toMatchObject({ done: true, processed: 1 });
  });
});
