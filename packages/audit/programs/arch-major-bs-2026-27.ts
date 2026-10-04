// Architecture Major, Bachelor of Science option, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/architecture-planning-preservation/architecture-major/
// and arch.umd.edu degree-planning page (fetched 2026-09-28); see program-sources/architecture-major.md.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { archCommonReviewNotes, archCore } from "./arch-shared-2026-27.ts";

export const archMajorBs: Program = {
  id: "arch-major-bs",
  name: "Architecture Major (BS)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Architecture Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/architecture-planning-preservation/architecture-major/); " +
    "School of Architecture, Planning and Preservation degree-planning page " +
    "(https://arch.umd.edu/programs/architecture/resources/student-resources/advising/undergraduate-advising/degree-planning), fetched 2026-09-28",
  verified: false,
  reviewNotes: [
    ...archCommonReviewNotes,
    "The catalog offers a BS and a BA option; encoded as two programs of major key 'arch', BS first (defaultTrack) as the catalog lists it first.",
    "The BS table's 'ARCH4XX | 12' row names no course: encoded as 12 credits of ARCH courses numbered 400-499 (the row's own pattern), which also lets any ARCH4xx not already used by a named requirement count.",
  ],
  requirements: [
    ...archCore,
    { kind: "course", id: "arch401", name: "Architecture Design Studio II (ARCH401, 6 credits)", options: ["ARCH401"] },
    { kind: "course", id: "arch402", name: "Architecture Design Studio III (ARCH402, 6 credits)", options: ["ARCH402"] },
    { kind: "course", id: "arch403", name: "Architecture Design Studio IV (ARCH403, 6 credits)", options: ["ARCH403"] },
    { kind: "course", id: "arch464", name: "Architectural Structures I (ARCH464)", options: ["ARCH464"] },
    { kind: "course", id: "arch465", name: "Architectural Structures II (ARCH465)", options: ["ARCH465"] },
    { kind: "course", id: "arch466", name: "Environmental Systems in Architecture (ARCH466)", options: ["ARCH466"] },
    { kind: "course", id: "arch474", name: "ARCH474 (1 credit)", options: ["ARCH474"] },
    {
      kind: "choose",
      id: "arch4xx",
      name: "ARCH4XX: 12 credits of 400-level Architecture courses",
      credits: 12,
      from: { departments: ["ARCH"], minNumber: 400, maxNumber: 499 },
    },
  ],
};

export const archMajorBsMeta: ProgramMeta = {
  kind: "major",
  college: "ARCH",
  short: "Architecture (BS)",
  major: "arch",
  track: "Bachelor of Science",
  defaultTrack: true,
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/architecture-planning-preservation/architecture-major/",
    department:
      "https://arch.umd.edu/programs/architecture/resources/student-resources/advising/undergraduate-advising/degree-planning",
  },
};
