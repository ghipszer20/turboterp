// Latin American and Caribbean Studies Minor, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/latin-american-studies-minor/
// (fetched 2026-09-28); LACS, https://lacs.umd.edu/ (fetched 2026-09-28; homepage only, no minor requirements).
// Encoded by hand from the catalog. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

// Same department set as the LACS certificate (lacs-cert-2026-27.ts); the approved elective list is not published.
const LACS_MINOR_DEPARTMENTS = [
  "LACS", "SPAN", "PORT", "FREN", "HIST", "GVPT", "ANTH", "ARTH", "AMST", "AASP", "CMLT", "ECON", "GEOG", "SOCY", "MUSC", "WGSS", "ENGL",
];

export const lacsMinor: Program = {
  id: "lacs-minor",
  name: "Latin American and Caribbean Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Latin American and Caribbean Studies Minor; LACS, https://lacs.umd.edu/ (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Department page not checked: the fetched lacs.umd.edu page is the center's homepage with no minor requirements, so this is encoded from the catalog alone.",
    "The catalog names the minor 'Latin American and Caribbean Studies Minor' at a 'latin-american-studies-minor' URL; the brief calls it Latin American Studies. Encoded once.",
    "Catalog rows: LACS/SPAN234 or LACS/SPAN235; HIST/LACS250 or HIST251; one of LACS486, LACS369 or LACS499; two 300/400 electives. LACS369 may be replaced by an approved 3-credit study abroad course with department permission (manual, not encoded). Cross-listings beyond those the catalog names (e.g. LACS251) are not added.",
    "Electives: 'at least 75% Latin American-related content and from two different departments'. No approved list is published, so this is two 300/400 courses from the same broad department set as the LACS certificate (never narrower); courses without Latin American content in those departments are wrongly accepted. The two-different-departments rule is enforced (a distribution with one area per department in that set); the 75% Latin American content is not enforced (manual).",
    "Language competence (a language of the Americas other than English, C+ or better in an intermediate-level course or a placement exam) is not a course requirement and is not encoded (manual, with the LACS advisor).",
    "Not encoded (manual): the 2.0 cumulative minor GPA (the catalog states no per-course floor; C- applied per the minors ruling). The catalog states no sharing cap with other programs, so none is set.",
  ],
  requirements: [
    { kind: "course", id: "issues", name: "LACS/SPAN234 or LACS/SPAN235 Issues in Latin American and Caribbean Studies", options: ["LACS234", "SPAN234", "LACS235", "SPAN235"] },
    { kind: "course", id: "history", name: "HIST/LACS250 or HIST251 Latin American history", options: ["LACS250", "HIST250", "HIST251"] },
    { kind: "course", id: "experiential", name: "LACS486 internship, LACS369 study abroad or LACS499 independent study", options: ["LACS486", "LACS369", "LACS499"] },
    {
      kind: "distribution",
      id: "electives",
      name: "Two upper-level electives (300 or 400) with Latin American content, from two departments",
      count: 2,
      minAreas: 2,
      maxPerArea: 1,
      areas: LACS_MINOR_DEPARTMENTS.map((dept) => ({ name: dept, from: { departments: [dept], minNumber: 300, maxNumber: 499 } })),
    },
  ],
};

export const lacsMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "LACS Minor",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/latin-american-studies-minor/",
    department: "https://lacs.umd.edu/",
  },
};
