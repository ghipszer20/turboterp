// Landscape Management Minor, 2026-27 UMD Academic Catalog (College of Agriculture and Natural
// Resources, Department of Plant Science and Landscape Architecture).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/
// plant-sciences-landscape-architecture/landscape-management-minor/ and
// https://psla.umd.edu/undergraduate/degrees/minors (both fetched 2026-09-28).
// No official published sample plan (constructed; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const plscLandscapeManagementMinor: Program = {
  id: "plsc-landscape-management-minor",
  name: "Landscape Management Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Landscape Management Minor; Department of Plant Science and Landscape Architecture, https://psla.umd.edu/undergraduate/degrees/minors (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ courses: 2 }, { credits: 6 }],
  reviewNotes: [
    "Department page adds no requirements (description and career text plus a link to an advising sheet not in the fetched sources); it says the Landscape Management concentration was discontinued in Spring 2019 but the minor is still available. Requirements encoded from the catalog; department page not checked for a course list.",
    "Catalog states no minimum grade; C- applied per the owner's Minors ruling (sibling PSLA minor states C-).",
    "Catalog: 'maximum of six credits (or two courses)' may count toward both major and minor -> maxSharedWith courses 2 and credits 6 (against every program). If a major requires more, the catalog says to contact the Landscape Management advisor for substitutions (manual).",
    "Catalog total is 22 credits (PLSC205 is 4 credits); credit total not separately enforced.",
  ],
  requirements: [
    { kind: "course", id: "turf", name: "Introduction to Turf Science and Management", options: ["PLSC205"] },
    { kind: "course", id: "finance", name: "Financial Applications for the Green Industry", options: ["PLSC251"] },
    { kind: "course", id: "woody-1", name: "Woody Plants for Mid-Atlantic Landscapes I", options: ["PLSC253"] },
    { kind: "course", id: "woody-2", name: "Woody Plants for Mid-Atlantic Landscape II", options: ["PLSC254"] },
    { kind: "course", id: "env-hort", name: "Environmental Horticulture", options: ["PLSC452"] },
    {
      kind: "choose",
      id: "electives",
      name: "Two of the listed turf and weed courses",
      count: 2,
      from: { courses: ["PLSC401", "PLSC402", "PLSC410", "PLSC453"] },
    },
  ],
};

export const plscLandscapeManagementMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "AGNR",
  short: "Landscape Management",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/plant-sciences-landscape-architecture/landscape-management-minor/",
    department: "https://psla.umd.edu/undergraduate/degrees/minors",
  },
};
