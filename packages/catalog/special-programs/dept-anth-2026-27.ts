// Departmental Honors: Anthropology.
// Source: https://anth.umd.edu/undergraduate/honors-program (fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://anth.umd.edu/undergraduate/honors-program";

export const deptAnth: Program = {
  id: "dept-honors-anth",
  name: "Departmental Honors: Anthropology",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "Students are required to take the following sequence of courses: ANTH485: Honors Research Preparation (3 credits), ANTH486: Honors Research and Proposal (3 credits), ANTH487: Honors Thesis Writing and Defense (3 credits)." "Honors candidates must take the preparation course ANTH485 the first term, the research course ANTH486 the second term, and the thesis writing and defense course ANTH487 during the third and final term." Timing across three terms isn't checked, only that all three are completed.`,
    `[manual] Qualifications: "Completed 60 credits... An overall G.P.A. of at least 3.0... A G.P.A. of at least 3.5 in all Anthropology courses." Not a citation requirement.`,
    `[manual] "A student must have a GPA of 3.5 or higher in the Honors courses to remain in the Honors Program." Not checked.`,
    `[manual] "The Thesis Review Committee, including the Honors Thesis Advisor, must consist of a minimum of three experts"; proposal defense and thesis defense before the committee. Committee approvals and defenses aren't course requirements.`,
  ],
  requirements: [
    { kind: "course", id: "anth485", name: "Honors Research Preparation", options: ["ANTH485"] },
    { kind: "course", id: "anth486", name: "Honors Research and Proposal", options: ["ANTH486"] },
    { kind: "course", id: "anth487", name: "Honors Thesis Writing and Defense", options: ["ANTH487"] },
  ],
};

export const deptAnthMeta: ProgramMeta = { kind: "special", college: "BSOS", sources: { department: "https://anth.umd.edu/undergraduate/honors-program" } };
