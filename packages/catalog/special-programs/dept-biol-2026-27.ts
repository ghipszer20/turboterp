// Departmental Honors: Biology.
// Source: https://biology.umd.edu/undergraduate/current-students/honors/program-requirements ("Program
// Requirements"; fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://biology.umd.edu/undergraduate/current-students/honors/program-requirements";

export const deptBiol: Program = {
  id: "dept-honors-biol",
  name: "Departmental Honors: Biology",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "Enrollment in Honors Research (BSCI 399H) each semester. Students must register for 1-2 credits of Honors Research... each semester in the program." No total-credit figure is published (the program is "typically a 2 year program," per the Admission page); drafted as presence of BSCI399H rather than a specific credit total.`,
    `[check] "Enrollment in Honors Seminar (BSCI 398H) each semester... this seminar is required each semester." Same caveat: drafted as presence rather than a semester count.`,
    `[manual] Admission: "an overall cumulative grade point average of at least 3.0"; the program is "typically a 2 year program." Not a citation requirement.`,
    `[manual] "Submission of a research Thesis Proposal... Submission of an Honors Thesis, approved first by the student's mentor and then by the Thesis Committee... Oral Defense of the Honors Thesis." The proposal, thesis document and defense aren't checked.`,
  ],
  requirements: [
    { kind: "course", id: "bsci399h", name: "Honors Research", options: ["BSCI399H"] },
    { kind: "course", id: "bsci398h", name: "Honors Seminar", options: ["BSCI398H"] },
  ],
};

export const deptBiolMeta: ProgramMeta = { kind: "special", college: "CMNS", sources: { department: "https://biology.umd.edu/undergraduate/current-students/honors/program-requirements" } };
