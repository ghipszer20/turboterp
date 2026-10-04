// Environmental Science and Technology Major, Ecological Technology Design concentration, 2026-27 UMD
// Academic Catalog. See enst-shared-2026-27.ts. Catalog only. UNVERIFIED.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { enstC, enstCatalogUrl, enstCommonReviewNotes, enstCore, enstDepartmentUrl } from "./enst-shared-2026-27.ts";

export const enstMajorEcologicalTechnologyDesign: Program = {
  id: "enst-major-ecological-technology-design",
  name: "Environmental Science and Technology Major (Ecological Technology Design)",
  catalogYear: "2026-27",
  source: `UMD Academic Catalog 2026-27, Environmental Science and Technology Major, ${enstCatalogUrl}; ${enstDepartmentUrl} (both fetched 2026-09-28)`,
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    ...enstCommonReviewNotes,
    "Concentration Depth - Design is '3 Courses, 9 credits' over five rows (ENST282 or ENST283, ENST405, ENST415, ENST456/GEOG272/GEOG373/INAG237, ENST485); encoded as a 3-course choose with the two 'or' rows as alternatives groups. The catalog does not say which three, so any three rows count.",
    "Technical Electives (12 credits) is one 12-credit choose over the union of the four blocks; the blocks are only advising groupings ('any combination of electives can be taken'). 'ENST361 or PLSC480' is one alternatives group. A course listed in both Depth - Ecology and the electives (ENST450, GEOL453) can count once only.",
  ],
  requirements: [
    ...enstCore,
    enstC("enst281", "Computer Aided Design in Ecology (ENST281)", "ENST281"),
    enstC("enst481", "Ecological Design (ENST481)", "ENST481"),
    enstC("math121", "Elementary Calculus II (MATH121)", "MATH121"),
    {
      kind: "choose",
      id: "depth-ecology",
      name: "Concentration Depth - Ecology (2 courses)",
      count: 2,
      from: { courses: ["ENST410", "ENST422", "ENST450", "ENST453", "GEOL453"] },
    },
    {
      kind: "choose",
      id: "depth-design",
      name: "Concentration Depth - Design (3 courses)",
      count: 3,
      from: {
        courses: ["ENST282", "ENST283", "ENST405", "ENST415", "ENST456", "GEOG272", "GEOG373", "INAG237", "ENST485"],
      },
      alternatives: [
        ["ENST282", "ENST283"],
        ["ENST456", "GEOG272", "GEOG373", "INAG237"],
      ],
    },
    {
      kind: "choose",
      id: "technical-electives",
      name: "Ecological Technology Design Technical Electives (12 credits)",
      credits: 12,
      from: {
        courses: [
          "ENST461", "GEOG331", "ENST361", "PLSC480",
          "ENST432", "ENST441", "GEOL453", "INAG250", "PLSC425",
          "ENST430", "ENST450", "ENST452", "GEOL452",
          "BSCI467", "ENST373", "ENST460", "PLSC471",
        ],
      },
      alternatives: [["ENST361", "PLSC480"]],
    },
  ],
};

export const enstMajorEcologicalTechnologyDesignMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Environmental Science & Technology (Ecological Technology Design)",
  major: "enst",
  track: "Ecological Technology Design",
  defaultTrack: true,
  sources: { catalog: enstCatalogUrl, department: enstDepartmentUrl },
};
