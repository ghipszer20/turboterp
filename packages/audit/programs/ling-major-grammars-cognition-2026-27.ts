// Linguistics Major, Grammars and Cognition Track, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/linguistics/linguistics-major/;
// the College of Arts and Humanities' official Linguistics - Grammars & Cognition Four Year Academic
// Plan (department source),
// https://drive.google.com/uc?export=download&id=1KT5gd9SfMR4YB1Kh_S3P9-yCgpQmBBRG#Music-Liberal-Arts---Grammars-and-Cognition
// (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page/plan and the catalog disagree,
// follow the department source. No disagreement found -- see reviewNotes.
// This is the catalog's first-listed track ("Select one of the following tracks: Grammars and
// Cognition Track / Language Track"), so it carries `defaultTrack: true`.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { lingCoreRequired, lingCoreSelectTwo, lingCoreElectives, lingCommonReviewNotes } from "./ling-shared-2026-27.ts";

export const lingMajorGrammarsCognition: Program = {
  id: "ling-major-grammars-cognition",
  name: "Linguistics Major (Grammars and Cognition)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Linguistics Major (Grammars and Cognition Track) " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/linguistics/linguistics-major/); " +
    "College of Arts and Humanities, official Linguistics - Grammars & Cognition Four Year Academic Plan " +
    "(department source), " +
    "https://drive.google.com/uc?export=download&id=1KT5gd9SfMR4YB1Kh_S3P9-yCgpQmBBRG#Music-Liberal-Arts---Grammars-and-Cognition " +
    "(fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Track: 'Select two approved electives in LING, PSYC, HESP, PHIL, or CMSC' (6 credits) names no " +
      "course-number range, so it is modeled as an open choose over those five departments at any " +
      "level; 'Electives for the Cognition Track must be approved by the linguistics advisor' (catalog) " +
      "is not encoded -- no approval-gate concept in the engine. Flagged in docs/project/owner-review.md.",
    ...lingCommonReviewNotes,
  ],
  requirements: [
    ...lingCoreRequired,
    lingCoreSelectTwo,
    lingCoreElectives,
    { kind: "course", id: "track-phil170", name: "Track: PHIL170 Introduction to Symbolic Logic", options: ["PHIL170"] },
    {
      kind: "course",
      id: "track-ling350-or-phil360",
      name: "Track: LING350 or PHIL360 Philosophy of Language",
      options: ["LING350", "PHIL360"],
    },
    {
      kind: "choose",
      id: "track-approved-electives",
      name: "Track: select two approved electives in LING, PSYC, HESP, PHIL, or CMSC",
      count: 2,
      credits: 6,
      from: { departments: ["LING", "PSYC", "HESP", "PHIL", "CMSC"] },
    },
  ],
};

export const lingMajorGrammarsCognitionMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Linguistics (Grammars and Cognition)",
  major: "ling",
  track: "Grammars and Cognition",
  defaultTrack: true,
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/linguistics/linguistics-major/",
    department:
      "https://drive.google.com/uc?export=download&id=1KT5gd9SfMR4YB1Kh_S3P9-yCgpQmBBRG#Music-Liberal-Arts---Grammars-and-Cognition",
  },
};
