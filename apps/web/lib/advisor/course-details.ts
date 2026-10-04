// Per-department course details for the plan's course sheet (description and the prerequisite
// text as printed). Loaded one department at a time when a student opens a course, so the plan
// catalog itself stays small.

import type { Course } from "@turboterp/course-data";

const COURSE_DETAILS_VERSION = 1;

export type CourseDetails = {
  description: string;
  prerequisite: string | null;
  corequisite: string | null;
  restriction: string | null;
  creditOnlyGrantedFor: string | null;
};

type CompactDetails = { d?: string; p?: string; q?: string; x?: string; o?: string };

export type CourseDetailsFile = {
  v: typeof COURSE_DETAILS_VERSION;
  dept: string;
  term: string;
  courses: Record<string, CompactDetails>;
};

export function courseDetailFiles(courses: Course[], term: string): Record<string, CourseDetailsFile> {
  const files: Record<string, CourseDetailsFile> = {};
  for (const course of courses) {
    const file = (files[course.department] ??= { v: COURSE_DETAILS_VERSION, dept: course.department, term, courses: {} });
    const out: CompactDetails = {};
    if (course.description) out.d = course.description;
    if (course.texts.prerequisite) out.p = course.texts.prerequisite;
    if (course.texts.corequisite) out.q = course.texts.corequisite;
    if (course.texts.restriction) out.x = course.texts.restriction;
    if (course.texts.creditOnlyGrantedFor) out.o = course.texts.creditOnlyGrantedFor;
    file.courses[course.id] = out;
  }
  return files;
}

export function decodeCourseDetails(data: unknown): Record<string, CourseDetails> {
  const file = data as Partial<CourseDetailsFile> | null;
  if (typeof file !== "object" || file === null || file.v !== COURSE_DETAILS_VERSION) {
    throw new Error("Unknown course details file version");
  }
  const result: Record<string, CourseDetails> = {};
  for (const [id, c] of Object.entries(file.courses ?? {})) {
    result[id] = {
      description: c.d ?? "",
      prerequisite: c.p ?? null,
      corequisite: c.q ?? null,
      restriction: c.x ?? null,
      creditOnlyGrantedFor: c.o ?? null,
    };
  }
  return result;
}
