// Women, Gender, and Sexuality Studies Major, 2026-27 UMD Academic Catalog.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/women-gender-sexuality-studies/
// womens-gender-sexuality-studies-major/; the College of Arts and Humanities official four-year academic plan
// (Google Drive PDF, fetched 2026-09-28) -- see program-sources/womens-gender-sexuality-studies-major.md.
// Owner ruling (docs/project/rulings.md, 2026-09-26): where the department page (the college's own
// four-year plan counts as one) and the Academic Catalog disagree, the department page wins.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

// "Introductory Course" (3 credits): select one.
const INTRO_LIST = ["LGBT200", "WGSS105", "WGSS200", "WGSS205", "WGSS250", "WGSS263"];

// Lower Level Core (LLC): minimum 3 credits.
const LLC_LIST = [
  "LGBT200", "LGBT264", "LGBT298",
  "WGSS105", "WGSS115", "WGSS200", "WGSS205", "WGSS250", "WGSS263", "WGSS265", "WGSS267", "WGSS271",
  "WGSS280", "WGSS290", "WGSS291",
];

// Lower Level Electives (LLE): maximum 3 credits; the catalog also allows a second Intro-or-LLC
// course here instead of an LLE course, so this pool is LLE union Intro union LLC (see reviewNotes).
const LLE_LIST = [
  "LGBT265",
  "WGSS210", "WGSS211", "WGSS212", "WGSS230", "WGSS255", "WGSS275", "WGSS298",
  "FMSC190", "HIST215", "KNES225",
];

// Upper Level Core (ULC): minimum 9 of the 18 Upper Level credits.
const ULC_LIST = [
  "LGBT310", "LGBT327", "LGBT350", "LGBT386", "LGBT398", "LGBT411", "LGBT448", "LGBT488", "LGBT499",
  "WGSS302", "WGSS315", "WGSS319", "WGSS330", "WGSS358", "WGSS360", "WGSS368", "WGSS370", "WGSS378",
  "WGSS379", "WGSS410", "WGSS428", "WGSS468", "WGSS486", "WGSS488", "WGSS489", "WGSS497", "WGSS498Z",
  "WGSS499",
];

// Upper Level Elective (ULE): minimum 6 of the 18 Upper Level credits; the remaining 3 of the 18
// come from either the ULC or ULE list (see the "either" requirement below).
const ULE_LIST = [
  "LGBT359", "ENGL359",
  "LGBT448C", "LGBT448W", "LGBT448Y", "ENGL439D",
  "WGSS314", "WGSS320", "WGSS325", "WGSS326", "WGSS336",
  "WGSS348", "ENGL348",
  "WGSS408", "ENGL408",
  "WGSS420", "WGSS425",
  "WGSS444", "ENGL444",
  "WGSS448", "ENGL448",
  "WGSS452", "WGSS455", "WGSS456", "WGSS457", "WGSS458", "WGSS469", "WGSS471", "WGSS491", "WGSS492", "WGSS498",
  "AASP493", "AMST320", "ANTH403", "CCJS346", "CINE423", "COMM324",
  "ENGL329A", "ENGL329C", "CMLT398L", "ENGL329Y", "ENGL362", "ENGL388D",
  "FMSC310", "FMSC330", "HESI422",
  "HIST338A", "HIST360", "WGSS498M", "HIST412", "HIST467",
  "HLTH377", "HLTH424", "JAPN316", "JWST373", "PLCY311", "PSYC354",
  "SOCY335", "SOCY435", "SOCY470",
  "SPAN412", "SPAN433", "SPAN471",
];

