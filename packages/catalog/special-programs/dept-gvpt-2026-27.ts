// Departmental Honors: Government & Politics.
// Source: https://gvpt.umd.edu/undergraduate/gvpt-honors-program (fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://gvpt.umd.edu/undergraduate/gvpt-honors-program";

export const deptGvpt: Program = {
  id: "dept-honors-gvpt",
  name: "Departmental Honors: Government & Politics",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "The thesis will begin with enrollment in GVPT 396 'Intro. to Honors Research,' typically completed during the Spring of the Junior year, followed by GVPT 397 'Honors Research' in the Fall of the Senior year."`,
    `[manual] "A substantial portion of Honors work within the major, including no fewer than two 3-credit Honors level courses... all offered by the Department of Government & Politics." No fixed course ids are published (the honors-level courses vary by semester); not drafted.`,
    `[manual] Eligibility: "a 3.7 GPA in GVPT coursework and at least a 3.4 in all other coursework." Not a citation requirement.`,
    `[manual] "The thesis should be submitted at least two weeks before classes end, at which time an oral examination of the thesis will be scheduled." The thesis document and oral exam aren't checked.`,
  ],
  requirements: [
    { kind: "course", id: "gvpt396", name: "GVPT396: Intro. to Honors Research", options: ["GVPT396"] },
    { kind: "course", id: "gvpt397", name: "GVPT397: Honors Research", options: ["GVPT397"] },
  ],
};

export const deptGvptMeta: ProgramMeta = { kind: "special", college: "BSOS", sources: { department: "https://gvpt.umd.edu/undergraduate/gvpt-honors-program" } };
