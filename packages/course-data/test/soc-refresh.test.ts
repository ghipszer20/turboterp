import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { FileSnapshotStore } from "@turboterp/campus-data/snapshots";
import { refreshCourses, refreshSeats, seatRefreshIntervalMinutes, type RefreshDeps } from "../src/soc-refresh.ts";
import { decodeCourseIndex, decodeDepartmentSections } from "../src/schedule-files.ts";
import type { Course, Section } from "../src/soc.ts";

const course = (id: string, title = id): Course => ({
  id, department: id.slice(0, 4), title, credits: { min: 3, max: 3 }, genEd: [], genEdText: "",
  permissionRequired: false, texts: {} as Course["texts"], description: "",
});
const section = (courseId: string, open: number, instructors = ["Ann Lee"]): Section => ({
  id: `${courseId}-0101`, courseId, instructors, seats: { total: 30, open, waitlist: 0, holdfile: 0 }, delivery: "f2f", meetings: [],
});

let store: FileSnapshotStore;
let calls: string[][];
let now = 0;
const NOW = new Date("2026-10-04T12:00:00Z");

const deps = (over: Partial<RefreshDeps> = {}): RefreshDeps => ({
  fetchSections: async (_t, ids) => {
    calls.push(ids);
    return ids.map((id) => section(id, 7));
  },
  fetchCourses: async (_t, dept) => (dept === "CMSC" ? [course("CMSC131"), course("CMSC132")] : dept === "MATH" ? [course("MATH140")] : []),
  fetchTermsAndDepartments: async () => ({ terms: [], departments: [{ code: "CMSC", name: "CS" }, { code: "MATH", name: "Math" }] }),
  pause: async () => {},
  clock: () => now,
  budgetMs: 240_000,
  batchSize: 40,
  ...over,
});

const put = (key: string, data: unknown) => store.put(key, { updatedAt: "2026-10-01T00:00:00Z", data });
const get = async <T>(key: string) => (await store.get<T>(key))?.data;

beforeEach(async () => {
  store = new FileSnapshotStore(mkdtempSync(join(tmpdir(), "soc-refresh-")));
  calls = [];
  now = 0;
  await put("schedule/current", { term: "202701" });
});

