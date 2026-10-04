// Computer Science Minor, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/computer-science/computer-science-minor/
// (fetched 2026-09-27); Department of Computer Science,
// https://undergrad.cs.umd.edu/computer-science-minor (fetched 2026-09-27). Owner ruling
// (docs/project/rulings.md): where the department page and the catalog disagree, follow the
// department page; each such difference is recorded below citing both. No official published
// sample plan (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const cmscMinor: Program = {
  id: "cmsc-minor",
  name: "Computer Science Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Computer Science Minor; Department of Computer Science, " +
    "https://undergrad.cs.umd.edu/computer-science-minor (fetched 2026-09-27)",
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Department-vs-catalog difference (owner ruling: follow the department page): the catalog lists 'Required Courses (12 credits): CMSC132, CMSC216, CMSC250' as the minor's own requirements, with CMSC131/MATH140 as mere prerequisites to enter. The department page (effective Spring 2025 admission) instead treats CMSC131/133/141 and CMSC132/142 and MATH140 as a gateway students must clear (with a B- minimum each and a 3.0 UMD GPA) BEFORE applying, and lists the minor's own 'Required Coursework' as MATH141, CMSC216, CMSC250, CMSC330, CMSC351, plus two 400-level electives -- adding MATH141 (absent from the catalog's list) and excluding CMSC132 as a minor requirement (it's a gateway course instead). Encoded per the department: the three gateway courses are kept as their own Requirements with minGrade 'B-' (so a plan can show them explicitly), MATH141 is added, and CMSC132 is NOT counted separately from the CMSC132/CMSC142 gateway pair.",
    "The 3.0 cumulative UMD GPA gateway requirement has no GPA-average concept in the engine; not encoded (manual check), same treatment as the CS major's LEP benchmarks.",
    "Electives: the department page just says 'two 400-level CMSC electives from the approved list' without naming it; the catalog's list (CMSC411 through CMSC474) is used since it isn't contradicted. 'Cannot use both CMSC460 and CMSC466' (department) is encoded as an alternatives pair.",
    "'Up to 3 credits of CMSC498 may substitute for one 400-level core course with prior approval', and 'students exempting all three core courses must take one additional 400-level class', are approval-gated exceptions, not encoded.",
    "'Maximum 6 credits overlap with primary major' (department) -> maxSharedWith: [{ credits: 6 }].",
    "'Not eligible: Computer Engineering majors, and the computing track of Immersive Media Design' (department) is enforced via notOpenTo (Computer Engineering majors, every track, and the IMDM computing track). 'Must enroll in the minor for at least two semesters before graduation' is a timing rule, not encoded.",
  ],
  requirements: [
    { kind: "course", id: "gateway1", name: "Gateway: CMSC131, CMSC133 or CMSC141", options: ["CMSC131", "CMSC133", "CMSC141"], minGrade: "B-" },
    { kind: "course", id: "gateway2", name: "Gateway: CMSC132 or CMSC142", options: ["CMSC132", "CMSC142"], minGrade: "B-" },
    { kind: "course", id: "gateway3", name: "Gateway: MATH140", options: ["MATH140"], minGrade: "B-" },
    { kind: "course", id: "math141", name: "Calculus II", options: ["MATH141"], minGrade: "C-" },
    { kind: "course", id: "cmsc216", name: "Introduction to Computer Systems", options: ["CMSC216"], minGrade: "C-" },
    { kind: "course", id: "cmsc250", name: "Discrete Structures", options: ["CMSC250"], minGrade: "C-" },
    { kind: "course", id: "cmsc330", name: "Organization of Programming Languages", options: ["CMSC330"], minGrade: "C-" },
    { kind: "course", id: "cmsc351", name: "Algorithms", options: ["CMSC351"], minGrade: "C-" },
    {
      kind: "choose",
      id: "electives",
      name: "Two 400-level CMSC electives",
      count: 2,
      from: {
        courses: [
          "CMSC411", "CMSC412", "CMSC414", "CMSC416", "CMSC417",
          "CMSC420", "CMSC421", "CMSC422", "CMSC423", "CMSC424", "CMSC426", "CMSC427",
          "CMSC430", "CMSC433", "CMSC434", "CMSC435", "CMSC436",
          "CMSC451", "CMSC452", "CMSC454", "CMSC456", "CMSC457", "CMSC460", "CMSC466",
          "CMSC470", "CMSC471", "CMSC472", "CMSC474",
        ],
      },
      alternatives: [["CMSC460", "CMSC466"]],
      minGrade: "C-",
    },
  ],
};

export const cmscMinorMeta: ProgramMeta = { kind: "minor", notOpenTo: { programs: ["compe", "imdm-major-computing"], reason: "Not open to Computer Engineering majors or the Immersive Media Design computing track." }, college: "CMNS", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/computer-science/computer-science-minor/", department: "https://undergrad.cs.umd.edu/computer-science-minor" } };
