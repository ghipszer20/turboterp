// Theatre Major, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/theatre-dance-performance-studies/
// theatre-major/; College of Arts and Humanities' official Theatre Four Year Academic Plan (department
// source, converted from PDF), https://drive.google.com/uc?export=download&id=1W2lqXy4Ra_wafe8_uFEihlgakWSZOBZK#Theatre
// (fetched 2026-09-28, via program-sources/theatre-major.md).
// Owner ruling (docs/project/rulings.md, 2026-09-26): where the department page (the college's own
// four-year plan counts as one) and the Academic Catalog disagree, the department page wins.
// The catalog's requirements are one flat list (Foundation Series, then an Area Menu every student
// draws from -- Performance, Design/Production, History/Theory -- plus Supporting Courses); no
// separate tracks/areas-of-emphasis like the sibling Dance major (danc-major-2026-27.ts), so this
// is one program, `thet-major`.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const THET_CATALOG_URL =
  "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/theatre-dance-performance-studies/theatre-major/";
export const THET_DEPT_URL = "https://drive.google.com/uc?export=download&id=1W2lqXy4Ra_wafe8_uFEihlgakWSZOBZK#Theatre";
export const THET_SOURCE =
  "UMD Academic Catalog 2026-27, Theatre Major (" + THET_CATALOG_URL + "); " +
  "College of Arts and Humanities, official Theatre Four Year Academic Plan (department source), " + THET_DEPT_URL + " (fetched 2026-09-28)";

