// Rhetoric Minor (cross-listed: Communication and English Language & Literature), 2026–27 UMD
// Academic Catalog. Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/
// communication/rhetoric-minor/ and .../english-language-literature/rhetoric-minor/ (identical
// requirement tables; fetched 2026-09-28); department page https://rhetoric.umd.edu/ (fetch failed)
// and https://arhu.umd.edu/rhetoric (navigation only, no requirements).
// Encoded once for both departments. No official published sample plan (constructed; see
// docs/project/owner-review.md). Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const commRhetoricMinor: Program = {
  id: "comm-minor-rhetoric",
  name: "Rhetoric Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Rhetoric Minor (Communication and English Language & Literature " +
    "list the same minor); https://rhetoric.umd.edu/ and https://arhu.umd.edu/rhetoric (fetched 2026-09-28)",
  verified: false,
  minGrade: "C-",
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Cross-listed minor: the Communication and English catalog pages carry the same requirement table; encoded once (id comm-minor-rhetoric).",
    "Department page not checked: rhetoric.umd.edu could not be fetched and arhu.umd.edu/rhetoric is only a homepage with a minor-form link. Encoded from the catalog.",
    "Open slot 'rhetorical-theory' (openSlot requirement): 6 credits from the Rhetorical Theory and Analysis of Discourse course list; the list is not in the fetched sources, so the student confirms it with their advisor.",
    "Open slot 'writing-speaking' (openSlot requirement): 6 credits from the Writing and Speaking Skills course list; the list is not in the fetched sources, so the student confirms it with their advisor.",
    "Open slot 'rhetoric-elective' (openSlot requirement): 3 credits of electives from either section of the Rhetoric Course List; the list is not in the fetched sources, so the student confirms it with their advisor.",
    "Encoded: at least 3 credits in ENGL and at least 3 credits from COMM (overlay checks, since the course lists are missing); minimum grade C- on every course.",
    "'No more than six of the fifteen semester hours may count toward the student's major and supporting courses' -> maxSharedWith: [{ credits: 6 }].",
    "Not encoded (manual): 9 of 15 credits at 3xx or higher (6 of them at UMD); at most 6 credits from another institution; no course counted toward a Fundamental Studies requirement or another minor; overall minor GPA 2.0.",
  ],
  requirements: [
    { kind: "choose", id: "engl-credits", name: "At least 3 credits taken in English (ENGL)", overlay: true, credits: 3, from: { departments: ["ENGL"] } },
    { kind: "choose", id: "comm-credits", name: "At least 3 credits taken in Communication (COMM)", overlay: true, credits: 3, from: { departments: ["COMM"] } },
    {
      kind: "openSlot",
      id: "rhetorical-theory",
      name: "Rhetorical Theory and Analysis of Discourse courses",
      credits: 6,
      note: "From the Rhetorical Theory and Analysis of Discourse course list.",
    },
    {
      kind: "openSlot",
      id: "writing-speaking",
      name: "Writing and Speaking Skills courses",
      credits: 6,
      note: "From the Writing and Speaking Skills course list.",
    },
    {
      kind: "openSlot",
      id: "rhetoric-elective",
      name: "Rhetoric elective",
      credits: 3,
      note: "From either section of the Rhetoric Course List.",
    },
  ],
};

export const commRhetoricMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Rhetoric",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/communication/rhetoric-minor/",
    department: "https://rhetoric.umd.edu/",
  },
};
