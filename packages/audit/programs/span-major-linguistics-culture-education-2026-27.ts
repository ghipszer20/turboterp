// Spanish Language, Literatures, and Culture Major, Spanish Linguistics, Culture, and Education
// Track ("Track 2" in the catalog), 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/spanish-language-literatures-culture/spanish-language-literatures-culture-major/;
// the College of Arts and Humanities' official "Linguistics, Culture, and Education" Four Year
// Academic Plan (department source),
// https://drive.google.com/uc?export=download&id=139qrMn2SvwHU7jkbVgDX6hNFt6wFi9Hj#Linguistics,-Culture,-and-Education
// (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md, 2026-09-26): where the department page/plan and the
// catalog disagree, the department page wins. No disagreement found -- see reviewNotes.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { spanCoreRequired, spanCoreSequence, spanSupportingArea, spanLcmElectives, spanCommonReviewNotes } from "./span-shared-2026-27.ts";

export const spanMajorLinguisticsCultureEducation: Program = {
  id: "span-major-linguistics-culture-education",
  name: "Spanish Language, Literatures, and Culture Major (Spanish Linguistics, Culture, and Education)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Spanish Language, Literatures, and Culture Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/spanish-language-literatures-culture/spanish-language-literatures-culture-major/); " +
    "College of Arts and Humanities, official Linguistics, Culture, and Education Four Year " +
    "Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=139qrMn2SvwHU7jkbVgDX6hNFt6wFi9Hj#Linguistics,-Culture,-and-Education " +
    "(fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Track: 'The approved program in Spanish and Secondary Education requires 2 upper-level courses " +
      "in literature and culture along with the three linguistics courses this option provides' is a " +
      "note about a related, separate Secondary Education program, not a rule of this major -- not " +
      "encoded.",
    "Department plan vs. catalog: no disagreement found. The plan's course list (SPAN325, SPAN425, " +
      "SPAN426, two 'SPAN 4xx (Lit., Culture, Media)' slots, plus the shared prerequisites, Core " +
      "sequence, Core-sequence-pick, and Supporting Area) matches the catalog's Track 2 structure " +
      "exactly.",
    "The four-year plan PDF's term-grid text conversion is garbled (Fall/Spring columns and the Gen " +
      "Ed/Major-Requirements legend appear interleaved), but the major course list and its relative " +
      "order (SPAN207/206 -> SPAN301/306 -> SPAN303 -> SPAN311/316 -> SPAN331/361 -> SPAN332/362 -> " +
      "SPAN325 -> SPAN425 -> SPAN426 -> SPAN333/363, two Literature/Culture/Media 4xx courses, three " +
      "Supporting Area slots) are legible. " +
      "`packages/programs/sample-plans/span-major-linguistics-culture-education.json` is `official: " +
      "true`, but its exact year/semester placement is reconstructed from that ordering, not read " +
      "verbatim. Flagged in docs/project/owner-review.md.",
    ...spanCommonReviewNotes,
  ],
  requirements: [
    ...spanCoreRequired,
    spanCoreSequence,
    { kind: "course", id: "span325", name: "SPAN325 Hispanic Linguistics I: Grammar and Society", options: ["SPAN325"] },
    { kind: "course", id: "span425", name: "SPAN425 Hispanic Linguistics II: Structures of Spanish", options: ["SPAN425"] },
    { kind: "course", id: "span426", name: "SPAN426 Hispanic Linguistics III: Language in Use", options: ["SPAN426"] },
    spanLcmElectives(
      "track-lcm-electives",
      "Track: select two 4xx-level courses in Spanish or Latin American Literature, Culture, and Media",
      2,
      6,
    ),
    spanSupportingArea,
  ],
};

export const spanMajorLinguisticsCultureEducationMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Spanish (Linguistics, Culture, and Education)",
  major: "span",
  track: "Spanish Linguistics, Culture, and Education",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/spanish-language-literatures-culture/spanish-language-literatures-culture-major/",
    department:
      "https://drive.google.com/uc?export=download&id=139qrMn2SvwHU7jkbVgDX6hNFt6wFi9Hj#Linguistics,-Culture,-and-Education",
  },
};
