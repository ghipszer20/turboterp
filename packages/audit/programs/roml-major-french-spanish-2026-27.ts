// Romance Languages Major, French & Spanish track, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/romance-languages/romance-languages-major/;
// College of Arts and Humanities official Romance Languages - French & Spanish Four Year Academic
// Plan (department source), https://drive.google.com/uc?export=download&id=1CYxEmtRxdG4Boj0l2VNZ9_IiBkUSyRTB#French-&-Spanish
// (fetched 2026-09-28). The ARHU world-language-placement page was also fetched as context (generic
// ARHU-wide placement-exam procedure, no Romance-Languages-specific requirement content).
// Owner ruling (docs/project/rulings.md, 2026-09-26): where the department page (the college's own
// four-year plan counts as one) and the Academic Catalog disagree, the department page wins. No
// disagreement found -- see reviewNotes.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { frenRomlCore, spanRomlCore, romlCommonReviewNotes } from "./roml-shared-2026-27.ts";

export const romlMajorFrenchSpanish: Program = {
  id: "roml-major-french-spanish",
  name: "Romance Languages Major (French & Spanish)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Romance Languages Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/romance-languages/romance-languages-major/); " +
    "College of Arts and Humanities, official Romance Languages - French & Spanish Four Year " +
    "Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1CYxEmtRxdG4Boj0l2VNZ9_IiBkUSyRTB#French-&-Spanish " +
    "(fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "'One additional course at the 4xx level in one of the two languages' (3 credits) is a choose " +
      "over the FREN and SPAN departments, 400-499 -- matches the plan's 'FREN 4xx or SPAN 4xx' " +
      "elective slot and the 'III. Elective' legend line.",
    "The plan PDF's term-grid text conversion is garbled (the Fall/Spring grid and the Gen " +
      "Ed/Major-Requirements legend appear column-interleaved), but the major's course list and its " +
      "rough order are legible (FREN204/250/301, SPAN207/301/303, FREN351/352, SPAN Option " +
      "choice, then FREN4xx and SPAN4xx slots near the end). " +
      "`packages/programs/sample-plans/roml-major-french-spanish.json` is `official: true`, but its " +
      "exact year/semester placement is reconstructed from that ordering, not read verbatim. Please " +
      "verify against the original PDF if exact term placement matters.",
    ...romlCommonReviewNotes,
  ],
  requirements: [...frenRomlCore, ...spanRomlCore, {
    kind: "choose",
    id: "roml-additional-4xx",
    name: "One additional course at the 4xx level in one of the two languages",
    credits: 3,
    from: { departments: ["FREN", "SPAN"], minNumber: 400, maxNumber: 499 },
  }],
};

export const romlMajorFrenchSpanishMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Romance Languages (French & Spanish)",
  major: "roml",
  track: "French & Spanish",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/romance-languages/romance-languages-major/",
    department: "https://drive.google.com/uc?export=download&id=1CYxEmtRxdG4Boj0l2VNZ9_IiBkUSyRTB#French-&-Spanish",
  },
};
