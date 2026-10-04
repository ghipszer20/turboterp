// Chinese Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/chinese/chinese-major/;
// College of Arts and Humanities official four-year academic plan for Chinese (Google Drive PDF,
// converted to text, fetched 2026-09-28). The ARHU world-language-placement page was also fetched as
// context (generic ARHU-wide placement-exam procedure, no Chinese-specific requirement content).
// Owner ruling (docs/project/rulings.md, 2026-09-26): where the department page (the college's own
// four-year plan counts as one) and the Academic Catalog disagree, the department page wins.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

// Language Sequence courses already required by name; excluded from the elective pool below so a
// required course can't also satisfy the Electives requirement instead of its own slot.
const REQUIRED_CHIN_COURSES = ["CHIN206", "CHIN207", "CHIN301", "CHIN305", "CHIN302", "CHIN306", "CHIN401", "CHIN307", "CHIN315", "CHIN441"];

export const chinMajor: Program = {
  id: "chin-major",
  name: "Chinese Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Chinese Major; " +
    "College of Arts and Humanities official four-year academic plan for Chinese, " +
    "fetched 2026-09-28 (https://drive.google.com/uc?export=download&id=1DA9AvJMUDq0Hn4oYY6xIH-u4XFD9C1lg#Chinese)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page vs. catalog: OCR re-check (2026-09-28) of the four-year plan (program-sources/chinese-major.md, 'Sample plan' section) found it still too garbled to read the major courses or their term placement (only Gen Ed legend labels and the footnote about WL-placement substitution of higher CHIN courses survive; the term grid has no legible CHIN codes). No department-vs-catalog difference could be established; encoding unchanged. The one legible footnote (higher-level CHIN substitution with advisor approval, total of 17 CHIN language credits) matches the un-encoded placement exception noted below.",
    "Because the plan text is still unusable (also after OCR), the sample plan (packages/programs/sample-plans/chin-major.json) is built from the catalog's own requirement list, not read from the four-year plan, and is marked official: false. Flagged in docs/project/owner-review.md.",
    "Not encoded (placement- and approval-based exception, no list given): footnote 1's 'Students with " +
      "the appropriate WLP level and the approval of the Chinese Undergraduate Advisor may substitute " +
      "CHIN207 (4 credits) with one 3-credit upper-level CHIN course and 1 credit of CHIN386 or CHIN499.' " +
      "The World Language Placement page (arhu.umd.edu/academics/world-language-placement, fetched as " +
      "context) has no Chinese-specific placement rule to encode; the engine has no placement or " +
      "advisor-approval concept.",
    "Not encoded (approval-based exception, no exhaustive list given): footnote 2's allowance for up to 12 " +
      "credits of Electives (and of EALL284/EALL285) to be substituted with China Studies, History, " +
      "Government & Politics, or other-department courses taught in English, 'with the approval of the " +
      "Chinese Undergraduate Advisor,' plus approved language courses and independent study. The Electives " +
      "requirement below is encoded with only the catalog's own named scope (any 300/400-level CHIN course, " +
      "or SLLC286). Marked advisorMayApprove (elective-upper, elective-remaining, history-culture-1, history-culture-2): other courses may count with advisor approval; only the listed courses count.",
    "Footnote 3 (EALL284/HIST284 and EALL285/HIST285 are interchangeable, whichever is offered) is encoded " +
      "directly: each History and Culture slot accepts either course.",
    "Not encoded (approval-based, no list given): 'Special Topics' and 'Colloquium' courses (variable " +
      "numbers ending in 8 or 9) 'may be acceptable depending on the actual title and content of the " +
      "course at the time it is offered,' final determination by the Chinese Program and advisor.",
    "Not encoded (engine gap, cuts across the whole major rather than one requirement): 'At least 15 of " +
      "the 38 credits for the major must be at the upper level (courses numbered 300 or above).' The audit " +
      "engine checks per-requirement course assignment and per-course minGrade, not a credit-level minimum " +
      "spanning every requirement.",
    "Not encoded (engine gaps): residency " +
      "rules, and the 120-credit graduation minimum.",
  ],
  requirements: [
    { kind: "course", id: "chin206", name: "Intermediate Chinese I", options: ["CHIN206"] },
    { kind: "course", id: "chin207", name: "Intermediate Chinese II", options: ["CHIN207"] },
    {
      kind: "course",
      id: "chin301",
      name: "Advanced Chinese I (or Life in China through TV Plays I)",
      options: ["CHIN301", "CHIN305"],
    },
    {
      kind: "course",
      id: "chin302",
      name: "Advanced Chinese II (or Life in China through TV Plays II)",
      options: ["CHIN302", "CHIN306"],
    },
    { kind: "course", id: "chin401", name: "Readings in Modern Chinese I", options: ["CHIN401"] },
    {
      kind: "course",
      id: "history-culture-1",
      advisorMayApprove: true,
      name: "East Asian Cultures I (or East Asian Civilization I)",
      options: ["EALL284", "HIST284"],
    },
    {
      kind: "course",
      id: "history-culture-2",
      advisorMayApprove: true,
      name: "East Asian Cultures II (or East Asian Civilization II)",
      options: ["EALL285", "HIST285"],
    },
    { kind: "course", id: "chin307", name: "Linguistic Landscape of China", options: ["CHIN307"] },
    { kind: "course", id: "chin315", name: "Modern Chinese Literature in Translation", options: ["CHIN315"] },
    { kind: "course", id: "chin441", name: "Traditional Chinese Fiction", options: ["CHIN441"] },
    {
      kind: "choose",
      id: "elective-upper",
      advisorMayApprove: true,
      name: "Electives, upper-level (at least 3 of the 6 elective credits at the 300/400 level)",
      credits: 3,
      from: { departments: ["CHIN"], minNumber: 300, maxNumber: 499, exclude: REQUIRED_CHIN_COURSES },
    },
    {
      kind: "choose",
      id: "elective-remaining",
      advisorMayApprove: true,
      name: "Electives, remaining 3 credits (any 300/400-level CHIN course, or SLLC286; at most 3 of the " +
        "6 elective credits may be at the 200 level)",
      credits: 3,
      from: { courses: ["SLLC286"], departments: ["CHIN"], minNumber: 300, maxNumber: 499, exclude: REQUIRED_CHIN_COURSES },
    },
  ],
};

export const chinMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Chinese",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/chinese/chinese-major/",
    department: "https://drive.google.com/uc?export=download&id=1DA9AvJMUDq0Hn4oYY6xIH-u4XFD9C1lg#Chinese",
  },
};
