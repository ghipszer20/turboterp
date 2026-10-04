// Italian Language and Culture Minor, 2026–27 UMD Academic Catalog (School of Languages, Literatures, and Cultures).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/
// italian-studies/italian-language-culture-minor/ and https://sllc.umd.edu/italian (both fetched 2026-09-28).
// The department page is only the program homepage (no requirements), so the catalog is the sole
// source for the rules. No official published sample plan. Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const italMinor: Program = {
  id: "ital-minor",
  name: "Italian Language and Culture Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Italian Language and Culture Minor; " +
    "Department page https://sllc.umd.edu/italian (fetched 2026-09-28; homepage only, no requirements)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page not checked: the fetched sllc.umd.edu/italian page is only the program homepage with no minor requirements; encoded from the catalog alone.",
    "Prerequisite ITAL203 (Intensive Intermediate Italian) is a prerequisite, not part of the 15 credits, so it isn't a Requirement.",
    "The extra course is 'one additional course taught in Italian at the 3xx or 4xx level': accepted as any ITAL 300-499 course. That it be taught in Italian isn't checkable (no language-of-instruction concept); manual check.",
    "Not encoded (manual): program GPA 2.0 is encoded as minGpa; at most 6 credits from other institutions (9 for the Study Abroad Program in Italy); native/fluent speakers replace core courses with advisor approval. No sharing cap is stated; none is set.",
  ],
  requirements: [
    { kind: "course", id: "ital204", name: "Advanced Intermediate Italian", options: ["ITAL204"] },
    { kind: "course", id: "ital207", name: "Speaking and Writing in Italian", options: ["ITAL207"] },
    { kind: "course", id: "ital301", name: "Italian Composition", options: ["ITAL301"] },
    { kind: "course", id: "ital311", name: "Advanced Oral Expression: Current Events", options: ["ITAL311"] },
    {
      kind: "choose",
      id: "elective",
      name: "One additional 3xx or 4xx-level ITAL course taught in Italian",
      count: 1,
      from: { departments: ["ITAL"], minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const italMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Italian Language & Culture",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/italian-studies/italian-language-culture-minor/",
    department: "https://sllc.umd.edu/italian",
  },
};
