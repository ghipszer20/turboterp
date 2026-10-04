// American Sign Language (ASL) Minor and Disability Studies Minor, 2026–27 UMD Academic Catalog
// (Department of Counseling, Higher Education, and Special Education).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/education/counseling-higher-special-education/
// american-sign-language-minor/ and disability-studies-minor/ (fetched 2026-09-28).
// Department page: not checked (program-sources holds the catalog page only).
// No official published sample plans (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const SOURCE_CHSE_MINORS =
  "UMD Academic Catalog 2026–27, Counseling, Higher Education, and Special Education minors (fetched 2026-09-28); department page not checked";

export const chseMinorAsl: Program = {
  id: "chse-minor-asl",
  name: "American Sign Language (ASL) Minor",
  catalogYear: "2026-27",
  source: SOURCE_CHSE_MINORS,
  verified: false,
  reviewNotes: [
    "Catalog only; department page not checked. Four core courses (CHSE376, CHSE476, CHSE477, CHSE480) plus one elective from a 12-course list; 15 credits.",
    "The catalog states no minimum grade, sharing cap, GPA or residency rule for this minor; none is encoded.",
  ],
  requirements: [
    { kind: "course", id: "chse376", name: "Fundamentals of Sign Language", options: ["CHSE376"] },
    { kind: "course", id: "chse476", name: "Communicating with Sign Language", options: ["CHSE476"] },
    { kind: "course", id: "chse477", name: "ASL III: Intermediate Sign Language Communication", options: ["CHSE477"] },
    { kind: "course", id: "chse480", name: "Deaf Culture, History, and Community", options: ["CHSE480"] },
    {
      kind: "choose",
      id: "elective",
      name: "Elective course (choose one)",
      count: 1,
      from: {
        courses: [
          "TLPL253", "TLPL441", "TLPL442", "TLPL443", "HESP420", "EDHD241",
          "EDHD310", "EDHD411", "EDHD425", "EDSP411", "LING200", "LING240",
        ],
      },
    },
  ],
};

const DS_300_PLUS = [
  "BMGT360", "COMM382", "INST466", "EDHD310", "EDSP376", "CHSE376", "EDSP470", "EDSP311",
  "EDSP476", "EDSP498", "FMSC330", "ENME444", "HESP386", "KNES334", "PLCY302", "PSYC354", "SOCY335",
];

export const chseMinorDisabilityStudies: Program = {
  id: "chse-minor-disability-studies",
  name: "Disability Studies Minor",
  catalogYear: "2026-27",
  source: SOURCE_CHSE_MINORS,
  minGrade: "C",
  verified: false,
  reviewNotes: [
    "Catalog only; department page not checked. Foundation: CHSE205 plus one of EDSP220 or HESP202; then three electives from an 18-course list; 15 credits. EDSP220 and HESP202 also appear in the elective list, so the one not used as the foundation can count as an elective.",
    "'Nine of the 15 credits must be at the 300 level or above' is an overlay choose (9 credits) over the 300+ courses of the program's lists; the only 200-level courses (CHSE205, EDSP220, HESP202) are the foundations.",
    "The elective list prints 'EDSP376 | Fundamentals of Sign Language', but that title is CHSE376 (the ASL minor's core course). Both codes are accepted; likely a catalog typo.",
    "EDSP476 has no title in the catalog. ENME444 requires permission of the School of Engineering (not encoded). EDSP498 must be taken for 3 credits (not encoded).",
    "'Other elective courses may be included with program advisor's approval' is open-ended with no named range; not encoded (manual check).",
    "'No more than six credits from off-campus (study abroad, transfer, etc.)' is a residency/transfer cap, not encoded. Catalog states no sharing cap; none is set.",
  ],
  requirements: [
    { kind: "course", id: "chse205", name: "Disability: From Stigma and Sideshow to Mainstream and Main Street", options: ["CHSE205"] },
    { kind: "course", id: "foundation2", name: "EDSP220 or HESP202", options: ["EDSP220", "HESP202"] },
    {
      kind: "choose",
      id: "electives",
      name: "Electives (three)",
      count: 3,
      from: { courses: ["EDSP220", "HESP202", ...DS_300_PLUS] },
    },
    {
      kind: "choose",
      id: "upper-division",
      name: "Nine credits at the 300 level or above",
      overlay: true,
      credits: 9,
      from: { courses: DS_300_PLUS },
    },
  ],
};

export const chseMinorAslMeta: ProgramMeta = { kind: "minor", college: "EDUC", short: "ASL", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/counseling-higher-special-education/american-sign-language-minor/" } };

export const chseMinorDisabilityStudiesMeta: ProgramMeta = { kind: "minor", college: "EDUC", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/counseling-higher-special-education/disability-studies-minor/" } };
