// Nutrition and Food Science Major, Nutritional Science concentration, 2026-27 UMD Academic Catalog.
// See nfsc-shared-2026-27.ts. Catalog only; department page not checked. UNVERIFIED.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { nfscBase, nfscC, nfscCatalogUrl, nfscCommonReviewNotes } from "./nfsc-shared-2026-27.ts";

export const nfscMajorNutritionalScience: Program = {
  id: "nfsc-major-nutritional-science",
  name: "Nutrition and Food Science Major (Nutritional Science)",
  catalogYear: "2026-27",
  source: `UMD Academic Catalog 2026-27, Nutrition and Food Science Major, ${nfscCatalogUrl} (fetched 2026-09-28); department page not checked`,
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...nfscCommonReviewNotes,
    "The catalog prints two Nutritional Science restricted-elective lists that differ: the concentration table lists BSCI410, BSCI422, BSCI430, BSCI447, NFSC380, NFSC455, NFSC470; the separate 'restricted elective list' has NFSC380, NFSC456, NFSC470, BSCI410, BSCI422, BSCI430, BSCI447. Encoded as the union (never narrower), so NFSC455 and NFSC456 both count; 3 credits.",
  ],
  requirements: [
    ...nfscBase,
    nfscC("nfsc315", "Nutrition During the Life Cycle (NFSC315)", "NFSC315"),
    nfscC("nfsc421", "Food Chemistry (NFSC421)", "NFSC421"),
    nfscC("nfsc440", "Advanced Human Nutrition (NFSC440)", "NFSC440"),
    nfscC("nfsc450", "Food and Nutrient Analysis (NFSC450)", "NFSC450"),
    nfscC("bchm461", "Biochemistry I (BCHM461)", "BCHM461"),
    nfscC("bchm462", "Biochemistry II (BCHM462)", "BCHM462"),
    nfscC("bchm464", "Biochemistry Laboratory (BCHM464)", "BCHM464"),
    nfscC("bchm465", "Biochemistry III (BCHM465)", "BCHM465"),
    nfscC("biom301", "Introduction to Biometrics (BIOM301)", "BIOM301"),
    nfscC("bsci222", "Principles of Genetics (BSCI222)", "BSCI222"),
    { kind: "sets", id: "cell-bio-physiology", name: "Cell Biology and Physiology and Laboratory (BSCI331 & BSCI332)", options: [["BSCI331", "BSCI332"]] },
    nfscC("bsci450", "Mammalian Systems Physiology (BSCI450)", "BSCI450"),
    nfscC("calc1", "Elementary Calculus I or Calculus I (MATH120 or MATH140)", "MATH120", "MATH140"),
    nfscC("phys121", "Fundamentals of Physics I (PHYS121)", "PHYS121"),
    {
      kind: "choose",
      id: "nutritional-science-restricted-elective",
      name: "Nutritional Science Restricted Elective (3 credits)",
      credits: 3,
      from: { courses: ["BSCI410", "BSCI422", "BSCI430", "BSCI447", "NFSC380", "NFSC455", "NFSC456", "NFSC470"] },
    },
  ],
};

export const nfscMajorNutritionalScienceMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Nutrition & Food Science (Nutritional Science)",
  major: "nfsc",
  track: "Nutritional Science",
  sources: { catalog: nfscCatalogUrl },
};
