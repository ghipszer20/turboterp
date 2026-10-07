// Religions of the Ancient Middle East Major, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/jewish-studies/religions-ancient-middle-east-major/;
// jewishstudies.umd.edu/academic-programs/undergraduate/rame-ba (department page);
// College of Arts and Humanities' official Religions of the Ancient Middle East Four Year Academic
// Plan (PDF, fetched 2026-09-28 via program-sources/religions-ancient-middle-east-major.md --
// Google Drive source of a fetch script).
// Owner ruling (docs/project/rulings.md): where the department page (the college's four-year plan
// counts as one) and the catalog disagree, follow the department page.
// Two tracks: the base major (30 credits) and an optional Language Track (adds 6 language credits,
// 36 total), so this file has two Program/Meta pairs sharing major key "rame-major".
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";

const CATALOG_URL =
  "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/jewish-studies/religions-ancient-middle-east-major/";
const DEPARTMENT_URL = "https://jewishstudies.umd.edu/academic-programs/undergraduate/rame-ba";
const COLLEGE_PLAN_URL =
  "https://drive.google.com/uc?export=download&id=1plP1e7d5mrA0V8gPnpWp_CcUWrDt1v_8#Religions-of-the-Ancient-Middle-East";

const SOURCE =
  "UMD Academic Catalog 2026-27, Religions of the Ancient Middle East Major (" +
  CATALOG_URL +
  "); Department of Jewish Studies Religions of the Ancient Middle East page (department source), " +
  DEPARTMENT_URL +
  "; College of Arts and Humanities Religions of the Ancient Middle East Four Year Academic Plan " +
  "(department source), fetched 2026-09-28";

const SHARED_NOTES = [
  "Big Question/I-series Foundations course: the catalog and the college's own four-year plan " +
    "(repeated three times: 'RELS 271, 273, 274, or JWST 230') agree exactly on the four-option list " +
    "JWST230/RELS271/RELS273/RELS274. The department webpage's narrative Foundations section instead " +
    "lists a different, three-option set for the same slot -- RELS289I ('What is Religion?'), " +
    "RELS289M ('Jesus, Mani, and Muhammad'), and JWST274 ('Jerusalem in Antiquity') -- omitting " +
    "JWST230 entirely and using RELS289I/RELS289M instead of RELS271/RELS273. This looks like a " +
    "stale, pre-renumbering fragment of the department page (RELS289 is UMD's generic special-topics " +
    "number, consistent with these having since become permanent RELS271/273/274 course numbers), " +
    "since the college's own official four-year plan -- also a department source under the ruling -- " +
    "agrees with the catalog's current numbering. Encoded as JWST230/RELS271/RELS273/RELS274. " +
    "Flagged in docs/project/owner-review.md since this is a three-way source tangle, not a clean " +
    "catalog-vs-department disagreement.",
  "'Three courses in two or more geographical, chronological, or cultural sub-areas': all three " +
    "sources give the same five-course list (HIST120, RELS264, JWST225, JWST231, JWST262) but none " +
    "assigns individual courses to a specific sub-area, so the 'two or more sub-areas' constraint " +
    "itself can't be verified/enforced -- encoded as choose-3-from-the-list. Flagged in " +
    "docs/project/owner-review.md.",
  "Electives ('four must be at the upper level', 5 of 10 listed courses): all three sources give the " +
    "same 10-course list, of which only HIST110 is below the 300 level. Since at most one of any 5 " +
    "distinct courses drawn from this list can be HIST110, 'four must be upper level' is always " +
    "satisfied by construction -- no separate level constraint was needed beyond choose-5-from-the-list.",
  "JWST324 carries a different title on the catalog ('Archaeology and the Quest for Ancient Israel') " +
    "than on the department page ('Biblical History and Culture'); same course number on both, so not " +
    "encoded as a disagreement, just noted.",
  "HIST428 is encoded as the specific section HIST428R ('Transition to Islam: From the Ancient to the " +
    "Medieval Muslim World'), the only section all three sources actually name for this slot.",
  "Language Track: 'First year language (6-12 credits)' is a prerequisite for reaching the " +
    "second-year level the 6 required credits sit at, not itself a major requirement that consumes " +
    "credit -- not encoded as a Requirement (same treatment as other batches' admission/placement " +
    "gates). Placement/exemption ('students who place directly into second year language or above " +
    "need only complete six credits of language') is advising/placement-test territory, not a " +
    "distinct encodable rule -- noted here rather than as a requirement.",
  "Language Track department coverage: the catalog and department page both say the university " +
    "'currently offers Arabic, Hebrew and Greek' for the track and both also allow substituting " +
    "Aramaic, Akkadian, or Syriac taken via CourseShare/the Consortium of Universities of the " +
    "Washington Metropolitan Area 'or other relevant language'. Encoded against HEBR, ARAB, and GREK " +
    "only (confirmed real UMD department codes already used elsewhere in this codebase); no UMD " +
    "department code for Aramaic, Akkadian, or Syriac undergraduate coursework is confirmed anywhere " +
    "in this codebase's sources, so that substitution allowance is not encoded. Flagged in " +
    "docs/project/owner-review.md.",
  "No per-course minimum grade is stated for the major anywhere in the sources (unlike sibling ARHU " +
    "majors) -- the four-year plan's 'Cumulative average of major requirements must be at least a " +
    "2.0' is a GPA-average rule, not a per-course floor, so Program.minGrade is left unset here.",
  "Not encoded (engine gaps): the 2.0 cumulative-average-of-major-requirements rule, residency rules " +
    "(30 credits at UMD, 15 of the final 30 credits at the 300-400 level, 12 upper-level major credits " +
    "at UMD), and the 120-credit/39 upper-level-credit graduation minimums. The audit engine checks " +
    "per-requirement course assignment and per-course minGrade, not GPA, residency, or credit totals.",
];

