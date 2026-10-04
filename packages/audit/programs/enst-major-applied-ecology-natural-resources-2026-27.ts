// Environmental Science and Technology Major, Applied Ecology and Natural Resources concentration,
// 2026-27 UMD Academic Catalog. See enst-shared-2026-27.ts. Catalog only. UNVERIFIED.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { enstC, enstCatalogUrl, enstCommonReviewNotes, enstCore, enstDepartmentUrl } from "./enst-shared-2026-27.ts";

export const enstMajorAppliedEcologyNaturalResources: Program = {
  id: "enst-major-applied-ecology-natural-resources",
  name: "Environmental Science and Technology Major (Applied Ecology and Natural Resources)",
  catalogYear: "2026-27",
  source: `UMD Academic Catalog 2026-27, Environmental Science and Technology Major, ${enstCatalogUrl}; ${enstDepartmentUrl} (both fetched 2026-09-28)`,
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    ...enstCommonReviewNotes,
    "Concentration Depth (3 courses) is one course from each of three groups (Wildlife and Habitats; Wetlands and Waterways; Urban Sustainability), encoded as three single-course requirements.",
    "Technical Electives (15 credits) is one 15-credit choose over the union of the three blocks. 'GEOG331 or GEOG333' is one alternatives group. 'ENSP330 or GVPT273' is not grouped because GVPT273 is also listed on its own in Wildlife and Habitats (so both can count). A course in both depth and electives (ENST410, ENST450, ENST453, ENST430, ENST460) can count once only.",
    "Not encoded: footnote 2 (the marked wetlands courses are required for the Society of Wetland Scientists WPIT professional certification) and footnote 3 (Soil Certification Exam); both are advising notes.",
  ],
  requirements: [
    ...enstCore,
    enstC("bsci222", "Principles of Genetics (BSCI222)", "BSCI222"),
    enstC("enst214", "Introduction to Natural Resources Management (ENST214)", "ENST214"),
    enstC("spatial", "Spatial Analysis (ENST456, GEOG373 or INAG237)", "ENST456", "GEOG373", "INAG237"),
    enstC("enst487", "Environmental Conflicts and Decision Making (ENST487)", "ENST487"),
    enstC("depth-wildlife", "Depth - Wildlife and Habitats (ENST460, BSCI361, PLSC253 or BSCI334)", "ENST460", "BSCI361", "PLSC253", "BSCI334"),
    enstC("depth-wetlands", "Depth - Wetlands and Waterways (ENST450, ENST453 or ENST430)", "ENST450", "ENST453", "ENST430"),
    enstC("depth-urban", "Depth - Urban Sustainability (ENST410, AREC240 or AREC241)", "ENST410", "AREC240", "AREC241"),
    {
      kind: "choose",
      id: "technical-electives",
      name: "Technical Electives (15 credits)",
      credits: 15,
      from: {
        courses: [
          "ENST460", "ENST461", "ENST462", "GEOG418", "BSCI366", "GVPT273", "PLSC254", "PLSC400",
          "ENST430", "ENST450", "ENST452", "ENST453", "GEOL452",
          "ENSP330", "ENST410", "AREC240", "COMM382", "GEOG331", "GEOG333", "GEOG416",
        ],
      },
      alternatives: [["GEOG331", "GEOG333"]],
    },
  ],
};

export const enstMajorAppliedEcologyNaturalResourcesMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Environmental Science & Technology (Applied Ecology and Natural Resources)",
  major: "enst",
  track: "Applied Ecology and Natural Resources",
  sources: { catalog: enstCatalogUrl, department: enstDepartmentUrl },
};
