// Dance Major, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/theatre-dance-performance-studies/dance-major/;
// College of Arts and Humanities' official Dance Four Year Academic Plan (department source, converted
// from PDF), https://drive.google.com/uc?export=download&id=1RdyaKmH8ft-GLD4UHzet9ubPtwSVD1cr#Dance
// (fetched 2026-09-28, via program-sources/dance-major.md).
// The catalog's single "Area of Emphasis" requirement (12 credits) has three named areas -- Performance
// and Choreography, Production, and Education -- each with its own required courses, so this is encoded
// as three tracks sharing major key `danc` (pattern: sds-major-tracks-2026-27.ts). Everything else in the
// major is identical across tracks and lives in DANC_CORE_REQUIREMENTS below.
// Owner ruling (docs/project/rulings.md): where the department page (the college's four-year plan counts
// as one) and the catalog disagree, follow the department page.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";

export const DANC_CATALOG_URL =
  "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/theatre-dance-performance-studies/dance-major/";
export const DANC_DEPT_URL = "https://drive.google.com/uc?export=download&id=1RdyaKmH8ft-GLD4UHzet9ubPtwSVD1cr#Dance";
export const DANC_SOURCE =
  "UMD Academic Catalog 2026-27, Dance Major (" + DANC_CATALOG_URL + "); " +
  "College of Arts and Humanities, official Dance Four Year Academic Plan (department source), " + DANC_DEPT_URL + " (fetched 2026-09-28)";

/** Shared review notes every DANC track below repeats verbatim. */
export const DANC_SHARED_NOTES: string[] = [
  "The department's official four-year plan (program-sources/dance-major.md, 'Sample plan' section) was re-checked from OCR text (2026-09-28). It is a single generic plan (Benchmark 1-3 rows, 'Area of Emphasis #1-#4' slots, DANC Dance Forms, a DANC capstone) that does not name a track, and its course codes and term placement are too garbled to read. No department-vs-catalog difference could be established; encoding unchanged. All three tracks' sample plans stay CONSTRUCTED from the catalog's own requirement list, `official: false`.",
  "The catalog's requirement table is headed 'College Requirements' immediately above the full course list, but the " +
    "listed courses/credits sum exactly to the catalog's own stated 49-credit major total (30 named courses + 3 " +
    "capstone + 4 Dance Forms + 12 Area of Emphasis = 49); read as a mislabeled table header from the PDF conversion, " +
    "not a separate ARHU college-level list, so the whole table is encoded as the major's own requirements.",
  "'4 credits of Dance Forms selected from' (DANC138/228/229/328/329) has no per-course credit value in the source; " +
    "the requirement is encoded as a 4-credit `choose` over that named list, so any real per-course credit value " +
    "the courses actually carry will satisfy it correctly at audit time. The sample plan's own per-course credit " +
    "assumption is noted in its own `notes` field.",
  "Not encoded (engine gaps): the Mid-Point Assessment (portfolio + " +
    "meeting, a benchmark gate, not a course); mandatory per-semester advising; residency rules (30 credits at UMD, " +
    "15 of the final 30 at the 300-400 level, 12 upper-level major credits at UMD); and the 120-credit graduation " +
    "minimum. Entrance auditions are 'not required' per the catalog, so nothing to encode or flag there. Program GPA 2.0 encoded as minGpa.",
];

/** Requirements every DANC track shares (everything but the 12-credit Area of Emphasis). */
export const dancCoreRequirements = (): Requirement[] => [
  { kind: "course", id: "danc218", name: "Modern Dance I", options: ["DANC218"] },
  { kind: "course", id: "danc219", name: "Modern Dance II", options: ["DANC219"] },
  { kind: "course", id: "danc318", name: "Modern Dance III", options: ["DANC318"] },
  { kind: "course", id: "danc319", name: "Modern Dance IV", options: ["DANC319"] },
  { kind: "course", id: "danc109", name: "Choreography I: Improvisation", options: ["DANC109"] },
  { kind: "course", id: "danc179", name: "Movement Integration", options: ["DANC179"] },
  { kind: "course", id: "danc207", name: "Choreography II: The Creative Process", options: ["DANC207"] },
  { kind: "course", id: "danc383", name: "Dance History & Theory", options: ["DANC383"] },
  { kind: "course", id: "danc304", name: "Dance Education I: Foundations", options: ["DANC304"] },
  { kind: "course", id: "tdps201", name: "Introduction to Technical Production", options: ["TDPS201"] },
  {
    kind: "course",
    id: "tdps479-core",
    name: "Production Practicum (1 credit required of all majors)",
    options: ["TDPS479"],
  },
  {
    kind: "course",
    id: "capstone",
    name: "Project-Based Learning or Seminar in Dance",
    options: ["DANC488", "DANC485"],
  },
  {
    kind: "choose",
    id: "dance-forms",
    name: "4 credits of Dance Forms",
    credits: 4,
    from: { courses: ["DANC138", "DANC228", "DANC229", "DANC328", "DANC329"] },
  },
];

// ---------------------------------------------------------------------------------------------
// Performance and Choreography (default track)
// ---------------------------------------------------------------------------------------------

