// Geographical Sciences Major, General Track, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/geographical-sciences/geographical-sciences-major/;
// Feller Center (College of Behavioral and Social Sciences) official "GEOG Major Checklist"
// (department checklist), https://fellercenter.umd.edu (Internet Archive copy, fetched 2026-09-28),
// which includes the department's own four-year graduation-plan grid.
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page (the college checklist counts as a department source); each such
// difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const geogMajorGeneral: Program = {
  id: "geog-major-general",
  name: "Geographical Sciences Major (General)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Geographical Sciences Major; " +
    "Feller Center, GEOG Major Checklist (department checklist), " +
    "https://fellercenter.umd.edu/sites/fellercenter.umd.edu/files/Major%20Cards/GEOG%20Major%20Checklist%20042524%20Writable.pdf " +
    "(Internet Archive copy, fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Benchmark 1 (Academic Writing, two Gen Ed courses, MATH120/140/136, GEOG201&211 or GEOG202, and an additional GEOG course of choice, all within two semesters of entering the major) is a progress-to-continue-in-the-major gate, not a separate graduation requirement: every GEOG/math course it names is already required below (GEOG201, GEOG211, GEOG202 are both required -- the checklist's own 'Required Course 1' and 'Required Course 2' rows list the same 'GEOG201&211 or GEOG202' pair, meaning a student takes one for the benchmark and the other as Required Course 2, so both end up required). The 'within two semesters' timing rule is an admission-progress gate the audit doesn't model (matches the GVPT majors' benchmark precedent).",
    "GEOG Human Gateway Requirement and GEOG Physical Gateway Requirement are each a blank 'GEOG _________' line on the checklist with no enumerated course list (unlike the Technique Gateway, which the checklist itself enumerates as GEOG372 or GEOG373). Per the no-named-list ruling, each is encoded as a `choose` requirement (count 1) filtered to department GEOG, level 300-400 -- this can't restrict to the human vs. physical subfield specifically (same treatment as International Relations' GVPT IR/Comparative Courses of Choice). Flagged for owner confirmation of subfield picks in docs/project/owner-review.md.",
    "GEOG Technique Gateway Requirement is fully enumerated by the checklist ('GEOG372 or 373') and encoded as a `course` requirement with both options.",
    "Department-vs-catalog difference: the checklist's 'GEOG Elective Courses' block requires 5 upper-level electives, but specifically marks Elective Courses 4 and 5 '(400 level)' -- i.e. 2 of the 5 must be 400-level, not just 300-or-400 -- while the catalog's own line item ('ELECT300/400 | Upper-level geography electives | 15') treats all 5 as interchangeably 300-or-400. Per the department-wins ruling, this is encoded as two `choose` requirements: 3 electives from GEOG 300-400, and 2 electives from GEOG 400-499 specifically, both excluding the major's other named required courses.",
    "Department-vs-catalog difference: the checklist's supporting-sequence row lists 'MATH120/140/136' for the first supporting course, while the catalog's prose names only MATH120 ('MATH120 | Elementary Calculus I | 3'). Per the department-wins ruling, encoded as a `course` requirement with all three options.",
    "Not encoded (approved elective with no enumerable list; flagged in docs/project/owner-review.md): the remaining 4 Supporting Courses (12 credits), which both the catalog and the checklist say are 'approved by GEOG advisor' / 'Refer to GEOG department for specific supporting area courses' with no course list in either fetched source.",
    "Not encoded (engine gap): Program GPA 2.0 encoded as minGpa (major + supporting sequence together). the checklist's residency rules (15 of the final 30 credits at the 300-400 level, 12 upper-level major credits at UMD, 30 credits at UMD, cumulative 2.0 UMD GPA); and the 120-credit graduation minimum. The audit checks individual requirements, not GPA, residency or overall credit totals.",
  ],
  requirements: [
    { kind: "course", id: "geog201", name: "Geography of Environmental Systems", options: ["GEOG201"] },
    { kind: "course", id: "geog211", name: "Geography of Environmental Systems Laboratory", options: ["GEOG211"] },
    { kind: "course", id: "geog202", name: "Introduction to Human Geography", options: ["GEOG202"] },
    { kind: "course", id: "geog212", name: "Career Planning for Geographical Sciences, GIS, and ENSP Majors", options: ["GEOG212"] },
    {
      kind: "choose",
      id: "physical-gateway",
      name: "Upper-Level Physical Geography Gateway Course",
      count: 1,
      from: { departments: ["GEOG"], minNumber: 300, maxNumber: 499, exclude: ["GEOG201", "GEOG211", "GEOG202", "GEOG212", "GEOG306", "GEOG372", "GEOG373"] },
    },
    {
      kind: "choose",
      id: "human-gateway",
      name: "Upper-Level Human Geography Gateway Course",
      count: 1,
      from: { departments: ["GEOG"], minNumber: 300, maxNumber: 499, exclude: ["GEOG201", "GEOG211", "GEOG202", "GEOG212", "GEOG306", "GEOG372", "GEOG373"] },
    },
    {
      kind: "course",
      id: "technique-gateway",
      name: "Upper-Level Geographic Techniques Gateway Course (GEOG372 or GEOG373)",
      options: ["GEOG372", "GEOG373"],
    },
    { kind: "course", id: "geog306", name: "Introduction to Quantitative Methods for the Geographical Environmental Sciences", options: ["GEOG306"] },
    {
      kind: "choose",
      id: "geog-electives",
      name: "Upper-Level Geography Electives (Courses 1-3)",
      count: 3,
      from: { departments: ["GEOG"], minNumber: 300, maxNumber: 499, exclude: ["GEOG201", "GEOG211", "GEOG202", "GEOG212", "GEOG306", "GEOG372", "GEOG373"] },
    },
    {
      kind: "choose",
      id: "geog-electives-400",
      name: "Upper-Level Geography Electives, 400-Level (Courses 4-5)",
      count: 2,
      from: { departments: ["GEOG"], minNumber: 400, maxNumber: 499, exclude: ["GEOG201", "GEOG211", "GEOG202", "GEOG212", "GEOG306", "GEOG372", "GEOG373"] },
    },
    {
      kind: "course",
      id: "math-supporting",
      name: "Math Supporting Course (MATH120, MATH140, or MATH136)",
      options: ["MATH120", "MATH140", "MATH136"],
    },
  ],
};

export const geogMajorGeneralMeta: ProgramMeta = {
  kind: "major",
  college: "BSOS",
  short: "Geographical Sciences (General)",
  major: "geog",
  track: "General",
  defaultTrack: true,
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/geographical-sciences/geographical-sciences-major/",
    department: "https://fellercenter.umd.edu/sites/fellercenter.umd.edu/files/Major%20Cards/GEOG%20Major%20Checklist%20042524%20Writable.pdf",
  },
};
