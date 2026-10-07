// Computer Science Major (B.S.), 2026-27: the four specializations offered as alternatives to the
// General Track (cmsc-major-2026-27.ts). Sources: Department of Computer Science,
// https://undergrad.cs.umd.edu/cybersecurity-degree-requirements,
// .../data-science-degree-requirements, .../machine-learning-degree-requirements,
// .../quantum-information-degree-requirements (fetched 2026-09-26/27; see
// program-sources/cmsc-major.md). Owner ruling (docs/project/rulings.md): where the department
// page and the academic catalog disagree, follow the department page. Each page states "the same
// foundational courses in computer science ... the difference in the specialization is the upper
// level computer science courses" -- so every specialization reuses cmsc-major-2026-27.ts's
// LOWER_LEVEL, CONCENTRATION_REQUIREMENT and (per the General Track / Distributive Areas page,
// "can be used by all 4 CS specialization tracks") AREAS. A student isn't required to pick a
// specialization; the General Track stays the default (packages/programs registry).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, Requirement, ProgramMeta } from "../src/audit.ts";
import { AREAS, CONCENTRATION_REQUIREMENT, LOWER_LEVEL, STAT4XX_GENERIC } from "./cmsc-major-2026-27.ts";

// Specializations don't take the General Track's "5 Distributive Area courses". UMD's official
// audit (the owner's, 2026-10-07) has, for every specialization, one line: "Students must fulfill
// their computer science upper level course requirements from at least 3 areas. Students may
// fulfill an area requirement under the Upper Level Elective Courses requirements." -- three
// area sub-groups, one course each. Word for word the department page's line
// (program-sources/cmsc-major.md:52). Encoded as an overlay (a course keeps counting toward the
// specialization's own required/choose courses, e.g. Cybersecurity's CMSC414 is both a specific
// requirement and an Area 1 course) whose `within` is that specialization's own upper-level CMSC
// requirements, so a course the CS major doesn't use can't be the third area. A cross-listed
// course counts under each code (MATH456 is CMSC456 in Area 4, AMSC460 is CMSC460 in Area 5).
const areasCheck = (within: string[]): Requirement => ({
  kind: "distribution",
  id: "areas-check",
  name: "Upper-level courses from three areas",
  count: 3,
  minAreas: 3,
  maxPerArea: 1,
  areas: AREAS,
  overlay: true,
  within,
  minGrade: "C-",
});

// Data Science, Machine Learning and Quantum Information all replace the General Track's generic
// "MATH/AMSC/STAT xxx" elective with a specific Linear Algebra course (department page footnote,
// Required Lower Level Coursework: "Data Science, Machine Learning, and Quantum Information
// students must take a MATH Linear Algebra course (e.g. MATH240, MATH341 [must complete MATH340
// first], or MATH461)"). MATH341's own MATH340 prerequisite isn't checked (review notes).
const LINEAR_ALGEBRA: Requirement = {
  kind: "course",
  id: "linearAlgebra",
  name: "Linear Algebra (MATH240, MATH341, or MATH461)",
  options: ["MATH240", "MATH341", "MATH461"],
  minGrade: "C-",
};

const cmscCourse = (id: string, name: string): Requirement => ({ kind: "course", id: id.toLowerCase(), name, options: [id], minGrade: "C-" });

