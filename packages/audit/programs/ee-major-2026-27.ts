// Electrical Engineering Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/electrical-and-computer/electrical-engineering-major/;
// Department of Electrical and Computer Engineering, B.S. in Electrical Engineering page,
// https://ece.umd.edu/undergraduate/degrees/bs-electrical-engineering;
// Technical Electives page, https://ece.umd.edu/undergraduate/degrees/bs-electrical-engineering/technical-electives;
// Degree Requirements page, https://ece.umd.edu/undergraduate/degrees/bs-electrical-engineering/requirements;
// Specializations page, https://ece.umd.edu/undergraduate/degrees/bs-electrical-engineering/specializations;
// and the A. James Clark School of Engineering's official Fall 2026 graduation plan,
// https://eng.umd.edu/sites/clark.umd.edu/files/resource_documents/electrical_fall_2026_gradplan.pdf (all fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Owner ruling: CMSC141 counts for CMSC131 and CMSC142 for CMSC132 wherever those appear.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

// ENEE Technical Electives, effective Fall 2024 (this catalog's cohort). Department's Technical
// Electives page, "Requirements for students who matriculated Fall 2024 and beyond".
const CATEGORY_A = [
  "ENEE411", "ENEE413", "ENEE420", "ENEE425", "ENEE426", "ENEE429Z", "ENEE435", "ENEE436",
  "ENEE439G", "ENEE440", "ENEE446", "ENEE452", "ENEE457", "ENEE459A", "ENEE459C", "ENEE459P",
  "ENEE460", "ENEE463", "ENEE464", "ENEE474", "ENEE475", "ENEE476", "ENEE484", "ENEE488",
  "ENEE489R", "ENEE489W", "ENEE491", "ENEE492", "ENEE496", "ENEE499",
];
const CATEGORY_B = [
  "ENEE415", "ENEE416", "ENEE427", "ENEE445", "ENEE459B", "ENEE459L", "ENEE461", "ENEE473",
  "ENEE486", "ENEE489J", "ENEE493", "ENEE499L",
];
const CATEGORY_C = [
  "ENEE408A", "ENEE408C", "ENEE408D", "ENEE408I", "ENEE408J", "ENEE408M", "ENEE408N",
  "ENEE408V", "ENEE408W",
];
const GENERAL_TECH_ELECTIVE_DEPARTMENTS = [
  "AMSC", "BCHM", "BIOE", "BSCI", "CHEM", "CMSC", "ENAE", "ENCE", "ENCH", "ENEE", "ENES",
  "ENFP", "ENMA", "ENME", "ENNU", "ENRE", "MATH", "PHYS", "STAT",
];

