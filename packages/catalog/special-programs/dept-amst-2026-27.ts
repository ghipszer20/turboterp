// Departmental Honors: American Studies.
// Source: https://amst.umd.edu/academic-programs/undergraduate/honors-program (fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://amst.umd.edu/academic-programs/undergraduate/honors-program";

export const deptAmst: Program = {
  id: "dept-honors-amst",
  name: "Departmental Honors: American Studies",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "Students fulfill the honors program requirements through a combination of honors-designated coursework (6 credit hours) and an honors thesis (6 credit hours)... 6 credit hours of AMST388: 'Honors Thesis and Research.'" and "Register for 3 credit hours of AMST388... in their final two semesters." Drafted: 6 credits of AMST388.`,
    `[manual] Coursework (6 credits) may be met by any of four routes: "Convert an upper-level AMST course to AMST418H using a departmental honors contract," an honors-option contract in another department, "an upper-level university honors course," or "a graduate course in AMST or in a department consonant with the student's thesis subject." None is fixed enough to draft as a requirement (AMST418H is only one of the four routes); not checked.`,
    `[manual] "Students who undertake American studies honors are excused from the senior seminar, AMST450." Not checked.`,
    `[manual] Eligibility: "a cumulative 3.0 GPA at the time of entry... a minimum overall GPA of 3.0 to remain in the program... a minimum overall GPA of 3.2 in their major coursework and successfully defend an honors thesis" to graduate with honors. Not a course requirement.`,
  ],
  requirements: [{ kind: "choose", id: "amst388", name: "AMST388: Honors Thesis and Research (6 credits)", credits: 6, from: { courses: ["AMST388"] } }],
};

export const deptAmstMeta: ProgramMeta = { kind: "special", college: "ARHU", sources: { department: "https://amst.umd.edu/academic-programs/undergraduate/honors-program" } };
