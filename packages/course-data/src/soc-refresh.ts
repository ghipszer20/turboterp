// Scheduled refresh of the Schedule of Classes data (see ../SCHEDULE_FILES.md), run by the
// web app's cron route. Only these jobs touch Testudo; page views read the stored files.
//
//   soc-seats     every 5 minutes: every section page of the current term, scanned for seat counts
//                 only (no DOM) -> the one whole-term file schedule/<term>/seats
//   soc-sections  nightly: the full parse (meetings, instructors, notes) -> schedule/<term>/sections/<DEPT>
//                 and /index, ratings read from schedule/<term>/ratings; cross-checks the seat scan
//   soc-courses   every department page -> schedule/<term>/courses (the full course list)
//
// All go one department at a time, one request at a time with a pause. A department whose
// fetches still fail after retries keeps its existing data (never a partial result) and is
// reported. When the time budget runs out, a cursor is stored and the next run continues.

import type { SnapshotStore } from "@turboterp/campus-data/snapshots";
import { fetchEach } from "./fetch-each.ts";
import {
  buildScheduleFiles,
  SCHEDULE_FILE_VERSION,
  type CourseIndexFile,
  type DepartmentSectionsFile,
} from "./schedule-files.ts";
import {
  fetchCourses,
  fetchSections,
  fetchSectionsHtml,
  fetchTermsAndDepartments,
  parseSections,
  scanSeats,
  withExtraDepartments,
  type Course,
  type Department,
  type SeatRow,
  type Section,
} from "./soc.ts";

/** schedule/<term>/seats: open, waitlist, holdfile, total per "COURSEID-SECTIONID". */
export type SeatsFile = { v: 1; term: string; generatedAt: string; seats: Record<string, [number, number, number, number]> };
export const SEATS_FILE_VERSION = 1;

export type RefreshDeps = {
  /** Full parse (the fallback for the seats job while the scanner is flagged broken). */
  fetchSections: (term: string, courseIds: string[]) => Promise<Section[]>;
  /** Seats-only scan of one batch. */
  fetchSeats: (term: string, courseIds: string[]) => Promise<SeatRow[]>;
  /** Full parse and seat scan of the same page, for the nightly cross-check. */
  fetchPage: (term: string, courseIds: string[]) => Promise<{ sections: Section[]; scanned: SeatRow[] }>;
  fetchCourses: (term: string, department: string) => Promise<Course[]>;
  fetchTermsAndDepartments: () => Promise<{ departments: Department[] }>;
  pause: () => Promise<void>;
  /** Milliseconds, monotonic. */
  clock: () => number;
  budgetMs: number;
  batchSize: number;
};

export function liveRefreshDeps(): RefreshDeps {
  return {
    fetchSections,
    fetchSeats: async (term, ids) => (ids.length === 0 ? [] : scanSeats(await fetchSectionsHtml(term, ids))),
    fetchPage: async (term, ids) => {
      if (ids.length === 0) return { sections: [], scanned: [] };
      const html = await fetchSectionsHtml(term, ids);
      return { sections: parseSections(html), scanned: scanSeats(html) };
    },
    fetchCourses,
    fetchTermsAndDepartments,
    pause: () => new Promise((resolve) => setTimeout(resolve, 300)),
    clock: () => performance.now(),
    budgetMs: 240_000,
    batchSize: 40,
  };
}

export type RefreshReport = {
  job: "soc-seats" | "soc-sections" | "soc-courses";
  term: string | null;
  /** False when the time budget ran out; the next run continues from the saved cursor. */
  done: boolean;
  /** Departments finished this run, including ones that failed. */
  processed: number;
  ok: number;
  failed: number;
  failures: { key: string; error: string }[];
  /** Set when the run did no work because the last refresh is younger than the interval. */
  skipped?: "not due";
  /** soc-sections only: sections whose scanned seat counts differed from the full parse (the scanner is then flagged broken). */
  scanMismatches?: number;
  /** soc-seats only: true while the scanner is flagged broken and the full parse is used instead. */
  usedFullParse?: boolean;
};

/** Seat counts refresh every 5 minutes, always (owner, 2026-10-30). */
export function seatRefreshIntervalMinutes(): 5 {
  return 5;
}

const ATTEMPTS = 3;
const REFRESH_KEY = (term: string) => `schedule/${term}/refresh`;
const SECTIONS_REFRESH_KEY = (term: string) => `schedule/${term}/sections-refresh`;
const SEATS_KEY = (term: string) => `schedule/${term}/seats`;
const RATINGS_KEY = (term: string) => `schedule/${term}/ratings`;
const SCAN_BROKEN_KEY = (term: string) => `schedule/${term}/seats-scan-broken`;

