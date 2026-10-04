// Mathematics Minor, Actuarial Mathematics Minor, and Statistics Minor, 2026–27 UMD Academic
// Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/mathematics/mathematics-minor/,
// .../mathematics/actuarial-mathematics-minor/, and .../mathematics/statistics-minor/ (fetched
// 2026-09-27); Department of Mathematics, https://www-math.umd.edu/undergraduate/math-minors.html
// (fetched 2026-09-27; covers all three). Owner ruling (docs/project/rulings.md): where the
// department page and the catalog disagree, follow the department page; each such difference is
// recorded below citing both. None of the three minors has an official published sample plan
// (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const SOURCE_MATH_MINORS =
  "UMD Academic Catalog 2026–27, Mathematics Minor / Actuarial Mathematics Minor; " +
  "Department of Mathematics, https://www-math.umd.edu/undergraduate/math-minors.html (fetched 2026-09-27)";

export const mathMinor: Program = {
  id: "math-minor",
  name: "Mathematics Minor",
  catalogYear: "2026-27",
  source: SOURCE_MATH_MINORS,
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department-vs-catalog difference (owner ruling in rulings.md: where the department page lists fewer options than the catalog, accept both lists): the catalog offers 'MATH241 or MATH340' for calculus and 'MATH240, MATH461, or MATH341' for linear algebra (the honors substitutes); the department page lists only MATH241 and MATH240/MATH461. Both lists are accepted, so MATH340 and MATH341 count.",
    "MATH310 'unless exempted' (proficiency exam): the exemption itself isn't modeled; MATH310 is required outright. The catalog's alternate '19 credits if exempted' total isn't a Requirement the audit checks.",
    "Theoretical/Algebra/Analysis/Probability course lists are the catalog's (the department page only describes them generically as '400-level theoretical/algebra/analysis/probability courses'); no conflict, so the catalog's specific lists are used. Probability's 'STAT400, STAT410, or other approved courses' is encoded as just those two named courses; 'other approved' isn't a fixed list.",
    "Not open to Mathematics majors (both sources): an eligibility gate, not a sharing limit; enforced via notOpenTo. Neither source states a sharing cap with another program, so none is set.",
    "'At least a C- in each minor course and an overall minor GPA of 2.0': the C- floor is the Program's minGrade; Program GPA 2.0 encoded as minGpa.",
    "'Maximum one 400-level course may transfer from another institution': a residency rule, not encoded (no term/institution data on StudentCourse).",
  ],
  requirements: [
    { kind: "course", id: "calc3", name: "Calculus III", options: ["MATH241", "MATH340"] },
    { kind: "course", id: "linalg", name: "Linear Algebra", options: ["MATH240", "MATH461", "MATH341"] },
    { kind: "course", id: "proof", name: "Introduction to Mathematical Proof", options: ["MATH310"] },
    { kind: "choose", id: "theoretical", name: "Theoretical course", count: 1, from: { courses: ["MATH403", "MATH405", "MATH410"] } },
    { kind: "choose", id: "algebra", name: "Algebra course", count: 1, from: { courses: ["MATH401", "MATH402", "MATH403", "MATH405", "MATH406", "MATH423"] } },
    { kind: "choose", id: "analysis", name: "Analysis course", count: 1, from: { courses: ["MATH410", "MATH416", "MATH462", "MATH463", "MATH464"] } },
    { kind: "choose", id: "probability", name: "Probability course", count: 1, from: { courses: ["STAT400", "STAT410"] } },
  ],
};

