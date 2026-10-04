// Economics Major, Bachelor of Science Track, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/economics/economics-major/
// (fetched 2026-09-28); Feller Center (BSOS), "ECON BS Major Checklist" (Internet Archive copy,
// effective Fall 2021 and later, last updated 4/24/24) (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree, follow
// the department page. No disagreement found: the checklist's Foundation, Additional ECON
// Requirements and Courses of Choice rows match the catalog's exactly.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const econMajorBs: Program = {
  id: "econ-major-bs",
  name: "Economics Major (Bachelor of Science)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Economics Major; " +
    "Feller Center, ECON BS Major Checklist (Internet Archive, effective Fall 2021 and later, updated 4/24/24) (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "No department-vs-catalog disagreement found: the checklist's Foundation Courses, Additional ECON Requirements (Statistics/ECON326/ECON325/ECON422) and Courses of Choice sections match the catalog's Foundation and Economics Courses of Choice sections course-for-course.",
    "Advanced Math gateway (ECON300 or MATH241) is encoded as a course-option pair. Both sources note that a student choosing MATH241 must also take 'another statistics course' -- this isn't a separate encoded requirement because the Statistics gateway (ECON321 or STAT401) is already required of every B.S. student regardless of which Advanced Math option they pick; the note doesn't describe an additional, unencoded course.",
    "ECON300, ECON321, ECON325, ECON326 and ECON422 (all required) are excluded from the econ-bs-400 and econ-bs-ba-300-400 elective filters so a required course can't double as its own elective (same treatment as civil-major's ENCE technical elective).",
    "Not encoded (engine gap, matches other majors' precedent): per-course C- minimum is encoded; program GPA 2.0 (average in all courses used to satisfy major requirements) encoded as minGpa; its residency rules (15 of the final 30 credits at the 300-400 level, 12 upper-level major credits at UMD, 30 credits at UMD, cumulative 2.0 GPA in all UMD coursework); and its 120-credit graduation minimum.",
  ],
  requirements: [
    { kind: "course", id: "econ200", name: "Principles of Microeconomics", options: ["ECON200"] },
    { kind: "course", id: "econ201", name: "Principles of Macroeconomics", options: ["ECON201"] },
    { kind: "course", id: "math140", name: "Calculus I", options: ["MATH140"] },
    {
      kind: "course",
      id: "advanced-math",
      name: "Advanced Math Gateway (ECON300 or MATH241)",
      options: ["ECON300", "MATH241"],
    },
    {
      kind: "course",
      id: "stats-gateway",
      name: "Statistics Gateway (ECON321 or STAT401)",
      options: ["ECON321", "STAT401"],
    },
    { kind: "course", id: "econ325", name: "Intermediate Macroeconomic Analysis", options: ["ECON325"] },
    { kind: "course", id: "econ326", name: "Intermediate Microeconomic Analysis", options: ["ECON326"] },
    { kind: "course", id: "econ422", name: "Econometrics", options: ["ECON422"] },
    {
      kind: "choose",
      id: "econ-bs-400",
      name: "400 Level ECON Courses Designated for the B.S. (3)",
      count: 3,
      from: {
        departments: ["ECON"],
        minNumber: 400,
        maxNumber: 499,
        exclude: ["ECON300", "ECON321", "ECON325", "ECON326", "ECON422"],
      },
    },
    {
      kind: "choose",
      id: "econ-bs-ba-400",
      name: "400 Level ECON Course Designated for the B.S. or B.A. (1)",
      count: 1,
      from: {
        departments: ["ECON"],
        minNumber: 400,
        maxNumber: 499,
        exclude: ["ECON300", "ECON321", "ECON325", "ECON326", "ECON422"],
      },
    },
    {
      kind: "choose",
      id: "econ-bs-ba-300-400",
      name: "300 or 400 Level ECON Course Designated for the B.S. or B.A. (1)",
      count: 1,
      from: {
        departments: ["ECON"],
        minNumber: 300,
        maxNumber: 499,
        exclude: ["ECON300", "ECON321", "ECON325", "ECON326", "ECON422"],
      },
    },
  ],
};

export const econMajorBsMeta: ProgramMeta = {
  kind: "major",
  college: "BSOS",
  short: "Economics (B.S.)",
  major: "econ",
  track: "B.S.",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/economics/economics-major/",
    department:
      "https://web.archive.org/web/20260210113440id_/https://fellercenter.umd.edu/sites/fellercenter.umd.edu/files/Major%20Cards/ECON%20BS%20Major%20Checklist%20042424%20writable.pdf",
  },
};
