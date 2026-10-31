// View-model for the course search results: per-course rating, GPA, seats and timing from the
// department files, and the four sorts. Scoring reuses the web's pieces (course-data/sort weights
// and neutral scores, app-core section helpers); nothing here re-derives them.
import type { IndexedCourse, DepartmentSections } from "@turboterp/course-data/schedule-files";
import type { Section } from "@turboterp/course-data/schedules";
import { DEFAULT_WEIGHTS, MIDDAY, NEUTRAL_SCORE, sectionParts } from "@turboterp/course-data/sort";
import { overlaySeats, type SeatsOverlay } from "@turboterp/app-core/schedule/seats-overlay";
import { bestGpa, bestRating, gpasFor } from "@turboterp/app-core/schedule/sections";
import type { GradesByCourse } from "./loader";

export type SortChoice = "default" | "rating" | "gpa" | "timing";

/** Labels follow the web's "Default" sort; Rating, GPA and Timing are its three weighted parts. */
export const SORT_CHOICES: { value: SortChoice; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "rating", label: "Rating" },
  { value: "gpa", label: "GPA" },
  { value: "timing", label: "Timing" },
];

export type CourseSummary = {
  /** Best teacher's PlanetTerp rating among the course's sections. */
  rating: number | undefined;
  /** Best teacher's average GPA in this course. */
  gpa: number | undefined;
  /** Open seats across all sections; undefined while sections are not loaded. */
  open: number | undefined;
  /** 0-1: how close the best section's class times sit to midday (1 = at noon). */
  timing: number | undefined;
  /** 0-1 weighted default score; missing parts count as 0.5. */
  score: number;
};

export type CourseRow = { course: IndexedCourse; summary: CourseSummary | undefined };

const HALF_DAY = 6 * 60;

/** Class times near midday score 1, dawn or evening score 0; sections with no timed meeting are undefined. */
export function sectionTiming(s: Section): number | undefined {
  const scores = s.meetings
    .filter((m) => m.start !== null && m.end !== null)
    .map((m) => 1 - Math.min(1, Math.abs((m.start! + m.end!) / 2 - MIDDAY) / HALF_DAY));
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : undefined;
}

const maxOf = (xs: (number | undefined)[]): number | undefined => {
  const n = xs.filter((x): x is number => x !== undefined);
  return n.length ? Math.max(...n) : undefined;
};

/** Summaries for every course in one department's file (computed once per file, not per keystroke). */
export function summarizeDepartment(
  dept: DepartmentSections,
  grades: GradesByCourse | "missing" | undefined,
  seats: SeatsOverlay | null,
): Map<string, CourseSummary> {
  const byCourse = new Map<string, Section[]>();
  for (const s of overlaySeats(dept.sections, seats)) {
    const list = byCourse.get(s.courseId);
    if (list) list.push(s);
    else byCourse.set(s.courseId, [s]);
  }
  const out = new Map<string, CourseSummary>();
  for (const c of dept.courses) {
    const sections = byCourse.get(c.id) ?? [];
    const gpas = grades && grades !== "missing" ? gpasFor({ [c.id.slice(0, 4)]: grades }, [c.id]) : {};
    const context = { ratings: dept.ratings, gpas };
    const parts = sections.map((s) => sectionParts(s, context));
    const timing = maxOf(sections.map(sectionTiming));
    const score =
      DEFAULT_WEIGHTS.rating * (parts.length ? Math.max(...parts.map((p) => p.rating)) : NEUTRAL_SCORE) +
      DEFAULT_WEIGHTS.gpa * (parts.length ? Math.max(...parts.map((p) => p.gpa)) : NEUTRAL_SCORE) +
      DEFAULT_WEIGHTS.timing * (timing ?? NEUTRAL_SCORE);
    out.set(c.id, {
      rating: maxOf(sections.map((s) => bestRating(s, dept.ratings))),
      gpa: maxOf(sections.map((s) => bestGpa(s, gpas))),
      open: sections.length ? sections.reduce((n, s) => n + s.seats.open, 0) : undefined,
      timing,
      score,
    });
  }
  return out;
}

/** Highest first; missing values last; ties keep the search's relevance order. */
export function sortRows(rows: readonly CourseRow[], sort: SortChoice, query = ""): CourseRow[] {
  const code = query.replace(/\s+/g, "").toUpperCase();
  const value = (r: CourseRow): number | undefined => {
    const s = r.summary;
    if (!s) return undefined;
    return sort === "default" ? s.score : sort === "rating" ? s.rating : sort === "gpa" ? s.gpa : s.timing;
  };
  const indexed = rows.map((r, i) => ({ r, i, v: value(r) }));
  indexed.sort((a, b) => {
    if (sort === "default") {
      // An exact course code the student typed always leads.
      const ea = a.r.course.id === code ? 0 : 1;
      const eb = b.r.course.id === code ? 0 : 1;
      if (ea !== eb) return ea - eb;
    }
    if (a.v === undefined || b.v === undefined) {
      if (a.v === b.v) return a.i - b.i;
      return a.v === undefined ? 1 : -1;
    }
    return b.v - a.v || a.i - b.i;
  });
  return indexed.map((x) => x.r);
}

/** The term's list after adding (at the end) or removing a course. */
export function toggleCourse(list: readonly string[], id: string): string[] {
  return list.includes(id) ? list.filter((c) => c !== id) : [...list, id];
}
