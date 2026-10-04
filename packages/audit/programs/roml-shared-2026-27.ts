// Shared per-language requirement building blocks for the Romance Languages Major's three tracks
// (French & Italian, French & Spanish, Italian & Spanish), 2026-27 UMD Academic Catalog. Not a
// program file itself (no `*Meta` export, so the registry generator ignores it); imported by
// roml-major-*-2026-27.ts, which each combine two of these three language blocks plus their own
// "additional 4xx course in one of the two languages" requirement.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/romance-languages/romance-languages-major/
// (fetched 2026-09-28); see program-sources/romance-languages-major.md. Catalog: "Select two of the
// following: French, Italian, Spanish | 42" (each language block is 21 credits) plus "Additional
// Requirement for ROML Majors: one additional course at the 4xx level in one of the two languages |
// 3", total 45.

import type { Requirement } from "../src/audit.ts";

/** Named French requirement courses; excluded from the FREN4xx elective pool below so a required
 * course can't also satisfy the elective slot instead of its own (matches fren-major-2026-27's
 * pattern). None of these are 4xx-numbered, so the exclusion has no practical effect today, but is
 * kept for defense if the catalog ever renumbers one into the 4xx range. */
export const REQUIRED_FREN_ROML_COURSES = ["FREN204", "FREN250", "FREN301", "FREN351", "FREN352"];

/** French Requirements (21 credits): FREN204, FREN250, FREN301, FREN351, FREN352, plus "Two
 * additional literature or civilization courses at the 4xx level" (6 credits). */
export const frenRomlCore: Requirement[] = [
  { kind: "course", id: "fren204", name: "French Grammar and Composition", options: ["FREN204"] },
  { kind: "course", id: "fren250", name: "Introduction to Cultural and Textual Analysis", options: ["FREN250"] },
  { kind: "course", id: "fren301", name: "Composition and Style", options: ["FREN301"] },
  { kind: "course", id: "fren351", name: "From Romanticism to the Age of Modernism and Beyond", options: ["FREN351"] },
  { kind: "course", id: "fren352", name: "From the Age of Epic and Romance to the Enlightenment", options: ["FREN352"] },
  {
    kind: "choose",
    id: "fren-4xx",
    name: "Two additional literature or civilization courses at the 4xx level",
    credits: 6,
    from: { departments: ["FREN"], minNumber: 400, maxNumber: 499, exclude: REQUIRED_FREN_ROML_COURSES },
  },
];

/** Named Italian requirement courses (the 3xx elective's own four options plus the 4xx pool's own
 * exclusion); excluded from the ITAL4xx elective pool below. ITAL478 (the colloquium) is excluded
 * there too -- it has its own bucket, see below (matches ital-major-2026-27's pattern). */
export const REQUIRED_ITAL_ROML_COURSES = ["ITAL207", "ITAL301", "ITAL351", "ITAL352", "ITAL361", "ITAL362", "ITAL478"];

/** Italian Requirements (21 credits): ITAL207, ITAL301, one additional 3xx literature/culture
 * course (ITAL351, ITAL352, ITAL361 or ITAL362), plus "Three additional literature or civilization
 * courses at the 4xx level with 1 credit colloquium" (12 credits total), encoded as 9 credits of
 * ITAL4xx electives plus 3 credits of the ITAL478 colloquium (matches ital-major-2026-27's split --
 * the engine can't check that a specific ITAL478 section accompanies a specific 4xx course). */
export const italRomlCore: Requirement[] = [
  { kind: "course", id: "ital207", name: "Speaking and Writing in Italian", options: ["ITAL207"] },
  { kind: "course", id: "ital301", name: "Italian Composition", options: ["ITAL301"] },
  {
    kind: "choose",
    id: "ital-3xx-elective",
    name: "Select one additional course at the 3xx level in literature or culture",
    count: 1,
    from: { courses: ["ITAL351", "ITAL352", "ITAL361", "ITAL362"] },
  },
  {
    kind: "choose",
    id: "ital-4xx",
    name: "Three additional literature or civilization courses at the 4xx level",
    credits: 9,
    from: { departments: ["ITAL"], minNumber: 400, maxNumber: 499, exclude: REQUIRED_ITAL_ROML_COURSES },
  },
  {
    kind: "choose",
    id: "ital478-colloquia",
    name: "ITAL478 colloquium (one 1-credit section for each ITAL4xx course above)",
    credits: 3,
    from: { courses: ["ITAL478"] },
  },
];

