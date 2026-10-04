// Departmental Honors: Art History & Archaeology.
// Source: https://arthistory.umd.edu/academics/undergraduate/honors (fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://arthistory.umd.edu/academics/undergraduate/honors";

export const deptArth: Program = {
  id: "dept-honors-arth",
  name: "Departmental Honors: Art History & Archaeology",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "ARTH498: 'Directed Studies in Art History' (2 to 3 credits), to be completed during the first semester of the thesis project... ARTH499: 'Honors Thesis' (3 to 6 credits), to be completed during the second semester." Drafted as 2 and 3 credits respectively (the low end of each stated range).`,
    `[manual] Eligibility: "advanced undergraduate students (those who have completed at least 60 credits overall, of which 12 are ARTH credits)." Not a citation requirement.`,
    `[manual] "develop a topic with a faculty advisor, write an honors thesis and work toward departmental honors at graduation." The thesis document and faculty-advisor pairing aren't checked.`,
  ],
  requirements: [
    { kind: "choose", id: "arth498", name: "ARTH498: Directed Studies in Art History", credits: 2, from: { courses: ["ARTH498"] } },
    { kind: "choose", id: "arth499", name: "ARTH499: Honors Thesis", credits: 3, from: { courses: ["ARTH499"] } },
  ],
};

export const deptArthMeta: ProgramMeta = { kind: "special", college: "ARHU", sources: { department: "https://arthistory.umd.edu/academics/undergraduate/honors" } };
