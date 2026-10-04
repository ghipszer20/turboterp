// Departmental Honors: Kinesiology.
// Source: https://sph.umd.edu/academics/departments-units/department-kinesiology/student-resources-kinesiology/kinesiology-honors-program
// (fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE =
  "https://sph.umd.edu/academics/departments-units/department-kinesiology/student-resources-kinesiology/kinesiology-honors-program";

export const deptKnes: Program = {
  id: "dept-honors-knes",
  name: "Departmental Honors: Kinesiology",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "KNES 478- Honors Seminar (3-5 credits depending on number of semesters in program; 1 credit per semester)... Honors students can spend 3-5 semesters in the program and they must take KNES478 every semester." Drafted as 3 credits, the minimum stated.`,
    `[check] "KNES 476- Honors Thesis Proposal (3 credits)."`,
    `[check] "KNES 477- Honors Thesis (3 credits)."`,
    `[manual] "At least 6 credits of course work must be completed in Honors or Honors equivalent courses": "300 or 400-level H-section courses in the Department of Kinesiology... 300-level or above University or College Honors courses... graduate courses (in KNES; 600-level and above)." No fixed course ids; not drafted.`,
    `[manual] Admission: "an overall GPA of 3.50 on a minimum of 45 credits... a 3.50 GPA in courses taken within the Department of Kinesiology, to include at least 9 credits from the following courses: KNES 287, 285..., 300, 350, 360, 370, 385." Prerequisite GPA, not a citation requirement.`,
    `[manual] "formally present an oral defense of the thesis." The defense isn't checked.`,
  ],
  requirements: [
    { kind: "choose", id: "knes478", name: "KNES478: Honors Seminar", credits: 3, from: { courses: ["KNES478"] } },
    { kind: "course", id: "knes476", name: "KNES476: Honors Thesis Proposal", options: ["KNES476"] },
    { kind: "course", id: "knes477", name: "KNES477: Honors Thesis", options: ["KNES477"] },
  ],
};

export const deptKnesMeta: ProgramMeta = { kind: "special", college: "SPHL", sources: { department: "https://sph.umd.edu/academics/departments-units/department-kinesiology/student-resources-kinesiology/kinesiology-honors-program" } };