/** Spanish Requirements (21 credits): SPAN207, SPAN301, SPAN303, "select two courses from one of
 * the following options" (Option I: SPAN331/332/333, Option II: SPAN361/362/363 -- modeled as a
 * `sets` requirement so a student can't mix courses from both options into one "two"), plus "Two
 * literature or civilization courses at the 4xx level" (6 credits). */
export const spanRomlCore: Requirement[] = [
  { kind: "course", id: "span207", name: "Reading and Writing in Spanish", options: ["SPAN207"] },
  { kind: "course", id: "span301", name: "Advanced Grammar and Composition I", options: ["SPAN301"] },
  {
    kind: "course",
    id: "span303",
    name: "Approaches to Cultural Materials in the Hispanic World",
    options: ["SPAN303"],
  },
  {
    kind: "sets",
    id: "span-culture-option",
    name: "Select two courses from one of the following options: Option I (SPAN331, SPAN332, SPAN333) or " +
      "Option II (SPAN361, SPAN362, SPAN363)",
    options: [
      [{ count: 2, from: { courses: ["SPAN331", "SPAN332", "SPAN333"] } }],
      [{ count: 2, from: { courses: ["SPAN361", "SPAN362", "SPAN363"] } }],
    ],
  },
  {
    kind: "choose",
    id: "span-4xx",
    name: "Two literature or civilization courses at the 4xx level",
    credits: 6,
    from: { departments: ["SPAN"], minNumber: 400, maxNumber: 499 },
  },
];

/** reviewNotes common to all three tracks (catalog-wide rules, engine gaps). Each track file
 * appends its own track-specific notes to this array. */
export const romlCommonReviewNotes: string[] = [
  "Department page vs. catalog: no disagreement found. All three of the College of Arts and " +
    "Humanities' official four-year plans list exactly the catalog's course sets for each language " +
    "block (French: FREN204/250/301/351/352 + two FREN4xx; Italian: ITAL207/301 + one of " +
    "ITAL351/352/361/362 + three ITAL4xx + three ITAL478 colloquia; Spanish: SPAN207/301/303 + " +
    "'choose two' from one Option (SPAN331/332/333 or SPAN361/362/363) + two SPAN4xx), plus a " +
    "French-or-Italian(-or-Spanish) 'elective' slot matching the catalog's 'one additional 4xx " +
    "course in one of the two languages'. ITAL204 appears in the term grids but only as a " +
    "prerequisite for ITAL207 (footnote: 'pre-requisites: ITAL 103/121, 203/122, and 204 or " +
    "equivalent'), matching the pre-major sequence pattern used by fren-major-2026-27 and " +
    "ital-major-2026-27; it is not part of the major's 45 credits and is not encoded here.",
  "ITAL351 and ITAL352 (the 3xx elective's first two options) have no title text in the catalog's " +
    "own source table -- likely the same PDF/HTML-to-text garbling seen elsewhere in this batch, not " +
    "evidence the numbers are stale. Used as named in the source per the department-page-wins " +
    "ruling; please confirm both are still active course numbers.",
  "'Select two of the following: French, Italian, Spanish | 42' (two 21-credit language blocks) " +
    "plus 'one additional course at the 4xx level in one of the two languages | 3' is encoded per " +
    "track (one track per language pair) rather than as a generic 'pick any two of three' rule, " +
    "since the engine has no primitive for choosing which two of three named blocks apply -- this " +
    "matches the pattern used for the Linguistics major's two tracks (ling-shared-2026-27.ts).",
  "Not encoded (no prerequisite-ordering concept in the engine): 'Students must take " +
    "language-acquisition courses sequentially. Once credit has been received in a higher level " +
    "language acquisition or grammar course, a lower level course may not be taken for credit.'",
  "Not encoded (engine gaps, matches other ARHU-language-major precedent): residency " +
    "rules (30 credits at UMD, 15 of the final 30 at the 300-400 level, 12 upper-level major credits " +
    "at UMD); and the 120-credit graduation minimum.",
];
