// Japanese Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/japanese/japanese-major/;
// sllc.umd.edu/fields/japanese/major (department page: gives a full requirement breakdown, unlike
// some other SLLC department pages already encoded); College of Arts and Humanities official
// four-year academic plan for Japanese (Google Drive PDF, converted to text, fetched 2026-09-28).
// The ARHU world-language-placement page was also fetched as context (generic ARHU-wide
// placement-exam procedure, no Japanese-specific requirement content).
// Owner ruling (docs/project/rulings.md, 2026-09-26): where the department page (the college's own
// four-year plan counts as one) and the Academic Catalog disagree, the department page wins.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

// Courses that fulfill the literature/cultural-studies elective category (catalog's own list).
const LITERATURE_CULTURAL = ["JAPN314", "JAPN315", "JAPN316", "JAPN325", "JAPN424", "JAPN425", "JAPN498"];

// Courses that fulfill the linguistics elective category (catalog's own list).
const LINGUISTICS = ["JAPN421", "JAPN422", "JAPN428", "JAPN438"];

// Courses the catalog names directly for the general-elective category.
const GENERAL_NAMED = ["JAPN311", "JAPN401", "JAPN402", "JAPN407", "EALL300"];

export const japnMajor: Program = {
  id: "japn-major",
  name: "Japanese Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Japanese Major; " +
    "sllc.umd.edu/fields/japanese/major (department page); " +
    "College of Arts and Humanities official four-year academic plan for Japanese, " +
    "fetched 2026-09-28 (https://drive.google.com/uc?export=download&id=1NkCebF68ZokYba325f7rASFoEz-XZTbX#Japanese)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page vs. catalog: no disagreement found. The department page (sllc.umd.edu/fields/japanese/major) " +
      "gives a full requirement breakdown: 'Prerequisite Courses for the Japanese Major (12 Credits)' (JAPN101, " +
      "JAPN102), 'Language Acquisition Courses (24 Credits)' (JAPN201/202/301/302), 'Civilization & History " +
      "Courses (6 Credits)', and 'Electives at 300-level or above (12 Credits)' -- 24+6+12=42, matching the " +
      "catalog's stated Total Credits of 42 exactly once the 12 prerequisite credits (JAPN101/102) are excluded, " +
      "which matches the catalog too: its own 'Language Requirements' section starts at JAPN201, never lists " +
      "JAPN101/102. JAPN101/102 are therefore encoded as prerequisites only, not as Program requirements here " +
      "(the same pattern used for gers-major-2026-27.ts, whose GERS103/203 pre-major sequence is likewise left out).",
    "Not encoded (no placement concept in the audit engine): the department page's 'Students who place at a " +
      "level above JAPN201 must take additional courses in Japanese language, and/or other Japan-related " +
      "topics, to earn the equivalent total of 24 credits.' Also not encoded: the catalog's sequential-" +
      "advancement rule (C- or better required to advance; a lower-level language/grammar course can't be " +
      "taken for credit once a higher one has been completed).",
    "Civilization/History requirement: the catalog gives two named options (Option I: HIST284 + HIST483; " +
      "Option II: HIST285 + HIST482), matching the department page's description exactly ('one must be a " +
      "pre-modern history and one a modern history course... one must be an East Asian civilization course, " +
      "and one a Japanese history course'). Encoded as a `sets` requirement -- pick one complete pair, not " +
      "any two of the four courses.",
    "Electives at 300+/400-level (12 credits): catalog and department page agree on the 3/3/6 split (one " +
      "literature/cultural-studies course, one linguistics course, and two general courses 'on a Japan-related " +
      "topic'). The catalog's own footnote further allows 'Pertinent courses at the 3xx or 4xx level in " +
      "History and Art History' and unused literature/linguistics JAPN courses to fill the general-elective " +
      "slots; encoded directly in the general-electives filter (HIST/ARTH 300-499, excluding the Civ/History " +
      "requirement's own HIST284/285/482/483, plus the literature-cultural and linguistics course lists).",
    "Not encoded (approval-based, no exhaustive list given): the department page's 'Courses on Japan in " +
      "departments outside of ours, such as HIST or ARTH, may count toward the non-literature, non-" +
      "linguistics electives, with permission of the advisor,' and the catalog's parallel 'subject to approval " +
      "by the student's advisor' for all electives. The engine has no advisor-approval concept, so any HIST/" +
      "ARTH 300-499 course is accepted for the general-elective slots, not only advisor-approved ones.",
    "The World Language Placement page (arhu.umd.edu/academics/world-language-placement, fetched as context) " +
      "has no Japanese-specific placement rule to encode; it's a generic ARHU-wide procedure description page.",
    "Not encoded (engine gaps): residency rules (at least 30 credits at " +
      "UMD, 15 of the final 30 at the 300-400 level, 12 upper-level major credits at UMD), ARHU's 39 upper-" +
      "level-credit graduation requirement, and the 120-credit graduation minimum.",
  ],
  requirements: [
    { kind: "course", id: "japn201", name: "Intermediate Japanese I", options: ["JAPN201"] },
    { kind: "course", id: "japn202", name: "Intermediate Japanese II", options: ["JAPN202"] },
    { kind: "course", id: "japn301", name: "Advanced Japanese I", options: ["JAPN301"] },
    { kind: "course", id: "japn302", name: "Advanced Japanese II", options: ["JAPN302"] },
    {
      kind: "sets",
      id: "civilization-history",
      name: "Civilization/History: Option I (HIST284 + HIST483) or Option II (HIST285 + HIST482)",
      options: [
        ["HIST284", "HIST483"],
        ["HIST285", "HIST482"],
      ],
    },
    {
      kind: "choose",
      id: "literature-cultural",
      name: "Literature/cultural-studies elective (300-level or above)",
      credits: 3,
      from: { courses: LITERATURE_CULTURAL },
    },
    {
      kind: "choose",
      id: "linguistics",
      name: "Linguistics elective (300-level or above)",
      credits: 3,
      from: { courses: LINGUISTICS },
    },
    {
      kind: "choose",
      id: "general-electives",
      name: "General electives on a Japan-related topic (300-level or above; 6 credits, may include " +
        "History/Art History courses or unused literature/linguistics electives)",
      credits: 6,
      from: {
        courses: [...GENERAL_NAMED, ...LITERATURE_CULTURAL, ...LINGUISTICS],
        departments: ["HIST", "ARTH"],
        minNumber: 300,
        maxNumber: 499,
        exclude: ["HIST284", "HIST285", "HIST482", "HIST483"],
      },
    },
  ],
};

export const japnMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Japanese",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/japanese/japanese-major/",
    department: "https://sllc.umd.edu/fields/japanese/major",
  },
};
