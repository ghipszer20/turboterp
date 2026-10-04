// Linguistics Minor, 2026-27 UMD Academic Catalog (Department of Linguistics, ARHU).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/linguistics/linguistics-minor/
// and the department page https://linguistics.umd.edu/academic-programs/undergraduate/linguistics-minor
// (both fetched 2026-09-28; see program-sources/linguistics-minor.md).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page. No published sample plan (constructed; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const lingMinor: Program = {
  id: "ling-minor",
  name: "Linguistics Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Linguistics Minor; Department of Linguistics, " +
    "https://linguistics.umd.edu/academic-programs/undergraduate/linguistics-minor (fetched 2026-09-28)",
  minGrade: "C",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Department-vs-catalog difference (grade): the catalog requires 'C-' or better in every minor course; the department page says 'No course with an earned grade below C may count towards a minor'. Department wins: minGrade 'C'.",
    "Department-vs-catalog difference (sharing): only the department page states 'There can only be six credits of overlap between a minor and a major'; the catalog is silent. Encoded as maxSharedWith: [{ credits: 6 }] (applies to every other program).",
    "Both sources agree on the courses: LING200, LING240, LING311, LING321 plus one 3xx/4xx LING elective (catalog: 'a fifth course in linguistics', 15 credits; department: 'at least one upper-level linguistics elective'). Elective encoded as any LING 300-499 course other than LING311/LING321 (already required).",
    "Not encoded: the elective must be a regular 'classroom' course, not independent study, research assistantship or internship (both sources) -- manual check. Minor GPA of 2.0 (catalog) encoded as minGpa.",
  ],
  requirements: [
    { kind: "course", id: "ling200", name: "LING200 Introductory Linguistics", options: ["LING200"] },
    { kind: "course", id: "ling240", name: "LING240 Language and Mind", options: ["LING240"] },
    { kind: "course", id: "ling311", name: "LING311 Syntax I", options: ["LING311"] },
    { kind: "course", id: "ling321", name: "LING321 Phonology I", options: ["LING321"] },
    {
      kind: "choose",
      id: "elective",
      name: "One 3xx-4xx LING elective (classroom course)",
      count: 1,
      from: { departments: ["LING"], minNumber: 300, maxNumber: 499, exclude: ["LING311", "LING321"] },
    },
  ],
};

export const lingMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/linguistics/linguistics-minor/",
    department: "https://linguistics.umd.edu/academic-programs/undergraduate/linguistics-minor",
  },
};