export const dancMajorPerformanceChoreography: Program = {
  id: "danc-major-performance-choreography",
  name: "Dance Major (Performance and Choreography Area of Emphasis)",
  catalogYear: "2026-27",
  source: DANC_SOURCE,
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    ...DANC_SHARED_NOTES,
    "'DANC310' appears in the catalog's Performance and Choreography elective list with no title text (a likely " +
      "PDF-table-conversion artifact) and is not on the Academic Catalog's approved DANC plan-slot course list; kept because it " +
      "is named directly in the source (department page wins per the owner ruling), flagged in " +
      "docs/project/owner-review.md for the owner to confirm the number is current.",
    "Footnote: 'A maximum of a total of 6 credits of DANC448 and DANC449 will count toward the 12 credit area " +
      "requirement' is NOT encoded -- engine gap, the audit's course filters have no per-course-group credit cap " +
      "within a `choose` requirement (matches ChBE/CompE/EE precedent). Flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    ...dancCoreRequirements(),
    { kind: "course", id: "danc309", name: "Choreography III: Dance Composition", options: ["DANC309"] },
    { kind: "course", id: "danc468-pc", name: "Dance Repertory", options: ["DANC468"] },
    {
      kind: "course",
      id: "tdps479-pc",
      name: "Production Practicum (additional, Performance and Choreography area)",
      options: ["TDPS479"],
    },
    {
      kind: "choose",
      id: "pc-electives",
      name: "Additional 5 credits: Modern Dance V/VI, Dance Repertory, Partnering, Laban Movement Analysis, " +
        "Somatics, DANC310, Practicum in Choreography Production and Performance III/IV, or Special Topics in Dance",
      credits: 5,
      from: {
        courses: [
          "DANC448",
          "DANC449",
          "DANC468",
          "DANC420",
          "DANC466",
          "DANC371",
          "DANC310",
          "DANC399",
          "DANC499",
          "DANC489",
        ],
      },
    },
  ],
};

export const dancMajorPerformanceChoreographyMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Dance (Performance and Choreography)",
  major: "danc",
  track: "Performance and Choreography",
  defaultTrack: true,
  sources: { catalog: DANC_CATALOG_URL, department: DANC_DEPT_URL },
};

// ---------------------------------------------------------------------------------------------
// Production
// ---------------------------------------------------------------------------------------------

export const dancMajorProduction: Program = {
  id: "danc-major-production",
  name: "Dance Major (Production Area of Emphasis)",
  catalogYear: "2026-27",
  source: DANC_SOURCE,
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    ...DANC_SHARED_NOTES,
    "'DANC410' appears in the catalog's Production elective list with no title text (same PDF-conversion artifact " +
      "as DANC310) and is not on the Academic Catalog's approved DANC plan-slot course list; kept because it is named directly " +
      "in the source, flagged in docs/project/owner-review.md for the owner to confirm the number is current.",
    "The seven named THET courses (THET116, THET284, THET371, THET383, THET377, THET373, THET472, THET474) are all " +
      "footnoted 'Permission required courses' (an admission gate on each course, not a course requirement) -- not " +
      "enforced, matching the ASTR399/admission-gate precedent; the engine has no per-course permission concept. " +
      "Flagged in docs/project/owner-review.md.",
    "The area's TDPS479 row shows 3 credits (vs. 1 credit in the other two areas), i.e. three separate practicum " +
      "enrollments beyond the 1 credit required of every major; encoded as a 3-credit `choose` over {TDPS479} so a " +
      "repeatable practicum can satisfy it across multiple terms.",
  ],
  requirements: [
    ...dancCoreRequirements(),
    {
      kind: "choose",
      id: "tdps479-production",
      name: "Production Practicum (additional, Production area: 3 credits)",
      credits: 3,
      from: { courses: ["TDPS479"] },
    },
    {
      kind: "choose",
      id: "production-electives",
      name: "Additional 9 credits: DANC310, DANC410, or named THET design/production courses (permission required)",
      credits: 9,
      from: {
        courses: [
          "DANC310",
          "DANC410",
          "THET116",
          "THET284",
          "THET371",
          "THET383",
          "THET377",
          "THET373",
          "THET472",
          "THET474",
        ],
      },
    },
  ],
};

export const dancMajorProductionMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Dance (Production)",
  major: "danc",
  track: "Production",
  sources: { catalog: DANC_CATALOG_URL, department: DANC_DEPT_URL },
};

// ---------------------------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------------------------

export const dancMajorEducation: Program = {
  id: "danc-major-education",
  name: "Dance Major (Education Area of Emphasis)",
  catalogYear: "2026-27",
  source: DANC_SOURCE,
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    ...DANC_SHARED_NOTES,
    "The catalog's own parenthetical for the Laban Movement Analysis row -- 'DANC466 | Laban Movement Analysis " +
      "(DANC489F::3xx or 4xx level Global Movement Practice)' -- names a specific DANC489F section as an accepted " +
      "substitute. Encoded as a `choose` count:1 from {DANC466, DANC489} since the engine has no section-code " +
      "concept to restrict the substitute to section F specifically or to the '3xx or 4xx level' qualifier on it; " +
      "flagged in docs/project/owner-review.md.",
    "Fully prescribed area (no open elective bucket): DANC405, DANC371, the DANC466/DANC489 choice, DANC338, and an " +
      "additional TDPS479 credit sum to exactly the stated 12 credits.",
  ],
  requirements: [
    ...dancCoreRequirements(),
    { kind: "course", id: "danc405", name: "Dance Education II: Education & Policy", options: ["DANC405"] },
    { kind: "course", id: "danc371-edu", name: "Somatics", options: ["DANC371"] },
    {
      kind: "choose",
      id: "edu-laban-or-topics",
      name: "Laban Movement Analysis (or DANC489F Global Movement Practice)",
      count: 1,
      from: { courses: ["DANC466", "DANC489"] },
    },
    { kind: "course", id: "danc338", name: "Dance Techniques", options: ["DANC338"] },
    {
      kind: "course",
      id: "tdps479-edu",
      name: "Production Practicum (additional, Education area)",
      options: ["TDPS479"],
    },
  ],
};

export const dancMajorEducationMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Dance (Education)",
  major: "danc",
  track: "Education",
  sources: { catalog: DANC_CATALOG_URL, department: DANC_DEPT_URL },
};
