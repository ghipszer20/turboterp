// Nutrition and Food Science Major, Food Science concentration, 2026-27 UMD Academic Catalog.
// See nfsc-shared-2026-27.ts. Catalog only; department page not checked. UNVERIFIED.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { nfscBase, nfscC, nfscCatalogUrl, nfscCommonReviewNotes } from "./nfsc-shared-2026-27.ts";

export const nfscMajorFoodScience: Program = {
  id: "nfsc-major-food-science",
  name: "Nutrition and Food Science Major (Food Science)",
  catalogYear: "2026-27",
  source: `UMD Academic Catalog 2026-27, Nutrition and Food Science Major, ${nfscCatalogUrl} (fetched 2026-09-28); department page not checked`,
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...nfscCommonReviewNotes,
    "The catalog lists NFSC425 in the restricted-elective list with no title; kept as a member.",
    "Food Science Restricted Elective is 3 credits from a 9-course list; encoded as a 3-credit choose.",
  ],
  requirements: [
    ...nfscBase,
    nfscC("nfsc398", "Seminar (NFSC398)", "NFSC398"),
    nfscC("nfsc412", "Food Processing Technology (NFSC412)", "NFSC412"),
    nfscC("nfsc414", "Mechanics of Food Processing (NFSC414)", "NFSC414"),
    nfscC("nfsc421", "Food Chemistry (NFSC421)", "NFSC421"),
    nfscC("nfsc422", "Food Product Research and Development (NFSC422)", "NFSC422"),
    nfscC("nfsc423", "Food Chemistry Laboratory (NFSC423)", "NFSC423"),
    nfscC("nfsc430", "Food Microbiology (NFSC430)", "NFSC430"),
    nfscC("nfsc431", "Food Quality Control (NFSC431)", "NFSC431"),
    nfscC("nfsc434", "Food Microbiology Laboratory (NFSC434)", "NFSC434"),
    nfscC("nfsc450", "Food and Nutrient Analysis (NFSC450)", "NFSC450"),
    nfscC("bchm463", "Biochemistry of Physiology (BCHM463)", "BCHM463"),
    nfscC("biom301", "Introduction to Biometrics (BIOM301)", "BIOM301"),
    nfscC("calc1", "Elementary Calculus I or Calculus I (MATH120 or MATH140)", "MATH120", "MATH140"),
    nfscC("calc2", "Elementary Calculus II or Calculus II (MATH121 or MATH141)", "MATH121", "MATH141"),
    nfscC("phys121", "Fundamentals of Physics I (PHYS121)", "PHYS121"),
    {
      kind: "choose",
      id: "food-science-restricted-elective",
      name: "Food Science Restricted Elective (3 credits)",
      credits: 3,
      from: { courses: ["AREC250", "BMGT220", "BMGT360", "BSCI222", "BMGT364", "BSCI422", "ENST333", "KNES360", "NFSC425"] },
    },
  ],
};

export const nfscMajorFoodScienceMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Nutrition & Food Science (Food Science)",
  major: "nfsc",
  track: "Food Science",
  sources: { catalog: nfscCatalogUrl },
};
