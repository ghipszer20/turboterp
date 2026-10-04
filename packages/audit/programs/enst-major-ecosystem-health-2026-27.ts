// Environmental Science and Technology Major, Ecosystem Health concentration, 2026-27 UMD Academic
// Catalog. See enst-shared-2026-27.ts. Catalog only. UNVERIFIED.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { enstC, enstCatalogUrl, enstCommonReviewNotes, enstCore, enstDepartmentUrl } from "./enst-shared-2026-27.ts";

export const enstMajorEcosystemHealth: Program = {
  id: "enst-major-ecosystem-health",
  name: "Environmental Science and Technology Major (Ecosystem Health)",
  catalogYear: "2026-27",
  source: `UMD Academic Catalog 2026-27, Environmental Science and Technology Major, ${enstCatalogUrl}; ${enstDepartmentUrl} (both fetched 2026-09-28)`,
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    ...enstCommonReviewNotes,
    "Concentration Depth is '3 Courses, 9 credits' over BSCI222, ENST403, ENST423 and 'ENST432 or BSCI223'; encoded as a 3-course choose with ENST432/BSCI223 as one alternatives group (the catalog does not say which three).",
    "Technical Electives (15 credits) is one 15-credit choose over the union of the six blocks (advising groupings only). Courses listed in both depth and electives (ENST403, ENST423) can count once only.",
  ],
  requirements: [
    ...enstCore,
    enstC("bsci207", "Principles of Biology III - Organismal Biology (BSCI207)", "BSCI207"),
    enstC("enst333", "Ecosystem Health and Protection (ENST333)", "ENST333"),
    enstC("enst334", "Environmental Toxicology (ENST334)", "ENST334"),
    enstC("enst436", "Emerging Environmental Threats (ENST436)", "ENST436"),
    {
      kind: "choose",
      id: "concentration-depth",
      name: "Concentration Depth (3 courses)",
      count: 3,
      from: { courses: ["BSCI222", "ENST403", "ENST423", "ENST432", "BSCI223"] },
      alternatives: [["ENST432", "BSCI223"]],
    },
    {
      kind: "choose",
      id: "technical-electives",
      name: "Ecosystem Health Technical Electives (15 credits)",
      credits: 15,
      from: {
        courses: [
          "ENST403", "ENST423", "ENST434",
          "ENST405", "GEOG415", "GEOL452",
          "ENST422", "ENST450", "ENST460", "PLSC400", "BSCI467",
          "BSCI424", "BSCI425", "BSCI437", "BSCI450",
          "CHEM241", "CHEM242",
          "ENST361", "ENST410", "GEOG331", "GEOG431", "PLCY301",
        ],
      },
    },
  ],
};

export const enstMajorEcosystemHealthMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Environmental Science & Technology (Ecosystem Health)",
  major: "enst",
  track: "Ecosystem Health",
  sources: { catalog: enstCatalogUrl, department: enstDepartmentUrl },
};
