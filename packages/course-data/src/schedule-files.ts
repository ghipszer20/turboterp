// Compact files for the schedule builder (format in ../SCHEDULE_FILES.md).
//
// Thousands of students build schedules at once, so generation runs in their browsers on
// data from pre-built, CDN-cacheable files: one small course index (search) and one
// section file per department (loaded when a course from it is picked).
//
// Browser-safe: no imports beyond types, so the web app and its Web Worker can decode.

import type { Course, Meeting, Section } from "./soc.ts";

export const SCHEDULE_FILE_VERSION = 1;

/** [days "MWF", start, end, building, room, type]; times are minutes after midnight or null. */
type EncodedMeeting = [string, number | null, number | null, string | null, string | null, string];
/** [id, instructors, open, total, waitlist, holdfile, delivery, meetings] */
type EncodedSection = [string, string[], number, number, number, number, string, EncodedMeeting[]];

export type CourseIndexFile = {
  v: typeof SCHEDULE_FILE_VERSION;
  term: string;
  generatedAt: string;
  /** [id, title, credits min, credits max, section count] for each course with sections. */
  courses: [string, string, number, number, number][];
};

export type DepartmentSectionsFile = {
  v: typeof SCHEDULE_FILE_VERSION;
  term: string;
  dept: string;
  generatedAt: string;
  courses: Record<string, { t: string; cr: [number, number]; s: EncodedSection[] }>;
  /** PlanetTerp average rating by instructor (SOC spelling); unrated instructors are left out. */
  ratings: Record<string, number>;
  /** Instructors (SOC spelling) with a PlanetTerp review summary file. Absent in older files. */
  reviews?: string[];
};

export type IndexedCourse = { id: string; title: string; credits: { min: number; max: number }; sections: number };
export type CourseIndex = { term: string; generatedAt: string; courses: IndexedCourse[] };
export type DepartmentSections = {
  term: string;
  dept: string;
  generatedAt: string;
  courses: { id: string; title: string; credits: { min: number; max: number } }[];
  sections: Section[];
  ratings: Record<string, number>;
  reviews: string[];
};

type Snapshot = { term: string; courses: Pick<Course, "id" | "department" | "title" | "credits">[]; sections: Section[] };

const DAY_CODES = /Tu|Th|Sa|Su|M|W|F/g;
/** Testudo's "Instructor: TBA" (and plain "TBA") means no instructor has been named. */
const isPlaceholder = (name: string) => /^\s*(instructor:\s*)?tba\s*$/i.test(name);

const encodeMeeting = (m: Meeting): EncodedMeeting => [m.days.join(""), m.start, m.end, m.building, m.room, m.type];
const encodeSection = (s: Section): EncodedSection => [
  s.id,
  s.instructors.filter((n) => !isPlaceholder(n)),
  s.seats.open,
  s.seats.total,
  s.seats.waitlist,
  s.seats.holdfile,
  s.delivery,
  s.meetings.map(encodeMeeting),
];

export function buildScheduleFiles(
  snapshot: Snapshot,
  options: { generatedAt: string; ratings?: Record<string, number>; reviews?: Iterable<string> },
): { index: CourseIndexFile; departments: Record<string, DepartmentSectionsFile> } {
  const reviewed = new Set(options.reviews ?? []);
  const byCourse = new Map<string, Section[]>();
  for (const s of snapshot.sections) byCourse.set(s.courseId, [...(byCourse.get(s.courseId) ?? []), s]);

  const index: CourseIndexFile = { v: SCHEDULE_FILE_VERSION, term: snapshot.term, generatedAt: options.generatedAt, courses: [] };
  const departments: Record<string, DepartmentSectionsFile> = {};
  const known = new Map(snapshot.courses.map((c) => [c.id, c]));
  // Sections whose course is missing from the course list still get a (title-less) entry.
  const ids = [...snapshot.courses.map((c) => c.id), ...[...byCourse.keys()].filter((id) => !known.has(id))];

  for (const id of ids) {
    const sections = byCourse.get(id);
    if (!sections?.length) continue;
    const c = known.get(id);
    const dept = c?.department ?? id.slice(0, 4);
    const title = c?.title ?? "";
    const credits = c?.credits ?? { min: 0, max: 0 };
    index.courses.push([id, title, credits.min, credits.max, sections.length]);
    const file = (departments[dept] ??= {
      v: SCHEDULE_FILE_VERSION,
      term: snapshot.term,
      dept,
      generatedAt: options.generatedAt,
      courses: {},
      ratings: {},
      reviews: [],
    });
    file.courses[id] = { t: title, cr: [credits.min, credits.max], s: sections.map(encodeSection) };
    for (const s of sections) {
      for (const name of s.instructors) {
        const r = options.ratings?.[name];
        if (r !== undefined) file.ratings[name] = r;
        if (reviewed.has(name) && !file.reviews!.includes(name)) file.reviews!.push(name);
      }
    }
  }
  return { index, departments };
}

function checkVersion(data: unknown, what: string): void {
  if (typeof data !== "object" || data === null || (data as { v?: unknown }).v !== SCHEDULE_FILE_VERSION) {
    throw new Error(`Unknown ${what} file version`);
  }
}

export function decodeCourseIndex(data: unknown): CourseIndex {
  checkVersion(data, "course index");
  const f = data as CourseIndexFile;
  return {
    term: f.term,
    generatedAt: f.generatedAt,
    courses: f.courses.map(([id, title, min, max, sections]) => ({ id, title, credits: { min, max }, sections })),
  };
}

export function decodeDepartmentSections(data: unknown): DepartmentSections {
  checkVersion(data, "department sections");
  const f = data as DepartmentSectionsFile;
  const courses: DepartmentSections["courses"] = [];
  const sections: Section[] = [];
  for (const [courseId, c] of Object.entries(f.courses)) {
    courses.push({ id: courseId, title: c.t, credits: { min: c.cr[0], max: c.cr[1] } });
    for (const [id, instructors, open, total, waitlist, holdfile, delivery, meetings] of c.s) {
      sections.push({
        id,
        courseId,
        instructors,
        seats: { total, open, waitlist, holdfile },
        delivery,
        meetings: meetings.map(([days, start, end, building, room, type]) => ({
          days: days.match(DAY_CODES) ?? [],
          start,
          end,
          building,
          room,
          type,
        })),
      });
    }
  }
  return { term: f.term, dept: f.dept, generatedAt: f.generatedAt, courses, sections, ratings: { ...f.ratings }, reviews: [...(f.reviews ?? [])] };
}
