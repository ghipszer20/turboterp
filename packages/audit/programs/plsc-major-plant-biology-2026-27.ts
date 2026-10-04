// Plant Sciences Major, Plant Biology specialization, 2026-27 UMD Academic Catalog.
// See plsc-shared-2026-27.ts. Department page has no requirements. UNVERIFIED.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { plscBase, plscC, plscCatalogUrl, plscCommonReviewNotes, plscDepartmentUrl } from "./plsc-shared-2026-27.ts";

export const plscMajorPlantBiology: Program = {
  id: "plsc-major-plant-biology",
  name: "Plant Sciences Major (Plant Biology)",
  catalogYear: "2026-27",
  source: `UMD Academic Catalog 2026-27, Plant Sciences Major, ${plscCatalogUrl}; department page ${plscDepartmentUrl} (both fetched 2026-09-28)`,
  verified: false,
  reviewNotes: [
    ...plscCommonReviewNotes,
    "The catalog row 'BCHM261 or BSCI461' gives no titles; encoded as one option of the Advanced Science Electives list alongside ENST411, ENST417, ENST421 and PHYS122.",
    "Advanced Plant Science Electives: PLSC403, PLSC456 and PLSC474 have no titles in the source; kept as members of the 'select one' list.",
    "PLSC399 (Special Problems in Plant Science, 1-3 credits) is required once; the credit count is not audited.",
  ],
  requirements: [
    ...plscBase,
    plscC("bsci337", "Biology of Insects (BSCI337)", "BSCI337"),
    plscC("plant-physiology", "Plant Physiology (BSCI442 or PLSC400)", "BSCI442", "PLSC400"),
    plscC("chem231", "Organic Chemistry I (CHEM231)", "CHEM231"),
    plscC("chem232", "Organic Chemistry Laboratory I (CHEM232)", "CHEM232"),
    plscC("chem241", "Organic Chemistry II (CHEM241)", "CHEM241"),
    plscC("chem242", "Organic Chemistry Laboratory II (CHEM242)", "CHEM242"),
    plscC("calculus", "Calculus I (MATH140 or MATH120)", "MATH140", "MATH120"),
    plscC("phys121", "Fundamentals of Physics I (PHYS121)", "PHYS121"),
    plscC("plsc201", "Plant Structure and Function (PLSC201)", "PLSC201"),
    plscC("plsc206", "Plant Structure and Function Laboratory (PLSC206)", "PLSC206"),
    plscC("plsc202", "PLSC202", "PLSC202"),
    plscC("plsc203", "Plants, Genes and Biotechnology (PLSC203)", "PLSC203"),
    plscC("plsc271", "Plant Propagation (PLSC271)", "PLSC271"),
    plscC("plsc399", "Special Problems in Plant Science (PLSC399)", "PLSC399"),
    plscC("plsc420", "Principles of Plant Pathology (PLSC420)", "PLSC420"),
    plscC(
      "advanced-plant-science",
      "Advanced Plant Science Elective (one of PLSC403, 430, 432, 433, 452, 456, 474)",
      "PLSC403",
      "PLSC430",
      "PLSC432",
      "PLSC433",
      "PLSC452",
      "PLSC456",
      "PLSC474",
    ),
    plscC(
      "advanced-science",
      "Advanced Science Elective (one of BCHM261 or BSCI461, ENST411, ENST417, ENST421, PHYS122)",
      "BCHM261",
      "BSCI461",
      "ENST411",
      "ENST417",
      "ENST421",
      "PHYS122",
    ),
  ],
};

export const plscMajorPlantBiologyMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Plant Sciences (Plant Biology)",
  major: "plsc",
  track: "Plant Biology",
  defaultTrack: true,
  sources: { catalog: plscCatalogUrl, department: plscDepartmentUrl },
};