describe("refreshSeats", () => {
  it("rewrites each department file and the index from the stored courses", async () => {
    await put("schedule/202701/courses", { term: "202701", courses: [course("CMSC131", "Intro"), course("MATH140")] });
    const report = await refreshSeats(store, deps(), NOW);
    expect(report).toMatchObject({ job: "soc-seats", done: true, failed: 0 });
    const cmsc = decodeDepartmentSections(await get("schedule/202701/sections/CMSC"));
    expect(cmsc.sections[0]!.seats.open).toBe(7);
    expect(cmsc.courses[0]!.title).toBe("Intro");
    expect(cmsc.generatedAt).toBe(NOW.toISOString());
    const index = decodeCourseIndex(await get("schedule/202701/index"));
    expect(index.courses.map((c) => c.id).sort()).toEqual(["CMSC131", "MATH140"]);
  });

  it("asks for 40 course ids per request", async () => {
    const many = Array.from({ length: 85 }, (_, i) => course(`CMSC${100 + i}`));
    await put("schedule/202701/courses", { term: "202701", courses: many });
    await refreshSeats(store, deps(), NOW);
    expect(calls.map((c) => c.length)).toEqual([40, 40, 5]);
  });

  it("leaves a department's file untouched when its fetch keeps failing, and reports it", async () => {
    await put("schedule/202701/courses", { term: "202701", courses: [course("CMSC131"), course("MATH140")] });
    await put("schedule/202701/sections/CMSC", { v: 1, old: true });
    const report = await refreshSeats(
      store,
      deps({ fetchSections: async (_t, ids) => { if (ids[0]!.startsWith("CMSC")) throw new Error("boom"); return ids.map((id) => section(id, 5)); } }),
      NOW,
    );
    expect(report.failed).toBe(1);
    expect(report.failures[0]).toMatchObject({ key: "CMSC" });
    expect(await get("schedule/202701/sections/CMSC")).toEqual({ v: 1, old: true });
    expect(await get("schedule/202701/sections/MATH")).toBeTruthy();
  });

  it("accepts a department whose fetch succeeded with zero sections", async () => {
    await put("schedule/202701/courses", { term: "202701", courses: [course("CMSC131")] });
    await put("schedule/202701/sections/CMSC", { v: 1, old: true });
    const report = await refreshSeats(store, deps({ fetchSections: async () => [] }), NOW);
    expect(report.failed).toBe(0);
    expect(decodeDepartmentSections(await get("schedule/202701/sections/CMSC")).sections).toEqual([]);
  });

  it("stops at the time budget, saves a cursor, and the next run continues from it", async () => {
    await put("schedule/202701/courses", { term: "202701", courses: [course("CMSC131"), course("MATH140")] });
    const slow = deps({ budgetMs: 100, fetchSections: async (_t, ids) => { now += 150; return ids.map((id) => section(id, 1)); } });
    const first = await refreshSeats(store, slow, NOW);
    expect(first.done).toBe(false);
    expect(await get("schedule/202701/sections/MATH")).toBeUndefined();
    expect(await get("schedule/202701/refresh")).toMatchObject({ next: "MATH" });
    calls = [];
    now = 0;
    const second = await refreshSeats(store, deps(), NOW);
    expect(second.done).toBe(true);
    expect(calls).toEqual([["MATH140"]]);
    expect(await get("schedule/202701/refresh")).toEqual({ completedAt: NOW.toISOString() });
    const index = decodeCourseIndex(await get("schedule/202701/index"));
    expect(index.courses.map((c) => c.id).sort()).toEqual(["CMSC131", "MATH140"]);
  });

  it("carries ratings over from the existing department files", async () => {
    await put("schedule/202701/courses", { term: "202701", courses: [course("CMSC131"), course("MATH140")] });
    await put("schedule/202701/sections/MATH", { v: 1, term: "202701", dept: "MATH", generatedAt: "x", courses: {}, ratings: { "Ann Lee": 4.5 } });
    await refreshSeats(store, deps(), NOW);
    expect(decodeDepartmentSections(await get("schedule/202701/sections/CMSC")).ratings).toEqual({ "Ann Lee": 4.5 });
  });

  it("carries the instructors with a review file over from the existing department files", async () => {
    await put("schedule/202701/courses", { term: "202701", courses: [course("CMSC131"), course("MATH140")] });
    await put("schedule/202701/sections/MATH", { v: 1, term: "202701", dept: "MATH", generatedAt: "x", courses: {}, ratings: {}, reviews: ["Ann Lee"] });
    await refreshSeats(store, deps(), NOW);
    expect(decodeDepartmentSections(await get("schedule/202701/sections/CMSC")).reviews).toEqual(["Ann Lee"]);
  });

  it("falls back to the index and department files when the courses key is absent", async () => {
    await put("schedule/202701/index", { v: 1, term: "202701", generatedAt: "x", courses: [["CMSC131", "Intro", 4, 4, 1]] });
    await put("schedule/202701/sections/CMSC", { v: 1, term: "202701", dept: "CMSC", generatedAt: "x", courses: { CMSC131: { t: "Intro", cr: [4, 4], s: [] } }, ratings: {} });
    const report = await refreshSeats(store, deps(), NOW);
    expect(report.failed).toBe(0);
    expect(calls).toEqual([["CMSC131"]]);
    const cmsc = decodeDepartmentSections(await get("schedule/202701/sections/CMSC"));
    expect(cmsc.courses[0]).toEqual({ id: "CMSC131", title: "Intro", credits: { min: 4, max: 4 } });
  });

  it("does nothing without a current term", async () => {
    await store.delete("schedule/current");
    const report = await refreshSeats(store, deps(), NOW);
    expect(report).toMatchObject({ done: true, processed: 0 });
    expect(calls).toEqual([]);
  });
});

