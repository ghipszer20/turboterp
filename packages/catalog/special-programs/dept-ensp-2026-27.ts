// Departmental Honors: Environmental Science and Policy.
// Source: http://www.ensp.umd.edu/research/honors-ensp (fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://www.ensp.umd.edu/research/honors-ensp";

export const deptEnsp: Program = {
  id: "dept-honors-ensp",
  name: "Departmental Honors: Environmental Science and Policy",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "6 credits of self-conducted research under the supervision of an honors thesis advisor (ENSP499)."`,
    `[manual] "9 credits of coursework, which can include up to two Honors Option courses, or 600-level graduate courses. With permission, these courses can also double-count as ENSP Restricted Electives." No fixed course ids; not drafted.`,
    `[manual] Admission: "Junior status (at least 45 credits earned, but no later than 75 credits); GPA of 3.25 or higher and a 3.5 or higher in all ENSP major requirements." Not a citation requirement.`,
    `[manual] "Oral Defense of completed honors thesis." Not checked.`,
  ],
  requirements: [{ kind: "choose", id: "ensp499", name: "ENSP499: Honors research (6 credits)", credits: 6, from: { courses: ["ENSP499"] } }],
};

export const deptEnspMeta: ProgramMeta = { kind: "special", college: "AGNR", sources: { department: "https://www.ensp.umd.edu/research/honors-ensp" } };
