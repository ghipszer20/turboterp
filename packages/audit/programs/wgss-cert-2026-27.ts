// Women, Gender, and Sexuality Studies Certificate, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/women-gender-sexuality-studies/women-gender-sexuality-studies-certificate/
// (fetched 2026-09-28); Department of WGSS, https://wgss.umd.edu/academic-programs/undergraduate/WGSS-certificate
// (fetched 2026-09-28; the page title begins "ARCHIVE"). Owner ruling: where the department page and the
// catalog disagree, follow the department page. Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const wgssCert: Program = {
  id: "wgss-cert",
  name: "Women, Gender, and Sexuality Studies Certificate",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Women, Gender, and Sexuality Studies Certificate; Department of WGSS, " +
    "https://wgss.umd.edu/academic-programs/undergraduate/WGSS-certificate (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ credits: 9 }],
  reviewNotes: [
    "Department page title begins 'ARCHIVE - Women, Gender, and Sexuality Studies Certificate': the certificate may no longer admit students (flagged in docs/project/owner-review.md). Encoded anyway.",
    "Department vs catalog: the catalog says 'No more than nine credits that are applied toward a major may be included in the certificate'; the department page says 'No more than 9 credits can overlap with the student's major'. Same rule. Encoded as maxSharedWith: [{ credits: 9 }], which caps overlap with ALL other programs (majors, minors, certificates), not majors only -- the engine can't restrict the cap to majors; flagged.",
    "Department vs catalog: the department page requires 'at least 12 credits at or above the 300 level'; the catalog says 'twelve of which must be at the 3xx/4xx level'. Same rule; encoded as an overlay choose of 12 credits from WGSS/WMST/LGBT 300-499.",
    "Department vs catalog: the department page lists the capstone as LGBT488, WGSS488 (any version) or an additional 400-level course from the thematic concentration; the catalog lists the same three routes. Encoded as one course from WGSS/WMST/LGBT at 400-499 (which includes WGSS488 and LGBT488).",
    "Thematic concentration (4 courses, 12 credits) has no course list in either source ('consult the department'; the department page does not say which courses fall in which of the seven areas). Encoded as any 4 courses from the whole department range (WGSS, WMST and LGBT prefixes, 100-499), never narrower. Not enforced (manual check): that the four courses fall within a single thematic concentration (Social Justice; Transnational Politics and Perspectives; Race, Ethnicity and Class; Bodies, Genders and Sexualities; Arts, Technologies, and Cultural Production; LGBTQ Studies; Student Designed), and that the capstone 400-level course comes from the student's concentration. Courses with other prefixes that the department approves for a concentration (cross-listed or Student Designed) are not recognised.",
    "Not encoded (engine gaps, manual): the 2.0 overall certificate GPA; the cap of 9 credits at institutions other than UMD; certificate admission gates. The C- minimum per course is encoded.",
  ],
  requirements: [
    {
      kind: "course",
      id: "intro",
      name: "Introductory course (3 credits)",
      options: ["LGBT200", "WGSS200", "WGSS250", "WGSS263", "WGSS290"],
    },
    { kind: "course", id: "foundation", name: "Feminist, Critical Race, and Queer Theories", options: ["WGSS302"] },
    {
      kind: "choose",
      id: "thematic",
      name: "Thematic concentration: 4 courses (12 credits), any WGSS, WMST or LGBT course",
      count: 4,
      from: { departments: ["WGSS", "WMST", "LGBT"], minNumber: 100, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "capstone",
      name: "Capstone: WGSS488, LGBT488 or another 400-level course from the thematic concentration",
      count: 1,
      from: { departments: ["WGSS", "WMST", "LGBT"], minNumber: 400, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "upper-credits",
      name: "At least 12 credits at the 300 level or above",
      overlay: true,
      credits: 12,
      from: { departments: ["WGSS", "WMST", "LGBT"], minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const wgssCertMeta: ProgramMeta = {
  kind: "certificate",
  college: "ARHU",
  short: "WGSS Certificate",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/women-gender-sexuality-studies/women-gender-sexuality-studies-certificate/",
    department: "https://wgss.umd.edu/academic-programs/undergraduate/WGSS-certificate",
  },
};
