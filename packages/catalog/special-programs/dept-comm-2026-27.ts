// Departmental Honors: Communication.
// Source: https://communication.umd.edu/academics/undergraduate/honors (fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://communication.umd.edu/academics/undergraduate/honors";

export const deptComm: Program = {
  id: "dept-honors-comm",
  name: "Departmental Honors: Communication",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[manual] "How to Apply: Admissions to the COMM Departmental Honors program is currently suspended while we review and update the program" (as of the 2026-09-26 fetch). Drafted anyway from the published Thesis Plan of Study, since the page still states the program's requirements.`,
    `[check] Thesis Plan of Study: "Satisfactory completion of six semester hours of COMM399: 'Honors Thesis.'"`,
    `[manual] Thesis Plan also requires "two upper-level communication honors, honors option courses or seminars (300-level and above) or graduate courses (600-level or above)"; no fixed course ids (the honors course offered varies by semester), so not drafted. The Non-Thesis Plan of Study (four 300+/600+ courses plus a written comprehensive exam, no COMM399) is an alternative not drafted here.`,
    `[manual] Eligibility: "an overall grade point average of 3.3 or above... completion of at least nine semester hours in the communication major coursework, including COMM250... a grade point average of 3.5 or above in the communication major courses." Not a citation requirement.`,
    `[manual] "Satisfactory oral defense of the honors thesis before a Thesis Examining Committee." The defense isn't checked.`,
  ],
  requirements: [{ kind: "choose", id: "comm399", name: "COMM399: Honors Thesis (6 credits)", credits: 6, from: { courses: ["COMM399"] } }],
};

export const deptCommMeta: ProgramMeta = { kind: "special", college: "ARHU", sources: { department: "https://communication.umd.edu/academics/undergraduate/honors" } };
