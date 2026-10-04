// Arabic Minor, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/arabic-studies/arabic-minor/
// and https://arhu.umd.edu/academics/undergraduate-studies/minors (fetched 2026-09-28).
// No official published sample plan (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const arabMinor: Program = {
  id: "arab-minor",
  name: "Arabic Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Arabic Minor; ARHU minors list, " +
    "https://arhu.umd.edu/academics/undergraduate-studies/minors (fetched 2026-09-28)",
  verified: false,
  minGrade: "C-",
  minGpa: 2.0,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Department page not checked for requirements: the fetched ARHU minors page is only a list of minors (Arabic: OPEN) with no requirements, and no SLLC Arabic page was fetched. Encoded from the catalog.",
    "9 credits at 3xx/4xx: the catalog says 'including at least one taught in Arabic' and footnote 1 says 'Contact the minor advisor for approved courses' without naming them. Encoded as any ARAB course numbered 300 or above (the whole named range); the 'at least one taught in Arabic' condition and the advisor-approved list are a manual check. The catalog also says all courses applied to the minor must be taught in Arabic, which may narrow the 3xx/4xx range further; not enforced. Marked advisorMayApprove (upper): other courses may count with advisor approval; only the listed courses count.",
    "'No more than 6 credits of the minor may be used to satisfy the requirements of a major' -> maxSharedWith: [{ credits: 6 }].",
    "'No courses in the minor may count toward another minor' is not encoded (no way to name every other minor); manual check.",
    "Manual notes, not encodable: mandatory placement testing and replacement of required courses for students with prior knowledge (advisor permission); max 6 credits from other institutions; overall minor GPA of 2.0 required (encoded as minGpa); a lower-level course may not be taken after a higher one in the same strand.",
  ],
  requirements: [
    { kind: "course", id: "arab101", name: "Elementary Arabic I", options: ["ARAB101"] },
    { kind: "course", id: "arab102", name: "Elementary Arabic II", options: ["ARAB102"] },
    { kind: "course", id: "arab201", name: "Intermediate Arabic I", options: ["ARAB201"] },
    { kind: "course", id: "arab202", name: "Intermediate Arabic II", options: ["ARAB202"] },
    {
      kind: "choose",
      id: "upper",
      advisorMayApprove: true,
      name: "9 credits of 3xx or 4xx Arabic courses",
      credits: 9,
      from: { departments: ["ARAB"], minNumber: 300 },
    },
  ],
};

export const arabMinorMeta: ProgramMeta = { kind: "minor", college: "ARHU", short: "Arabic", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/arabic-studies/arabic-minor/", department: "https://arhu.umd.edu/academics/undergraduate-studies/minors" } };
