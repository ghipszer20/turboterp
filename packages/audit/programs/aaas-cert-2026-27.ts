// African American and Africana Studies Certificate, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/african-american-africana-studies/african-american-africana-studies-certificate/
// (fetched 2026-09-28); Department of African American and Africana Studies,
// https://aaas.umd.edu/undergraduate/certificate-african-american-studies (fetched 2026-09-28).
// Owner ruling: where the department page and the catalog disagree, follow the department page.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const aaasCert: Program = {
  id: "aaas-cert",
  name: "African American and Africana Studies Certificate",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, African American and Africana Studies Certificate; Department of African American " +
    "and Africana Studies, https://aaas.umd.edu/undergraduate/certificate-african-american-studies (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ credits: 9 }],
  reviewNotes: [
    "Department vs catalog: the department page allows AAAS200 or AAAS202 (Black Culture in the United States) for the third foundation course; the catalog lists AAAS200 only. The department page wins: AAAS200 or AAAS202.",
    "Department vs catalog: for the 9 upper-level credits, the department page says 'any 3 AAAS upper-level (300/400) courses'; the catalog says 'Pre-approved courses 300-level or above in other departments'. The department page wins: encoded as any 3 AAAS courses at 300-499. The catalog's pre-approved courses in other departments have no list in the source and are not recognised; flagged.",
    "Seminar: AAAS400 or AAAS402 in both sources. Same rule. AAAS400 and AAAS402 are excluded from the 3 upper-level courses so the seminar can't double as one of them.",
    "'No more than 9 credit hours applied towards a major may be counted for the certificate' -> maxSharedWith: [{ credits: 9 }], which caps overlap with ALL other programs, not majors only; the engine can't restrict the cap to majors; flagged.",
    "Not encoded (engine gaps, manual): the 2.0 cumulative certificate GPA; the cap of 9 credit hours at institutions other than UMD; 'regular grading method' (no pass/fail); certificate application/admission. The C- minimum per course is encoded.",
  ],
  requirements: [
    { kind: "course", id: "aaas100", name: "Introduction to African American and Africana Studies", options: ["AAAS100"] },
    { kind: "course", id: "aaas101", name: "Public Policy and the Black Community", options: ["AAAS101"] },
    { kind: "course", id: "aaas200", name: "African Civilization or Black Culture in the United States", options: ["AAAS200", "AAAS202"] },
    {
      kind: "choose",
      id: "upper",
      name: "Three AAAS upper-level (300/400) courses (9 credits)",
      count: 3,
      from: { departments: ["AAAS"], minNumber: 300, maxNumber: 499, exclude: ["AAAS400", "AAAS402"] },
    },
    {
      kind: "course",
      id: "seminar",
      name: "Seminar: Directed Readings or Classic Readings",
      options: ["AAAS400", "AAAS402"],
    },
  ],
};

export const aaasCertMeta: ProgramMeta = {
  kind: "certificate",
  college: "BSOS",
  short: "AAAS Certificate",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/african-american-africana-studies/african-american-africana-studies-certificate/",
    department: "https://aaas.umd.edu/undergraduate/certificate-african-american-studies",
  },
};
