// Persian Studies Minor, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/persian-studies/persian-studies-minor/;
// SLLC Persian page https://sllc.umd.edu/persian; ARHU minors list (all fetched 2026-09-28).
// No official published sample plan (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const persMinor: Program = {
  id: "pers-minor",
  name: "Persian Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Persian Studies Minor; SLLC Persian program, " +
    "https://sllc.umd.edu/persian (fetched 2026-09-28)",
  verified: false,
  minGrade: "C-",
  minGpa: 2.0,
  reviewNotes: [
    "Department page (sllc.umd.edu/persian) is only a program overview with no requirements, so it neither confirms nor contradicts the catalog; encoded from the catalog. No department-vs-catalog difference found.",
    "Electives: 3 of PERS353, PERS371, PERS385, PERS498 (9 credits), as listed. The catalog also says electives may be substituted in consultation with the Undergraduate Advisor; substitutions are not encoded. 'At least 9 credits upper-level' is met automatically by the listed electives.",
    "Neither source states a cap on overlap with a major; none set. 'Courses may not be used to fulfill the requirements of two minors' is not encoded (no way to name every other minor); manual check.",
    "Manual notes, not encodable: mandatory placement assessment and substitute courses for students placing out (advisor); up to 6 transfer credits toward language requirements; overall minor GPA of 2.0 encoded as minGpa; a lower-level language course may not be taken after a higher one.",
  ],
  requirements: [
    { kind: "course", id: "pers103", name: "Beginning Persian I", options: ["PERS103"] },
    { kind: "course", id: "pers104", name: "Beginning Persian II", options: ["PERS104"] },
    { kind: "course", id: "pers201", name: "Intermediate Persian I", options: ["PERS201"] },
    { kind: "course", id: "pers202", name: "Intermediate Persian II", options: ["PERS202"] },
    {
      kind: "choose",
      id: "electives",
      name: "Electives (9 credits)",
      credits: 9,
      from: { courses: ["PERS353", "PERS371", "PERS385", "PERS498"] },
    },
  ],
};

export const persMinorMeta: ProgramMeta = { kind: "minor", college: "ARHU", short: "Persian Studies", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/persian-studies/persian-studies-minor/", department: "https://sllc.umd.edu/persian" } };