export const cmscCybersecurity: Program = {
  id: "cmsc-major-cybersecurity",
  name: "Computer Science Major (Cybersecurity Specialization)",
  catalogYear: "2026-27",
  source: "Department of Computer Science, https://undergrad.cs.umd.edu/cybersecurity-degree-requirements (fetched 2026-09-26)",
  verified: false,
  reviewNotes: [
    "Same lower-level, additional-required (generic STAT4xx and MATH/AMSC/STAT xxx), Distributive Areas and Upper Level Concentration requirements as the General Track (cmsc-major-2026-27.ts) -- the department page: 'the same foundational courses ... the difference in the specialization is the upper level computer science courses.'",
    "Department-vs-catalog difference (owner ruling: follow the department page, per cmsc-major-2026-27.ts's own note): the department's Cybersecurity page's 'choose four' list includes CMSC431 (Privacy Engineering); the academic catalog's Cybersecurity table omits it. CMSC431 is included below.",
    "'Upper Level Elective Course: 3 credits from CMSC 300- or 400-level coursework (not eligible, CMSC330 and CMSC351)' is encoded as a 3-credit CMSC 300-499 filter excluding CMSC330/351, same shape as the General Track's 6-credit electives (ELECTIVES_GENERIC) but for 3 credits and its own id.",
    "The 'areas-check' overlay (5 distributive-area courses across >=3 areas) is a structural safety net for the owner's 'regardless of track' ruling; see this file's module comment. It isn't itself printed on the Cybersecurity page as a separate line -- it's the General Track's own Distributive Areas rule, which that page says applies to every specialization.",
  ],
  requirements: [
    ...LOWER_LEVEL,
    STAT4XX_GENERIC,
    { kind: "choose", id: "mathxxx", name: "MATH/AMSC/STAT course (prerequisite MATH141 or higher)", count: 1, from: { departments: ["MATH", "AMSC", "STAT"], minNumber: 240, maxNumber: 499, exclude: ["AMSC460", "AMSC466", "MATH456", "MATH475"] }, minGrade: "C-" },
    cmscCourse("CMSC414", "Computer and Network Security"),
    cmscCourse("CMSC456", "Cryptology"),
    {
      kind: "choose",
      id: "cyber-choose4",
      name: "Choose four: CMSC411, 412, 417, 430, 431, 433, or 451",
      count: 4,
      from: { courses: ["CMSC411", "CMSC412", "CMSC417", "CMSC430", "CMSC431", "CMSC433", "CMSC451"] },
      minGrade: "C-",
    },
    { kind: "choose", id: "cyber-elective", name: "Upper Level Elective Course (3 credits)", credits: 3, from: { departments: ["CMSC"], minNumber: 300, maxNumber: 499, exclude: ["CMSC330", "CMSC351"] }, minGrade: "C-" },
    areasCheck(["cmsc414", "cmsc456", "cyber-choose4", "cyber-elective"]),
    CONCENTRATION_REQUIREMENT,
  ],
};

export const cmscDataScience: Program = {
  id: "cmsc-major-data-science",
  name: "Computer Science Major (Data Science Specialization)",
  catalogYear: "2026-27",
  source: "Department of Computer Science, https://undergrad.cs.umd.edu/data-science-degree-requirements (fetched 2026-09-26)",
  verified: false,
  reviewNotes: [
    "Same lower-level, Distributive Areas and Upper Level Concentration requirements as the General Track. The generic STAT4xx and MATH/AMSC/STAT xxx additional-required slots are replaced here by specific courses (department page 'Required': STAT400, and a Linear Algebra course) -- see LINEAR_ALGEBRA above.",
    "Department-vs-catalog difference (owner ruling: follow the department page): the department's Data Science page's 'choose two' list includes CMSC431 (Privacy Engineering) and CMSC471 (Introduction to Data Visualization); the academic catalog's table omits both. Both are included below (ds-choose-systems).",
    "The department page has no separate 'Upper Level Elective Course(s)' line for Data Science (unlike Cybersecurity, Machine Learning and Quantum Information) -- its required + choose-one + choose-one + choose-two total 7 CMSC courses on their own, matching the General Track's 5-area + 2-elective total by a different split. Transcribed literally; no extra elective requirement added.",
    "The 'areas-check' overlay (5 distributive-area courses across >=3 areas) is the same structural safety net described in cmsc-specializations-2026-27.ts's module comment.",
  ],
  requirements: [
    ...LOWER_LEVEL,
    LINEAR_ALGEBRA,
    cmscCourse("STAT400", "Applied Probability and Statistics I"),
    cmscCourse("CMSC320", "Introduction to Data Science"),
    cmscCourse("CMSC422", "Introduction to Machine Learning"),
    cmscCourse("CMSC424", "Database Design"),
    {
      kind: "choose",
      id: "ds-choose-ai",
      name: "Choose one: CMSC420, 421, 423, 425, 426, 427, or 470",
      count: 1,
      from: { courses: ["CMSC420", "CMSC421", "CMSC423", "CMSC425", "CMSC426", "CMSC427", "CMSC470"] },
      minGrade: "C-",
    },
    {
      kind: "choose",
      id: "ds-choose-theory",
      name: "Choose one: CMSC451, 454, or 460",
      count: 1,
      from: { courses: ["CMSC451", "CMSC454", "CMSC460"] },
      minGrade: "C-",
    },
    {
      kind: "choose",
      id: "ds-choose-systems",
      name: "Choose two: CMSC411, 412, 414, 417, 430, 431, 433, 434, 435, or 471",
      count: 2,
      from: { courses: ["CMSC411", "CMSC412", "CMSC414", "CMSC417", "CMSC430", "CMSC431", "CMSC433", "CMSC434", "CMSC435", "CMSC471"] },
      minGrade: "C-",
    },
    areasCheck(["cmsc320", "cmsc422", "cmsc424", "ds-choose-ai", "ds-choose-theory", "ds-choose-systems"]),
    CONCENTRATION_REQUIREMENT,
  ],
};

