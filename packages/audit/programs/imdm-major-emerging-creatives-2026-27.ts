// Immersive Media Design Major, Emerging Creatives Track (catalog: "Track 2 (Art)" /
// "Emerging Creatives Track"), 2026-27 UMD Academic Catalog. Source:
// academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art/immersive-media-design-major/
// (fetched 2026-09-28; see program-sources/art-immersive-media-design-major.md). No department
// page with IMDM-specific requirements was found (lep.umd.edu is a generic LEP overview); see
// imdm-shared-2026-27.ts's module comment. The catalog's CMSC131/132/216/250 exemption-exam
// footnote is explicitly Track 1 only ("These courses are not required for Track 2"), so the
// CMSC141/CMSC142 owner ruling doesn't apply here (this track doesn't require CMSC131/132 at all).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { imdmEnglElective, imdmCommonCourses, artCommonCourses, imdmCommonReviewNotes } from "./imdm-shared-2026-27.ts";

export const imdmMajorEmergingCreatives: Program = {
  id: "imdm-major-emerging-creatives",
  name: "Immersive Media Design Major (Emerging Creatives)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Immersive Media Design Major, Emerging Creatives Track " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art/immersive-media-design-major/)",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "'ARTT47X | (Advanced Digital Media Choice: 479a/c/d/e)' is encoded as a choose over " +
      "ARTT479A/ARTT479C/ARTT479D/ARTT479E (the catalog's own lettered options for this slot).",
    ...imdmCommonReviewNotes,
  ],
  requirements: [
    imdmEnglElective,
    { kind: "course", id: "math115", name: "Precalculus", options: ["MATH115"] },
    { kind: "course", id: "cmsc122", name: "Introduction to Computer Programming via the Web", options: ["CMSC122"] },
    ...artCommonCourses,
    { kind: "course", id: "artt110", name: "Elements of Drawing I", options: ["ARTT110"] },
    { kind: "course", id: "artt210", name: "Elements of Drawing II", options: ["ARTT210"] },
    { kind: "course", id: "artt370", name: "Elements of Digital Media", options: ["ARTT370"] },
    {
      kind: "choose",
      id: "artt47x",
      name: "ARTT47X (Advanced Digital Media Choice: 479a/c/d/e)",
      count: 1,
      from: { courses: ["ARTT479A", "ARTT479C", "ARTT479D", "ARTT479E"] },
    },
    ...imdmCommonCourses,
    { kind: "course", id: "imdm127", name: "Creative Coding for Digital Media", options: ["IMDM127"] },
    { kind: "course", id: "imdm350", name: "Advanced Digital Media Theory", options: ["IMDM350"] },
  ],
};

export const imdmMajorEmergingCreativesMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Immersive Media Design (Emerging Creatives)",
  major: "imdm",
  track: "Emerging Creatives",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art/immersive-media-design-major/",
    department: "https://lep.umd.edu/",
  },
};
