// Environmental Science and Technology Major, Soil and Watershed Science concentration, 2026-27 UMD
// Academic Catalog. See enst-shared-2026-27.ts. Catalog only. UNVERIFIED.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { enstC, enstCatalogUrl, enstCommonReviewNotes, enstCore, enstDepartmentUrl } from "./enst-shared-2026-27.ts";

const SOIL_SCIENCES = ["ENST411", "ENST414", "ENST417", "ENST421", "ENST422"];

export const enstMajorSoilWatershedScience: Program = {
  id: "enst-major-soil-watershed-science",
  name: "Environmental Science and Technology Major (Soil and Watershed Science)",
  catalogYear: "2026-27",
  source: `UMD Academic Catalog 2026-27, Environmental Science and Technology Major, ${enstCatalogUrl}; ${enstDepartmentUrl} (both fetched 2026-09-28)`,
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    ...enstCommonReviewNotes,
    "Concentration Depth - Soil Sciences ('4 classes; at least 13 credits') is a 4-course choose over the five listed courses plus an overlay 13-credit choose over the same list. The catalog gives no credits for ENST411 (13 = 4 + 3 + 3 + 3 implies 4); the sample plan uses 4.",
    "Concentration Depth - Field Experiences (3 credits) is a 3-credit choose over its seven courses; the source gives no credits for ENST301/302/303/309.",
    "Technical Electives (12 credits) is one 12-credit choose over the union of the three blocks (advising groupings only). The catalog's core line 'ENST456 or GEOG272, GEOG373, INAG237' is one course requirement with those four options. A course in two lists (ENST430, ENST450 in field experiences and elsewhere; ENST422 as a soil science) can count once only.",
    "Not encoded: footnote 3 (marked as required for the Soil Certification Exam), an advising note.",
  ],
  requirements: [
    ...enstCore,
    enstC("geol100", "Physical Geology (GEOL100)", "GEOL100"),
    enstC("geol110", "Physical Geology Laboratory (GEOL110)", "GEOL110"),
    enstC("spatial", "Spatial Analysis (ENST456, GEOG272, GEOG373 or INAG237)", "ENST456", "GEOG272", "GEOG373", "INAG237"),
    {
      kind: "choose",
      id: "depth-soil-sciences",
      name: "Concentration Depth - Soil Sciences (4 courses)",
      count: 4,
      from: { courses: SOIL_SCIENCES },
    },
    {
      kind: "choose",
      id: "depth-soil-sciences-credits",
      name: "Concentration Depth - Soil Sciences (at least 13 credits)",
      overlay: true,
      credits: 13,
      from: { courses: SOIL_SCIENCES },
    },
    {
      kind: "choose",
      id: "depth-field-experiences",
      name: "Concentration Depth - Field Experiences (3 credits)",
      credits: 3,
      from: { courses: ["ENST301", "ENST302", "ENST303", "ENST309", "ENST430", "ENST441", "ENST450"] },
    },
    {
      kind: "choose",
      id: "technical-electives",
      name: "Soil and Watershed Science Technical Electives (12 credits)",
      credits: 12,
      from: {
        courses: [
          "AREC365", "PLSC303", "PLSC400",
          "BSCI223", "BSCI337", "BSCI467", "ENST432", "PLSC404",
          "GEOL340", "GEOL341", "ENST334", "ENST423", "ENST453", "GEOL451", "GEOL452", "GEOL453",
        ],
      },
    },
  ],
};

export const enstMajorSoilWatershedScienceMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Environmental Science & Technology (Soil and Watershed Science)",
  major: "enst",
  track: "Soil and Watershed Science",
  sources: { catalog: enstCatalogUrl, department: enstDepartmentUrl },
};
