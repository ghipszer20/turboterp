// Scheduled refresh of the Schedule of Classes data (see ../SCHEDULE_FILES.md), run by the
// web app's cron route. Only these jobs touch Testudo; page views read the stored files.
//
//   soc-seats    every section page of the current term -> schedule/<term>/sections/<DEPT> and /index
//   soc-courses  every department page -> schedule/<term>/courses (the full course list)
//
// Both go one department at a time, one request at a time with a pause. A department whose
// fetches still fail after retries keeps its existing file (never a partial result) and is
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
  fetchTermsAndDepartments,
  withExtraDepartments,
  type Course,
  type Department,
  type Section,
} from "./soc.ts";

export type RefreshDeps = {
  fetchSections: (term: string, courseIds: string[]) => Promise<Section[]>;
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
    fetchCourses,
    fetchTermsAndDepartments,
    pause: () => new Promise((resolve) => setTimeout(resolve, 300)),
    clock: () => performance.now(),
    budgetMs: 240_000,
    batchSize: 40,
  };
}

export type RefreshReport = {
  job: "soc-seats" | "soc-courses";
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
};

/** The parts of the academic calendar snapshot (calendar/academic) this needs. */
export type CalendarEvent = { term: string; kind: string; start: string; end?: string };

const SEASON_BY_MONTH: Record<string, string> = { "01": "Spring", "05": "Summer", "08": "Fall", "12": "Winter" };
const newYorkDate = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(d);

/**
 * How often seat counts refresh: every 5 minutes from the first day of classes through the end
 * of schedule adjustment (dates from the academic calendar, compared as New York dates),
 * every 15 minutes otherwise, and when the calendar lacks those dates.
 */
export function seatRefreshIntervalMinutes(now: Date, events: CalendarEvent[] | null, term: string): 5 | 15 {
  const season = SEASON_BY_MONTH[term.slice(4)];
  if (!season || !events) return 15;
  const name = `${season} ${term.slice(0, 4)}`;
  const mine = events.filter((e) => e.term === name);
  const first = mine.find((e) => e.kind === "first-day")?.start;
  const adjustment = mine.find((e) => e.kind === "schedule-adjustment");
  const last = adjustment?.end ?? adjustment?.start;
  if (!first || !last) return 15;
  const today = newYorkDate(now);
  return today >= first && today <= last ? 5 : 15;
}

const ATTEMPTS = 3;
const REFRESH_KEY = (term: string) => `schedule/${term}/refresh`;
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

/** Every instructor rating in the existing department files, merged into one map. */
async function loadRatings(store: SnapshotStore, term: string): Promise<Record<string, number>> {
  const keys = await store.list(`schedule/${term}/sections`);
  const ratings: Record<string, number> = {};
  for (let i = 0; i < keys.length; i += 20) {
    const files = await Promise.all(keys.slice(i, i + 20).map((k) => store.get<DepartmentSectionsFile>(k)));
    for (const f of files) Object.assign(ratings, f?.data.ratings);
  }
  return ratings;
}

export async function refreshSeats(store: SnapshotStore, deps: RefreshDeps, now: Date): Promise<RefreshReport> {
  const report: RefreshReport = { job: "soc-seats", term: null, done: true, processed: 0, ok: 0, failed: 0, failures: [] };
  const term = await currentTerm(store);
  if (!term) return report;
  report.term = term;

  const started = deps.clock();
  const generatedAt = now.toISOString();
  const updatedAt = generatedAt;
  const state = (await store.get<{ next?: string; completedAt?: string }>(REFRESH_KEY(term)))?.data;
  const cursor = state?.next;
  // A run resuming from a cursor always continues; otherwise wait out the interval.
  if (cursor === undefined && state?.completedAt) {
    const calendar = (await store.get<CalendarEvent[]>("calendar/academic"))?.data ?? null;
    const interval = seatRefreshIntervalMinutes(now, calendar, term);
    if (now.getTime() - Date.parse(state.completedAt) < (interval - 0.5) * 60_000) {
      report.skipped = "not due";
      return report;
    }
  }
  const courses = await loadCourses(store, term);
  const groups = groupBy(courses, (c) => c.department);
  const ratings = await loadRatings(store, term);

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
    const result = await fetchEach(batches, (batch) => deps.fetchSections(term, batch), { attempts: ATTEMPTS, pause: deps.pause });
    if (result.failed.length > 0) {
      report.failed++;
      report.failures.push({ key: dept, error: result.failed[0]?.message ?? "failed" });
      continue;
    }
    const built = buildScheduleFiles({ term, courses: deptCourses, sections: result.items }, { generatedAt, ratings });
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

  if (stoppedAt) {
    report.done = false;
    await store.put(REFRESH_KEY(term), { updatedAt, data: { next: stoppedAt, completedAt: state?.completedAt } });
  } else {
    await store.put(REFRESH_KEY(term), { updatedAt, data: { completedAt: generatedAt } });
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
