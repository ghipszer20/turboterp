// Cinema and Media Studies Major, Film Production Track, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/cinema-media-studies-major/;
// the department's own page (sllc.umd.edu/fields/cinema-media, nav/context only, no requirements
// text -- no disagreement possible); the College's official Film Production four-year plan
// (department source), https://drive.google.com/uc?export=download&id=1-dNgdkQ622vupRk-U2eRXNRcfAniVSk-
// (fetched 2026-09-28). This same major (identical requirements) is also listed under the
// Department of English's catalog page (english-language-literature-cinema-media-studies-major.md);
// encoded once here per the main session's check that the two listings agree.
// Owner ruling (docs/project/rulings.md): where the department page/plan and the catalog disagree,
// follow the department source; no disagreement was found.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

/** Foundation, Core, and Film Production required courses, excluded from the generic CINE choose
 * filters below so a slot can't be double-satisfied by a course that's separately required. */
const REQUIRED_ELSEWHERE = ["CINE245", "ENGL245", "CINE301", "CINE302", "CINE310", "CINE376", "CINE415", "CINE499"];

export const cineMajorFilmProduction: Program = {
  id: "cine-major-film-production",
  name: "Cinema and Media Studies Major (Film Production)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Cinema and Media Studies Major (Film Production Track); " +
    "College of Arts and Humanities, official Film Production Four Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1-dNgdkQ622vupRk-U2eRXNRcfAniVSk- (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "This major is listed under both the School of Languages, Literatures, and Cultures and the Department of English (identical requirements, per the main session's check); encoded once here (source file languages-literatures-cultures-cinema-media-studies-major.md).",
    "New track: the department page says Film Production 'will open in the Spring Semester of 2026' and shares 21 of its 39 credits with Critical Studies (Foundation 9 + Program Core 12 = 21 here, matching that statement -- no disagreement).",
    "The Film Production plan's OCR text (re-checked 2026-09-28) still has no legible term grid: course rows show only rubric labels (CINE Genres, Auteurs, Movements; National & International Cinemas; Electives) with garbled codes and no readable term placement. `packages/programs/sample-plans/cine-major-film-production.json` therefore stays CONSTRUCTED from the catalog's own requirement structure (official: false) and the OCR text gave no basis for changing the encoding; flagged in docs/project/owner-review.md.",
    "Program Core Courses (one course each in Film Theories; Documentary/Animation/Experimental Cinema or other Visual Media; National/International Cinemas; Genres/Auteurs/Movements) have no course-to-rubric list in any fetched source -- the department's own full list (sllc.umd.edu/fields/cinema-media/courses/) is referenced but wasn't fetched. All four are encoded as identical CINE 300-499 `choose` filters (excluding Foundation and Film Production required courses); the engine can't verify a student's four picks actually span four distinct rubrics. Please supply the rubric-to-course list if this should be checked.",
    "CINE310 ('Introduction to Filmmaking', catalog footnote: formerly CINE319M) is encoded under its current number only.",
    "'Directed Study in Cinema and Media Studies' (CINE499) is the catalog's course-title-table name for what the body text calls the track's 'Capstone Course' -- same course number, no disagreement, just two labels for one course.",
    "Two Cinema and Media Studies Electives (footnote 5): the footnote's own text is internally inconsistent -- it repeats footnote 4's 'up to two courses may be taken at the 200-level' line, then names two specific (300-level) CINE courses, CINE315 and CINE317, as the in-program pair. Since 315/317 aren't 200-level, the 200-level sentence looks like a copy-paste artifact from footnote 4 rather than a real allowance here; encoded literally as the named pair (a `choose` over exactly {CINE315, CINE317}, count 2). The footnote's alternate path ('two courses from other programs...with the approval of the...Advisor') isn't modeled -- no advisor-approval concept in the engine, matching the AAAS/AMST precedent for similar substitutions. Please confirm this reading.",
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
    { kind: "course", id: "fp-cine310", name: "Film Production: Introduction to Filmmaking (CINE310)", options: ["CINE310"] },
    { kind: "course", id: "fp-cine376", name: "Film Production: Writing the Feature Film / Screenwriting (CINE376)", options: ["CINE376"] },
    { kind: "course", id: "fp-cine415", name: "Film Production: Advanced Filmmaking (CINE415)", options: ["CINE415"] },
    { kind: "course", id: "fp-cine499", name: "Film Production: Capstone (CINE499)", options: ["CINE499"] },
    {
      kind: "choose",
      id: "fp-electives",
      name: "Film Production Track: two Cinema and Media Studies Electives (CINE315, CINE317)",
      count: 2,
      from: { courses: ["CINE315", "CINE317"] },
    },
  ],
};

export const cineMajorFilmProductionMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Cinema & Media Studies (Film Production)",
  major: "cine",
  track: "Film Production",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/cinema-media-studies-major/",
    department: "https://drive.google.com/uc?export=download&id=1-dNgdkQ622vupRk-U2eRXNRcfAniVSk-",
  },
};
