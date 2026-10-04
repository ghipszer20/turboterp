// Latin American and Caribbean Studies Certificate, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/latin-american-caribbean-studies-certificate/
// (fetched 2026-09-28); LACS, https://lacs.umd.edu/academics/certificate (fetched 2026-09-28).
// Owner ruling: where the department page and the catalog disagree, follow the department page.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

// Departments that plausibly offer Latin America / Caribbean content; the approved list is not published.
const LACS_DEPARTMENTS = [
  "LACS", "SPAN", "PORT", "FREN", "HIST", "GVPT", "ANTH", "ARTH", "AMST", "AASP", "CMLT", "ECON", "GEOG", "SOCY", "MUSC", "WGSS", "ENGL",
];

export const lacsCert: Program = {
  id: "lacs-cert",
  name: "Latin American and Caribbean Studies Certificate",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Latin American and Caribbean Studies Certificate; LACS, " +
    "https://lacs.umd.edu/academics/certificate (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Department vs catalog (core): the department page names LACS234, LACS235, LACS250 or LACS251, and LACS458. The catalog lists the same courses with cross-listings (SPAN/PORT234, SPAN/PORT235, HIST250, HIST251, SPAN458). The cross-listed codes are the same courses, so they are accepted as alternatives; flagged in case the department intends LACS-prefixed sections only.",
    "Department vs catalog (electives): the department page says 'three elective courses (9 credits) with Latin American and or Caribbean-related content from at least two different departments; six of the nine credits at 300 and/or 400 levels'; the catalog says 'nine credits from an approved list and from at least two different departments; at least six credits at 3xx or 4xx'. Same rule. No approved list is published in either source, so this is encoded as 3 courses from a broad set of departments (" + LACS_DEPARTMENTS.join(", ") + "), never narrower, so non-Latin-America courses in those departments are wrongly accepted; the student must confirm each is approved. Flagged. The 6 credits at 300+ is an overlay choose. The at-least-two-different-departments rule is enforced: the electives are a distribution with one area per department in that set (3 courses, at least 2 areas).",
    "Language competence (catalog: competence in one language of the Americas other than English, shown by C+ or better in an intermediate-level course or a placement exam; department: Spanish, Portuguese, or another language with permission) is not a course requirement and is not encoded. Manual check with the LACS undergraduate advisor.",
    "Not encoded (manual): the 2.0 overall certificate GPA; certificate admission and approval. The C- minimum per course is encoded. The catalog states no sharing cap with other programs, so none is set.",
  ],
  requirements: [
    { kind: "course", id: "lacs234", name: "LACS234 Issues in Latin American and Caribbean Studies I", options: ["LACS234", "SPAN234", "PORT234"] },
    { kind: "course", id: "lacs235", name: "LACS235 Issues in Latin American and Caribbean Studies II", options: ["LACS235", "SPAN235", "PORT235"] },
    { kind: "course", id: "history", name: "LACS250 or LACS251 (Latin American history)", options: ["LACS250", "LACS251", "HIST250", "HIST251"] },
    { kind: "course", id: "capstone", name: "LACS458 Senior Capstone", options: ["LACS458", "SPAN458"] },
    {
      kind: "distribution",
      id: "electives",
      name: "Electives: 3 courses with Latin American or Caribbean content, from at least two departments",
      count: 3,
      minAreas: 2,
      maxPerArea: 3,
      areas: LACS_DEPARTMENTS.map((dept) => ({ name: dept, from: { departments: [dept], minNumber: 100, maxNumber: 499 } })),
    },
    {
      kind: "choose",
      id: "electives-upper",
      name: "Electives: at least 6 credits at the 300-400 level",
      overlay: true,
      credits: 6,
      from: { departments: LACS_DEPARTMENTS, minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const lacsCertMeta: ProgramMeta = {
  kind: "certificate",
  college: "ARHU",
  short: "LACS Certificate",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/latin-american-caribbean-studies-certificate/",
    department: "https://lacs.umd.edu/academics/certificate",
  },
};
