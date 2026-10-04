// Music Major, Bachelor of Music (BM), 2026-27 UMD Academic Catalog -- this is the BM's generic/
// degree-level track (Strings' plan matches it exactly, so Strings gets no track file of its own).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/music/music-major/;
// the School of Music's official Music - Bachelor of Music - Strings Four Year Academic Plan
// (department source), https://drive.google.com/uc?export=download&id=1KKQburfg7BLqxm2EnshvLLnm0SckYw0i#Music-Performance---Strings
// (fetched 2026-09-28). The college publishes one BM plan per area (Composition, Jazz, Piano,
// Strings, Theory, Voice, Wind & Percussion); five of the six other areas turned out to have
// genuinely different required courses and are now their own tracks of this major key ("musc") --
// see musc-major-bm-jazz/-piano/-theory/-voice/-wind-percussion-2026-27.ts. Composition's plan
// was re-checked from its OCR text (2026-09-28) and is still not usable (see reviewNotes), so it
// stays on this generic track. Owner ruling
// (docs/project/rulings.md, 2026-09-26): where the department page (the college's own plan counts
// as one) and the Academic Catalog disagree, the department page wins. Encoded by hand. UNVERIFIED
// until the owner signs off.

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

export const muscMajorBm: Program = {
  id: "musc-major-bm",
  name: "Music Major (Bachelor of Music)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Music Major (Bachelor of Music) " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/music/music-major/); " +
    "School of Music, official Music - Bachelor of Music - Strings Four Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1KKQburfg7BLqxm2EnshvLLnm0SckYw0i#Music-Performance---Strings " +
    "(fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "No disagreement found between the catalog and the Strings plan on the BM's own requirement " +
      "structure (8 semesters of lessons, 8 of large ensemble, 6-8 of small ensemble, 4 of theory, " +
      "2 of history, 1 of a 400-level history elective, 1 of global music, 2 of class piano, 1 of " +
      "form and analysis, 1 of conducting, 1 of music literature, 1 of music pedagogy, 3-5 elective " +
      "credits).",
    "'8 semesters of private lessons' encoded as the Strings plan's own " +
      "MUSP119/120/217/218/315/316/419/420 sequence; this remains this generic/degree-level track's " +
      "own requirement (Strings' numbers, used as-is since Strings matches the generic structure " +
      "exactly). Five other areas -- Jazz, Piano, Theory, Voice, Wind & Percussion -- turned out to " +
      "have genuinely different required courses (area-specific lesson numbers, ensemble courses, " +
      "and/or upper-division requirements) and are now encoded as their own tracks of this major key " +
      "(\"musc\"); see musc-major-bm-jazz/-piano/-theory/-voice/-wind-percussion-2026-27.ts. " +
      "Composition's plan was re-checked from its OCR text (2026-09-28): the OCR is only partly legible " +
      "(term grids are noise; only a few fragments such as MUSC260 and MUSP207 survive, all matching " +
      "what the generic plan already has) and no Composition-specific lesson, ensemble or composition " +
      "course list can be read, so no Composition track is added and it stays on this generic track. " +
      "Unverified against the real plan; needs a legible copy. The Senior Recital the catalog attaches to the final " +
      "lesson semester is not encoded anywhere (unencodable).",
    "'8 semesters of large ensemble participation' and '6-8 semesters of small ensemble " +
      "participation' encoded as MUSC229 x8 and MUSC129 x6 (the plan's own two ensemble course " +
      "numbers); the small-ensemble range's upper bound (8) is not enforced, only the 6-semester floor.",
    "'1 semester of 400 level music history elective' -- the plan shows only a generic 'MUSC 4xx " +
      "Music History Elective' slot, no specific course; encoded as a generic 400-499 MUSC choose " +
      "(3 credits) rather than inventing a course number.",
    "'1 semester of conducting' and '1 semester of music literature' encoded as MUSC446 and MUSC490 " +
      "respectively, both named in the plan in positions consistent with those labels; '1 semester " +
      "of music pedagogy' encoded as MUSC400 -- the plan shows 'MUSC400S', reconstructed here as the " +
      "base course MUSC400 (an 'S' section suffix, not a distinct catalog course number). Please " +
      "verify all three against the department if exact identity matters.",
    "'3-5 credits of music electives' encoded as a 3-credit floor (generic MUSC choose, any level), " +
      "matching the plan's single 'MUSC 1xx-4xx (3 cr.)' elective slot; the catalog's 5-credit upper " +
      "bound isn't a ceiling the engine needs to enforce.",
    ...muscCommonReviewNotes,
  ],
  requirements: [
    {
      kind: "choose",
      id: "private-lessons",
      name: "8 semesters of private lessons (Senior Recital in final semester; not encoded) " +
        "(MUSP119, MUSP120, MUSP217, MUSP218, MUSP315, MUSP316, MUSP419, MUSP420)",
      count: 8,
      // Any MUSP applied-lesson course counts: the listed numbers are one area's (main session, 2026-09-28).
      from: { courses: ["MUSP119", "MUSP120", "MUSP217", "MUSP218", "MUSP315", "MUSP316", "MUSP419", "MUSP420"], departments: ["MUSP"], minNumber: 100, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "large-ensemble",
      name: "8 semesters of large ensemble participation (MUSC229)",
      credits: 8,
      from: { courses: ["MUSC229"] },
    },
    {
      kind: "choose",
      id: "small-ensemble",
      name: "6-8 semesters of small ensemble participation (6-semester floor encoded) (MUSC129)",
      credits: 6,
      from: { courses: ["MUSC129"] },
    },
    muscTheory,
    muscHistorySurvey,
    {
      kind: "choose",
      id: "history-elective-400",
      name: "1 semester of 400-level music history elective (no specific course named)",
      credits: 3,
      from: { departments: ["MUSC"], minNumber: 400, maxNumber: 499 },
    },
    muscGlobalMusic,
    muscClassPiano2,
    muscFormAnalysis,
    { kind: "course", id: "conducting", name: "1 semester of conducting (MUSC446)", options: ["MUSC446"] },
    { kind: "course", id: "music-literature", name: "1 semester of music literature (MUSC490)", options: ["MUSC490"] },
    { kind: "course", id: "music-pedagogy", name: "1 semester of music pedagogy (MUSC400)", options: ["MUSC400"] },
    {
      kind: "choose",
      id: "electives",
      name: "3-5 credits of music electives (3-credit floor encoded)",
      credits: 3,
      from: { departments: ["MUSC"] },
    },
    muscRecitalAttendance(6),
  ],
};

export const muscMajorBmMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Music (BM)",
  major: "musc",
  track: "Bachelor of Music",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/music/music-major/",
    department: "https://drive.google.com/uc?export=download&id=1KKQburfg7BLqxm2EnshvLLnm0SckYw0i#Music-Performance---Strings",
  },
};
