// Departmental Honors: History.
// Source: https://history.umd.edu/academics/undergraduate/honors ("History Honors"; fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://history.umd.edu/academics/undergraduate/honors";

export const deptHist: Program = {
  id: "dept-honors-hist",
  name: "Departmental Honors: History",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "Courses Required: Junior Year: Fall Semester HIST 395 Honors Colloquium, I. (3 credits) Spring Semester HIST 396 Honors Colloquium, II. (3 credits) Senior Year: HIST 398 Independent Study (3 Credits) HIST 399 Independent Study (3 Credits)." Four required courses, 12 credits total.`,
    `[manual] "Restriction: Permission of Department of History Honors Director." Instructor/department permission for HIST398/399 isn't checked.`,
    `[manual] Eligibility: "Any History Major may apply for admission to the History Honors Program"; applications are due in the sophomore year. Admission isn't a course requirement.`,
    `[manual] "Writing an Honors Thesis is the culmination of the four-semester course sequence... Honors students produce a major paper of 50 to 100 pages... In the spring semester of the senior year, the Honors Thesis is defended." The thesis document and defense aren't audit requirements; HIST398/399 (where the thesis is written) stand in for them.`,
  ],
  requirements: [
    { kind: "course", id: "hist395", name: "Honors Colloquium I", options: ["HIST395"] },
    { kind: "course", id: "hist396", name: "Honors Colloquium II", options: ["HIST396"] },
    { kind: "course", id: "hist398", name: "Independent Study (thesis research)", options: ["HIST398"] },
    { kind: "course", id: "hist399", name: "Independent Study (thesis writing)", options: ["HIST399"] },
  ],
};

export const deptHistMeta: ProgramMeta = { kind: "special", college: "ARHU", sources: { department: "https://history.umd.edu/academics/undergraduate/honors" } };