export const cmscMachineLearning: Program = {
  id: "cmsc-major-machine-learning",
  name: "Computer Science Major (Machine Learning Specialization)",
  catalogYear: "2026-27",
  source: "Department of Computer Science, https://undergrad.cs.umd.edu/machine-learning-degree-requirements (fetched 2026-09-26)",
  verified: false,
  reviewNotes: [
    "Same lower-level, generic STAT4xx additional-required, Distributive Areas and Upper Level Concentration requirements as the General Track. The generic MATH/AMSC/STAT xxx elective is replaced by a specific Linear Algebra course (department page 'Required') -- see LINEAR_ALGEBRA above.",
    "'Choose two courses from: CMSC426, CMSC/AMSC460, CMSC/AMSC466, MATH401, CMSC470, CMSC472, CMSC473, CMSC474' includes both course-number spellings for the cross-listed pair (a student's transcript could show either) and MATH401 (a non-CMSC course the department explicitly allows here). Owner ruling: MATH401 used for this major requirement can't also be used for the Upper Level Concentration -- already true by construction (a course counts toward at most one non-overlay requirement per program).",
    "'Upper Level Elective Courses: Six credits from CMSC 3XX or CMSC 4XX excluding CMSC330 and CMSC351' is worded identically to the General Track's electives requirement, so ELECTIVES_GENERIC is reused as-is.",
    "The 'areas-check' overlay (5 distributive-area courses across >=3 areas) is a real, independently-checked requirement here: Machine Learning's own required (CMSC421, CMSC422) and choose-two pool are Area 2/Area 4-heavy and don't by themselves guarantee 3 areas -- students may need electives outside those areas to satisfy it, matching the owner's 'regardless of track' ruling.",
  ],
  requirements: [
    ...LOWER_LEVEL,
    STAT4XX_GENERIC,
    LINEAR_ALGEBRA,
    cmscCourse("CMSC320", "Introduction to Data Science"),
    cmscCourse("CMSC421", "Introduction to Artificial Intelligence"),
    cmscCourse("CMSC422", "Introduction to Machine Learning"),
    {
      kind: "choose",
      id: "ml-choose2",
      name: "Choose two: CMSC426, one of CMSC/AMSC460 or CMSC/AMSC466, MATH401, CMSC470, CMSC472, CMSC473, CMSC474, or CMSC498F",
      count: 2,
      from: { courses: ["CMSC426", "CMSC460", "AMSC460", "CMSC466", "AMSC466", "MATH401", "CMSC470", "CMSC472", "CMSC473", "CMSC474", "CMSC498F"] },
      // The official audit lists "460 OR AMSC460 OR CMSC466 OR AMSC466" as one option.
      alternatives: [["CMSC460", "AMSC460", "CMSC466", "AMSC466"]],
      minGrade: "C-",
    },
    {
      kind: "choose",
      id: "electives",
      name: "Upper-level CMSC electives (6 credits)",
      credits: 6,
      from: { departments: ["CMSC"], minNumber: 300, maxNumber: 499, exclude: ["CMSC320", "CMSC330", "CMSC351", "CMSC421", "CMSC422"] },
      minGrade: "C-",
    },
    areasCheck(["cmsc320", "cmsc421", "cmsc422", "ml-choose2", "electives"]),
    CONCENTRATION_REQUIREMENT,
  ],
};

