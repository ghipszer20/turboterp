// Arabic Studies Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/arabic-studies/arabic-studies-major/;
// College of Arts and Humanities official four-year academic plan for Arabic Studies (Google Drive PDF,
// converted to text, fetched 2026-09-28). The ARHU world-language-placement page was also fetched as
// context (generic ARHU-wide placement-exam procedure, no Arabic-specific requirement content).
// Owner ruling (docs/project/rulings.md, 2026-09-26): where the department page (the college's own
// four-year plan counts as one) and the Academic Catalog disagree, the department page wins.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const CORE_SEQUENCE = ["ARAB101", "ARAB102", "ARAB201", "ARAB202", "ARAB301", "ARAB302"];

const FOUNDATION_ELECTIVES = ["ARAB190", "ARAB317", "ARAB222", "ARAB322", "ARAB225", "ARAB325"];

const OPTIONAL_ELECTIVES = [
  "ARAB206",
  "ARAB207",
  "ARAB250",
  "ARAB398",
  "ARAB401",
  "ARAB410",
  "ARAB499",
  "ARAB386",
];

export const arabMajor: Program = {
  id: "arab-major",
  name: "Arabic Studies Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Arabic Studies Major; " +
    "College of Arts and Humanities official four-year academic plan for Arabic Studies, " +
    "fetched 2026-09-28 (https://drive.google.com/uc?export=download&id=11biF06jxlkxYZ8_71AWJ7ZzpcEx-an7g#Arabic-Studies)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page vs. catalog: no numeric disagreement found. The college's four-year plan's own " +
      "checklist places exactly 3 named Foundation-elective slots ('One ARAB Foundation Elective' + " +
      "'Two ARAB Foundation Electives', filled in the plan with ARAB222, ARAB325 and ARAB317) -- 9 " +
      "credits, matching the catalog's 'minimum of 9 credits' -- and 3 more ARAB elective slots ('ARAB " +
      "2xx (Elective in English)' + two 'ARAB 3xx-4xx') totaling 9 more credits, matching the catalog's " +
      "'maximum of 9 credits' of Optional Electives. Both sources agree on the 9/9 split of the 18 " +
      "elective credits.",
    "Not encoded (no placement concept in the audit engine): 'Once credits have been received for a " +
      "higher-level language focus course, a lower-level course in the same strand may not be taken for " +
      "credit' (e.g. ARAB201 may not be taken after ARAB202), and 'All pre-requisites imply or equivalent " +
      "knowledge... required language-focused credits are replaced in consultation with, and with the " +
      "written approval of, the undergraduate advisor.' Students placing out of the lower core-sequence " +
      "courses via the World Language Placement exam (arhu.umd.edu/academics/world-language-placement, " +
      "fetched as context) would need those requirements waived by an advisor, which this program does " +
      "not model.",
    "Not encoded (approval-based exception, no list given): 'Other ARAB courses may be included [in " +
      "Foundation Electives] on written approval of the undergraduate advisor,' and 'Certain courses in " +
      "Middle Eastern Studies taught in English in other departments... can be substituted [for Optional " +
      "Electives] with the approval of the Undergraduate Advisor and Program Director.' Both foundation " +
      "and optional elective requirements are encoded with only the catalog's own named course lists.",
    "Not encoded (no 'taught in language' attribute in the audit engine): Optional Electives caps at 9 " +
      "credits 'including at least one 3-credit course taught in Arabic.' The engine has no way to check " +
      "which language a course is taught in, so any combination of the Optional Electives list up to 9 " +
      "credits is accepted.",
    "Not encoded (engine gap, cuts across the whole major rather than one requirement): 'Students must " +
      "take a minimum of 12 major credits at the upper level,' restated in the four-year plan's ARHU " +
      "graduation requirements as '12 upper level major credits must be earned at UMD.' The audit engine " +
      "checks per-requirement course assignment and per-course minGrade, not a credit-level minimum " +
      "spanning every requirement.",
    "Not encoded (engine gaps): residency " +
      "rules (at least 30 credits at UMD, 15 of the final 30 credits at the 300-400 level), and the " +
      "120-credit graduation minimum.",
  ],
  requirements: [
    { kind: "course", id: "arab101", name: "Elementary Arabic I", options: ["ARAB101"] },
    { kind: "course", id: "arab102", name: "Elementary Arabic II", options: ["ARAB102"] },
    { kind: "course", id: "arab201", name: "Intermediate Arabic I", options: ["ARAB201"] },
    { kind: "course", id: "arab202", name: "Intermediate Arabic II", options: ["ARAB202"] },
    {
      kind: "course",
      id: "arab301",
      name: "Arab Culture and Society: Skills and Topics I",
      options: ["ARAB301"],
    },
    {
      kind: "course",
      id: "arab302",
      name: "Arab Culture & Society: Skills and Topics II",
      options: ["ARAB302"],
    },
    {
      kind: "choose",
      id: "foundation-electives",
      name: "Foundation Electives (minimum 9 credits)",
      credits: 9,
      from: { courses: FOUNDATION_ELECTIVES },
    },
    {
      kind: "choose",
      id: "remaining-electives",
      name: "Remaining Elective Credits (9 credits, from Foundation and/or Optional Electives; " +
        "at most 9 of the 18 total elective credits may be Optional Electives)",
      credits: 9,
      from: { courses: [...FOUNDATION_ELECTIVES, ...OPTIONAL_ELECTIVES] },
    },
  ],
};

export const arabMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Arabic Studies",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/arabic-studies/arabic-studies-major/",
    department: "https://drive.google.com/uc?export=download&id=11biF06jxlkxYZ8_71AWJ7ZzpcEx-an7g#Arabic-Studies",
  },
};