export const eeMajor: Program = {
  id: "ee-major",
  name: "Electrical Engineering Major",
  catalogYear: "2026-27",
  minGrade: "C-",
  source:
    "UMD Academic Catalog 2026–27, Electrical Engineering Major; " +
    "Department of Electrical and Computer Engineering, B.S. in Electrical Engineering page, " +
    "https://ece.umd.edu/undergraduate/degrees/bs-electrical-engineering (fetched 2026-09-28); " +
    "Technical Electives page, https://ece.umd.edu/undergraduate/degrees/bs-electrical-engineering/technical-electives (fetched 2026-09-28); " +
    "official Fall 2026 graduation plan, " +
    "https://eng.umd.edu/sites/clark.umd.edu/files/resource_documents/electrical_fall_2026_gradplan.pdf (fetched 2026-09-28)",
  verified: false,
  reviewNotes: [
    "Program-wide minGrade \"C-\": the catalog states 'Students must earn a grade of \"C-\" or higher in all engineering, mathematics, and science courses, as well as the prerequisites for these courses' -- every course this program requires is ENGR, math or science, so it's set at the Program level rather than per-requirement (same treatment as compe-major).",
    "Owner ruling on CMSC131/CMSC141 and CMSC132/CMSC142 does not apply here: neither CMSC131 nor CMSC132 appears anywhere in EE's own required-course list. CMSC131 is only named in a footnote as one way to exempt the ENEE140-before-ENEE150 prerequisite ('AP credit for CMSC131... or the ENEE150 Placement Exam'); that's a prerequisite-exemption note, not a course-substitution requirement, so it isn't encoded (ENEE140 and ENEE150 both remain hard-required courses).",
    "ENEE101/ENES100 same-semester restriction ('ENEE101 and ENES100 cannot be taken in the same semester') and the ENEE140-before-ENEE150 prerequisite -- not encoded; both are term-scheduling/prerequisite constraints, not eligibility rules the audit models. Both course pairs remain as separate required `course` entries.",
    "Specialization Requirement -- treated as NOT a hard requirement, and NOT encoded as tracks. The specializations (Communications and Signal Processing, Computer Engineering, Controls, Electrophysics, Microelectronics, Power Systems) don't add or change any required course: a student still completes the same core curriculum and the same 22-credit Category A/B/C technical-elective pool regardless of which specialization (if any) they pick, so this isn't a case of 'different required courses per specialization' the way CPSE's tracks are. Whether 2 courses in one specialization area are *required* genuinely differs by source: the department's Technical Electives page explicitly splits by matriculation cohort -- 'Requirements for students who matriculated Fall 2021 - Summer 2024' must satisfy a 'Specialization Requirement... at least two courses from a single area of concentration', while 'Requirements for students who matriculated Fall 2024 and beyond' (this catalog's cohort) states specialization coursework is 'not required... students are encouraged to take several upper-level elective courses in the same sub-discipline.' The official Fall 2026 graduation plan's own boilerplate overview panel, however, still prints 'A minimum of 22 credits of 300/400-level ENEE electives must be completed and at least two courses must be selected from a single area of specialization,' which reads as carried-over language from the pre-Fall-2024 policy the department's dedicated, cohort-specific Technical Electives page has since superseded. Following the department's more specific and explicitly dated page (in the same spirit as the department-wins ruling), specialization is treated as optional/encouraged, not required, for this 2026-27 catalog.",
    "Not encoded (approved elective with no list): catalog footnote 5's 'up to 7 credits can come from approved non-ENEE courses that are appropriate for the area of interest chosen by the student' and the Technical Electives page's parallel 'students can take up to nine credits of upper-level electrical engineering electives from approved non-ENEE courses related to that sub-discipline' -- neither source gives the actual approved list, so Categories A/B/C and the 14-credit Additional pool below are encoded from the department's explicit ENEE course lists only.",
    "Not encoded (approved elective with no list): the General Technical Elective's alternate path, 'any upper-level course whose prefix is not given in the list above,' subject to a student application and 'signed approval of the Associate Chair.' The General Technical Elective requirement below uses only the catalog's positive prefix list.",
    "Not encoded (engine gap, matches compe-major precedent for repeatable-course caps): 'The maximum number of ENEE499/ENEE499L credits that may be applied towards EE technical elective requirements is five, except for students in the departmental honors program, who may take up to six credits' -- the audit's course filters have no per-course-group credit cap within a `choose` requirement.",
    "Posted substitution (owner, 2026-10-07: posted alternatives are encoded): the Technical Electives page says 'a second Capstone Design course may be used as a substitute for the required Advanced Theory and Applications course', so Category A also accepts Category C courses (a course counts once, so the first capstone still fills Category C). The seat-and-permission wait for a second capstone is about enrolling, not about counting. Not encoded: 'students may enroll in a second advanced laboratory [Category B]' says nothing about replacing another requirement; a second lab already counts toward the Additional Technical Electives.",
    "Not encoded (owner-review.md, engine gap -- cross-program admission restriction): the department B.S. page states 'students in Electrical Engineering are not allowed to earn a second major or degree in Computer Engineering.' The audit has no concept of one program disqualifying another.",
    "Not encoded (engine gap, matches compe-major/ChBE precedent): total credits -- the catalog's own sample-program table sums to 'Total Credits 122'; the department B.S. page instead gives a generic curriculum-wide range, 'a minimum of 120-123 credits' (not a specific total). The audit has no total-credit-minimum concept regardless. Also not encoded: the 2.00 cumulative UMD GPA and the usual Clark School residency boilerplate repeated on the graduation plan (final 30 credits at UMD, 15 of the final 30 at the 300-400 level, 12 upper-level major credits at UMD).",
    "ENEE Technical Electives (22 credits, Fall 2024+ curriculum) are encoded as three category-minimum `choose` requirements (Category A >= 3 credits, Category B >= 2 credits, Category C >= 3 credits) plus a fourth `choose` requirement for the remaining 14 credits drawn from the union of all three categories -- matching the source's own phrasing, 'Completing the minimum required credits from Category A-C comes to 8 credits. The remaining 14 credits may be taken from any one category or combination of categories.' Kept as four separate requirements (rather than one pooled 22-credit requirement) so a student short in one category's own minimum is correctly flagged there, not masked by overshoot in another category.",
    "General Technical Elective (3 credits): both the catalog and the department's Technical Electives page agree this is any upper-level (300+) course from the listed prefixes (AMSC, BCHM, BIOE, BSCI, CHEM, CMSC, ENAE, ENCE, ENCH, ENEE, ENES, ENFP, ENMA, ENME, ENNU, ENRE, MATH, PHYS, STAT) -- no real disagreement found. 'Upper-level ENEE elective courses may be used to satisfy General Technical Elective requirements. However, any upper-level ENEE course used for this purpose may NOT then be used to satisfy the ENEE Technical Elective Requirement' is already the default single-use-per-enrollment behavior of the audit engine, so no extra exclusion is encoded.",
    "ENGL101 (Academic Writing) and ENGL39x (Professional Writing) are gen-ed slots on the official graduation plan's General Education Requirements panel (not its Major Requirements panel) -- left out here, same treatment as compe-major (covered by gen-ed-2026-27.ts instead). ENEE200 (Engineering Ethics) is kept as a required course even though it also satisfies a Humanities/Big-Question gen-ed slot, because the graduation plan prints it in its Major Requirements column (same reasoning as compe-major).",
    "No real department-vs-catalog disagreement found otherwise: the core curriculum course list, credit values, and the Category A/B/C technical-elective course lists all agree across the catalog and the department's own Technical Electives page.",
  ],
  requirements: [
    { kind: "course", id: "chem135", name: "General Chemistry for Engineers", options: ["CHEM135"] },
    { kind: "course", id: "enee101", name: "Introduction to Electrical and Computer Engineering", options: ["ENEE101"] },
    { kind: "course", id: "enee140", name: "Programming Concepts for Engineers", options: ["ENEE140"] },
    { kind: "course", id: "enes100", name: "Introduction to Engineering Design", options: ["ENES100"] },
    { kind: "course", id: "math140", name: "Calculus I", options: ["MATH140"] },
    { kind: "course", id: "enee150", name: "Intermediate Programming Concepts for Engineers", options: ["ENEE150"] },
    { kind: "course", id: "math141", name: "Calculus II", options: ["MATH141"] },
    { kind: "course", id: "phys161", name: "General Physics: Mechanics and Particle Dynamics", options: ["PHYS161"] },
    { kind: "course", id: "enee290", name: "Introduction to Differential Equations and Linear Algebra for Engineers", options: ["ENEE290"] },
    { kind: "course", id: "enee244", name: "Digital Logic Design", options: ["ENEE244"] },
    { kind: "course", id: "math241", name: "Calculus III", options: ["MATH241"] },
    { kind: "course", id: "phys260", name: "General Physics: Electricity, Magnetism and Thermodynamics", options: ["PHYS260"] },
    { kind: "course", id: "phys261", name: "General Physics: Electricity, Magnetism and Thermodynamics (Laboratory)", options: ["PHYS261"] },
    { kind: "course", id: "enee205", name: "Electric Circuits", options: ["ENEE205"] },
    { kind: "course", id: "enee222", name: "Elements of Discrete Signal Analysis", options: ["ENEE222"] },
    { kind: "course", id: "enee245", name: "Digital Circuits and Systems Laboratory", options: ["ENEE245"] },
    { kind: "course", id: "phys270", name: "General Physics: Vibrations, Waves, Heat, Electricity and Magnetism", options: ["PHYS270"] },
    { kind: "course", id: "phys271", name: "General Physics: Vibrations, Waves, Heat, Electricity and Magnetism (Laboratory)", options: ["PHYS271"] },
    { kind: "course", id: "enee304", name: "Micro and Nanoelectronics", options: ["ENEE304"] },
    { kind: "course", id: "enee323", name: "Signals and Systems: Theory and Applications", options: ["ENEE323"] },
    { kind: "course", id: "enee350", name: "Computer Organization", options: ["ENEE350"] },
    { kind: "course", id: "enee200", name: "Engineering Ethics", options: ["ENEE200"] },
    { kind: "course", id: "enee305", name: "Micro and Nanoelectronics Laboratory", options: ["ENEE305"] },
    { kind: "course", id: "enee324", name: "Engineering Probability", options: ["ENEE324"] },
    { kind: "course", id: "enee382", name: "Electromagnetics", options: ["ENEE382"] },
    {
      kind: "choose",
      id: "tech-elective-a",
      name: "ENEE Technical Elective Category A: Advanced Theory and Applications (3 credits, or a second Capstone Design course)",
      credits: 3,
      from: { courses: [...CATEGORY_A, ...CATEGORY_C] },
    },
    {
      kind: "choose",
      id: "tech-elective-b",
      name: "ENEE Technical Elective Category B: Advanced Laboratory (2 credits)",
      credits: 2,
      from: { courses: CATEGORY_B },
    },
    {
      kind: "choose",
      id: "tech-elective-c",
      name: "ENEE Technical Elective Category C: Capstone Design (3 credits)",
      credits: 3,
      from: { courses: CATEGORY_C },
    },
    {
      kind: "choose",
      id: "tech-elective-additional",
      name: "Additional ENEE Technical Elective (14 credits, from Categories A-C)",
      credits: 14,
      from: { courses: [...new Set([...CATEGORY_A, ...CATEGORY_B, ...CATEGORY_C])] },
    },
    {
      kind: "choose",
      id: "general-technical-elective",
      name: "General Technical Elective (3 credits, upper-level math/engineering/basic-science)",
      credits: 3,
      from: { departments: GENERAL_TECH_ELECTIVE_DEPARTMENTS, minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const eeMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ENGR",
  short: "Electrical Eng.",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/electrical-and-computer/electrical-engineering-major/",
    department: "https://ece.umd.edu/undergraduate/degrees/bs-electrical-engineering",
  },
};
