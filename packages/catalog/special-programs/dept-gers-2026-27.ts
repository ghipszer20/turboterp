// Departmental Honors: Germanic Studies.
// Source: https://sllc.umd.edu/fields/german/undergraduate/honors ("German Studies Honors Program"; fetched 2026-09-26).
// Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://sllc.umd.edu/fields/german/undergraduate/honors";

export const deptGers: Program = {
  id: "dept-honors-gers",
  name: "Departmental Honors: Germanic Studies",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "Part B: 6 credits of research and thesis writing: GERS398H: Research (3 credits)... GERS499H: Thesis Writing (3 credits)."`,
    `[manual] "Part A: Two upper division courses (6 credits) to be selected from the following courses: GERS397H... GERS3-H/4-H: Students may choose from the honors courses listed in a given semester." No fixed course ids (the semester's honors offerings vary); not drafted.`,
    `[manual] "It is recommended that students take one of the following courses prior to entering the honors program: 320H or 322H." A recommendation, not a requirement.`,
    `[manual] Eligibility: "an overall GPA of 3.0 and a GPA of 3.5 in the major." Not a citation requirement.`,
    `[manual] "The thesis must be at least 20 pages long and preferably written in German. The thesis must be defended before two or more regular members of the German department faculty." The thesis document and defense aren't checked.`,
  ],
  requirements: [
    { kind: "choose", id: "gers398h", name: "GERS398H: Research", credits: 3, from: { courses: ["GERS398H"] } },
    { kind: "choose", id: "gers499h", name: "GERS499H: Thesis Writing", credits: 3, from: { courses: ["GERS499H"] } },
  ],
};

export const deptGersMeta: ProgramMeta = { kind: "special", college: "ARHU", sources: { department: "https://sllc.umd.edu/fields/german/undergraduate/honors" } };
