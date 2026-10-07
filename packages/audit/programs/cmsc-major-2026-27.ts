// Computer Science Major (B.S.), 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/computer-science/computer-science-major/
// (packages/catalog/test/fixtures/cs-major.html); Department of Computer Science,
// https://undergrad.cs.umd.edu/degree-requirements-cs-major (fetched 2026-09-26; see
// program-sources/cmsc-major.md), with course lists from https://undergrad.cs.umd.edu/general-track-degree-requirements
// and exclusions from https://undergrad.cs.umd.edu/upper-level-concentration. Owner ruling
// (docs/project/rulings.md): where the department page and the catalog disagree, follow the
// department page; each such difference is recorded below citing both sources.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, Requirement, ProgramMeta } from "../src/audit.ts";

// Shared by every specialization (cmsc-specializations-2026-27.ts): the department's General
// Track / Distributive Areas page says its area and elective lists "can be used by all 4 CS
// specialization tracks" (program-sources/cmsc-major.md, line 55), and the Upper Level
// Concentration is identical "regardless of specialization" (same source, line 35).
export const AREAS = [
  { name: "Area 1: Systems", courses: ["CMSC411", "CMSC412", "CMSC414", "CMSC416", "CMSC417"] },
  {
    name: "Area 2: Information Processing",
    courses: ["CMSC420", "CMSC421", "CMSC422", "CMSC423", "CMSC424", "CMSC426", "CMSC427", "CMSC470", "CMSC471", "CMSC472"],
  },
  {
    name: "Area 3: Software Engineering and Programming Languages",
    // CMSC431 (department page only, see review notes below).
    courses: ["CMSC430", "CMSC431", "CMSC433", "CMSC434", "CMSC435", "CMSC436", "CMSC471"],
  },
  { name: "Area 4: Theory", courses: ["CMSC451", "CMSC452", "CMSC454", "CMSC456", "CMSC457", "CMSC474"] },
  { name: "Area 5: Numerical Analysis", courses: ["CMSC460", "CMSC466"] },
];

// Footnote 2 (catalog) / Math Requirements table (department page): the STAT4xx and
// MATH/AMSC/STAT elective slots "cannot be cross-listed with CMSC". Confirmed by the department's
// own Upper Level Concentration page (its own worked example: "courses cross-listed with CMSC
// courses (e.g., AMSC460)"; its course table lists "AMSC: 460, 466") -- both sources call for this
// exclusion, so it's an engine gap, not a disagreement between them.
export const AMSC_CROSSLISTS = ["AMSC460", "AMSC466"];
// MATH456 (= CMSC456/ENEE456) and MATH475 (= CMSC475) are cross-listed per Testudo/Coursicle
// schedule-of-classes listings (web search, 2026-09-26) -- the department's ULC page lists
// MATH456/475 as ULC-ineligible but doesn't say cross-listed-with-CMSC is the reason for each one
// individually, so this pairing is confirmed by a different source than AMSC460/466 above.
// Owner-confirmed as real cross-lists (CS department-page answers, 2026-09-27).
export const MATH_CROSSLISTS = ["MATH456", "MATH475"];
// STAT426 is NOT cross-listed with CMSC (owner ruling, CS department-page answers, 2026-09-27):
// it never counts as a CMSC course, so it's free to fill the STAT4xx requirement or the
// MATH/AMSC/STAT elective below. It stays ineligible for the Upper Level Concentration --
// the department's ULC page lists it as "credit only granted for" a CMSC course, which is a
// different requirement with its own exclusion (see the concentration requirement's `exclude`).
export const CONCENTRATION_CREDIT_ONLY_FOR_CMSC = ["STAT426"];