describe("refreshCourses", () => {
  it("stores the full course list from every department", async () => {
    const report = await refreshCourses(store, deps(), NOW);
    expect(report).toMatchObject({ job: "soc-courses", done: true, failed: 0 });
    const data = await get<{ term: string; courses: Course[] }>("schedule/202701/courses");
    expect(data!.courses.map((c) => c.id)).toEqual(["CMSC131", "CMSC132", "MATH140"]);
  });

  it("drops cancelled courses of a refreshed department but keeps a failed one's", async () => {
    await put("schedule/202701/courses", { term: "202701", courses: [course("CMSC999"), course("MATH999")] });
    const report = await refreshCourses(
      store,
      deps({ fetchCourses: async (_t, dept) => { if (dept === "MATH") throw new Error("boom"); return dept === "CMSC" ? [course("CMSC131")] : []; } }),
      NOW,
    );
    expect(report.failed).toBe(1);
    const data = await get<{ courses: Course[] }>("schedule/202701/courses");
    expect(data!.courses.map((c) => c.id).sort()).toEqual(["CMSC131", "MATH999"]);
  });

  it("resumes from its cursor after running out of time", async () => {
    const slow = deps({ budgetMs: 100, fetchCourses: async (_t, d) => { now += 150; return [course(`${d}100`)]; } });
    expect((await refreshCourses(store, slow, NOW)).done).toBe(false);
    expect(await get("schedule/202701/courses-refresh")).toMatchObject({ next: "ARTX" });
    const seen: string[] = [];
    const second = await refreshCourses(store, deps({ fetchCourses: async (_t, d) => { seen.push(d); return d === "MATH" ? [course("MATH100")] : []; } }), NOW);
    expect(second.done).toBe(true);
    expect(seen[0]).toBe("ARTX");
    expect(seen).not.toContain("ARHX");
    expect((await get<{ courses: Course[] }>("schedule/202701/courses"))!.courses.map((c) => c.id)).toContain("MATH100");
    expect(await get("schedule/202701/courses-refresh")).toBeUndefined();
  });
});

describe("seatRefreshIntervalMinutes", () => {
  const ev = [
    { term: "Spring 2027", kind: "first-day", start: "2027-01-25" },
    { term: "Spring 2027", kind: "schedule-adjustment", start: "2027-01-25", end: "2027-02-05" },
  ];
  const at = (iso: string) => seatRefreshIntervalMinutes(new Date(iso), ev, "202701");
  it("is 5 from the first day through the end of schedule adjustment", () => {
    expect(at("2027-01-25T15:00:00Z")).toBe(5);
    expect(at("2027-02-05T23:30:00-05:00")).toBe(5);
  });
  it("is 15 the day before and the day after", () => {
    expect(at("2027-01-24T12:00:00-05:00")).toBe(15);
    expect(at("2027-02-06T00:30:00-05:00")).toBe(15);
  });
  it("compares New York dates, not UTC", () => {
    expect(at("2027-01-25T03:00:00Z")).toBe(15); // still Jan 24 at 10pm in New York
    expect(at("2027-02-06T03:00:00Z")).toBe(5); // still Feb 5 at 10pm in New York
  });
  it("is 15 without calendar dates for the term", () => {
    expect(seatRefreshIntervalMinutes(new Date("2027-01-28T12:00:00Z"), [], "202701")).toBe(15);
    expect(seatRefreshIntervalMinutes(new Date("2027-01-28T12:00:00Z"), ev, "202608")).toBe(15);
    expect(seatRefreshIntervalMinutes(new Date("2027-01-28T12:00:00Z"), null, "202701")).toBe(15);
  });
});

describe("refreshSeats due check", () => {
  const adjustment = [
    { term: "Spring 2027", kind: "first-day", start: "2027-01-25" },
    { term: "Spring 2027", kind: "schedule-adjustment", start: "2027-01-25", end: "2027-02-05" },
  ];
  const at = (min: number) => new Date(Date.parse("2027-01-28T15:00:00Z") + min * 60_000);
  beforeEach(async () => {
    await put("schedule/202701/courses", { term: "202701", courses: [course("CMSC131")] });
  });
  it("skips with no requests when the last refresh is younger than the interval", async () => {
    await refreshSeats(store, deps(), at(0));
    calls = [];
    const r = await refreshSeats(store, deps(), at(10));
    expect(r).toMatchObject({ done: true, skipped: "not due" });
    expect(calls).toEqual([]);
    expect((await refreshSeats(store, deps(), at(15))).skipped).toBeUndefined();
  });
  it("uses 5 minutes inside the adjustment period", async () => {
    await put("calendar/academic", adjustment);
    await refreshSeats(store, deps(), at(0));
    calls = [];
    expect((await refreshSeats(store, deps(), at(3))).skipped).toBe("not due");
    expect((await refreshSeats(store, deps(), at(5))).skipped).toBeUndefined();
    expect(calls.length).toBe(1);
  });
  it("always continues from a saved cursor", async () => {
    await put("schedule/202701/refresh", { next: "CMSC", completedAt: at(0).toISOString() });
    const r = await refreshSeats(store, deps(), at(1));
    expect(r.skipped).toBeUndefined();
    expect(calls.length).toBe(1);
  });
});
