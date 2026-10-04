// Departmental Honors: Spanish & Portuguese.
// Source: https://sllc.umd.edu/fields/spanish/undergraduate/honors ("Spanish Honors Program"; fetched 2026-09-26).
// Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://sllc.umd.edu/fields/spanish/undergraduate/honors";

export const deptSpan: Program = {
  id: "dept-honors-span",
  name: "Departmental Honors: Spanish & Portuguese",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "the honors student will enroll in SPAN479 (Honors Thesis), for a total of 6 credits, split over two semesters... Register for SPAN479, an independent honors thesis course during the last two semesters of your undergraduate career (total credits: 6)."`,
    `[manual] "At least two upper-level courses must be taken either in the 'H' version or as honors with permission of the instructor." No fixed course ids (the "H" sections vary by semester and the instructor-permission route has no id at all); not drafted.`,
    `[manual] Eligibility: "an overall GPA of 3.0 and a GPA of 3.5 in the major... recommended by a member of the regular faculty." Not a citation requirement.`,
    `[manual] "You will write a 35-50 page honors thesis during your senior year" with a public presentation and a formal examination before a three-member committee. The thesis document and defense aren't checked.`,
  ],
  requirements: [{ kind: "choose", id: "span479", name: "SPAN479: Honors Thesis (6 credits over two semesters)", credits: 6, from: { courses: ["SPAN479"] } }],
};

export const deptSpanMeta: ProgramMeta = { kind: "special", college: "ARHU", sources: { department: "https://sllc.umd.edu/fields/spanish/undergraduate/honors" } };
