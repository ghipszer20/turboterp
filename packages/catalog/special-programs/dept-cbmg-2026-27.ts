// Departmental Honors: Cell Biology & Molecular Genetics.
// Source: https://cbmg.umd.edu/education/undergraduate/undergrad-honors/ (fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://cbmg.umd.edu/education/undergraduate/undergrad-honors/";

export const deptCbmg: Program = {
  id: "dept-honors-cbmg",
  name: "Departmental Honors: Cell Biology & Molecular Genetics",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "Students must enroll in Honors Research for at least three semesters... A minimum of six credit hours of BSCI379H is required."`,
    `[check] "Students must enroll in Honors Seminar (BSCI378H) during their time in the program... Three semesters of BSCI378H are required." Drafted as 3 credits (1 credit × 3 semesters, per "1 Credit of BSCI378H counts towards the Advanced Course Requirements").`,
    `[manual] "Students must pass at least seven credits of CBMG-related lecture/laboratory courses and obtain a grade of B+ or better... from the approved upper level (300- or 400-level) courses required for any specialization areas of the Biological Sciences Program." No fixed course list is published; not drafted.`,
    `[manual] Admission: "an overall cumulative grade point average of at least 3.40 in the courses required for the Biological Sciences major." Not a citation requirement.`,
    `[manual] "An approved Honors thesis... An oral defense of the Honors thesis" before a committee of the mentor and at least two other faculty. The thesis document and defense aren't checked.`,
  ],
  requirements: [
    { kind: "choose", id: "bsci379h", name: "BSCI379H: Honors Research (6 credits, 3 semesters)", credits: 6, from: { courses: ["BSCI379H"] } },
    { kind: "choose", id: "bsci378h", name: "BSCI378H: Honors Seminar (3 credits, 3 semesters)", credits: 3, from: { courses: ["BSCI378H"] } },
  ],
};

export const deptCbmgMeta: ProgramMeta = { kind: "special", college: "CMNS", sources: { department: "https://cbmg.umd.edu/education/undergraduate/undergrad-honors/" } };
