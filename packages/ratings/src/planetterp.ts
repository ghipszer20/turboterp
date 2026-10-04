// PlanetTerp public API (free, unauthenticated JSON).
//
// Endpoints (observed 2026-09-25):
//   GET /professor?name=<full name>          → { name, slug, type, average_rating, courses[] }
//   GET /course?name=<COURSE>                → { name, department, course_number, title, credits,
//                                                description (HTML), average_gpa, professors[],
//                                                is_recent, geneds }
//   GET /grades?course=<COURSE>[&professor=] → [{ course, professor, semester, section,
//                                                "A+", "A", …, "F", "W", "Other" }]
// Not found is HTTP 400 with {"error": "professor not found"} (or "course not found").
// The documented base https://api.planetterp.com/v1 301-redirects to the one used here.
// `courses` and `professors` repeat entries (apparently one per semester taught); we dedupe.

import { fetchJson, SourceError } from "@turboterp/campus-data/http";

const API = "https://planetterp.com/api/v1";
const SOURCE = "planetterp";

export type Professor = {
  name: string;
  slug: string;
  /** "professor" or "ta" */
  type: string;
  /** 1–5 average of PlanetTerp reviews; null if the API gives none. */
  averageRating: number | null;
  /** Courses taught, each once, in PlanetTerp's first-seen order. */
  courses: string[];
};

export type Course = {
  id: string;
  department: string;
  courseNumber: string;
  title: string;
  credits: number;
  /** PlanetTerp's description, which contains HTML (<b>Prerequisite:</b> …). */
  description: string;
  averageGpa: number | null;
  /** Professors who have taught it, each once. */
  professors: string[];
  isRecent: boolean;
  geneds: string[];
};

export const GRADE_COLUMNS = [
  "A+", "A", "A-",
  "B+", "B", "B-",
  "C+", "C", "C-",
  "D+", "D", "D-",
  "F", "W", "Other",
] as const;
export type GradeColumn = (typeof GRADE_COLUMNS)[number];

export type GradeRow = {
  course: string;
  /** null when PlanetTerp doesn't know who taught the section (seen in MATH140, STAT400, CMSC132). */
  professor: string | null;
  /** Testudo term id, e.g. "201608". */
  semester: string;
  section: string;
  counts: Record<GradeColumn, number>;
};

export type GradeLetter = "A" | "B" | "C" | "D" | "F" | "W" | "Other";

export type GradeSummary = {
  /** Mean grade points over students with a letter grade (W and Other excluded); null if none. */
  averageGpa: number | null;
  /** Every student counted, including W and Other. */
  total: number;
  distribution: Record<GradeLetter, number>;
};

// ---- parsing ----

type Json = Record<string, unknown>;

const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const isNotFound = (v: unknown) => isObject(v) && typeof v.error === "string";
const unique = (xs: string[]) => [...new Set(xs)];

function fail(what: string): never {
  throw new SourceError(SOURCE, `response shape changed: ${what}`);
}

function str(o: Json, key: string, what: string): string {
  const v = o[key];
  if (typeof v !== "string") fail(`${what}.${key} is not a string`);
  return v;
}

function num(o: Json, key: string, what: string): number {
  const v = o[key];
  if (typeof v !== "number") fail(`${what}.${key} is not a number`);
  return v;
}

function nullableNum(o: Json, key: string, what: string): number | null {
  const v = o[key];
  if (v === null || v === undefined) return null;
  if (typeof v !== "number") fail(`${what}.${key} is not a number`);
  return v;
}

function strings(o: Json, key: string, what: string): string[] {
  const v = o[key];
  if (v === null || v === undefined) return [];
  if (!Array.isArray(v) || !v.every((x) => typeof x === "string")) fail(`${what}.${key} is not a string list`);
  return v as string[];
}

/** Returns null for PlanetTerp's {"error": "professor not found"}. */
export function parseProfessor(data: unknown): Professor | null {
  if (isNotFound(data)) return null;
  if (!isObject(data)) fail("professor is not an object");
  return {
    name: str(data, "name", "professor"),
    slug: str(data, "slug", "professor"),
    type: str(data, "type", "professor"),
    averageRating: nullableNum(data, "average_rating", "professor"),
    courses: unique(strings(data, "courses", "professor")),
  };
}

