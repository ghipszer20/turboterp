// Immersive Media Design Major, Computing Track (catalog: "Track 1 (Computing)"), 2026-27 UMD
// Academic Catalog. Source: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art/immersive-media-design-major/
// (fetched 2026-09-28; see program-sources/art-immersive-media-design-major.md). No department
// page with IMDM-specific requirements was found (lep.umd.edu is a generic LEP overview); see
// imdm-shared-2026-27.ts's module comment. Owner ruling: CMSC141 counts for CMSC131 and CMSC142
// for CMSC132 wherever those appear. Listed first in the catalog, so `defaultTrack: true`.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { imdmEnglElective, imdmCommonCourses, artCommonCourses, imdmCommonReviewNotes } from "./imdm-shared-2026-27.ts";

export const imdmMajorComputing: Program = {
  id: "imdm-major-computing",
  name: "Immersive Media Design Major (Computing)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Immersive Media Design Major, Computing Track " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art/immersive-media-design-major/)",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "'Major Elective: CMSC 4xx (Graphics Programming)' and 'CMSC Elective: CMSC 4xx (Graphics " +
      "Programming)' are two catalog rows with no specific course number named anywhere in the " +
      "source for either slot (unlike, e.g., cmsc-major-2026-27.ts's Areas, which name specific " +
      "CMSC 4xx courses). Encoded as one 6-credit choose over CMSC 400-499 (owner ruling: never " +
      "invent a course number). The sample plan cannot fill this slot with a real, source-named " +
      "course either, so it is left unsatisfied there and flagged in docs/project/owner-review.md " +
      "rather than guessed at.",
    "'Major Elective: ARTT37x/47x (Digital Media)' also names no specific course, but the same " +
      "'37x/47x Digital Media' family IS named concretely in this major's own Emerging Creatives " +
      "track table: ARTT370, and ARTT47X 'Advanced Digital Media Choice: 479a/c/d/e' (encoded as " +
      "ARTT479A/ARTT479C/ARTT479D/ARTT479E). Reused here as this slot's options, since they are the " +
      "only real course numbers this source names under the '37x/47x' label. Flagged for owner " +
      "confirmation in docs/project/owner-review.md.",
    ...imdmCommonReviewNotes,
  ],
  requirements: [
    imdmEnglElective,
    { kind: "course", id: "math140", name: "Calculus I", options: ["MATH140"] },
    { kind: "course", id: "math141", name: "Calculus II", options: ["MATH141"] },
    // Owner ruling: CMSC141 counts for CMSC131 and CMSC142 for CMSC132.
    { kind: "course", id: "cmsc131", name: "Object-Oriented Programming I", options: ["CMSC131", "CMSC141"] },
    { kind: "course", id: "cmsc132", name: "Object-Oriented Programming II", options: ["CMSC132", "CMSC142"] },
    { kind: "course", id: "cmsc216", name: "Introduction to Computer Systems", options: ["CMSC216"] },
    { kind: "course", id: "cmsc250", name: "Discrete Structures", options: ["CMSC250"] },
    { kind: "course", id: "cmsc330", name: "Organization of Programming Languages", options: ["CMSC330"] },
    { kind: "course", id: "cmsc351", name: "Algorithms", options: ["CMSC351"] },
    {
      kind: "choose",
      id: "cmsc-4xx-graphics",
      name: "Major Elective + CMSC Elective: CMSC 4xx (Graphics Programming), 6 credits",
      credits: 6,
      from: { departments: ["CMSC"], minNumber: 400, maxNumber: 499 },
    },
    ...artCommonCourses,
    {
      kind: "choose",
      id: "artt-digital-media-elective",
      name: "Major Elective: ARTT37x/47x (Digital Media)",
      count: 1,
      from: { courses: ["ARTT370", "ARTT479A", "ARTT479C", "ARTT479D", "ARTT479E"] },
    },
    ...imdmCommonCourses,
    { kind: "course", id: "imdm327", name: "Computational Virtual Reality (Augmented and Virtual Reality)", options: ["IMDM327"] },
  ],
};

export const imdmMajorComputingMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Immersive Media Design (Computing)",
  major: "imdm",
  track: "Computing",
  defaultTrack: true,
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art/immersive-media-design-major/",
    department: "https://lep.umd.edu/",
  },
};
