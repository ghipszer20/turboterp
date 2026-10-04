// Plant Sciences Major, Urban Forestry specialization, 2026-27 UMD Academic Catalog.
// See plsc-shared-2026-27.ts. Department page has no requirements. UNVERIFIED.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { plscBase, plscC, plscCatalogUrl, plscCommonReviewNotes, plscDepartmentUrl } from "./plsc-shared-2026-27.ts";

export const plscMajorUrbanForestry: Program = {
  id: "plsc-major-urban-forestry",
  name: "Plant Sciences Major (Urban Forestry)",
  catalogYear: "2026-27",
  source: `UMD Academic Catalog 2026-27, Plant Sciences Major, ${plscCatalogUrl}; department page ${plscDepartmentUrl} (both fetched 2026-09-28)`,
  verified: false,
  reviewNotes: [
    ...plscCommonReviewNotes,
    "The catalog's 'Suggested General Education Courses and Electives for urban forestry' table is advisory, not required, so it is not encoded.",
    "PLSC361 has no title in the source; encoded by course id.",
    "'Select one of the following: CHEM105 or CHEM231 & CHEM232' is encoded as a two-option set requirement.",
  ],
  requirements: [
    ...plscBase,
    plscC("arec240", "Introduction to Economics and the Environment (AREC240)", "AREC240"),
    plscC("bmgt220", "Principles of Accounting I (BMGT220)", "BMGT220"),
    plscC("insects", "Biology of Insects or Insect Pests of Ornamentals and Turf (BSCI337 or BSCI497)", "BSCI337", "BSCI497"),
    {
      kind: "sets",
      id: "chem-choice",
      name: "CHEM105 or Organic Chemistry I and Laboratory (CHEM231 & CHEM232)",
      options: [["CHEM105"], ["CHEM231", "CHEM232"]],
    },
    plscC("enst411", "Principles of Soil Fertility (ENST411)", "ENST411"),
    plscC("larc160", "Introduction to Landscape Architecture and Environmental Design (LARC160)", "LARC160"),
    plscC("plsc171", "Introduction to Urban Forestry (PLSC171)", "PLSC171"),
    plscC("plsc201", "Plant Structure and Function (PLSC201)", "PLSC201"),
    plscC("plsc206", "Plant Structure and Function Laboratory (PLSC206)", "PLSC206"),
    plscC("plsc253", "Woody Plants for Mid-Atlantic Landscapes I (PLSC253)", "PLSC253"),
    plscC("plsc254", "Woody Plants for Mid-Atlantic Landscape II (PLSC254)", "PLSC254"),
    plscC("plsc272", "Principles of Arboriculture (PLSC272)", "PLSC272"),
    plscC("plsc361", "PLSC361", "PLSC361"),
    plscC("plsc389", "Internship (PLSC389)", "PLSC389"),
    plscC("plsc400", "Plant Physiology (PLSC400)", "PLSC400"),
    plscC("plsc420", "Principles of Plant Pathology (PLSC420)", "PLSC420"),
    plscC("plsc471", "Forest Ecology (PLSC471)", "PLSC471"),
    plscC("plsc472", "Capstone-Urban Forest Project Management (PLSC472)", "PLSC472"),
  ],
};

export const plscMajorUrbanForestryMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Plant Sciences (Urban Forestry)",
  major: "plsc",
  track: "Urban Forestry",
  sources: { catalog: plscCatalogUrl, department: plscDepartmentUrl },
};
