// East Asian Studies Certificate, 2026–27 UMD Academic Catalog (History listing).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/history/east-asian-studies-certificate/
// (fetched 2026-09-28); Department of SLLC, https://sllc.umd.edu/fields/east-asian/certificate (fetched 2026-09-28).
// Owner ruling: where the department page and the catalog disagree, follow the department page.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

// Disciplines the catalog names for East Asia electives, plus the language/history prefixes.
const EAS_DEPARTMENTS = [
  "CHIN", "JAPN", "KORA", "HIST", "ARTH", "BMGT", "MUSC", "GVPT", "LING", "CMLT", "PLSC", "LARC", "SOCY", "WGSS", "WMST",
];

export const easCert: Program = {
  id: "eas-cert",
  name: "East Asian Studies Certificate",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, East Asian Studies Certificate (History listing); Department of SLLC, " +
    "https://sllc.umd.edu/fields/east-asian/certificate (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ credits: 9 }],
  reviewNotes: [
    "Two catalog listings carry identical text: History (https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/history/east-asian-studies-certificate/) and SLLC (https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/east-asian-studies-certificate/). Encoded once; the SLLC URL is recorded here only.",
    "Department vs catalog (language): the department page allows CHIN121/122 or any other upper-level Chinese course, JAPN101, or KORA101 and KORA102; the catalog lists CHIN101, JAPN101 and KORA101 & KORA102. The department options are encoded (CHIN121+CHIN122, or two Chinese courses at 121-499, never narrower); the catalog's CHIN101 route is not accepted. Not enforced: the catalog's language-competence exemption (exempt students take six more elective hours, 24 credits total).",
    "Department vs catalog (major overlap): the catalog says 'No more than nine credits from any one department or from the student's major may be applied toward the certificate'; the department page says 'No more than 9 credits used for a student's major may also count toward the certificate' plus a separate 9-credit cap per academic program or department. Encoded as maxSharedWith: [{ credits: 9 }], which caps overlap with ALL other programs (majors, minors, certificates), not majors only -- the engine can't restrict the cap to majors; flagged.",
    "Electives: 'approved courses from CEAS lists issued each semester' (department) / 'four regular approved courses on East Asia' (catalog); no list is published in either source. Encoded as 12 credits from a broad prefix set (" + EAS_DEPARTMENTS.join(", ") + ", covering the disciplines the catalog names), never narrower, so non-East-Asia courses in those departments are wrongly accepted; the student must confirm each is on the CEAS list. Flagged. Split follows the department page: 3 credits at 100-299 and 9 credits at 300-499 (the catalog says only 'nine of the 12 hours must be upper division').",
    "Not enforced (manual): no more than 9 credits from any one department; that electives cover at least three disciplines and China, Japan and Korea (recommended); at most 3 credits of special topics courses, with coordinator approval; at most 9 transfer credits; 2.0 overall certificate GPA; certificate admission and coordinator approval. The C- minimum per course is encoded.",
  ],
  requirements: [
    { kind: "course", id: "hist284", name: "HIST284 East Asian Civilization I", options: ["HIST284"] },
    { kind: "course", id: "hist285", name: "HIST285 East Asian Civilization II", options: ["HIST285"] },
    {
      kind: "sets",
      id: "language",
      name: "Language: CHIN121 & CHIN122 (or upper-level Chinese), JAPN101, or KORA101 & KORA102",
      options: [
        ["CHIN121", "CHIN122"],
        [{ count: 2, from: { departments: ["CHIN"], minNumber: 121, maxNumber: 499 } }],
        ["JAPN101"],
        ["KORA101", "KORA102"],
      ],
    },
    {
      kind: "choose",
      id: "electives",
      name: "East Asia electives: 12 credits from CEAS-approved courses",
      credits: 12,
      from: { departments: EAS_DEPARTMENTS, minNumber: 100, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "electives-upper",
      name: "Electives: 9 credits at the 300-400 level",
      overlay: true,
      credits: 9,
      from: { departments: EAS_DEPARTMENTS, minNumber: 300, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "electives-lower",
      name: "Electives: 3 credits at the 100-200 level",
      overlay: true,
      credits: 3,
      from: { departments: EAS_DEPARTMENTS, minNumber: 100, maxNumber: 299 },
    },
  ],
};

export const easCertMeta: ProgramMeta = {
  kind: "certificate",
  college: "ARHU",
  short: "East Asian Studies Certificate",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/history/east-asian-studies-certificate/",
    department: "https://sllc.umd.edu/fields/east-asian/certificate",
  },
};
