// Art History Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art-history-archaeology/art-history-major/;
// College of Arts and Humanities' official Art History Four Year Academic Plan (PDF, fetched 2026-09-28
// via program-sources/art-history-major.md -- Google Drive source of docs.google.com fetch script).
// Owner ruling (docs/project/rulings.md): where the department page (the college's four-year plan counts as
// one) and the catalog disagree, follow the department page.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const arthMajor: Program = {
  id: "arth-major",
  name: "Art History Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Art History Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art-history-archaeology/art-history-major/); " +
    "College of Arts and Humanities Art History Four Year Academic Plan (department source), fetched 2026-09-28",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "'Select three ARTH courses at the 2xx level, one of which may be a Big Question course' (catalog " +
      "footnote 1) names an example list ('include, but are not limited to') rather than a closed roster, " +
      "so it's encoded as a department + number-range `choose` (ARTH 200-299) rather than a fixed course " +
      "list. The 'may be a Big Question course' clause is informational (Gen Ed overlap), not a further " +
      "restriction, so it isn't separately modeled.",
    "'Select seven ARTH courses at the 3xx or 4xx level, at least one must be ARTH488' (catalog footnote 2) " +
      "is encoded as ARTH488 required plus a department + number-range `choose` (ARTH 300-499, excluding " +
      "ARTH488) for the remaining six, following the amst-major-2026-27.ts pattern.",
    "Supporting Area ('three courses at the 3xx or 4xx level outside the Art History and Archaeology " +
      "Department...must cohere around a broad area of study') is encoded as a `concentration` (9 credits, " +
      "300-499 level, excluding ARTH) matching the 'cohere' shape.",
    "Possible catalog-vs-department disagreement: the four-year plan's term grid lists four numbered " +
      "'Supporting Area' slots (#1-#4) where the catalog's own requirement text specifies three supporting-" +
      "area courses (9 credits, part of the stated 42-credit major total). Given the source PDF's garbled, " +
      "column-interleaved conversion (see the plan's own notes), this may be an OCR/layout artifact rather " +
      "than a genuine fourth course, so the clearer catalog text (3 courses / 9 credits) was encoded. " +
      "Flagged in docs/project/owner-review.md for adjudication under the department-wins ruling.",
    "Not encoded (no enumerable source, informational only): 'Majors should complete the 2xx-level surveys " +
      "before they enroll in 3xx- or 4xx-level courses' (sequencing advice, not a requirement) and ARTH488's " +
      "own enrollment gate (75+ total credits and 9+ credits of 3xx ARTH, or department permission) -- the " +
      "engine has no prerequisite/eligibility-gate concept.",
    "Not encoded (engine gap: no requirement type caps credits by specific course number within a `choose` " +
      "pool): the catalog's per-course credit caps on special-topics numbers (at most 3 credits of 269/289, " +
      "6 credits of 369, 6 credits of 389).",
    "Not encoded (engine gaps): residency rules (implied by ARHU norms; " +
      "not restated on this program's own catalog page), and the 120-credit graduation minimum stated on " +
      "the four-year plan. Program GPA 2.0 encoded as minGpa.",
  ],
  requirements: [
    {
      kind: "course",
      id: "artt100-or-110",
      name: "Two-Dimensional Design Fundamentals (ARTT100) or Elements of Drawing I (ARTT110)",
      options: ["ARTT100", "ARTT110"],
    },
    {
      kind: "choose",
      id: "arth-2xx",
      name: "Select three ARTH courses at the 2xx level, one of which may be a Big Question course",
      count: 3,
      from: {
        departments: ["ARTH"],
        minNumber: 200,
        maxNumber: 299,
      },
    },
    {
      kind: "course",
      id: "arth488",
      name: "Art History Seminar (ARTH488)",
      options: ["ARTH488"],
    },
    {
      kind: "choose",
      id: "arth-3xx-4xx",
      name: "Select six additional ARTH courses at the 3xx or 4xx level",
      count: 6,
      from: {
        departments: ["ARTH"],
        minNumber: 300,
        maxNumber: 499,
        exclude: ["ARTH488"],
      },
    },
    {
      kind: "concentration",
      id: "supporting-area",
      name: "Supporting Area: three courses at the 3xx or 4xx level outside the Art History and " +
        "Archaeology Department, cohering around a broad area of study",
      credits: 9,
      minNumber: 300,
      maxNumber: 499,
      excludeDepartments: ["ARTH"],
    },
  ],
};

export const arthMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Art History",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art-history-archaeology/art-history-major/",
    department: "https://drive.google.com/uc?export=download&id=1bXaa5dhAxm54n7XLoYOmgO7Drnt3PYXV#Art-History",
  },
};
