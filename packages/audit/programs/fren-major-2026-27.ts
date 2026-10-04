// French Language and Literature Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/french-language-literature/french-major/;
// College of Arts and Humanities official four-year academic plan for French (Google Drive PDF,
// converted to text, fetched 2026-09-28). The ARHU world-language-placement page was also fetched as
// context (generic ARHU-wide placement-exam procedure, no French-specific requirement content).
// Owner ruling (docs/project/rulings.md, 2026-09-26): where the department page (the college's own
// four-year plan counts as one) and the Academic Catalog disagree, the department page wins.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

// Courses already required by name; excluded from the elective/upper-level pools below so a
// required course can't also satisfy an elective requirement instead of its own slot.
const REQUIRED_FREN_COURSES = ["FREN204", "FREN250", "FREN301", "FREN387", "FREN351", "FREN352"];

export const frenMajor: Program = {
  id: "fren-major",
  name: "French Language and Literature Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, French Language and Literature Major; " +
    "College of Arts and Humanities official four-year academic plan for French, " +
    "fetched 2026-09-28 (https://drive.google.com/uc?export=download&id=17UqV14aynMTWEgyBOex0GzaajjhDtcjc#French)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page vs. catalog: no disagreement found. The college's four-year plan's 'Major " +
      "Requirements' legend lists exactly the same 12 courses/slots as the catalog's 36-credit list " +
      "(FREN204, FREN250, FREN301, FREN387, two from FREN302/306/312/313/399, FREN351, FREN352, four " +
      "FREN4xx). The plan's 'One FREN course', 'Three additional FREN courses', and FREN103/FREN203 " +
      "entries are the pre-major language sequence (FREN204's own footnote: 'pre-requisites FREN 103 " +
      "and 203 or equivalent'), not part of the major's 36 credits, and are not encoded here.",
    "The four-year plan PDF's term-grid text conversion is garbled (the Fall/Spring grid and the Gen " +
      "Ed/Major-Requirements legend appear column-interleaved), but the 12 major courses/slots and their " +
      "relative order (FREN204 -> FREN250 -> FREN301/FREN352 -> FREN387/elective#1 -> FREN351/elective#2 " +
      "-> four FREN4xx near the end) are legible. `packages/programs/sample-plans/fren-major.json` is " +
      "`official: true`, but its exact year/semester placement is reconstructed from that ordering, not " +
      "read verbatim. Please verify against the original PDF if exact term placement matters.",
    "Not encoded (no language-of-instruction attribute in the engine): 'Select four additional FREN4xx " +
      "level courses in literature, linguistics, film, and culture, of which only one may be in " +
      "English.' Encoded as a plain FREN 400-499 choose; the English-course cap isn't checked.",
    "Not encoded (no prerequisite-ordering concept in the engine): 'FREN387 must be completed before " +
      "any FREN4xx level course offered in French.'",
    "The World Language Placement page (arhu.umd.edu/academics/world-language-placement, fetched as " +
      "context) has no French-specific placement rule to encode.",
    "Not encoded (engine gaps): residency rules (30 credits at " +
      "UMD, 15 of the final 30 at the 300-400 level, 12 upper-level major credits at UMD), and the " +
      "120-credit graduation minimum. Program GPA 2.0 encoded as minGpa.",
  ],
  requirements: [
    { kind: "course", id: "fren204", name: "French Grammar and Composition", options: ["FREN204"] },
    { kind: "course", id: "fren250", name: "Introduction to Cultural and Textual Analysis", options: ["FREN250"] },
    { kind: "course", id: "fren301", name: "Composition and Style", options: ["FREN301"] },
    {
      kind: "course",
      id: "fren387",
      name: "Critical Writing on France and the French-Speaking World",
      options: ["FREN387"],
    },
    {
      kind: "choose",
      id: "elective-topics",
      name: "Select two of: FREN302, FREN306, FREN312, FREN313, FREN399",
      credits: 6,
      from: { courses: ["FREN302", "FREN306", "FREN312", "FREN313", "FREN399"] },
    },
    {
      kind: "course",
      id: "fren351",
      name: "From Romanticism to the Age of Modernism and Beyond",
      options: ["FREN351"],
    },
    {
      kind: "course",
      id: "fren352",
      name: "From the Age of Epic and Romance to the Enlightenment",
      options: ["FREN352"],
    },
    {
      kind: "choose",
      id: "upper-level-4xx",
      name: "Select four additional FREN4xx level courses in literature, linguistics, film, and " +
        "culture (only one may be in English)",
      credits: 12,
      from: { departments: ["FREN"], minNumber: 400, maxNumber: 499, exclude: REQUIRED_FREN_COURSES },
    },
  ],
};

export const frenMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "French",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/french-language-literature/french-major/",
    department: "https://drive.google.com/uc?export=download&id=17UqV14aynMTWEgyBOex0GzaajjhDtcjc#French",
  },
};
