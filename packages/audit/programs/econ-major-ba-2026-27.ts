// Economics Major, Bachelor of Arts Track, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/economics/economics-major/
// (fetched 2026-09-28). The Feller Center's B.A. Major Checklist (Internet Archive copy) failed to
// convert ("Invalid Root reference."), so unlike the B.S. track there is no department source for the
// B.A. -- the catalog is the only source. See docs/project/owner-review.md.
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree, follow
// the department page; not applicable here since no department page converted.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const econMajorBa: Program = {
  id: "econ-major-ba",
  name: "Economics Major (Bachelor of Arts)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Economics Major, " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/economics/economics-major/ (fetched 2026-09-28); " +
    "no usable department source for the B.A. (Feller Center checklist failed to convert)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "No department checklist source: the Feller Center's 'ECON BA Major Checklist' PDF (Internet Archive copy) failed to convert in the fetched source. Every requirement below comes from the catalog alone; there is no department-vs-catalog comparison to make for this track (see docs/project/owner-review.md).",
    "Calc gateway (MATH120 or MATH140) and Applied Economic Statistics gateway (ECON230 or BMGT230) are encoded as course-option pairs, same shape as other majors' either/or gateways.",
    "The catalog's four 'Economics Courses of Choice' rows are collapsed to three `choose` requirements. The 'Select one of the following: ECON386 (Experiential Learning) / Other experiential learning course(s) / 300 or 400 level ECON course designated for the B.A.' row is NOT encoded as its own requirement: its own third option ('300 or 400 level ECON course designated for the B.A.') is identical in eligibility to the separate 'Select two 300 or 400 level ECON courses' row, and ECON386 itself is a 300-level ECON course already inside that same pool. Encoding it separately would add nothing checkable, so it is merged into econ-ba-300-400 as a third course (2 + 1 = 3 courses, 9 credits) instead of tracking it apart.",
    "The named 'Economics Courses of Choice: Select one' list includes ECON425 as printed in the catalog table, even though the table gives it no title (a conversion artifact, not a builder omission) and it is not on the builder brief's approved-course list used to fill plan slots. Kept as a valid option since the catalog itself names the course number; not used to fill either sample plan.",
    "ECON305 and ECON306 (both required, 300-level) are excluded from the econ-ba-300-400 and econ-ba-400 elective filters so a plan can't be short-changed by having a required course double as its own elective (same treatment as civil-major's ENCE technical elective).",
    "Not encoded (engine gap, matches other majors' precedent): the per-course C- minimum is encoded; program GPA 2.0 (average across all courses used to satisfy major requirements) encoded as minGpa; the college's residency rules (15 of the final 30 credits at the 300-400 level, 12 upper-level major credits at UMD, 30 credits at UMD, per the B.S. checklist -- assumed identical for the B.A. since no B.A.-specific residency text was fetched); and the major's own 41-42 total-credit range, which the audit has no concept for.",
  ],
  requirements: [
    { kind: "course", id: "econ200", name: "Principles of Microeconomics", options: ["ECON200"] },
    { kind: "course", id: "econ201", name: "Principles of Macroeconomics", options: ["ECON201"] },
    {
      kind: "course",
      id: "calc-gateway",
      name: "Calculus Gateway (MATH120 or MATH140)",
      options: ["MATH120", "MATH140"],
    },
    {
      kind: "course",
      id: "stats-gateway",
      name: "Applied Economic Statistics Gateway (ECON230 or BMGT230)",
      options: ["ECON230", "BMGT230"],
    },
    { kind: "course", id: "econ305", name: "Intermediate Macroeconomic Theory and Policy", options: ["ECON305"] },
    { kind: "course", id: "econ306", name: "Intermediate Microeconomic Theory & Policy", options: ["ECON306"] },
    {
      kind: "choose",
      id: "econ-ba-choice-list",
      name: "Economics Courses of Choice (named list)",
      count: 1,
      from: { courses: ["ECON402", "ECON414", "ECON424", "ECON425", "ECON426"] },
    },
    {
      kind: "choose",
      id: "econ-ba-300-400",
      name: "300 or 400 Level ECON Courses Designated for the B.A. (3)",
      count: 3,
      from: { departments: ["ECON"], minNumber: 300, maxNumber: 499, exclude: ["ECON305", "ECON306"] },
    },
    {
      kind: "choose",
      id: "econ-ba-400",
      name: "400 Level ECON Courses Designated for the B.A. (3)",
      count: 3,
      from: { departments: ["ECON"], minNumber: 400, maxNumber: 499 },
    },
  ],
};

export const econMajorBaMeta: ProgramMeta = {
  kind: "major",
  college: "BSOS",
  short: "Economics (B.A.)",
  major: "econ",
  track: "B.A.",
  defaultTrack: true,
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/economics/economics-major/",
  },
};
