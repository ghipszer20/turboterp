// Departmental Honors: Physics.
// Source: https://umdphysics.umd.edu/academics/undergraduate/ugrad-phys-honors.html (fetched 2026-09-26).
// Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://umdphysics.umd.edu/academics/undergraduate/ugrad-phys-honors.html";

export const deptPhys: Program = {
  id: "dept-honors-phys",
  name: "Departmental Honors: Physics",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "Complete one of the following research courses PHYS 386 (Physics experimental Learning), PHYS 389 (Undergraduate Thesis Research), PHYS 399, or PHYS 499 (Independent Study)." Drafted as 3 credits (typical value; the page gives no explicit credit count for this item).`,
    `[manual] "Complete at least three credit hours of a Physics Honors version course." No fixed list of "H" courses is published; not drafted.`,
    `[manual] "Have earned a 3.00 or higher overall GPA and a 3.30 or higher GPA for all physics major required courses at graduation time." Not a citation requirement.`,
    `[manual] For High Honors, "students must complete a research project... and defend a senior thesis or paper." For "regular" Honors, students "must either pass an oral exam... or complete an approved, graduate-level PHYS course with a grade of B or higher." The thesis/exam/grad-course alternative isn't checked.`,
  ],
  requirements: [
    { kind: "choose", id: "research-course", name: "Research course (3 credits)", credits: 3, from: { courses: ["PHYS386", "PHYS389", "PHYS399", "PHYS499"] } },
  ],
};

export const deptPhysMeta: ProgramMeta = { kind: "special", college: "CMNS", sources: { department: "https://umdphysics.umd.edu/academics/undergraduate/ugrad-phys-honors.html" } };
