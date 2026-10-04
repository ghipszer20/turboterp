// Departmental Honors: Mathematics.
// Source: https://www-math.umd.edu/undergraduate/opportunities.html?id=101 ("The Departmental Honors Program in
// Mathematics"; fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://www-math.umd.edu/undergraduate/opportunities.html?id=101";

/** "Any course in the following list may be applied toward the requirements of the Honors Program in Mathematics:
 * MATH 403, MATH 404, MATH 405, MATH407, MATH 432, MATH 436, MATH 446, STAT 410, or STAT 420." */
const BREADTH_COURSES = ["MATH403", "MATH404", "MATH405", "MATH407", "MATH432", "MATH436", "MATH446", "STAT410", "STAT420"];
/** "Any graduate course (600-level or above) in Mathematics (MATH), Applied Mathematics (AMSC), or
 * Statistics (STAT) may be substituted for courses on this list." No upper bound is stated; capped
 * at 999 (the highest course number the audit's course-id pattern allows). */
const GRADUATE_600 = { departments: ["MATH", "AMSC", "STAT"], minNumber: 600, maxNumber: 999 };
/** The breadth list, plus the 600-level substitute rule: a course counts if it's on the list, or if
 * it's a 600+ MATH/AMSC/STAT course (matchesFilter checks `courses` first, then falls through to
 * `departments`/`minNumber`, so both apply to the same filter). */
const BREADTH_FILTER = { courses: BREADTH_COURSES, ...GRADUATE_600 };

export const deptMath: Program = {
  id: "dept-honors-math",
  name: "Departmental Honors: Mathematics",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "The Departmental Honors Program in Mathematics requires a minimum of 12 credit hours of honors coursework... available in a thesis option and a non-thesis option." Both options are drafted below as alternative "sets" for the depth requirement; the common breadth requirement is shared.`,
    `[check] Breadth: "The breadth requirement for the thesis option... will be satisfied by taking two courses from among those listed above": MATH403, MATH404, MATH405, MATH407, MATH432, MATH436, MATH446, STAT410, STAT420. "Any graduate course (600-level or above) in Mathematics (MATH), Applied Mathematics (AMSC), or Statistics (STAT) may be substituted for courses on this list" is added as a department/number-range filter alongside the explicit list; H-versions of other upper-level courses (offered "from time to time") aren't enumerated since none are named.`,
    `[check] Depth (thesis option): "The depth requirement will be satisfied by six credit-hours of MATH 498 (Selected Topics in Mathematics)... The first three credits... a reading course... The second three credits... to write an honors thesis." Encoded as one set requiring two MATH498 course-completions (not by credit total, so a single 6-credit MATH498 enrollment wouldn't satisfy it -- not expected in practice).`,
    `[check] Depth (non-thesis option): "Students choosing the non-thesis option satisfy the breadth requirement by taking two courses from those listed above. The depth requirement will be satisfied by taking two additional courses. One of the additional courses must be a graduate course (600-level or above). The other course must be a reading course (three credit-hours of MATH 498), or a course listed above." Encoded as the depth requirement's second "sets" option; the audit picks whichever option (thesis or non-thesis) the student's courses complete, counting courses rather than the underlying credit-hours. "A course listed above" is read as the breadth list plus its own 600-level substitute rule (so a second 600-level course also satisfies this slot), not the bare nine-course list -- an interpretation, not stated verbatim on the page.`,
    `[manual] Admission: "a student is expected to have completed either Math 410 or Math 341 with a grade of B or better" and "an overall GPA of at least 3.0." Not a program requirement; a prerequisite for entry.`,
    `[manual] Good standing: "a student must maintain a GPA of 3.3 in his or her upper-division mathematics courses" and an overall GPA of 3.0. Not a course requirement.`,
    `[manual] "In order to receive the citation for Honors in Mathematics, the student must make a successful oral defense of the thesis" (thesis option), replaced for the non-thesis option by "a two-hour written comprehensive examination," with Honors Committee approval to choose non-thesis. None of this is a course requirement.`,
  ],
  requirements: [
    { kind: "choose", id: "breadth", name: "Breadth: two courses from the Honors list (or a 600-level MATH/AMSC/STAT substitute)", count: 2, from: BREADTH_FILTER },
    {
      kind: "sets",
      id: "depth",
      name: "Depth: thesis (two MATH498 courses) or non-thesis (a 600-level course plus MATH498 or a listed course)",
      options: [
        // Thesis option: MATH498 reading course + MATH498 thesis (6 credit-hours, two 3-credit enrollments).
        [{ count: 2, from: { courses: ["MATH498"] } }],
        // Non-thesis option: one 600-level MATH/AMSC/STAT course, plus one MATH498 reading course or a listed (or 600-level) course.
        [{ count: 1, from: GRADUATE_600 }, { count: 1, from: { courses: [...BREADTH_COURSES, "MATH498"], ...GRADUATE_600 } }],
      ],
    },
  ],
};

export const deptMathMeta: ProgramMeta = { kind: "special", college: "CMNS", sources: { department: "https://www-math.umd.edu/undergraduate/opportunities.html?id=101" } };
