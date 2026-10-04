// Departmental Honors: Economics.
// Source: https://www.econ.umd.edu/undergraduate/departmental-honors-program (fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://www.econ.umd.edu/undergraduate/departmental-honors-program";

export const deptEcon: Program = {
  id: "dept-honors-econ",
  name: "Departmental Honors: Economics",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "The Economics Honors Program is a two-semester, 6-credit sequence... The program consists of: ECON396: Independent Honors Study (Fall semester only), ECON397: Honors Thesis (Spring semester only)."`,
    `[manual] Eligibility (before enrolling in ECON396): "a minimum GPA of 3.25" in required courses (ECON305/306, a BA methods course, a field course for BA students; ECON325/326, ECON321/STAT401 for BS students). These are prerequisites for admission, already required by the major, not a departmental-honors requirement in themselves.`,
    `[manual] "Requirements to Graduate with Economics Honors": a minimum 3.5 GPA in ECON396–ECON397 and in "ECON321 or ECON422" plus "One approved 300- or 400-level ECON field course." GPA thresholds aren't checked; the methods/field courses duplicate the major's own requirements and aren't re-drafted here.`,
    `[manual] "Students must successfully complete and present their honors thesis." The thesis document and presentation aren't checked.`,
  ],
  requirements: [
    { kind: "course", id: "econ396", name: "ECON396: Independent Honors Study", options: ["ECON396"] },
    { kind: "course", id: "econ397", name: "ECON397: Honors Thesis", options: ["ECON397"] },
  ],
};

export const deptEconMeta: ProgramMeta = { kind: "special", college: "BSOS", sources: { department: "https://www.econ.umd.edu/undergraduate/departmental-honors-program" } };