export const wgssMajor: Program = {
  id: "wgss-major",
  name: "Women, Gender, and Sexuality Studies Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Women, Gender, and Sexuality Studies Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/women-gender-sexuality-studies/" +
    "womens-gender-sexuality-studies-major/); College of Arts and Humanities official four-year academic plan " +
    "for Women, Gender, and Sexuality Studies, fetched 2026-09-28 (PDF-to-text conversion unreadable, see reviewNotes)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department plan unreadable: unlike other ARHU builds where the college's four-year-plan PDF converts to " +
      "garbled-but-partially-legible text, this one (program-sources/womens-gender-sexuality-studies-major.md, " +
      "'Sample plan' section) converts to unreadable binary-looking text with no recoverable course numbers or " +
      "structure at all. Per the main session's brief, the sample plan (packages/programs/sample-plans/wgss-major.json) " +
      "is constructed from the catalog's own requirement table instead, marked `official: false`, and flagged in " +
      "docs/project/owner-review.md. No department-vs-catalog disagreement could be checked for the same reason.",
    "'Lower Level Requirements' (6 credits) is the catalog's own 'minimum 3 credits from LLC' + 'maximum 3 " +
      "credits of LLE, or a second course from the Intro or LLC list instead of LLE' language, encoded as two " +
      "`choose` buckets: one 3-credit bucket restricted to the LLC list, and one 3-credit bucket over the union " +
      "of LLE, Intro and LLC (so a student may spend the second slot on a second LLC/Intro course or an LLE " +
      "course, matching the source exactly -- not narrowed to LLE-only).",
    "'Upper Level Requirements' (18 credits: '9 of the 18 credits are required to be ULC, 6 are required to be " +
      "ULE, the remaining 3 credits can come from either the ULC or ULE lists') is encoded as three `choose` " +
      "buckets: 9 credits from ULC, 6 credits from ULE, and 3 credits from the union of both -- matching the " +
      "source's own three-way split exactly.",
    "Topic-lettered course numbers named by the catalog (LGBT448C, LGBT448W, LGBT448Y, ENGL329A, ENGL329C, " +
      "ENGL329Y, HIST338A, WGSS498Z, WGSS498M) are kept as their own literal course ids, exactly as printed, " +
      "even though they aren't on the Academic Catalog's plain WGSS course-number list supplied for filler use " +
      "(that list is for unnamed plan slots only, per the builder brief; these are named directly by the source).",
    "No WMST-prefixed course appears anywhere in either source for this major (unlike AAAS/AASP, where the " +
      "department checklists used the retired AASP prefix throughout); the WGSS/WMST dual-prefix acceptance " +
      "pattern from the builder brief was therefore not applied to any requirement here. If a department source " +
      "naming WMST codes surfaces later, this should be revisited.",
    "Foundation Courses (WGSS301, WGSS487) and the Upper Level Requirements (24 credits total) are all at the " +
      "3xx level or above, so the catalog's 'at least 24 credits must be at or above the 3xx level' floor is met " +
      "automatically by this structure's own credit totals -- not separately encoded as its own requirement.",
    "Not encoded (engine gaps): residency rules; and the 120-credit " +
      "graduation minimum. The audit engine checks per-requirement course assignment and per-course minGrade, " +
      "not GPA, residency, or credit totals.",
  ],
  requirements: [
    {
      kind: "choose",
      id: "wgss-intro",
      name: "Introductory Course",
      credits: 3,
      from: { courses: INTRO_LIST },
    },
    {
      kind: "choose",
      id: "wgss-llc",
      name: "Lower Level Core (LLC)",
      credits: 3,
      from: { courses: LLC_LIST },
    },
    {
      kind: "choose",
      id: "wgss-lle-or-second",
      name: "Lower Level Elective (LLE), or a second course from the Introductory or LLC list",
      credits: 3,
      from: { courses: [...new Set([...LLE_LIST, ...INTRO_LIST, ...LLC_LIST])] },
    },
    { kind: "course", id: "wgss301", name: "Feminist Knowledge Production", options: ["WGSS301"] },
    {
      kind: "course",
      id: "wgss487",
      name: "Advanced Projects Seminar in Gender, Race, and Queer Studies",
      options: ["WGSS487"],
    },
    {
      kind: "choose",
      id: "wgss-ulc",
      name: "Upper Level Core (ULC)",
      credits: 9,
      from: { courses: ULC_LIST },
    },
    {
      kind: "choose",
      id: "wgss-ule",
      name: "Upper Level Elective (ULE)",
      credits: 6,
      from: { courses: ULE_LIST },
    },
    {
      kind: "choose",
      id: "wgss-ulc-or-ule",
      name: "Upper Level Core or Elective (remaining credits)",
      credits: 3,
      from: { courses: [...new Set([...ULC_LIST, ...ULE_LIST])] },
    },
  ],
};

export const wgssMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Women, Gender, and Sexuality Studies",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/women-gender-sexuality-studies/womens-gender-sexuality-studies-major/",
    department:
      "https://drive.google.com/uc?export=download&id=1LJeussxI358rB4P4J7pbCZeQlEgE6jOv#Women,-Gender,-and-Sexuality-Studies",
  },
};
