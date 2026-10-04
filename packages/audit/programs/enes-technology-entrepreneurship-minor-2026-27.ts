// Technology Entrepreneurship and Corporate Innovation Minor, 2026–27 UMD Academic Catalog (A. James Clark School of Engineering).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/technology-entrepreneurship-minor/
// and https://mtech.umd.edu/educate/minor (both fetched 2026-09-28).
// Owner ruling: where the department page and the catalog disagree, follow the department page.
// No official published sample plan (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const COURSES = [
  "ENES140", "ENES210", "ENES460", "ENES461", "ENES462", "ENES463", "ENES464", "ENES466", "ENES471",
  "HEIP143", "HEIP240", "HEIP241",
  "SMLP470", "SMLP471", "SMLP472", "SMLP473", "SMLP474",
];

export const technologyEntrepreneurshipMinor: Program = {
  id: "technology-entrepreneurship-minor",
  name: "Technology Entrepreneurship and Corporate Innovation Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Technology Entrepreneurship and Corporate Innovation Minor; Mtech, " +
    "https://mtech.umd.edu/educate/minor (fetched 2026-09-28)",
  verified: false,
  reviewNotes: [
    "Catalog: 15 credits from a subset of 17 courses, at least 9 credits at the 400 level, and 100/200-level courses limited to 6 credits in total. Encoded as a 15-credit choose over the 17 courses plus an overlay of 9 credits at 400+ (which with 15 total credits also caps 100/200-level courses at 6).",
    "Department-vs-catalog difference: the department page says 'five courses for 15 credits' and lists only eight ENES courses ('may include'), plus the four SMLP courses (470, 471, 472, 474) for Terrapin Innovation Leadership Program (TILP) students. The catalog additionally lists ENES464, HEIP143 (1 credit), HEIP240, HEIP241 (2 credits) and SMLP473. Because the department list is 'may include', not exhaustive, the catalog's 17 courses are all accepted (widest reading); encoded in credits, not five courses, since HEIP143 and HEIP241 are not 3 credits.",
    "TILP students complete the four SMLP courses plus an eligible transfer course for ENES210 (department page); the transfer course is not encoded.",
    "Admission (department page), not encoded: apply via the Mtech advising worksheet no later than one year before graduation; open to any major. No minimum grade or sharing cap is stated by either source, so none is set.",
  ],
  requirements: [
    { kind: "choose", id: "courses", name: "15 credits of minor courses", credits: 15, from: { courses: COURSES } },
    { kind: "choose", id: "upper-level", name: "At least 9 credits at the 400 level", credits: 9, from: { courses: COURSES, minNumber: 400 }, overlay: true },
  ],
};

export const technologyEntrepreneurshipMinorMeta: ProgramMeta = { kind: "minor", college: "ENGR", short: "Tech. Entrepreneurship Minor", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/technology-entrepreneurship-minor/", department: "https://mtech.umd.edu/educate/minor" } };
