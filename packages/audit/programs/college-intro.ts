// College intro courses: each college's first-semester course, a college requirement for
// students who enter as freshmen (owner ruling 2026-09-29; research in
// docs/project/college-intro-courses.md). Only the REQUIRED rows are audit requirements; the
// recommended ones (INFO's INST101, UNIV100 for other colleges) only go into sample plans.

import type { CourseFilter, Program } from "../src/audit.ts";

/** Course options that satisfy the requirement, by college code. */
export const COLLEGE_INTRO_REQUIRED: Record<string, string[]> = {
  CMNS: ["CMNS100", "UNIV100"],
  ARHU: ["ARHU158"],
  SPHL: ["UNIV100"],
};

/**
 * Colleges whose intro course is only scheduled as lettered topic sections (ARHU158A, ARHU158V, ...),
 * so the plain ID never appears in the Schedule of Classes: any lettered variant counts.
 * The audit reads a trailing letter as part of the same course number.
 */
const LETTERED_TOPIC: Record<string, CourseFilter> = {
  ARHU: { departments: ["ARHU"], minNumber: 158, maxNumber: 158 },
};

/** The college's requirement layer, or null when the college has none or the student transferred in. */
export function collegeIntro(college: string, entry: "freshman" | "transfer" = "freshman"): Program | null {
  const options = COLLEGE_INTRO_REQUIRED[college];
  const name = `College intro course (${options?.join(" or ")})`;
  if (!options || entry === "transfer") return null;
  return {
    id: `college-intro-${college.toLowerCase()}`,
    name: "College requirements",
    layer: "college",
    catalogYear: "2026-27",
    source: "UMD Academic Catalog 2026–27, approved courses",
    verified: false,
    reviewNotes: ["Applies to students who enter UMD as freshmen; transfer students are exempt."],
    requirements: [
      LETTERED_TOPIC[college]
        ? { kind: "choose", id: "college-intro", name, count: 1, from: LETTERED_TOPIC[college] }
        : { kind: "course", id: "college-intro", name, options },
    ],
  };
}
