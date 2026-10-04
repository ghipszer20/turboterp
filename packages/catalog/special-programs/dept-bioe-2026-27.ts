// Departmental Honors: Bioengineering.
// Source: https://bioe.umd.edu/undergraduate/honors ("Undergraduate Honors Program"; fetched 2026-09-26).
// Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://bioe.umd.edu/undergraduate/honors";

export const deptBioe: Program = {
  id: "dept-honors-bioe",
  name: "Departmental Honors: Bioengineering",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "Complete 6 credits of BIOE399H (3 credits can be counted towards graduation as a BIOE elective)."`,
    `[check] "Complete three semesters of BIOE489H." Drafted as a count of 3 (one section per semester; the page gives no per-semester credit figure).`,
    `[manual] "Complete one 600-level BIOE elective." No specific course id is published (graduate BIOE electives vary by semester); not drafted.`,
    `[manual] "Conduct research for at least four semesters under the supervision of a faculty mentor... Attend at least four research seminars... Present a research update to the BIOE489H class... Present a research poster... Complete an academic thesis and defend the thesis." Research attendance, presentations, the thesis document and its defense aren't course requirements.`,
    `[manual] Admissions: "Students with a GPA of 3.5 and higher will receive the strongest consideration, though all students with a 3.0 or higher are invited to apply." Not a citation requirement.`,
  ],
  requirements: [
    { kind: "choose", id: "bioe399h", name: "BIOE399H (6 credits)", credits: 6, from: { courses: ["BIOE399H"] } },
    { kind: "choose", id: "bioe489h", name: "BIOE489H, three semesters", count: 3, from: { courses: ["BIOE489H"] } },
  ],
};

export const deptBioeMeta: ProgramMeta = { kind: "special", college: "ENGR", sources: { department: "https://bioe.umd.edu/undergraduate/honors" } };
