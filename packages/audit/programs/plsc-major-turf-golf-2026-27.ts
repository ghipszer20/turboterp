// Plant Sciences Major, Turf and Golf Course Management specialization, 2026-27 UMD Academic Catalog.
// See plsc-shared-2026-27.ts. Department page has no requirements. UNVERIFIED.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { plscBase, plscC, plscCatalogUrl, plscCommonReviewNotes, plscDepartmentUrl } from "./plsc-shared-2026-27.ts";

export const plscMajorTurfGolf: Program = {
  id: "plsc-major-turf-golf",
  name: "Plant Sciences Major (Turf and Golf Course Management)",
  catalogYear: "2026-27",
  source: `UMD Academic Catalog 2026-27, Plant Sciences Major, ${plscCatalogUrl}; department page ${plscDepartmentUrl} (both fetched 2026-09-28)`,
  verified: false,
  reviewNotes: [
    ...plscCommonReviewNotes,
    "The catalog note 'BSCI161 and BSCI171 can count for BSCI180' is encoded as BSCI180, BSCI161 or BSCI171 satisfying the lab slot.",
    "The catalog lists BSCI160 (ecology) and BSCI170 (molecular and cellular) as separate requirements; both are required.",
  ],
  requirements: [
    ...plscBase,
    plscC("agst275", "Fundamentals of Agricultural and Environmental Chemistry (AGST275)", "AGST275"),
    plscC("bsci170", "Principles of Molecular & Cellular Biology (BSCI170)", "BSCI170"),
    plscC("bsci160", "Principles of Ecology and Evolution (BSCI160)", "BSCI160"),
    plscC("bio-lab", "Principles Biology Laboratory (BSCI180; BSCI161 or BSCI171 can count)", "BSCI180", "BSCI161", "BSCI171"),
    plscC("bsci337", "Biology of Insects (BSCI337)", "BSCI337"),
    plscC("comm107", "Oral Communication: Principles and Practices (COMM107)", "COMM107"),
    plscC("phys121", "Fundamentals of Physics I (PHYS121)", "PHYS121"),
    plscC("turf-business", "Business Management Principles for Turf Facilities or Agricultural Business Management (INAG215 or INAG204)", "INAG215", "INAG204"),
    plscC("inag235", "Irrigation and Drainage (INAG235)", "INAG235"),
    plscC("plsc201", "Plant Structure and Function (PLSC201)", "PLSC201"),
    plscC("plsc206", "Plant Structure and Function Laboratory (PLSC206)", "PLSC206"),
    plscC("plsc205", "Introduction to Turf Science and Management (PLSC205)", "PLSC205"),
    plscC("plsc389", "Internship (PLSC389)", "PLSC389"),
    plscC("plsc401", "Pest Management Strategies for Turfgrass (PLSC401)", "PLSC401"),
    plscC("plsc402", "Sports Turf Management (PLSC402)", "PLSC402"),
    plscC("plsc420", "Principles of Plant Pathology (PLSC420)", "PLSC420"),
    plscC("plsc453", "Weed Science (PLSC453)", "PLSC453"),
  ],
};

export const plscMajorTurfGolfMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Plant Sciences (Turf and Golf Course Management)",
  major: "plsc",
  track: "Turf and Golf Course Management",
  sources: { catalog: plscCatalogUrl, department: plscDepartmentUrl },
};
