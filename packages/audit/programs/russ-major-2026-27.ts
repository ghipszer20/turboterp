// Russian Language and Literature Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/
// russian-language-literature/russian-language-literature-major/; the ARHU world-language-placement
// page (arhu.umd.edu/academics/world-language-placement -- generic ARHU-wide placement-exam
// procedure, no Russian-specific requirement content, context only); College of Arts and Humanities
// official four-year academic plan for Russian (Google Drive PDF, converted to text, fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md, 2026-09-26): where the department page (the college's own
// four-year plan counts as one) and the Academic Catalog disagree, the department page wins.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const russMajor: Program = {
  id: "russ-major",
  name: "Russian Language and Literature Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Russian Language and Literature Major; " +
    "College of Arts and Humanities official four-year academic plan for Russian, " +
    "fetched 2026-09-28 (https://drive.google.com/uc?export=download&id=1Z_eMIfEE0R2R1ipjzgVF7pQcOaxzJ2vb#Russian)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page vs. catalog: no disagreement found. The ARHU world-language-placement page has " +
      "no Russian-specific requirement content (only a generic ARHU-wide placement-exam procedure " +
      "description), so there's nothing on it to conflict with the catalog. The college's official " +
      "four-year plan (a department source under the owner's ruling) confirms the catalog's own list " +
      "of 10 RUSS course slots -- RUSS201, RUSS202, RUSS301, RUSS302, one additional 3xx, RUSS401, " +
      "RUSS402, one additional 4xx, and two 3xx/4xx electives 'in Russian' -- in the same order, in its " +
      "own 'Major Requirements' checklist sidebar. No additional or different courses are named.",
    "Catalog arithmetic: the catalog's own table states 'Total Credits: 40', but summing its own listed " +
      "rows (5+5+3+3+3+3+3+3+6) gives 34, not 40. Both the catalog's row list and the college's plan's " +
      "'Major Requirements' checklist independently agree on the same 10 course slots (34 credits), so " +
      "this looks like an error in the catalog's own total-credits cell. The engine doesn't check total " +
      "credits anyway (known gap, see below); flagging the mismatch for the owner to verify against the " +
      "live catalog page.",
    "Four-year plan PDF-to-text conversion is garbled the same way noted in other ARHU-language builds " +
      "(GERS): a per-benchmark sidebar box and the Fall/Spring columns are interleaved. Years 1 and 3 are " +
      "legible as a clean 2-column (Fall | Spring) grid once the benchmark box is read separately (Year 1: " +
      "RUSS101 Fall / RUSS102 Spring; Year 3: RUSS301 + one 3xx Fall / RUSS302 + one 'RUSS 3xx-4xx in " +
      "Russian' elective Spring). Year 2's raw text doesn't cleanly separate into the same 2-column shape " +
      "for RUSS201/RUSS202 -- both read as adjacent lines that could both land in the same column. Placed " +
      "RUSS201 in Year 2 Fall and RUSS202 in Year 2 Spring, following the one-course-per-term pattern the " +
      "legible Year 1 (101/102) and Year 3 (301/302) columns both show, and consistent with Benchmark 2's " +
      "own 'must be completed by the end of four semesters' deadline for RUSS202. This term placement is " +
      "reconstructed, not read verbatim -- flagged in docs/project/owner-review.md.",
    "Year 1 has no major courses: RUSS201 (the first major requirement) has RUSS101/RUSS102 as its own " +
      "prerequisite sequence, which per the plan's own footnote ('pre-requisites: RUSS 101 and 102 or " +
      "equivalent') is not part of the major's 40-credit requirement list, so it's left out of the sample " +
      "plan per the pattern used by other language majors' sample plans (only the major itself is audited).",
    "Plan slots with no course named by the source (one additional 3xx, one additional 4xx, two 3xx/4xx " +
      "electives) are filled in the sample plan with RUSS303, RUSS403, RUSS321, and RUSS334 respectively -- " +
      "real courses from the Academic Catalog's approved RUSS-course list (not named by the owner or by " +
      "either source for these specific slots; attributed to the Academic Catalog).",
    "Not encoded (no language-of-instruction attribute in the engine): the footnote 'Must be taught in " +
      "Russian' on the two 3xx/4xx elective slots. The sample plan's elective picks (RUSS321, RUSS334) " +
      "are not verified to be taught in Russian; the requirement itself accepts any RUSS 3xx/4xx course.",
    "Not encoded: 'One supporting course outside the department (at the 3xx or 4xx level) may be counted " +
      "toward the major with an advisor's prior approval' -- an optional, advisor-gated substitution, not " +
      "modeled.",
    "Not encoded: 'Once credit has been received in a higher level language-acquisition or grammar " +
      "course, a lower level course may not be taken for credit' -- a backward-credit/sequencing policy, " +
      "not a requirement structure the engine represents.",
    "Not encoded (engine gaps): residency rules (30 credits at UMD, " +
      "15 of the final 30 at the 300-400 level, 12 upper-level major credits at UMD), ARHU's 39 upper-" +
      "level-credit graduation requirement, and the 120-credit graduation minimum.",
  ],
  requirements: [
    { kind: "course", id: "russ201", name: "Intermediate Russian I", options: ["RUSS201"] },
    { kind: "course", id: "russ202", name: "Intermediate Russian II", options: ["RUSS202"] },
    { kind: "course", id: "russ301", name: "Advanced Russian I", options: ["RUSS301"] },
    { kind: "course", id: "russ302", name: "Advanced Russian II", options: ["RUSS302"] },
    {
      kind: "choose",
      id: "russ-3xx-additional",
      name: "One additional RUSS course at the 3xx level",
      credits: 3,
      from: { departments: ["RUSS"], minNumber: 300, maxNumber: 399 },
    },
    { kind: "course", id: "russ401", name: "Advanced Russian Composition", options: ["RUSS401"] },
    { kind: "course", id: "russ402", name: "Practicum in Written Russian", options: ["RUSS402"] },
    {
      kind: "choose",
      id: "russ-4xx-additional",
      name: "One additional RUSS course at the 4xx level",
      credits: 3,
      from: { departments: ["RUSS"], minNumber: 400, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "russ-electives",
      name: "Select two RUSS 3xx or 4xx level electives (must be taught in Russian)",
      credits: 6,
      from: { departments: ["RUSS"], minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const russMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Russian Language and Literature",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/russian-language-literature/russian-language-literature-major/",
    department: "https://drive.google.com/uc?export=download&id=1Z_eMIfEE0R2R1ipjzgVF7pQcOaxzJ2vb#Russian",
  },
};