export const mathMinorActuarial: Program = {
  id: "math-minor-actuarial",
  name: "Actuarial Mathematics Minor",
  catalogYear: "2026-27",
  source: SOURCE_MATH_MINORS,
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Department-vs-catalog difference (owner ruling in rulings.md: accept both lists): the catalog offers 'MATH241 or MATH340' and 'MATH461, MATH240, or MATH341'; the department page states 'Math 241 ... Math 461 (or Math 240 as substitute)' with no honors alternative. Both lists are accepted, so MATH340 and MATH341 count.",
    "'Not open to Mathematics majors': Enforced via notOpenTo.",
    "'No more than 2 courses may count toward both major and minor' (catalog; the department page doesn't restate it but doesn't contradict it either) -> maxSharedWith: [{ courses: 2 }].",
    "'No more than one 400-level course, and no more than 2 courses total, may be taken elsewhere': a transfer/residency rule, not encoded.",
    "STAT470 and the probability pair: STAT470 (Actuarial Mathematics) is a separate required course from the probability-and-statistics pair (footnote: 'recommended Math 424 and/or Stat 430' isn't required, so not encoded).",
    "'At least C- (1.7) in each minor course and an overall minor GPA of 2.0': the C- floor is the Program's minGrade; Program GPA 2.0 encoded as minGpa.",
  ],
  requirements: [
    { kind: "course", id: "calc3", name: "Calculus III", options: ["MATH241", "MATH340"] },
    {
      kind: "sets",
      id: "probStat",
      name: "Probability and statistics pair",
      options: [
        ["STAT400", "STAT401"],
        ["STAT410", "STAT420"],
        ["STAT410", "STAT401"],
      ],
    },
    { kind: "course", id: "linalg", name: "Linear Algebra", options: ["MATH461", "MATH240", "MATH341"] },
    { kind: "course", id: "actuarial", name: "Actuarial Mathematics", options: ["STAT470"] },
  ],
};

export const statisticsMinor: Program = {
  id: "stat-minor",
  name: "Statistics Minor",
  catalogYear: "2026-27",
  source: SOURCE_MATH_MINORS,
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Department-vs-catalog difference (owner ruling in rulings.md: accept both lists): the catalog offers 'MATH241 or MATH340'; the department page states only 'Math 241'. Both are accepted, so MATH340 counts.",
    "Both sources agree on the rest: one probability/statistics pair (STAT400+401, STAT410+420, or STAT410+401), STAT430, and one more elective (a third pair course if not already taken, or STAT422/426/440/470/MATH424). The elective's 'third course from the pairs' option is encoded by including all four pair course codes (STAT400/401/410/420) in the elective's own option list -- the audit's default one-requirement-per-course behavior means a pair-course already used for probStatPair can't also satisfy the elective, but an extra one beyond the pair (e.g. a student who took all of STAT400/401/410) correctly can.",
    "'Not open to Mathematics majors': Enforced via notOpenTo.",
    "'A student may use a maximum of 2 courses to satisfy the requirements of both a major and the minor' -> maxSharedWith: [{ courses: 2 }].",
    "'At least a C- (1.7) in each minor course and an overall minor GPA of 2.0': the C- floor is the Program's minGrade; Program GPA 2.0 encoded as minGpa.",
    "'No more than one 400-level course, and no more than 2 courses total, may be taken elsewhere': a transfer/residency rule, not encoded.",
  ],
  requirements: [
    { kind: "course", id: "calc3", name: "Calculus III", options: ["MATH241", "MATH340"] },
    {
      kind: "sets",
      id: "probStat",
      name: "Probability and statistics pair",
      options: [
        ["STAT400", "STAT401"],
        ["STAT410", "STAT420"],
        ["STAT410", "STAT401"],
      ],
    },
    { kind: "course", id: "computing", name: "Introduction to Statistical Computing with SAS", options: ["STAT430"] },
    {
      kind: "choose",
      id: "elective",
      name: "Elective",
      count: 1,
      from: { courses: ["STAT400", "STAT401", "STAT410", "STAT420", "STAT422", "STAT426", "STAT440", "STAT470", "MATH424"] },
    },
  ],
};

export const mathMinorActuarialMeta: ProgramMeta = { kind: "minor", notOpenTo: { programs: ["math"], reason: "Not open to Mathematics majors." }, college: "CMNS", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/mathematics/actuarial-mathematics-minor/", department: "https://www-math.umd.edu/undergraduate/math-minors.html" } };

export const mathMinorMeta: ProgramMeta = { kind: "minor", notOpenTo: { programs: ["math"], reason: "Not open to Mathematics majors." }, college: "CMNS", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/mathematics/mathematics-minor/", department: "https://www-math.umd.edu/undergraduate/math-minors.html" } };

export const statisticsMinorMeta: ProgramMeta = { kind: "minor", notOpenTo: { programs: ["math"], reason: "Not open to Mathematics majors." }, college: "CMNS", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/mathematics/statistics-minor/", department: "https://www-math.umd.edu/undergraduate/math-minors.html" } };
