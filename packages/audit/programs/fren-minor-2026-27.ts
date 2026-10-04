// French Studies Minor, 2026–27 UMD Academic Catalog (School of Languages, Literatures, and Cultures).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/
// french-language-literature/french-studies-minor/ and https://sllc.umd.edu/french (both fetched 2026-09-28).
// The department page is only the program homepage (no requirements), so the catalog is the sole
// source for the rules. No official published sample plan. Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const frenMinor: Program = {
  id: "fren-minor",
  name: "French Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, French Studies Minor; " +
    "Department page https://sllc.umd.edu/french (fetched 2026-09-28; homepage only, no requirements)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page not checked: the fetched sllc.umd.edu/french page is only the program homepage with no minor requirements; encoded from the catalog alone.",
    "Catalog table (21 credits) is garbled: 'Select three of the following: FREN302 or 303; FREN311 or 312; FREN351; FREN352; any 4XX-level course', with a footnote requiring one 4xx-level elective. Read as three courses total (4 core + 3 = 21 credits), one of which must be 4xx: a 'choose 3' whose pool includes every FREN 400-499 course, plus an overlay requiring one FREN 4xx.",
    "'FREN302 or FREN303' and 'FREN311 or FREN312' are one row each, so encoded as alternatives pairs (only one of each counts).",
    "'All courses must be in French' isn't encoded (no language-of-instruction concept); manual check.",
    "Not encoded (manual): at most 6 credits from other institutions (9 for Maryland in Nice); native/fluent speakers replace core courses with advisor approval. No sharing cap is stated; none is set. Program GPA 2.0 encoded as minGpa.",
  ],
  requirements: [
    { kind: "course", id: "fren204", name: "French Grammar and Composition", options: ["FREN204"] },
    { kind: "course", id: "fren250", name: "Introduction to Cultural and Textual Analysis", options: ["FREN250"] },
    { kind: "course", id: "fren301", name: "Composition and Style", options: ["FREN301"] },
    { kind: "course", id: "fren387", name: "Critical Writing on France and the French-Speaking World", options: ["FREN387"] },
    {
      kind: "choose",
      id: "electives",
      name: "Three from FREN302/303, FREN311/312, FREN351, FREN352 or any 4xx-level FREN (at least one 4xx)",
      count: 3,
      from: {
        courses: ["FREN302", "FREN303", "FREN311", "FREN312", "FREN351", "FREN352"],
        departments: ["FREN"],
        minNumber: 400,
        maxNumber: 499,
      },
      alternatives: [
        ["FREN302", "FREN303"],
        ["FREN311", "FREN312"],
      ],
    },
    {
      kind: "choose",
      id: "fren-4xx",
      name: "One 4xx-level FREN elective",
      overlay: true,
      count: 1,
      from: { departments: ["FREN"], minNumber: 400, maxNumber: 499 },
    },
  ],
};

export const frenMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "French Studies",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/french-language-literature/french-studies-minor/",
    department: "https://sllc.umd.edu/french",
  },
};
