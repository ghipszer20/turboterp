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
export type SeatsFile = {
  v: 1;
  term: string;
  generatedAt: string;
  seats: Record<string, [number, number, number, number]>;
  /** Set by the nightly run while the string scanner disagrees with the full parse: the seats job then uses the full parse. */
  scanBroken?: { at: string; mismatches: number };
  /** Where the next seats run resumes after one that hit its time budget. */
  next?: string;
};
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
  /** Departments fetched at once by the seats run (default 1). */
  concurrency?: number;
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


const ATTEMPTS = 3;
const SECTIONS_REFRESH_KEY = (term: string) => `schedule/${term}/sections-refresh`;
const SEATS_KEY = (term: string) => `schedule/${term}/seats`;
const RATINGS_KEY = (term: string) => `schedule/${term}/ratings`;

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

/** The departments and their course ids as the seats row lists them ("CMSC131-0101" -> CMSC / CMSC131). */
function groupsFromRow(seats: SeatsFile["seats"]): Map<string, string[]> {
  const byDept = new Map<string, Set<string>>();
  for (const key of Object.keys(seats)) {
    const courseId = key.slice(0, key.indexOf("-"));
    const dept = courseId.slice(0, 4);
    byDept.set(dept, (byDept.get(dept) ?? new Set()).add(courseId));
  }
  return new Map([...byDept].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([d, ids]) => [d, [...ids].sort()]));
}

/**
 * The frequent run: seat counts only, ONE call (Supabase Edge Function; the schedule of when it runs is
 * in SQL, supabase/migrations/0016_edge_jobs.sql). Store requests: the current term, the seats row, and
 * the seats row written back, so 3. The row is the only state: the department and section list comes from
 * its keys (the course list is read only when there is no row yet), `scanBroken` is the flag the nightly run
 * sets when the scanner disagrees with the full parse (then the full parse supplies the counts), and
 * `next` is the cursor of a run that hit its time budget. A department whose fetch fails keeps its
 * previous entries. Up to deps.concurrency departments are fetched at once, each worker pausing after
 * every request.
 */
export async function refreshSeats(store: SnapshotStore, deps: RefreshDeps, now: Date): Promise<RefreshReport> {
  const report: RefreshReport = { job: "soc-seats", term: null, done: true, processed: 0, ok: 0, failed: 0, failures: [] };
  const term = await currentTerm(store);
  if (!term) return report;
  report.term = term;

  const started = deps.clock();
  const generatedAt = now.toISOString();
  const row = (await store.get<SeatsFile>(SEATS_KEY(term)))?.data;
  const useFullParse = row?.scanBroken !== undefined;
  if (useFullParse) report.usedFullParse = true;
  const groups =
    row && Object.keys(row.seats).length > 0
      ? groupsFromRow(row.seats)
      : new Map([...groupBy(await loadCourses(store, term), (c) => c.department)].map(([d, cs]) => [d, cs.map((c) => c.id)]));
  const pending = [...groups.keys()].filter((d) => row?.next === undefined || d >= row.next);

  const fresh = new Map<string, [string, [number, number, number, number]][]>();
  let nextIndex = 0;
  let stopped = false;
  const worker = async () => {
    for (;;) {
      if (report.processed > 0 && deps.clock() - started >= deps.budgetMs) {
        stopped = true;
        return;
      }
      const i = nextIndex++;
      if (i >= pending.length) return;
      const dept = pending[i]!;
      report.processed++;
      const ids = groups.get(dept)!;
      const batches: string[][] = [];
      for (let b = 0; b < ids.length; b += deps.batchSize) batches.push(ids.slice(b, b + deps.batchSize));
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
      fresh.set(dept, result.items.map(toRow));
      report.ok++;
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(deps.concurrency ?? 1, pending.length)) }, worker));

  const seats: SeatsFile["seats"] = { ...row?.seats };
  for (const key of Object.keys(seats)) if (fresh.has(key.slice(0, 4))) delete seats[key];
  for (const rows of fresh.values()) for (const [key, counts] of rows) seats[key] = counts;
  const file: SeatsFile = { v: SEATS_FILE_VERSION, term, generatedAt, seats };
  if (row?.scanBroken) file.scanBroken = row.scanBroken;
  if (stopped && nextIndex < pending.length) {
    report.done = false;
    file.next = pending[nextIndex]!;
  }
  await store.put(SEATS_KEY(term), { updatedAt: generatedAt, data: file });
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
  const parsedRows = new Map<string, [string, [number, number, number, number]][]>();
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
    parsedRows.set(dept, rowsOf(sections).map(toRow));
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

  // The seats row: this run's departments take the full parse's counts (so new courses and sections show up
  // without a department-list read in the seats job), and the scanner flag lives in the row.
  const row = (await store.get<SeatsFile>(SEATS_KEY(term)))?.data;
  const mismatched = (report.scanMismatches ?? 0) > 0;
  const cleanPass = !stoppedAt && cursor === undefined && report.failed === 0;
  if (refreshed.size > 0 && (row || !mismatched)) {
    const seats: SeatsFile["seats"] = { ...row?.seats };
    for (const key of Object.keys(seats)) if (refreshed.has(key.slice(0, 4))) delete seats[key];
    for (const rows of parsedRows.values()) for (const [key, counts] of rows) seats[key] = counts;
    const file: SeatsFile = { v: SEATS_FILE_VERSION, term, generatedAt: row?.generatedAt ?? generatedAt, seats };
    if (row?.next !== undefined) file.next = row.next;
    if (mismatched) file.scanBroken = { at: generatedAt, mismatches: report.scanMismatches ?? 0 };
    else if (!cleanPass && row?.scanBroken) file.scanBroken = row.scanBroken; // only a whole clean pass clears the flag
    await store.put(SEATS_KEY(term), { updatedAt: file.generatedAt, data: file });
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
