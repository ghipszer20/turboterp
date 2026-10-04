// Departmental Honors: Entomology.
// Source: https://entomology.umd.edu/honors-program.html (fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://entomology.umd.edu/honors-program.html";

export const deptEntm: Program = {
  id: "dept-honors-entm",
  name: "Departmental Honors: Entomology",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "Successfully complete at least 6 credits of BSCI 389H research under the direction of your Mentor. Research will culminate in a thesis and oral defense of the thesis."`,
    `[manual] "Successfully complete 2 Honors courses (300-level or above; Honors option courses ok) in BSCI or ENTM, or related courses in other colleges. Graduate courses (600-level) can count for at least 3 credits." No fixed course ids (any 300+ BSCI/ENTM course can be an honors option, not just H-sections); not drafted, since a department+range filter would also match ordinary, non-honors BSCI/ENTM courses.`,
    `[manual] "You must have completed at least 56 credits (have Junior standing)... a cumulative GPA of at least 3.2, and a minimum GPA of 3.2 in your major." Not a citation requirement.`,
    `[manual] "Entomology Honors students are not required to enroll in an Entomology Honors seminar." Confirms there's no seminar course to draft.`,
  ],
  requirements: [{ kind: "choose", id: "bsci389h", name: "BSCI389H: Honors research (6 credits)", credits: 6, from: { courses: ["BSCI389H"] } }],
};

export const deptEntmMeta: ProgramMeta = { kind: "special", college: "AGNR", sources: { department: "https://entomology.umd.edu/honors-program.html" } };