function foundations(): Requirement[] {
  return [
    {
      kind: "choose",
      id: "big-question",
      name: "One approved Big Question course (JWST230, RELS271, RELS273, or RELS274)",
      count: 1,
      from: { courses: ["JWST230", "RELS271", "RELS273", "RELS274"] },
    },
    {
      kind: "choose",
      id: "sub-areas",
      name: "Three courses in two or more geographical, chronological, or cultural sub-areas",
      count: 3,
      from: { courses: ["HIST120", "RELS264", "JWST225", "JWST231", "JWST262"] },
    },
    {
      kind: "choose",
      id: "electives",
      name: "Five electives (four must be at the upper level)",
      count: 5,
      from: {
        courses: [
          "CLAS305",
          "HIST110",
          "HIST320",
          "HIST428R",
          "JWST324",
          "JWST325",
          "JWST326",
          "JWST430",
          "JWST468",
          "JWST469",
        ],
      },
    },
    {
      kind: "course",
      id: "capstone",
      name: "Capstone Seminar for Religions of the Ancient Middle East",
      options: ["RELS408"],
    },
  ];
}

// ---------------------------------------------------------------------------------------------
// Base major (default)
// ---------------------------------------------------------------------------------------------

export const rameMajor: Program = {
  id: "rame-major",
  name: "Religions of the Ancient Middle East Major",
  catalogYear: "2026-27",
  source: SOURCE,
  verified: false,
  reviewNotes: [...SHARED_NOTES],
  requirements: [...foundations()],
};

export const rameMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Religions of the Ancient Middle East",
  major: "rame-major",
  track: "Standard",
  defaultTrack: true,
  sources: { catalog: CATALOG_URL, department: DEPARTMENT_URL },
};

// ---------------------------------------------------------------------------------------------
// Language Track (min. 36 credits total)
// ---------------------------------------------------------------------------------------------

export const rameMajorLanguageTrack: Program = {
  id: "rame-major-language",
  name: "Religions of the Ancient Middle East Major (Language Track)",
  catalogYear: "2026-27",
  source: SOURCE,
  verified: false,
  reviewNotes: [...SHARED_NOTES],
  requirements: [
    ...foundations(),
    {
      kind: "choose",
      id: "language-track",
      name:
        "Six credits in Hebrew, Arabic, Greek, or another approved language beyond the first-year " +
        "level",
      credits: 6,
      // Department page: "Courses at the 600-, 700- and 800-levels are reserved for graduate students."
      from: { departments: ["HEBR", "ARAB", "GREK"], minNumber: 200, maxNumber: 499, noGraduateCourses: true },
    },
  ],
};

export const rameMajorLanguageTrackMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Religions of the Ancient Middle East",
  major: "rame-major",
  track: "Language Track",
  sources: { catalog: CATALOG_URL, department: DEPARTMENT_URL },
};
