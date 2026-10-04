// Honors College: Gemstone Honors Program (four-year team research).
// Sources: https://www.gemstone.umd.edu/current-students/earning-gemstone-citation and
// https://www.gemstone.umd.edu/current-students/curriculum (fetched 2026-09-25). Hand-transcribed. UNVERIFIED.

import type { Program, Requirement, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, HONORS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://www.gemstone.umd.edu/current-students/earning-gemstone-citation";

const COURSES: [string, string][] = [
  ["GEMS101", "Gemstone seminar GEMS101"],
  ["GEMS102", "Gemstone seminar GEMS102"],
  ["GEMS202", "Gemstone seminar GEMS202"],
  ["GEMS296", "Gemstone team research seminar GEMS296"],
  ["GEMS297", "Gemstone team research seminar GEMS297"],
  ["GEMS396", "Gemstone team research seminar GEMS396"],
  ["GEMS397", "Gemstone team research seminar GEMS397"],
  ["GEMS496", "Gemstone team research seminar GEMS496"],
  ["GEMS497", "Gemstone team research seminar GEMS497"],
];

export const honorsGemstone: Program = {
  id: "honors-gemstone",
  name: "Gemstone",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  minGrade: "C-",
  reviewNotes: [
    ...HONORS_CITATION_NOTES,
    `[check] "1. Completing all Gemstone prerequisite and seminar credits with a grade of at least a "C-."" The citation table lists GEMS 101 (3cr), GEMS 102 (1cr), GEMS 202 (2cr), GEMS 296 (1cr), GEMS 297 (2cr), GEMS 396 (2cr), GEMS 397 (2cr), GEMS 496 (2cr), GEMS 497 (2cr): 17 credits, matching "Credits required for citation: 17" (honors.umd.edu Programs at a Glance).`,
    `[manual] "GEMS 101, GEMS 102, and GEMS 202 must be taken DURING THE SEMESTER the courses are REQUIRED for a student's cohort" and the prerequisite chain; timing isn't checked.`,
    `[manual] "*Students who co-op or study abroad will need to complete a Learning Contract for the missed Gemstone research seminar."`,
    `[manual] "2. Significantly contributing to writing the team thesis and presenting and defending it at the Team Thesis Conference. 3. Submitting the FINAL version of the team thesis by the posted deadline. 4. The student has at least a 3.2 cumulative GPA".`,
    `[check] "GEMS 208 - Special Topics in Leadership and Team Development (variable credits)" are elective leadership courses, not citation requirements; not drafted.`,
  ],
  requirements: COURSES.map(([id, name]): Requirement => ({ kind: "course", id: id.toLowerCase(), name, options: [id] })),
};

export const honorsGemstoneMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://www.gemstone.umd.edu/current-students/earning-gemstone-citation" } };