// Upper Level Concentration: identical for every specialization (see the module comment above).
// disciplineGroups: the ULC "Things to Note" page (program-sources/cmsc-major.md, line ~173 on)
// says students "are able to mix and match their courses between MATH and STAT" and, separately,
// "between LGBT and WGSS" -- so those pairs count as one discipline, not two, for the "one
// discipline outside CMSC" rule (owner ruling; engine support: Requirement's `disciplineGroups`).
export const CONCENTRATION_REQUIREMENT: Requirement = {
  kind: "concentration",
  id: "concentration",
  name: "12 credits of 300–400 level courses in one discipline outside CMSC",
  credits: 12,
  minNumber: 300,
  maxNumber: 499,
  // CMSC excluded by both sources; DATA/HONR/HNUH/INST/CPSP excluded by the department
  // page only (see review notes above). STAT426 is individually excluded: the department's
  // ULC page lists it as "credit only granted for" a CMSC course (owner ruling, 2026-09-27),
  // even though STAT itself isn't an excluded department here. The CMSC cross-lists are
  // excluded too (footnote 5: "no course in or cross-listed with CMSC").
  excludeDepartments: ["CMSC", "DATA", "HONR", "HNUH", "INST", "CPSP"],
  exclude: [...AMSC_CROSSLISTS, ...MATH_CROSSLISTS, ...CONCENTRATION_CREDIT_ONLY_FOR_CMSC],
  disciplineGroups: [
    ["MATH", "STAT"],
    ["LGBT", "WGSS"],
  ],
  minGrade: "D-",
  minGpa: 1.7,
};

// Required lower-level courses (unless exempt by proficiency exam, footnote 1) plus the two
// "additional required" CMSC courses -- identical for every specialization (each one's page says
// "the same foundational courses in computer science... the difference in the specialization is
// the upper level computer science courses").
export const LOWER_LEVEL: Requirement[] = [
  { kind: "course", id: "math140", name: "Calculus I", options: ["MATH140"], minGrade: "C-" },
  { kind: "course", id: "math141", name: "Calculus II", options: ["MATH141"], minGrade: "C-" },
  // Owner-confirmed 2026-09-25: CMSC141 counts for CMSC131 and CMSC142 for CMSC132.
  // CMSC133 (department page, see review notes): "CMSC131 or CMSC133".
  { kind: "course", id: "cmsc131", name: "Object-Oriented Programming I", options: ["CMSC131", "CMSC141", "CMSC133"], minGrade: "C-" },
  { kind: "course", id: "cmsc132", name: "Object-Oriented Programming II", options: ["CMSC132", "CMSC142"], minGrade: "C-" },
  { kind: "course", id: "cmsc216", name: "Introduction to Computer Systems", options: ["CMSC216"], minGrade: "C-" },
  { kind: "course", id: "cmsc250", name: "Discrete Structures", options: ["CMSC250"], minGrade: "C-" },
  { kind: "course", id: "cmsc330", name: "Organization of Programming Languages", options: ["CMSC330"], minGrade: "C-" },
  { kind: "course", id: "cmsc351", name: "Algorithms", options: ["CMSC351"], minGrade: "C-" },
];

// The generic "STAT4xx" and "MATH/AMSC/STAT xxx" additional-required slots (General Track and
// Cybersecurity). Data Science, Machine Learning and Quantum Information replace one or both with
// a specific course instead (see cmsc-specializations-2026-27.ts).
export const STAT4XX_GENERIC: Requirement = {
  kind: "choose",
  id: "stat4xx",
  name: "STAT 400-level course",
  count: 1,
  from: { departments: ["STAT"], minNumber: 400, maxNumber: 499 },
  minGrade: "C-",
};
export const MATHXXX_GENERIC: Requirement = {
  kind: "choose",
  id: "mathxxx",
  name: "MATH/AMSC/STAT course (prerequisite MATH141 or higher)",
  count: 1,
  from: {
    departments: ["MATH", "AMSC", "STAT"],
    minNumber: 240,
    maxNumber: 499,
    exclude: [...AMSC_CROSSLISTS, ...MATH_CROSSLISTS],
  },
  minGrade: "C-",
};