/** schedule/<term>/ratings: instructor ratings and the instructors with a review file, stored once. */
export type RatingsFile = { v: 1; term: string; ratings: Record<string, number>; reviews: string[] };
const COURSES_KEY = (term: string) => `schedule/${term}/courses`;
const COURSES_CURSOR_KEY = (term: string) => `schedule/${term}/courses-refresh`;

type CourseRow = Pick<Course, "id" | "department" | "title" | "credits">;
type CoursesFile = { term: string; courses: Course[] };
type CoursesCursor = { next: string; courses: Course[] };

async function currentTerm(store: SnapshotStore): Promise<string | null> {
  return (await store.get<{ term: string }>("schedule/current"))?.data.term ?? null;
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) map.set(key(item), [...(map.get(key(item)) ?? []), item]);
  return new Map([...map].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

/** The departments from `next` on (all of them when there is no cursor). */
const fromCursor = <T>(groups: Map<string, T>, next: string | undefined) =>
  [...groups].filter(([code]) => next === undefined || code >= next);

/** The term's courses: the stored full list, else the course index (a course's department is its first four letters). */
async function loadCourses(store: SnapshotStore, term: string): Promise<CourseRow[]> {
  const full = await store.get<CoursesFile>(COURSES_KEY(term));
  if (full) return full.data.courses;
  const index = (await store.get<CourseIndexFile>(`schedule/${term}/index`))?.data;
  return (index?.courses ?? []).map(([id, title, min, max]) => ({ id, department: id.slice(0, 4), title, credits: { min, max } }));
}

/**
 * Instructor ratings and the instructors with a review file: the single ratings key when it
 * exists, else (first run after this key was introduced) merged from the department files,
 * and then stored under the key so later runs read just that one file.
 */
async function loadRatings(store: SnapshotStore, term: string, updatedAt: string): Promise<{ ratings: Record<string, number>; reviews: Set<string> }> {
  const stored = (await store.get<RatingsFile>(RATINGS_KEY(term)))?.data;
  if (stored) return { ratings: stored.ratings, reviews: new Set(stored.reviews) };
  const merged = await ratingsFromDepartmentFiles(store, term);
  if (Object.keys(merged.ratings).length > 0 || merged.reviews.size > 0) {
    await store.put(RATINGS_KEY(term), { updatedAt, data: { v: 1, term, ratings: merged.ratings, reviews: [...merged.reviews] } satisfies RatingsFile });
  }
  return merged;
}

async function ratingsFromDepartmentFiles(store: SnapshotStore, term: string): Promise<{ ratings: Record<string, number>; reviews: Set<string> }> {
  const keys = await store.list(`schedule/${term}/sections`);
  const ratings: Record<string, number> = {};
  const reviews = new Set<string>();
  for (let i = 0; i < keys.length; i += 20) {
    const files = await Promise.all(keys.slice(i, i + 20).map((k) => store.get<DepartmentSectionsFile>(k)));
    for (const f of files) {
      Object.assign(ratings, f?.data.ratings);
      for (const n of f?.data.reviews ?? []) reviews.add(n);
    }
  }
  return { ratings, reviews };
}

const seatKey = (courseId: string, sectionId: string) => `${courseId}-${sectionId}`;
const toRow = (r: SeatRow): [string, [number, number, number, number]] => [seatKey(r[0], r[1]), [r[3], r[4], r[5], r[2]]];
const rowsOf = (sections: Section[]): SeatRow[] =>
  sections.map((s) => [s.courseId, s.id, s.seats.total, s.seats.open, s.seats.waitlist, s.seats.holdfile]);

/**
 * The frequent run: seat counts only. Scans every section page and writes ONE whole-term file
 * (schedule/<term>/seats); no department files, no index, no ratings. A department whose fetch
 * fails keeps its previous entries. While the nightly run has flagged the scanner as broken,
 * the full parse supplies the counts instead.
 */
export async function refreshSeats(store: SnapshotStore, deps: RefreshDeps, now: Date): Promise<RefreshReport> {
  const report: RefreshReport = { job: "soc-seats", term: null, done: true, processed: 0, ok: 0, failed: 0, failures: [] };
  const term = await currentTerm(store);
  if (!term) return report;
  report.term = term;

  const started = deps.clock();
  const generatedAt = now.toISOString();
  const state = (await store.get<{ next?: string; completedAt?: string }>(REFRESH_KEY(term)))?.data;
  const cursor = state?.next;
  // A run resuming from a cursor always continues; otherwise wait out the interval.
  if (cursor === undefined && state?.completedAt) {
    if (now.getTime() - Date.parse(state.completedAt) < (seatRefreshIntervalMinutes() - 0.5) * 60_000) {
      report.skipped = "not due";
      return report;
    }
  }
  const useFullParse = (await store.get(SCAN_BROKEN_KEY(term))) !== null;
  if (useFullParse) report.usedFullParse = true;
  const courses = await loadCourses(store, term);
  const groups = groupBy(courses, (c) => c.department);
  const previous = (await store.get<SeatsFile>(SEATS_KEY(term)))?.data.seats ?? {};
  const seats: SeatsFile["seats"] = { ...previous };
  let stoppedAt: string | null = null;
  let wrote = false;

  for (const [dept, deptCourses] of fromCursor(groups, cursor)) {
    if (report.processed > 0 && deps.clock() - started >= deps.budgetMs) {
      stoppedAt = dept;
      break;
    }
    report.processed++;
    const ids = deptCourses.map((c) => c.id);
    const batches: string[][] = [];
    for (let i = 0; i < ids.length; i += deps.batchSize) batches.push(ids.slice(i, i + deps.batchSize));
    const result = await fetchEach(
      batches,
      async (batch) => (useFullParse ? rowsOf(await deps.fetchSections(term, batch)) : deps.fetchSeats(term, batch)),
      { attempts: ATTEMPTS, pause: deps.pause },
    );
    if (result.failed.length > 0) {
      report.failed++;
      report.failures.push({ key: dept, error: result.failed[0]?.message ?? "failed" });
      continue;
    }
    for (const key of Object.keys(seats)) if (key.startsWith(dept)) delete seats[key];
    for (const row of result.items) {
      const [key, counts] = toRow(row);
      seats[key] = counts;
    }
    wrote = true;
    report.ok++;
  }

  if (wrote || !(await store.get(SEATS_KEY(term)))) {
    const file: SeatsFile = { v: SEATS_FILE_VERSION, term, generatedAt, seats };
    await store.put(SEATS_KEY(term), { updatedAt: generatedAt, data: file });
  }
  if (stoppedAt) {
    report.done = false;
    await store.put(REFRESH_KEY(term), { updatedAt: generatedAt, data: { next: stoppedAt, completedAt: state?.completedAt } });
  } else {
    await store.put(REFRESH_KEY(term), { updatedAt: generatedAt, data: { completedAt: generatedAt } });
  }
  return report;
}

/**
 * The nightly run: the full parse of every section page into the department files and the
 * index (meetings, instructors, notes). Ratings come from the ratings key. It also scans the
 * same pages for seats and compares with the parse; any difference flags the scanner as
 * broken (the seats job then uses the full parse until a clean full pass clears the flag).
 */
export async function refreshSections(store: SnapshotStore, deps: RefreshDeps, now: Date): Promise<RefreshReport> {
  const report: RefreshReport = { job: "soc-sections", term: null, done: true, processed: 0, ok: 0, failed: 0, failures: [], scanMismatches: 0 };
  const term = await currentTerm(store);
  if (!term) return report;
  report.term = term;

  const started = deps.clock();
  const generatedAt = now.toISOString();
  const updatedAt = generatedAt;
  const state = (await store.get<{ next?: string; completedAt?: string }>(SECTIONS_REFRESH_KEY(term)))?.data;
  const cursor = state?.next;
  const courses = await loadCourses(store, term);
  const groups = groupBy(courses, (c) => c.department);
  const { ratings, reviews } = await loadRatings(store, term, updatedAt);

  const fresh: CourseIndexFile["courses"] = [];
  const refreshed = new Set<string>();
  let stoppedAt: string | null = null;

  for (const [dept, deptCourses] of fromCursor(groups, cursor)) {
    // Always do at least one department, so a run makes progress.
    if (report.processed > 0 && deps.clock() - started >= deps.budgetMs) {
      stoppedAt = dept;
      break;
    }
    report.processed++;
    const ids = deptCourses.map((c) => c.id);
    const batches: string[][] = [];
    for (let i = 0; i < ids.length; i += deps.batchSize) batches.push(ids.slice(i, i + deps.batchSize));
    const result = await fetchEach(batches, async (batch) => [await deps.fetchPage(term, batch)], { attempts: ATTEMPTS, pause: deps.pause });
    if (result.failed.length > 0) {
      report.failed++;
      report.failures.push({ key: dept, error: result.failed[0]?.message ?? "failed" });
      continue;
    }
    const sections = result.items.flatMap((p) => p.sections);
    const scanned = new Map(result.items.flatMap((p) => p.scanned).map(toRow));
    const parsed = new Map(rowsOf(sections).map(toRow));
    const same = scanned.size === parsed.size && [...parsed].every(([k, v]) => scanned.get(k)?.join() === v.join());
    if (!same) {
      report.scanMismatches = (report.scanMismatches ?? 0) + 1;
      console.error(`soc-sections: seat scan disagrees with the full parse for ${dept}; flagging the scanner as broken`);
    }
    const built = buildScheduleFiles({ term, courses: deptCourses, sections }, { generatedAt, ratings, reviews });
    const file: DepartmentSectionsFile = built.departments[dept] ?? {
      v: SCHEDULE_FILE_VERSION,
      term,
      dept,
      generatedAt,
      courses: {},
      ratings: {},
    };
    await store.put(`schedule/${term}/sections/${dept}`, { updatedAt, data: file });
    fresh.push(...built.index.courses);
    refreshed.add(dept);
    report.ok++;
  }

  // The index: this run's departments replaced, the rest kept as they were.
  const old = (await store.get<CourseIndexFile>(`schedule/${term}/index`))?.data;
  const kept = (old?.courses ?? []).filter(([id]) => !refreshed.has(groupDept(id, courses)));
  const order = new Map(courses.map((c, i) => [c.id, i]));
  const merged = [...kept, ...fresh].sort((a, b) => (order.get(a[0]) ?? Infinity) - (order.get(b[0]) ?? Infinity));
  if (refreshed.size > 0 || !old) {
    const index: CourseIndexFile = { v: SCHEDULE_FILE_VERSION, term, generatedAt, courses: merged };
    await store.put(`schedule/${term}/index`, { updatedAt, data: index });
  }

  if ((report.scanMismatches ?? 0) > 0) {
    await store.put(SCAN_BROKEN_KEY(term), { updatedAt, data: { at: generatedAt, mismatches: report.scanMismatches } });
  } else if (!stoppedAt && cursor === undefined && report.failed === 0) {
    // A whole clean pass re-verified the scanner.
    await store.delete(SCAN_BROKEN_KEY(term));
  }

  if (stoppedAt) {
    report.done = false;
    await store.put(SECTIONS_REFRESH_KEY(term), { updatedAt, data: { next: stoppedAt, completedAt: state?.completedAt } });
  } else {
    await store.put(SECTIONS_REFRESH_KEY(term), { updatedAt, data: { completedAt: generatedAt } });
  }
  return report;
}

const groupDept = (courseId: string, courses: CourseRow[]) =>
  courses.find((c) => c.id === courseId)?.department ?? courseId.slice(0, 4);

export async function refreshCourses(store: SnapshotStore, deps: RefreshDeps, now: Date): Promise<RefreshReport> {
  const report: RefreshReport = { job: "soc-courses", term: null, done: true, processed: 0, ok: 0, failed: 0, failures: [] };
  const term = await currentTerm(store);
  if (!term) return report;
  report.term = term;

  const started = deps.clock();
  const updatedAt = now.toISOString();
  const departments = withExtraDepartments((await deps.fetchTermsAndDepartments()).departments).map((d) => d.code);
  const codes = [...new Set(departments)].sort();

  // Progress lives in the cursor (with the list so far) until the whole pass finishes, so
  // a half-refreshed list is never published.
  const cursor = (await store.get<CoursesCursor>(COURSES_CURSOR_KEY(term)))?.data;
  let list: Course[] = cursor?.courses ?? (await store.get<CoursesFile>(COURSES_KEY(term)))?.data.courses ?? [];
  let stoppedAt: string | null = null;

  for (const code of codes.filter((c) => cursor === undefined || c >= cursor.next)) {
    if (report.processed > 0 && deps.clock() - started >= deps.budgetMs) {
      stoppedAt = code;
      break;
    }
    report.processed++;
    const result = await fetchEach([code], (d) => deps.fetchCourses(term, d), { attempts: ATTEMPTS, pause: deps.pause });
    if (result.failed.length > 0) {
      report.failed++;
      report.failures.push({ key: code, error: result.failed[0]?.message ?? "failed" });
      continue;
    }
    list = [...list.filter((c) => c.department !== code), ...result.items];
    report.ok++;
  }

  if (stoppedAt) {
    report.done = false;
    await store.put(COURSES_CURSOR_KEY(term), { updatedAt, data: { next: stoppedAt, courses: list } satisfies CoursesCursor });
    return report;
  }
  const known = new Set(codes);
  list = list.filter((c) => known.has(c.department));
  await store.put(COURSES_KEY(term), { updatedAt, data: { term, courses: list } satisfies CoursesFile });
  await store.delete(COURSES_CURSOR_KEY(term));
  return report;
}