export const thetMajor: Program = {
  id: "thet-major",
  name: "Theatre Major",
  catalogYear: "2026-27",
  source: THET_SOURCE,
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "The department's official four-year plan PDF (program-sources/theatre-major.md, 'Sample plan' section) " +
      "converted to font-remapped control characters and symbol substitution end to end -- no legible course " +
      "code, term header, or any other course-level signal anywhere. No department-vs-catalog comparison was " +
      "possible for term placement, and the sample plan below is CONSTRUCTED from the catalog's own " +
      "requirement list alone, `official: false`. Please supply a readable copy if one exists.",
    "The catalog's own top-level requirement table gives 'History/Theory: | 6' credits, but summing the " +
      "table's own stated area credits (Foundation 16 + Performance 3 + Design 6 + History/Theory X + " +
      "Supporting 15) against its own 'Total Credits | 49' footer requires X = 9, which matches the more " +
      "detailed History/Theory Area section below it ('Prerequisites: 9 credits required; THET390, THET391, " +
      "one additional course at 4xx level') exactly. Read the top table's '6' as a PDF-conversion digit " +
      "error and encoded History/Theory as 9 credits (THET390 + THET391 + one 4xx course).",
    "Performance Area list includes THET210, THET420, THET424 and THET430 with no title text (a likely " +
      "PDF-table-conversion artifact) and none is on the Academic Catalog's approved THET plan-slot course " +
      "list; kept because each is named directly in the source (department page wins per the owner ruling), " +
      "flagged in docs/project/owner-review.md for the owner to confirm the numbers are current.",
    "Footnote 1 on the Performance Area ('Requires an audition'; also 'Students may only audition twice for " +
      "each course requiring an audition') applies to most of that area's courses -- an admission gate on " +
      "each course, not a course requirement. Not enforced: the engine has no per-course-audition/admission-" +
      "gate concept, matching the Dance major's own audition-footnote precedent. Flagged in docs/project/owner-review.md.",
    "Design/Production Area's 'Prerequisites: 6 credits required; three at the 3xx or 4xx level' is encoded " +
      "as a 6-credit choose over the area's own named course list, plus an `overlay: true` 3-credit choose " +
      "checking any THET course at the 3xx/4xx level (department-wide, not restricted to the Design list " +
      "itself -- the engine's `choose` can't combine a fixed course list with a number-range filter in one " +
      "rule, matching phil-major-2026-27.ts's own overlay pattern for a sub-minimum within a larger bucket). " +
      "This is broader than the letter of the requirement (any 3xx/4xx THET course satisfies the overlay, " +
      "not only a Design-area one) rather than narrower, per the 'never narrower' rule.",
    "Supporting Courses ('Select 15 credits of Supporting Courses'; footnote 4: '12 credits of THET/TDPS " +
      "Courses. 12 credits must be 3xx or 4xx level coursework. Supporting course credits may come from the " +
      "Performance, Design/Production, or History/Theory Area menus OR any combination of the four menus. " +
      "Students may also petition to their advisor for other suitable courses') is encoded as a 15-credit " +
      "choose over the whole THET/TDPS department range, plus an `overlay: true` 12-credit choose over the " +
      "same departments restricted to the 3xx/4xx level -- both exactly matching the footnote's own numbers. " +
      "The advisor-petition allowance for non-THET/TDPS courses isn't encoded (no named courses, and no " +
      "approval-gate concept in the engine).",
    "History/Theory Area's footnote ('All seminars offered at the 4xx/6xx level require... permission... and " +
      "having completed either THET488 or THET489. This includes: THET408/THET608, THET486/THET686, " +
      "THET498/THET698') names THET486 and THET498 only inside that permission-gate footnote, never in the " +
      "area's own course table (THET390, THET391, THET408, THET488, THET489); not added to the area's " +
      "eligible-course list on that basis. The permission gate on THET408 itself is not enforced (same " +
      "admission-gate engine gap as above).",
    "TDPS479's footnotes ('cannot be taken until TDPS201 is completed'; 'must be completed in 3 different " +
      "areas -- costume, scenic, lighting and sound'; specific credit-count/semester deadlines) are " +
      "prerequisite-sequencing and scheduling-deadline rules, not encoded (no prerequisite-chain or per-area " +
      "sub-distribution-within-one-course-list concept in the engine).",
    "Program GPA 2.0 encoded as minGpa. Not encoded (engine gaps): no course with a grade less " +
      "than 'C-' may satisfy major/supporting requirements (per-course minGrade is set; the GPA floor across " +
      "all of them is minGpa); no course for the major may be taken Pass/Fail or Audit; the requirement that " +
      "at least 28 of the 49 major credits be 3xx or 4xx level (a floor spanning every area at once, beyond " +
      "the two per-area overlays above); the College of Arts and Humanities' own 3xx/4xx-credit minimum and " +
      "Global Engagement Requirement (college-wide, not Theatre-specific); residency rules; and the " +
      "120-credit graduation minimum.",
  ],
  requirements: [
    { kind: "course", id: "tdps201", name: "Introduction to Technical Production", options: ["TDPS201"] },
    { kind: "course", id: "thet116", name: "Fundamentals of Theatrical Design", options: ["THET116"] },
    { kind: "course", id: "thet222", name: "Foundations of Acting and Performance", options: ["THET222"] },
    { kind: "course", id: "thet223", name: "Text and Context in Western Theatre", options: ["THET223"] },
    {
      kind: "choose",
      id: "tdps479",
      name: "Production Practicum (4 x 1-credit courses, 3 different areas: costume, scenic, lighting, sound)",
      credits: 4,
      from: { courses: ["TDPS479"] },
    },
    {
      kind: "choose",
      id: "performance-area",
      name: "Performance Area: select 3 credits",
      credits: 3,
      from: {
        courses: [
          "THET210",
          "THET285",
          "THET310",
          "THET324",
          "THET325",
          "THET330",
          "THET360",
          "THET411",
          "THET420",
          "THET424",
          "THET425",
          "THET430",
          "THET451",
          "THET452",
        ],
      },
    },
    {
      kind: "choose",
      id: "design-area",
      name: "Design/Production Area: select 6 credits",
      credits: 6,
      from: {
        courses: [
          "THET274",
          "THET282",
          "THET284",
          "THET371",
          "THET372",
          "THET373",
          "THET377",
          "THET380",
          "THET383",
          "THET384",
          "THET465",
          "THET471",
          "THET472",
          "THET473",
          "THET474",
          "THET475",
          "THET477",
          "THET481",
          "THET482",
        ],
      },
    },
    {
      kind: "choose",
      id: "design-area-3xx4xx",
      name: "Design/Production Area: 3 of the 6 credits at the 3xx or 4xx level",
      overlay: true,
      credits: 3,
      from: { departments: ["THET"], minNumber: 300, maxNumber: 499 },
    },
    { kind: "course", id: "thet390", name: "History of Theatre I", options: ["THET390"] },
    { kind: "course", id: "thet391", name: "Theatre History II", options: ["THET391"] },
    {
      kind: "choose",
      id: "history-theory-4xx",
      name: "History/Theory Area: one additional course at the 4xx level",
      credits: 3,
      from: { courses: ["THET408", "THET488", "THET489"] },
    },
    {
      kind: "choose",
      id: "supporting-courses",
      name: "Supporting Courses: select 15 credits of THET/TDPS coursework",
      credits: 15,
      from: { departments: ["THET", "TDPS"] },
    },
    {
      kind: "choose",
      id: "supporting-courses-3xx4xx",
      name: "Supporting Courses: 12 of the 15 credits at the 3xx or 4xx level",
      overlay: true,
      credits: 12,
      from: { departments: ["THET", "TDPS"], minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const thetMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Theatre",
  major: "thet",
  sources: { catalog: THET_CATALOG_URL, department: THET_DEPT_URL },
};