// Upper level: five 400-level courses from at least three areas, at most three per area (footnote
// 3); the General Track / Distributive Areas page says this "applies to all CS tracks" (see the
// module comment above).
export const AREAS_REQUIREMENT: Requirement = {
  kind: "distribution",
  id: "areas",
  name: "Five Distributive Area courses across three areas",
  count: 5,
  minAreas: 3,
  maxPerArea: 3,
  areas: AREAS,
  minGrade: "C-",
};
// Machine Learning's page states this identically ("Six credits from CMSC 3XX or CMSC 4XX
// excluding CMSC330 and CMSC351"); Cybersecurity and Quantum Information's "Upper Level Elective
// Course(s)" are a narrower 3-credit version of the same filter (see that program's own choose).
export const ELECTIVES_GENERIC: Requirement = {
  kind: "choose",
  id: "electives",
  name: "Upper-level CMSC electives (6 credits)",
  credits: 6,
  from: { departments: ["CMSC"], minNumber: 300, maxNumber: 499, exclude: ["CMSC330", "CMSC351"] },
  minGrade: "C-",
};

export const cmscMajor: Program = {
  id: "cmsc-major",
  name: "Computer Science Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Computer Science Major; " +
    "Department of Computer Science, https://undergrad.cs.umd.edu/degree-requirements-cs-major (fetched 2026-09-26)",
  // No program-wide minGrade: the concentration's D-grade allowance (department page; see review
  // notes) needs its own, looser minGrade, so every other requirement below sets minGrade: "C-"
  // individually instead.
  verified: false,
  reviewNotes: [
    "Footnote 2 ('MATH/AMSC/STAT xxx' must have MATH141 or higher as a prerequisite, not cross-listed with CMSC) is approximated as any MATH/AMSC/STAT course numbered 240+. Needs the real prerequisite check. AMSC stays in this slot (owner-confirmed, CS department-page answers, 2026-09-27).",
    "'STAT4xx' is encoded as any STAT course numbered 400–499.",
    "Cross-listed-with-CMSC exclusion (engine gap the catalog and department page both call for, not a disagreement between them): mathxxx excludes AMSC460, AMSC466 (dept-page-confirmed) and MATH456, MATH475 (web-search-confirmed via Testudo/Coursicle, owner-confirmed as real cross-lists). STAT426 is NOT a CMSC cross-list (owner ruling, CS department-page answers, 2026-09-27) and is no longer excluded from stat4xx or mathxxx -- it's excluded only from the Upper Level Concentration (see that requirement's `exclude`), which is a separate, 'credit only granted for' ineligibility. This list is only as complete as what could be confirmed -- not necessarily exhaustive.",
    "Footnote 4 (credit for only one of CMSC460/CMSC466) is not enforced yet.",
    "Upper-level electives: footnote 3 says 6 credits at the 300/400 level, including 1-credit winter courses and independent study; encoded as 6 credits of CMSC 300–499 excluding CMSC330 and CMSC351. The department's General Track page lists specific eligible electives (CMSC320, 335, 388/389/398 STICs, 395, 396, 401, 425, 437, 473, 475, 476, 477, 488A, 498, 498A, 499A) -- all within this range, so no widening or narrowing needed. CMSC395 (TAs only) and CMSC396 (Dept Honors only) have eligibility gates the audit can't check (no TA/Honors data on StudentCourse); not enforced.",
    "Department-vs-catalog difference (owner ruling: follow the department page): the department's main requirements page lists 'CMSC131 (4) Object-Oriented Programming I* or CMSC133 (2) Object-Oriented Programming I Beyond Fundamentals'; the academic catalog's required-courses table lists only CMSC131. CMSC133 is added to cmsc131's options, alongside the owner-confirmed CMSC141. Owner-confirmed (CS department-page answers, 2026-09-27): CMSC133 also satisfies the CMSC131 LEP gateway course, so gateway.ts's GATEWAY_COURSES now matches this program's options.",
    "Department-vs-catalog difference (owner ruling: follow the department page): the department's Upper Level Concentration page allows 'a grade of D ... as long as the cumulative GPA for the ULC is at least 1.7', looser than the catalog's blanket 'C- or better in all major requirements' (footnote 5 doesn't mention D grades at all). This is encoded (the concentration requirement gets its own minGrade: 'D-' and minGpa: 1.7, the credit-weighted GPA of its completed letter-graded courses; every other requirement keeps minGrade: 'C-' individually, since the audit engine now has no program-wide minGrade -- see the requirements list below). Checked and NOT a UI change: apps/web/lib/advisor/words.ts's '<grade> or better' note (prerequisiteText) reads a course-prerequisite object's minGrade (@turboterp/course-data/prereqs), not a Program Requirement's -- this program's requirements aren't rendered through it, and advisor-requirements.test.ts's existing assertions were unaffected by adding minGrade here, confirming no live text changed. P/S grades still don't count toward the concentration (meetsGrade has no rank for non-letter grades), matching the department page's narrow 'P only for Spring 2020/2021' allowance closely enough (that narrow exception itself isn't encoded). Edge case, not fixed: a D-then-passing-retake of the SAME course (e.g. CMSC330 D, then B) can be mis-displayed by packages/plan/src/what-if.ts's usedIndices, which marks 'used' occurrences by walking the plan in order without knowing which specific occurrence the solver actually assigned; it could tag the D attempt as 'counts' instead of the passing retake. Low-stakes in practice: the owner's own rule only allows a retake after an F or W, so a D-then-B retake is already flagged as an error by the repeat checker regardless of this display quirk.",
    "Department-vs-catalog difference (owner ruling: follow the department page): the department's General Track distributive-areas page and its Cybersecurity specialization page both list 'CMSC431 (3) Privacy Engineering (formerly CMSC498G)' under Area 3; the academic catalog's Area 3 table (and its Cybersecurity table) omit it. Added to Area 3.",
    "The department's distributive-area lists also count several CMSC498* 'Selected Topics' sections toward specific areas, but only for the semester(s) each was offered (e.g. 'CMSC498C ... Spring 2024, Spring 2025, Spring 2026, and Fall 2026 only'). StudentCourse has no term field, so the audit can't check when a course was taken; these semester-limited area credits are not encoded. Manual check until StudentCourse gains a term.",
    "Department-vs-catalog difference (owner ruling: follow the department page): the department's Upper Level Concentration page ('Not Eligible for ULC') excludes Data Science (DATA), Honors (HONR/HNUH), Information Science (INST) and College Park Scholars (CPSP) from ever being the outside-CMSC discipline; the academic catalog's footnote 5 only says 'no course in or cross-listed with CMSC'. Added to the concentration's excludeDepartments. The same page also lists 'Computer Engineering' and 'Quantum Science Engineering' as ineligible disciplines, but doesn't give them a distinct course prefix (their courses are largely ENEE/PHYS, which the page bans only course-by-course, not wholesale) -- not encoded; manual check. INST's narrow exception (declared in one of two specific Shady Grove minors) also isn't encoded -- INST is excluded outright here.",
    "The same Upper Level Concentration page gives a worked example that a course 'cross-listed as CMSC' is ineligible even outside the CMSC department (e.g. AMSC460) and lists dozens more course-specific exclusions across AOSC, AREC, BIOE, BSCI, BMGT, ECON, ENEE, ENGL, GEOG, GEOL, IMDM, MATH, PHIL, PHPE, PHYS, PSYC and STAT -- explicitly captioned 'not exhaustive; updated with new courses regularly' and 'send the syllabus to your advisor for review'. The concentration requirement now supports a per-course `exclude` as well as `excludeDepartments` (added to encode STAT426, see below), but this table is advisor-maintained and far larger than one course; the rest of it is still not encoded. Manual check (see program-sources/cmsc-major.md for the full list as fetched). The confirmed CMSC cross-lists (AMSC460/466, MATH456/475) are in the concentration's `exclude` too (footnote 5).",
    "Both sources require a minimum GPA in the outside-CMSC concentration coursework, but disagree on the number: the department's Upper Level Concentration page says 'a cumulative GPA of 1.7 or higher'; the academic catalog's footnote 5 says 'an overall 2.0 average'. Department-vs-catalog difference (owner ruling: follow the department page) -- 1.7 is the number used, encoded as the concentration's minGpa (the audit computes it over completed letter-graded courses; planned courses only mark it at risk).",
    "Footnote 5 / the concentration page also require: each course at least 3 credits, at most one independent-study/experiential-learning course, up to 6 transfer credits, and no course also used for the CS major (the last one is already true by construction -- a course counts toward at most one non-overlay requirement per program). None of the credit/count limits are enforced; manual check.",
    "Resolved: the department's Upper Level Concentration page says 'Students using Math or Statistics courses for the ULC are able to mix and match their courses between MATH and STAT' (and the same for LGBT/WGSS courses). The concentration requirement type now supports `disciplineGroups` (packages/audit/src/audit.ts); CONCENTRATION_REQUIREMENT groups MATH+STAT and LGBT+WGSS. This matters for the owner's own verification target (Math Applied + CS), whose concentration is very likely MATH/STAT.",
    "LEP Benchmarks (department page): a 45-credit checkpoint (CMSC131, CMSC132, MATH140, each C- or better, 2.0 cumulative GPA) and a 75-credit checkpoint (CMSC330, CMSC351, one of STAT4xx/MATH-AMSC-STAT xxx, C- or better, 2.0 cumulative GPA). This is a progress-checkpoint concept (tied to credits-earned-so-far) the audit engine doesn't model at all (it only reports gaps against the finished requirement list, not by checkpoint); not encoded. Resolved (CS department-page answers, owner, 2026-09-27): the 3.0 cumulative GPA in gateway.ts's Fall-2024-or-later rule is correct; this page's 2.0 figure is out of date.",
    "No CS-specific residency requirement is stated on the department's requirements pages (only the general university residency policy would apply, which the audit engine doesn't model at all).",
    "Minimum grade C- applies to every requirement except the concentration (see above); gateway courses need B- for students who started Fall 2024 or later (CS tracking sheet), handled separately by the gateway check.",
    "Resolved: the four specializations (Cybersecurity, Data Science, Machine Learning, Quantum Information) are encoded as separate programs in cmsc-specializations-2026-27.ts, each selectable in place of this General Track program (packages/programs registry: major: 'cs', a track per specialization; General Track stays the default, not required). They share this file's LOWER_LEVEL, AREAS, ELECTIVES_GENERIC and CONCENTRATION_REQUIREMENT. See that file's own review notes for specialization-specific gaps.",
  ],
  requirements: [
    ...LOWER_LEVEL,
    STAT4XX_GENERIC,
    MATHXXX_GENERIC,
    AREAS_REQUIREMENT,
    ELECTIVES_GENERIC,
    // Upper-level concentration (footnote 5; department page: "Upper Level Concentration").
    // minGrade "D-" (not "C-"): the department page allows a D grade here specifically (see
    // review notes) -- D- is the lowest grade above F, so F/W attempts still earn no credit
    // (audit.ts's earnsCredit excludes them universally regardless of minGrade).
    CONCENTRATION_REQUIREMENT,
  ],
};

export const cmscMajorMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "Computer Science", major: "cs", track: "General", defaultTrack: true, sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/computer-science/computer-science-major/", department: "https://undergrad.cs.umd.edu/degree-requirements-cs-major" } };
