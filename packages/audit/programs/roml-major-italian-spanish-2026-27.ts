// Romance Languages Major, Italian & Spanish track, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/romance-languages/romance-languages-major/;
// College of Arts and Humanities official Romance Languages - Italian & Spanish Four Year Academic
// Plan (department source), https://drive.google.com/uc?export=download&id=1nL-g2PQXdXaw7Zs4gDP8g8w0Np5suauD#Italian-&-Spanish
// (fetched 2026-09-28). The ARHU world-language-placement page was also fetched as context (generic
// ARHU-wide placement-exam procedure, no Romance-Languages-specific requirement content).
// Owner ruling (docs/project/rulings.md, 2026-09-26): where the department page (the college's own
// four-year plan counts as one) and the Academic Catalog disagree, the department page wins. No
// disagreement found -- see reviewNotes.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { italRomlCore, spanRomlCore, romlCommonReviewNotes } from "./roml-shared-2026-27.ts";

export const romlMajorItalianSpanish: Program = {
  id: "roml-major-italian-spanish",
  name: "Romance Languages Major (Italian & Spanish)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Romance Languages Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/romance-languages/romance-languages-major/); " +
    "College of Arts and Humanities, official Romance Languages - Italian & Spanish Four Year " +
    "Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1nL-g2PQXdXaw7Zs4gDP8g8w0Np5suauD#Italian-&-Spanish " +
    "(fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "'One additional course at the 4xx level in one of the two languages' (3 credits) is a choose " +
      "over the ITAL and SPAN departments, 400-499, excluding ITAL478 (the 1-credit colloquium, " +
      "which has its own bucket) -- matches the plan's 'ITAL 4xx or SPAN 4xx' elective slot and the " +
      "'III. Elective' legend line.",
    "The plan PDF's term-grid text conversion is garbled (the Fall/Spring grid and the Gen " +
      "Ed/Major-Requirements legend appear column-interleaved), but the major's course list and its " +
      "rough order are legible (ITAL207/301, SPAN207/301/303, ITAL 3xx choice, SPAN Option choice, " +
      "then ITAL4xx/478 and SPAN4xx slots near the end). " +
      "`packages/programs/sample-plans/roml-major-italian-spanish.json` is `official: true`, but its " +
      "exact year/semester placement is reconstructed from that ordering, not read verbatim. Please " +
      "verify against the original PDF if exact term placement matters.",
    ...romlCommonReviewNotes,
  ],
  requirements: [...italRomlCore, ...spanRomlCore, {
    kind: "choose",
    id: "roml-additional-4xx",
    name: "One additional course at the 4xx level in one of the two languages",
    credits: 3,
    from: { departments: ["ITAL", "SPAN"], minNumber: 400, maxNumber: 499, exclude: ["ITAL478"] },
  }],
};

export const romlMajorItalianSpanishMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Romance Languages (Italian & Spanish)",
  major: "roml",
  track: "Italian & Spanish",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/romance-languages/romance-languages-major/",
    department: "https://drive.google.com/uc?export=download&id=1nL-g2PQXdXaw7Zs4gDP8g8w0Np5suauD#Italian-&-Spanish",
  },
};
