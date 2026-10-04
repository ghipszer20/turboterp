// Nutrition and Food Science Major, Dietetics concentration, 2026-27 UMD Academic Catalog.
// See nfsc-shared-2026-27.ts. Catalog only; department page not checked. UNVERIFIED.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { nfscBase, nfscC, nfscCatalogUrl, nfscCommonReviewNotes } from "./nfsc-shared-2026-27.ts";

export const nfscMajorDietetics: Program = {
  id: "nfsc-major-dietetics",
  name: "Nutrition and Food Science Major (Dietetics)",
  catalogYear: "2026-27",
  source: `UMD Academic Catalog 2026-27, Nutrition and Food Science Major, ${nfscCatalogUrl} (fetched 2026-09-28); department page not checked`,
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...nfscCommonReviewNotes,
    "The catalog row 'EDMS451 | 0-3 or BIOM301' gives EDMS451 no title; encoded as EDMS451 or BIOM301.",
    "The catalog lists NFSC425 in the restricted-elective list with no title; kept as a member.",
    "Dietetics Restricted Elective is 12 credits from the listed 12 courses; encoded as a 12-credit choose over that list (the catalog's 4-credit BSCI222 counts its real credits).",
  ],
  requirements: [
    ...nfscBase,
    nfscC("nfsc315", "Nutrition During the Life Cycle (NFSC315)", "NFSC315"),
    nfscC("nfsc350", "Foodservice Operations (NFSC350)", "NFSC350"),
    nfscC("nfsc380", "Methods of Nutritional Assessment (NFSC380)", "NFSC380"),
    nfscC("nfsc440", "Advanced Human Nutrition (NFSC440)", "NFSC440"),
    nfscC("nfsc470", "Community Nutrition (NFSC470)", "NFSC470"),
    nfscC("nfsc455", "Medical Nutrition Therapy I (NFSC455)", "NFSC455"),
    nfscC("nfsc456", "Medical Nutrition Therapy II (NFSC456)", "NFSC456"),
    nfscC("nfsc491", "Professional Issues and Opportunities in Dietetics (NFSC491)", "NFSC491"),
    nfscC("bchm461", "Biochemistry I (BCHM461)", "BCHM461"),
    nfscC("bchm462", "Biochemistry II (BCHM462)", "BCHM462"),
    nfscC("bmgt364", "Managing People and Organizations (BMGT364)", "BMGT364"),
    { kind: "sets", id: "cell-bio-physiology", name: "Cell Biology and Physiology and Laboratory (BSCI331 & BSCI332)", options: [["BSCI331", "BSCI332"]] },
    nfscC("bsci450", "Mammalian Systems Physiology (BSCI450)", "BSCI450"),
    nfscC("math-algebra", "College Algebra and Trigonometry or Precalculus (MATH113 or MATH115)", "MATH113", "MATH115"),
    nfscC("psyc100", "Introduction to Psychology (PSYC100)", "PSYC100"),
    nfscC("biometrics", "EDMS451 or Introduction to Biometrics (BIOM301)", "EDMS451", "BIOM301"),
    nfscC("socy100", "Introduction to Sociology (SOCY100)", "SOCY100"),
    {
      kind: "choose",
      id: "dietetics-restricted-elective",
      name: "Dietetics Restricted Elective (12 credits)",
      credits: 12,
      from: {
        courses: ["AREC250", "BMGT220", "BMGT360", "BSCI222", "BSCI422", "EDCP210", "KNES360", "NFSC421", "NFSC425", "NFSC430", "NFSC498", "NFSC450"],
      },
    },
  ],
};

export const nfscMajorDieteticsMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Nutrition & Food Science (Dietetics)",
  major: "nfsc",
  track: "Dietetics",
  defaultTrack: true,
  sources: { catalog: nfscCatalogUrl },
};
