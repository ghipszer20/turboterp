// The compact per-department grade-distribution file (format in GRADES.md),
// and the list of courses offered in a Schedule of Classes snapshot.
// Only counts and terms are stored; decodeDepartment derives shares, GPA and
// student totals with the same code the build uses.

import { SourceError } from "@turboterp/campus-data/http";
import { GRADE_COLUMNS, type GradeColumn } from "./planetterp.ts";
import { distributionFromCounts, type CourseGrades, type Distribution } from "./course-grades.ts";

export const GRADE_FILE_VERSION = 1;

/** Counts in `columns` order, plus the sorted term ids covered. */
export type EncodedDistribution = { c: number[]; t: string[] };

export type DepartmentFile = {
  v: typeof GRADE_FILE_VERSION;
  dept: string;
  /** Schedule of Classes term the course list came from, e.g. "202701". */
  term: string;
  generatedAt: string;
  columns: GradeColumn[];
  /** Only courses with at least one student; a missing course means no data. */
  courses: Record<string, EncodedDistribution & { p: Record<string, EncodedDistribution> }>;
};

const SOURCE = "grade-files";
const fail = (what: string): never => {
  throw new SourceError(SOURCE, what);
};

const encode = (d: Distribution): EncodedDistribution => ({ c: GRADE_COLUMNS.map((col) => d.counts[col]), t: d.terms });

function decode(e: EncodedDistribution): Distribution {
  if (!Array.isArray(e.c) || e.c.length !== GRADE_COLUMNS.length || !Array.isArray(e.t)) fail("bad distribution");
  const counts = Object.fromEntries(GRADE_COLUMNS.map((col, i) => [col, e.c[i]])) as Record<GradeColumn, number>;
  return distributionFromCounts(counts, e.t);
}

export function encodeDepartment(
  meta: { department: string; term: string; generatedAt: string },
  courses: CourseGrades[],
): DepartmentFile {
  const out: DepartmentFile["courses"] = {};
  for (const g of courses) {
    if (g.overall.students === 0) continue;
    const p: Record<string, EncodedDistribution> = {};
    for (const [name, d] of Object.entries(g.byProfessor)) p[name] = encode(d);
    out[g.course] = { ...encode(g.overall), p };
  }
  return {
    v: GRADE_FILE_VERSION,
    dept: meta.department,
    term: meta.term,
    generatedAt: meta.generatedAt,
    columns: [...GRADE_COLUMNS],
    courses: out,
  };
}

/** Expands a department file (parsed JSON) into full CourseGrades keyed by course id. */
export function decodeDepartment(data: unknown): Record<string, CourseGrades> {
  const file = data as Partial<DepartmentFile> | null;
  if (typeof file !== "object" || file === null || file.v !== GRADE_FILE_VERSION) fail("unknown grade file version");
  if (JSON.stringify(file!.columns) !== JSON.stringify(GRADE_COLUMNS)) fail("grade columns changed");
  const result: Record<string, CourseGrades> = {};
  for (const [course, e] of Object.entries(file!.courses ?? {})) {
    const overall = decode(e);
    const byProfessor: Record<string, Distribution> = {};
    for (const [name, pe] of Object.entries(e.p ?? {})) byProfessor[name] = decode(pe);
    result[course] = { course, overall, byProfessor, terms: overall.terms };
  }
  return result;
}

// ---- Schedule of Classes snapshot (packages/course-data/.cache/soc-<term>.json) ----

export type OfferedCourse = { id: string; department: string; instructors: string[] };

/** Courses in the snapshot, in its order, each with its sections' instructors once each (TBA kept). */
export function coursesOffered(snapshot: unknown): OfferedCourse[] {
  const s = snapshot as { courses?: unknown; sections?: unknown } | null;
  if (typeof s !== "object" || s === null || !Array.isArray(s.courses)) fail("snapshot has no course list");
  const sections = (Array.isArray(s!.sections) ? s!.sections : []) as { courseId: string; instructors?: string[] }[];
  const instructors = new Map<string, Set<string>>();
  for (const sec of sections) {
    const set = instructors.get(sec.courseId) ?? new Set<string>();
    for (const name of sec.instructors ?? []) set.add(name);
    instructors.set(sec.courseId, set);
  }
  return (s!.courses as { id: string; department: string }[]).map((c) => ({
    id: c.id,
    department: c.department,
    instructors: [...(instructors.get(c.id) ?? [])],
  }));
}
