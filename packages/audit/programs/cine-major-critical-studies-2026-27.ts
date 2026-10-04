// Cinema and Media Studies Major, Critical Studies Track, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/cinema-media-studies-major/;
// the department's own page (sllc.umd.edu/fields/cinema-media, nav/context only, no requirements
// text -- no disagreement possible); the College's official Critical Studies four-year plan
// (department source), https://drive.google.com/uc?export=download&id=1B9ifEzSZ_rtJDP-6P0b5_D-AiNAAEmrw
// (fetched 2026-09-28). This same major (identical requirements) is also listed under the
// Department of English's catalog page (english-language-literature-cinema-media-studies-major.md);
// encoded once here per the main session's check that the two listings agree.
// Owner ruling (docs/project/rulings.md): where the department page/plan and the catalog disagree,
// follow the department source; no disagreement was found.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

/** Foundation courses, excluded from the generic CINE choose filters below so a Core/elective slot
 * can't be double-satisfied by a course that's separately required. */
const REQUIRED_ELSEWHERE = ["CINE245", "ENGL245", "CINE301", "CINE302"];

export const cineMajorCriticalStudies: Program = {
  id: "cine-major-critical-studies",
  name: "Cinema and Media Studies Major (Critical Studies)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Cinema and Media Studies Major (Critical Studies Track); " +
    "College of Arts and Humanities, official Critical Studies Four Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1B9ifEzSZ_rtJDP-6P0b5_D-AiNAAEmrw (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "This major is listed under both the School of Languages, Literatures, and Cultures and the Department of English (identical requirements, per the main session's check); encoded once here (source file languages-literatures-cultures-cinema-media-studies-major.md).",
    "The Critical Studies plan's OCR text (re-checked 2026-09-28) still has no legible term grid: course rows show only rubric labels (CINE Genres, Auteurs, Movements; National & International Cinemas; Electives) with garbled codes and no readable term placement. `packages/programs/sample-plans/cine-major-critical-studies.json` therefore stays CONSTRUCTED from the catalog's own requirement structure (official: false) and the OCR text gave no basis for changing the encoding; flagged in docs/project/owner-review.md.",
    "Program Core Courses (one course each in Film Theories; Documentary/Animation/Experimental Cinema or other Visual Media; National/International Cinemas; Genres/Auteurs/Movements) and the Critical Studies Track's two extra picks (Genres/Auteurs/Movements; National/International Cinemas) have no course-to-rubric list in any fetched source -- the department's own full list (sllc.umd.edu/fields/cinema-media/courses/) is referenced but wasn't fetched. All six are encoded as identical CINE 300-499 `choose` filters (excluding the Foundation courses); the engine can't verify that a student's six picks actually span the intended six distinct rubrics, or that no two picks share one rubric. Please supply the rubric-to-course list if this should be checked.",
    "Footnote 3 ('at least one course in [the Critical Studies Track's two extra Genres/National picks] must be taken at the 4xx-level') isn't encoded -- no requirement type enforces a level minimum across two separate choose requirements, only a level range within one.",
    "Four Cinema and Media Studies Electives (footnote 4): 'up to two courses may be taken at the 200-level'; encoded as CINE 200-499 (excluding Foundation courses). Footnote 4's alternate path ('two courses from other programs with the approval of the advisor') isn't modeled -- the engine has no advisor-approval concept, so this is approximated as CINE-only, matching the AAAS/AMST precedent for similar advisor-approved substitutions. Marked advisorMayApprove (cs-electives): other courses may count with advisor approval; only the listed courses count.",
    "Not encoded (engine gaps, matches other majors' precedent): 'up to 9 credits may be taken at the 2xx-level' and 'at least 6 of the 39 credits must be at the 4xx-level' (aggregate credit-level constraints spanning multiple requirements, no requirement type for this); the major's own grade floor is already encoded (minGrade C-, catalog says a C- or better in each of the 39 credits); residency rules and the 120-credit graduation minimum.",
  ],
  requirements: [
    { kind: "course", id: "foundation-245", name: "Foundation: Film Form and Culture (CINE/ENGL245)", options: ["CINE245", "ENGL245"] },
    { kind: "course", id: "foundation-301", name: "Foundation: Cinema History I (CINE301)", options: ["CINE301"] },
    { kind: "course", id: "foundation-302", name: "Foundation: Cinema History II (CINE302)", options: ["CINE302"] },
    {
      kind: "choose",
      id: "core-film-theories",
      name: "Program Core: one course in Film Theories",
      count: 1,
      from: { departments: ["CINE"], minNumber: 300, maxNumber: 499, exclude: REQUIRED_ELSEWHERE },
    },
    {
      kind: "choose",
      id: "core-doc-anim-experimental",
      name: "Program Core: one course in Documentary, Animation, Experimental Cinema or other Visual Media",
      count: 1,
      from: { departments: ["CINE"], minNumber: 300, maxNumber: 499, exclude: REQUIRED_ELSEWHERE },
    },
    {
      kind: "choose",
      id: "core-national-international",
      name: "Program Core: one course in National/International Cinemas",
      count: 1,
      from: { departments: ["CINE"], minNumber: 300, maxNumber: 499, exclude: REQUIRED_ELSEWHERE },
    },
    {
      kind: "choose",
      id: "core-genres-auteurs",
      name: "Program Core: one course in Genres/Auteurs/Movements",
      count: 1,
      from: { departments: ["CINE"], minNumber: 300, maxNumber: 499, exclude: REQUIRED_ELSEWHERE },
    },
    {
      kind: "choose",
      id: "cs-extra-genres-auteurs",
      name: "Critical Studies Track: one additional course in Genres/Auteurs/Movements",
      count: 1,
      from: { departments: ["CINE"], minNumber: 300, maxNumber: 499, exclude: REQUIRED_ELSEWHERE },
    },
    {
      kind: "choose",
      id: "cs-extra-national-international",
      name: "Critical Studies Track: one additional course in National/International Cinemas",
      count: 1,
      from: { departments: ["CINE"], minNumber: 300, maxNumber: 499, exclude: REQUIRED_ELSEWHERE },
    },
    {
      kind: "choose",
      id: "cs-electives",
      advisorMayApprove: true,
      name: "Critical Studies Track: four Cinema and Media Studies Electives",
      count: 4,
      from: { departments: ["CINE"], minNumber: 200, maxNumber: 499, exclude: REQUIRED_ELSEWHERE },
    },
  ],
};

export const cineMajorCriticalStudiesMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Cinema & Media Studies (Critical Studies)",
  major: "cine",
  track: "Critical Studies",
  defaultTrack: true,
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/cinema-media-studies-major/",
    department: "https://drive.google.com/uc?export=download&id=1B9ifEzSZ_rtJDP-6P0b5_D-AiNAAEmrw",
  },
};