/** Returns null for PlanetTerp's {"error": "course not found"}. */
export function parseCourse(data: unknown): Course | null {
  if (isNotFound(data)) return null;
  if (!isObject(data)) fail("course is not an object");
  return {
    id: str(data, "name", "course"),
    department: str(data, "department", "course"),
    courseNumber: str(data, "course_number", "course"),
    title: str(data, "title", "course"),
    credits: num(data, "credits", "course"),
    description: typeof data.description === "string" ? data.description : "",
    averageGpa: nullableNum(data, "average_gpa", "course"),
    professors: unique(strings(data, "professors", "course")),
    isRecent: data.is_recent === true,
    geneds: strings(data, "geneds", "course"),
  };
}

/** Returns [] for PlanetTerp's not-found error object. */
export function parseGrades(data: unknown): GradeRow[] {
  if (isNotFound(data)) return [];
  if (!Array.isArray(data)) fail("grades is not a list");
  return data.map((row) => {
    if (!isObject(row)) fail("grade row is not an object");
    const counts = {} as Record<GradeColumn, number>;
    for (const col of GRADE_COLUMNS) counts[col] = num(row, col, "grade row");
    return {
      course: str(row, "course", "grade row"),
      professor: row.professor === null ? null : str(row, "professor", "grade row"),
      semester: str(row, "semester", "grade row"),
      section: str(row, "section", "grade row"),
      counts,
    };
  });
}

// ---- summary ----

// UMD grade points: A+ and A are both 4.0; W and Other carry none.
const POINTS: Partial<Record<GradeColumn, number>> = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7,
  "D+": 1.3, D: 1.0, "D-": 0.7,
  F: 0,
};

const letterOf = (col: GradeColumn): GradeLetter => (col === "W" || col === "Other" ? col : (col[0] as GradeLetter));

export function summarizeGrades(rows: GradeRow[]): GradeSummary {
  const distribution: Record<GradeLetter, number> = { A: 0, B: 0, C: 0, D: 0, F: 0, W: 0, Other: 0 };
  let total = 0;
  let graded = 0;
  let points = 0;
  for (const row of rows) {
    for (const col of GRADE_COLUMNS) {
      const n = row.counts[col];
      distribution[letterOf(col)] += n;
      total += n;
      const p = POINTS[col];
      if (p !== undefined) {
        graded += n;
        points += p * n;
      }
    }
  }
  return { averageGpa: graded > 0 ? points / graded : null, total, distribution };
}

// ---- network (one request per call; callers should not loop over many names) ----

const q = encodeURIComponent;

/** PlanetTerp answers not-found with HTTP 400 (or 404); fetchJson drops the body, so match the status. */
async function getOrNull(url: string): Promise<unknown | null> {
  try {
    return await fetchJson<unknown>(SOURCE, url);
  } catch (e) {
    if (e instanceof SourceError && /HTTP (400|404) /.test(e.message)) return null;
    throw e;
  }
}

export async function fetchProfessor(name: string): Promise<Professor | null> {
  const data = await getOrNull(`${API}/professor?name=${q(name)}`);
  return data === null ? null : parseProfessor(data);
}

export async function fetchCourse(id: string): Promise<Course | null> {
  const data = await getOrNull(`${API}/course?name=${q(id)}`);
  return data === null ? null : parseCourse(data);
}

/** A course's unparsed /grades body; not-found becomes {"error": "course not found"}. Other failures throw. */
export async function fetchGradesRaw(course: string): Promise<unknown> {
  return (await getOrNull(`${API}/grades?course=${q(course)}`)) ?? { error: "course not found" };
}

export async function fetchGrades(course: string, professor?: string): Promise<GradeRow[]> {
  const url = `${API}/grades?course=${q(course)}${professor ? `&professor=${q(professor)}` : ""}`;
  const data = await getOrNull(url);
  return data === null ? [] : parseGrades(data);
}
