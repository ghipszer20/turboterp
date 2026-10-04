// Sociology Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/sociology/sociology-major/;
// college checklist (Feller Center, "SOCY Major Checklist", fetched via Internet Archive, Feb 2026).
// Owner ruling (docs/project/rulings.md): where the department page (the college checklist counts as one)
// and the catalog disagree, follow the department page; the difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const NAMED_REQUIRED_COURSES = [
  "SOCY100",
  "SOCY201",
  "SOCY202",
  "SOCY203",
  "SOCY230",
  "SOCY200",
  "SOCY241",
  "SOCY441",
];

export const socyMajor: Program = {
  id: "socy-major",
  name: "Sociology Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Sociology Major; " +
    "Feller Center SOCY Major Checklist, fetched via Internet Archive, Feb 2026 " +
    "(https://web.archive.org/web/20260210113440id_/https://fellercenter.umd.edu/sites/fellercenter.umd.edu/files/Major%20Cards/SOCY%20Major%20Checklist%20050724%20writable.pdf)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department-vs-catalog difference: the Gateway Math options. The catalog text lists " +
      "'MATH107/MATH111/MATH120/MATH140, or STAT100' but the college checklist (department source, " +
      "'SOCY Major Requirements' / Benchmark 1) lists only 'MATH107, 120 [113], 140 [115] or STAT100+' -- " +
      "MATH111 is absent from the checklist, but the checklist (dated 2024) is older than the 2026-27 catalog, so the catalog is followed: MATH111 is accepted (main session, 2026-09-28).",
    "The 'Select two 400 level SOCY Research Courses' requirement (catalog footnote 2 / checklist's " +
      "'400 Level SOCY Research Courses of Choice') references 'a list maintained by the Sociology " +
      "Undergraduate Advising Office' that is not included in either source. Approximated with a " +
      "department + number-range filter (any 400-level SOCY course, excluding the named requirement " +
      "courses) since the true approved list is unavailable. Flagged in docs/project/owner-review.md.",
    "'Select one 300 or 400 level SOCY course' and 'Select one 400 level SOCY course' have no named " +
      "list in either source, so both are encoded as department + number-range `choose` filters " +
      "(SOCY 300-499 and SOCY 400-499 respectively), excluding the named requirement courses.",
    "Not encoded (prerequisite, not a requirement-satisfaction rule): SOCY201 requires MATH107 or " +
      "higher with a C- or better before enrollment. The audit engine does not model prerequisites.",
    "Not encoded (engine gaps): residency " +
      "rules (30 credits at UMD, 15 of the final 30 credits at the 300-400 level, 12 upper-level major " +
      "credits at UMD), and the 120-credit graduation minimum. The audit engine checks per-requirement " +
      "course assignment and per-course minGrade, not GPA, residency, or credit totals.",
  ],
  requirements: [
    {
      kind: "course",
      id: "gateway-math",
      name: "Gateway Math (MATH107, MATH111, MATH120, MATH140, or STAT100)",
      options: ["MATH107", "MATH111", "MATH120", "MATH140", "STAT100"],
    },
    { kind: "course", id: "socy100", name: "Introduction to Sociology", options: ["SOCY100"] },
    { kind: "course", id: "socy201", name: "Introductory Statistics for Sociology", options: ["SOCY201"] },
    { kind: "course", id: "socy202", name: "Introduction to Research Methods in Sociology", options: ["SOCY202"] },
    { kind: "course", id: "socy203", name: "Sociological Theory", options: ["SOCY203"] },
    { kind: "course", id: "socy230", name: "Sociological Social Psychology", options: ["SOCY230"] },
    {
      kind: "choose",
      id: "socy-evolution-or-inequality",
      name: "SOCY200, SOCY241, or SOCY441 (choose one)",
      count: 1,
      from: { courses: ["SOCY200", "SOCY241", "SOCY441"] },
    },
    {
      kind: "choose",
      id: "socy-substantive-300-400",
      name: "Substantive Course Requirement: select one 300 or 400 level SOCY course",
      count: 1,
      from: {
        departments: ["SOCY"],
        minNumber: 300,
        maxNumber: 499,
        exclude: NAMED_REQUIRED_COURSES,
      },
    },
    {
      kind: "choose",
      id: "socy-substantive-400",
      name: "Substantive Course Requirement: select one 400 level SOCY course",
      count: 1,
      from: {
        departments: ["SOCY"],
        minNumber: 400,
        maxNumber: 499,
        exclude: NAMED_REQUIRED_COURSES,
      },
    },
    {
      kind: "choose",
      id: "socy-research-400",
      name: "Select two 400 level SOCY Research Courses (approved list maintained by the Sociology " +
        "Undergraduate Advising Office; not available from source, approximated as any 400-level SOCY course)",
      count: 2,
      from: {
        departments: ["SOCY"],
        minNumber: 400,
        maxNumber: 499,
        exclude: NAMED_REQUIRED_COURSES,
      },
    },
  ],
};

export const socyMajorMeta: ProgramMeta = {
  kind: "major",
  college: "BSOS",
  short: "Sociology",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/sociology/sociology-major/",
    department: "https://web.archive.org/web/20260210113440id_/https://fellercenter.umd.edu/sites/fellercenter.umd.edu/files/Major%20Cards/SOCY%20Major%20Checklist%20050724%20writable.pdf",
  },
};
