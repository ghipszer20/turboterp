// African Studies Minor, 2026–27 UMD Academic Catalog (African American and Africana Studies).
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/african-american-africana-studies/african-studies-minor/
// (fetched 2026-09-28). No department page was provided (department page not checked). No
// official published sample plan (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const AREA1 = [
  "AAAS310", "AAAS398", "AAAS468", "CMLT235", "ENGL360", "ENGL368", "HIST254", "HIST310", "HIST319", "HIST428",
];
const AREA2 = [
  "AAAS190", "AAAS410", "AAAS398", "AAAS468", "AREC365", "ECON315", "GEOG130", "GEOG422", "GVPT282",
];
// Every listed course numbered 300 or higher (the source's "upper level").
const UPPER = [
  "AAAS310", "AAAS398", "AAAS410", "AAAS468", "ENGL360", "ENGL368", "HIST310", "HIST319", "HIST428",
  "AREC365", "ECON315", "GEOG422",
];

export const aaasMinorAfricanStudies: Program = {
  id: "aaas-minor-african-studies",
  name: "African Studies Minor",
  catalogYear: "2026-27",
  source: "UMD Academic Catalog 2026–27, African Studies Minor (fetched 2026-09-28); department page not checked",
  verified: false,
  reviewNotes: [
    "Department page not checked (none provided); encoded from the catalog alone.",
    "Area 1 'LANGUAGE: any approved African language course' (Igbo, Twi, Yoruba; Swahili through the Big Ten Alliance) names no subject prefix or course numbers, so it can't be encoded as a course filter; manual check. A student using a language course for Area 1 will show that slot as unfinished. 'Other relevant courses with permission of the program' (advisor-approved list) is likewise not encoded. Marked advisorMayApprove (area1, area2): other courses may count with advisor approval; only the listed courses count.",
    "'Two must be at the upper level' is encoded as an overlay requiring 2 courses numbered 300+ from the union of the two areas' lists; the source doesn't define 'upper level', assumed 300+.",
    "AAAS398 and AAAS468 appear in both areas; a course counts toward one area only (the audit's default), so a student needs distinct courses for the two areas. Topic conditions (ENGL368 'must be approved', HIST319 'The African City...', HIST428B) aren't modeled; any section is accepted.",
    "The Capstone (AAAS400, AAAS402 or AAAS468Z; optional, raises the total from 15 to 18 credits) is not encoded.",
    "No grade minimum, sharing cap or eligibility rule is stated; none encoded.",
  ],
  requirements: [
    { kind: "course", id: "aaas200", name: "African Civilization", options: ["AAAS200"] },
    { kind: "choose", id: "area1", name: "Area 1: History, Culture, and Language (2 courses)", count: 2, from: { courses: AREA1 }, advisorMayApprove: true },
    { kind: "choose", id: "area2", name: "Area 2: Politics, Society, and Development (2 courses)", count: 2, from: { courses: AREA2 }, advisorMayApprove: true },
    {
      kind: "choose",
      id: "upper-level",
      name: "Two of the four area courses at the upper level (300+)",
      overlay: true,
      count: 2,
      from: { courses: UPPER },
    },
  ],
};

export const aaasMinorAfricanStudiesMeta: ProgramMeta = { kind: "minor", college: "BSOS", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/african-american-africana-studies/african-studies-minor/" } };
