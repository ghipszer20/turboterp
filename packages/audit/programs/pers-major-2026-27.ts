// Persian Studies Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/persian-studies/persian-studies-major/;
// College of Arts and Humanities official four-year academic plan for Persian Studies (Google Drive PDF,
// converted to text, fetched 2026-09-28). The ARHU world-language-placement page was also fetched as
// context (generic ARHU-wide placement-exam procedure, no Persian-specific requirement content).
// Owner ruling (docs/project/rulings.md, 2026-09-26): where the department page (the college's own
// four-year plan counts as one) and the Academic Catalog disagree, the department page wins.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const FOUNDATION_COURSES = ["PERS251", "PERS252", "PERS283", "PERS371"];

const ELECTIVE_COURSES = [
  "PERS280",
  "PERS298",
  "PERS299",
  "PERS301",
  "PERS302",
  "PERS311",
  "PERS312",
  "PERS353",
  "PERS385",
  "PERS386",
  "PERS399",
  "PERS405",
  "PERS406",
  "PERS498",
];

export const persMajor: Program = {
  id: "pers-major",
  name: "Persian Studies Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Persian Studies Major; " +
    "College of Arts and Humanities official four-year academic plan for Persian Studies, " +
    "fetched 2026-09-28 (https://drive.google.com/uc?export=download&id=1oulxmIQPz-P4OVNev8Vz1UTs5iFtNuzZ#Persian-Studies)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Posted advisor-approved substitution (owner, 2026-10-07: posted alternatives are encoded): 'Foundation Requirements may be substituted with the approval of the Undergraduate Advisor' and '*Foundation Courses may be substituted with permission.' The substitute isn't a fixed course list, so electives, foundation-requirements carry advisorMayApprove (the Advisor tells the student another course may count with approval).",
    "Department page vs. catalog: no numeric or course-list disagreement found. The college's four-year " +
      "plan's own checklist section restates the catalog's Core Language Sequence (PERS103/104/201/202, " +
      "12 credits), Foundation Requirements ('Select three (3) courses from: PERS 251, 252, 283, 371', 9 " +
      "credits) and Electives ('Select five (5) courses from: PERS 280, 298, 299, 301, 302, 311, 312, 353, " +
      "385, 386, 399, 405, 406, 498', 15 credits) verbatim, and its term grid names exactly three Foundation " +
      "courses (PERS251, PERS283, PERS371) and five Elective courses (PERS301, PERS302, PERS311, PERS312, " +
      "PERS498) across the four years, summing to the catalog's 36 total credits.",
    "Not encoded (no placement concept in the audit engine): 'Once credits have been received for a " +
      "higher-level language focus course, a lower-level course in the same strand may not be taken for " +
      "credit' (e.g. PERS201 may not be taken after PERS202), and 'All pre-requisites imply or equivalent " +
      "knowledge... required language-focused credits are replaced in consultation with, and with the " +
      "written approval of, the undergraduate advisor.' Students placing out of the lower core-sequence " +
      "courses via the World Language Placement exam (arhu.umd.edu/academics/world-language-placement, " +
      "fetched as context) would need those requirements waived by an advisor, which this program does " +
      "not model.",
    "Not encoded (approval-based exception, no list given): 'Foundation Requirements may be substituted " +
      "with the approval of the Undergraduate Advisor as the list of such courses will be regularly " +
      "updated.' Encoded with only the catalog's own four named Foundation courses.",
    "Not encoded (engine gap, cuts across the whole major rather than one requirement): 'At least 15 of the " +
      "36 credits for the major must be at the upper level (courses numbered 300 or above).' The Electives " +
      "list mixes sub-300 courses (PERS280, 298, 299) with 300+ courses, so which five a student picks " +
      "determines whether this floor is met; the audit engine checks per-requirement course assignment, " +
      "not a credit-level minimum spanning every requirement.",
    "Not encoded (engine gaps, matching every other ARHU language major's precedent): the overall 2.0 " +
      "cumulative GPA-in-the-major requirement, residency rules (30 credits at UMD, 15 of the final 30 " +
      "credits at the 300-400 level, 12 upper-level major credits at UMD), and the 120-credit graduation " +
      "minimum.",
  ],
  requirements: [
    { kind: "course", id: "pers103", name: "Beginning Persian I", options: ["PERS103"] },
    { kind: "course", id: "pers104", name: "Beginning Persian II", options: ["PERS104"] },
    { kind: "course", id: "pers201", name: "Intermediate Persian I", options: ["PERS201"] },
    { kind: "course", id: "pers202", name: "Intermediate Persian II", options: ["PERS202"] },
    {
      kind: "choose",
      id: "foundation-requirements", advisorMayApprove: true,
      name: "Foundation Requirements (choose 9 credits)",
      credits: 9,
      from: { courses: FOUNDATION_COURSES },
    },
    {
      kind: "choose",
      id: "electives", advisorMayApprove: true,
      name: "Electives (choose 15 credits)",
      credits: 15,
      from: { courses: ELECTIVE_COURSES },
    },
  ],
};

export const persMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Persian Studies",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/persian-studies/persian-studies-major/",
    department: "https://drive.google.com/uc?export=download&id=1oulxmIQPz-P4OVNev8Vz1UTs5iFtNuzZ#Persian-Studies",
  },
};