// Union of every Distributive Area's courses, deduped (CMSC471 is listed under both Area 2 and
// Area 3) -- Quantum Information's "Choose four" pool is exactly the General Track's five Area
// lists (department page, lines 518-552 of program-sources/cmsc-major.md), so it's derived from
// AREAS rather than retyped.
const QI_CHOOSE4_POOL = [...new Set(AREAS.flatMap((a) => a.courses))];

export const cmscQuantumInformation: Program = {
  id: "cmsc-major-quantum-information",
  name: "Computer Science Major (Quantum Information Specialization)",
  catalogYear: "2026-27",
  source: "Department of Computer Science, https://undergrad.cs.umd.edu/quantum-information-degree-requirements (fetched 2026-09-26)",
  verified: false,
  reviewNotes: [
    "Same lower-level, generic STAT4xx additional-required, Distributive Areas and Upper Level Concentration requirements as the General Track. The generic MATH/AMSC/STAT xxx elective is replaced by a specific Linear Algebra course (department page 'Required') -- see LINEAR_ALGEBRA above.",
    "PHYS467 (Introduction to Quantum Technology) is a real department requirement outside CMSC; it's a plain 'course' requirement here, separate from the Upper Level Concentration (a different, unrelated outside-CMSC requirement).",
    "Not encoded: the page's 'Choose four courses from: ... (Note: two of those four courses must fall in two separate areas outside of Area 4)' constraint. The audit engine's distribution kind can't express 'at least 2 of these 4 span >=2 areas from a restricted subset while the others are free' alongside a flat choose-4; the choose-4 here is unconstrained by area. Manual check.",
    "The choose-four pool (QI_CHOOSE4_POOL) is the union of all five Distributive Areas' courses (the department page's own four per-area lists here are the same five Areas 1-5 as the General Track, verbatim) -- CMSC457 also appears in that pool (it's independently listed in Area 4), but since it's already required above, a single completed CMSC457 can't also fill a choose-four slot (a course counts toward at most one non-overlay requirement per program).",
    "The 'areas-check' overlay (5 distributive-area courses across >=3 areas) doesn't enforce the unencoded 'outside Area 4' nuance above, but does still enforce the owner's general 'regardless of track' >=3-areas ruling.",
  ],
  requirements: [
    ...LOWER_LEVEL,
    STAT4XX_GENERIC,
    LINEAR_ALGEBRA,
    cmscCourse("CMSC457", "Introduction to Quantum Computing"),
    cmscCourse("PHYS467", "Introduction to Quantum Technology"),
    { kind: "choose", id: "qi-choose4", name: "Choose four courses across the five Distributive Areas", count: 4, from: { courses: QI_CHOOSE4_POOL }, minGrade: "C-" },
    { kind: "choose", id: "qi-elective", name: "Upper Level Elective Course(s) (3 credits)", credits: 3, from: { departments: ["CMSC"], minNumber: 300, maxNumber: 499, exclude: ["CMSC330", "CMSC351"] }, minGrade: "C-" },
    areasCheck(["cmsc457", "qi-choose4", "qi-elective"]),
    CONCENTRATION_REQUIREMENT,
  ],
};

export const cmscCybersecurityMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "CS (Cybersecurity)", major: "cs", track: "Cybersecurity", sources: { department: "https://undergrad.cs.umd.edu/cybersecurity-degree-requirements" } };

export const cmscDataScienceMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "CS (Data Science)", major: "cs", track: "Data Science", sources: { department: "https://undergrad.cs.umd.edu/data-science-degree-requirements" } };

export const cmscMachineLearningMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "CS (Machine Learning)", major: "cs", track: "Machine Learning", sources: { department: "https://undergrad.cs.umd.edu/machine-learning-degree-requirements" } };

export const cmscQuantumInformationMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "CS (Quantum Information)", major: "cs", track: "Quantum Information", sources: { department: "https://undergrad.cs.umd.edu/quantum-information-degree-requirements" } };
