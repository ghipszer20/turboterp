// Music Major, Bachelor of Arts in Music (BA), 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/music/music-major/;
// the School of Music's official Music - Bachelor of Arts - Strings Four Year Academic Plan
// (department source), https://drive.google.com/uc?export=download&id=1YMxqNvmPxryb9_R0765_pYGFvMeSnxpS#Music-Liberal-Arts---Strings
// (fetched 2026-09-28). The college publishes one BA plan per area (Piano, Voice, Violin, Viola,
// Cello, Bass, Flute, Oboe, Clarinet, Bassoon, Saxophone, Horn, Trumpet, Trombone, Tuba, Euphonium,
// Percussion, Harp, Jazz Studies); the Strings plan was used because it is fully legible and, unlike
// the Piano plan, doesn't carry the Piano-area "except Piano majors" exception on its own
// requirements. Owner ruling (docs/project/rulings.md, 2026-09-26): where the department page (the
// college's own plan counts as one) and the Academic Catalog disagree, the department page wins.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  muscTheory,
  muscClassPiano2,
  muscHistorySurvey,
  muscGlobalMusic,
  muscFormAnalysis,
  muscRecitalAttendance,
  muscCommonReviewNotes,
} from "./musc-shared-2026-27.ts";

export const muscMajorBa: Program = {
  id: "musc-major-ba",
  name: "Music Major (Bachelor of Arts)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Music Major (Bachelor of Arts in Music) " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/music/music-major/); " +
    "School of Music, official Music - Bachelor of Arts - Strings Four Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1YMxqNvmPxryb9_R0765_pYGFvMeSnxpS#Music-Liberal-Arts---Strings " +
    "(fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Jazz Studies plan re-checked from its OCR text (2026-09-28): the OCR is mostly noise (term grids " +
      "unreadable; only fragments such as MUSC260, MUSC229 and MUSC 312 survive), so no Jazz-specific " +
      "requirement could be confirmed or ruled out. NOT confirmed as matching this Strings-based encoding; " +
      "no Jazz Studies track added. Needs a legible copy of the plan.",
    "No disagreement found between the catalog and the Strings plan on the BA's own requirement " +
      "structure (5 semesters of lessons, 5 of ensemble, 4 of theory, 2 of history, 1 of global " +
      "music, 2 of class piano, 1 of form and analysis, 6 elective credits).",
    "'5 semesters of private lessons' encoded as the Strings plan's own MUSP109/110/207/208/305 " +
      "sequence, used generically for every area (see musc-shared-2026-27.ts's scope note); the " +
      "Senior Recital the catalog attaches to the final lesson semester is not encoded (unencodable).",
    "'5 semesters of ensemble participation' (the catalog does not split large/small for the BA, " +
      "unlike the BM) encoded as MUSC229 (the Strings plan's large-ensemble course) taken 5 times, " +
      "1 credit each.",
    "'6 credits of music electives' encoded as a generic 3xx-4xx MUSC choose (the catalog and plan " +
      "name no specific courses); the plan's own two 'MUSC 3xx-4xx (3 cr.)' elective slots confirm " +
      "the credit total and level floor.",
    "The College of Arts and Humanities' own 45-credit 3xx/4xx-level and Global Engagement " +
      "requirements DO apply to BA Music students per the catalog (unlike BM, which is waived); " +
      "these are college-layer requirements out of scope for this Program file.",
    ...muscCommonReviewNotes,
  ],
  requirements: [
    {
      kind: "choose",
      id: "private-lessons",
      name: "5 semesters of private lessons (Senior Recital in final semester; not encoded) " +
        "(MUSP109, MUSP110, MUSP207, MUSP208, MUSP305)",
      count: 5,
      // Any MUSP applied-lesson course counts: the listed numbers are one area's (main session, 2026-09-28).
      from: { courses: ["MUSP109", "MUSP110", "MUSP207", "MUSP208", "MUSP305"], departments: ["MUSP"], minNumber: 100, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "ensemble",
      name: "5 semesters of ensemble participation (MUSC229)",
      credits: 5,
      from: { courses: ["MUSC229"] },
    },
    muscTheory,
    muscHistorySurvey,
    muscGlobalMusic,
    muscClassPiano2,
    muscFormAnalysis,
    {
      kind: "choose",
      id: "electives",
      name: "6 credits of music electives (3xx-4xx MUSC)",
      credits: 6,
      from: { departments: ["MUSC"], minNumber: 300, maxNumber: 499 },
    },
    muscRecitalAttendance(4),
  ],
};

export const muscMajorBaMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Music (BA)",
  major: "musc",
  track: "Bachelor of Arts",
  defaultTrack: true,
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/music/music-major/",
    department: "https://drive.google.com/uc?export=download&id=1YMxqNvmPxryb9_R0765_pYGFvMeSnxpS#Music-Liberal-Arts---Strings",
  },
};
