// Spanish Language, Literatures, and Culture Major, Spanish Language, Culture, and Professional
// Contexts Track ("Track 3" in the catalog), 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/spanish-language-literatures-culture/spanish-language-literatures-culture-major/;
// the College of Arts and Humanities' official "Language, Culture, and Professional Contexts" Four
// Year Academic Plan (department source),
// https://drive.google.com/uc?export=download&id=1Lz_BBrjv7AeI3bf8GHRH5cBrNQBC0baF#Language,-Culture,-and-Professional-Contexts
// (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md, 2026-09-26): where the department page/plan and the
// catalog disagree, the department page wins. See reviewNotes for one disagreement.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  spanCoreRequired,
  spanCoreSequence,
  spanSupportingArea,
  spanLcmElectives,
  spanCommonReviewNotes,
  SPAN_LCP_COURSES,
} from "./span-shared-2026-27.ts";

export const spanMajorLanguageCultureProfessionalContexts: Program = {
  id: "span-major-language-culture-professional-contexts",
  name: "Spanish Language, Literatures, and Culture Major (Spanish Language, Culture, and Professional Contexts)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Spanish Language, Literatures, and Culture Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/spanish-language-literatures-culture/spanish-language-literatures-culture-major/); " +
    "College of Arts and Humanities, official Language, Culture, and Professional Contexts Four " +
    "Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1Lz_BBrjv7AeI3bf8GHRH5cBrNQBC0baF#Language,-Culture,-and-Professional-Contexts " +
    "(fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Track: 'Select two of the following courses in Spanish in Language, Culture, and Professional " +
      "Contexts' (6 credits) is SPAN318, SPAN370, SPAN371, SPAN372, SPAN373, SPAN374, SPAN375 -- " +
      "named directly by the catalog.",
    "Track: 'Select two 4xx-level courses in Spanish or Latin American Literature, Culture, and " +
      "Media' (6 credits) has no course list in the catalog beyond distinguishing it from the " +
      "language, culture and professional contexts courses (SPAN370/371/372/373/374/375/422/480), " +
      "so it is modeled as the whole SPAN 4xx range minus those (never narrower -- see " +
      "docs/project/program-batches.md). Flagged in docs/project/owner-review.md.",
    "Disagreement: the department plan's legend for the second 'select one' slot reads 'SPAN 422 or " +
      "470' (both the Fall-term-grid cell and the legend), but the catalog's Track 3 table lists " +
      "'SPAN422 | Intercultural Communication and Negotiation' or 'SPAN480 | Spanish for Business " +
      "II' in that same slot, not SPAN470. The same substitution appears in the Track 1 plan (see " +
      "span-major-literature-culture-media-2026-27.ts). Per the owner's department-page-wins ruling " +
      "this would favor SPAN470, but SPAN470 is not in the approved SPAN course list the owner " +
      "supplied for unnamed slots, while SPAN480 IS a real, named catalog course, so both SPAN470 " +
      "and SPAN480 are kept as options (encoding what either source says, never narrower). Flagged " +
      "in docs/project/owner-review.md for the owner to confirm which is correct.",
    "The four-year plan PDF's term-grid text conversion is garbled (Fall/Spring columns and the Gen " +
      "Ed/Major-Requirements legend appear interleaved), but the major course list and its relative " +
      "order (SPAN207/206 -> SPAN301/306 -> SPAN303 -> SPAN311/316 -> SPAN331/361 -> SPAN332/362 -> " +
      "two language/professional-contexts picks -> SPAN333/363, two Literature/Culture/Media 4xx " +
      "courses, three Supporting Area slots) are legible. " +
      "`packages/programs/sample-plans/span-major-language-culture-professional-contexts.json` is " +
      "`official: true`, but its exact year/semester placement is reconstructed from that ordering, " +
      "not read verbatim. Flagged in docs/project/owner-review.md.",
    ...spanCommonReviewNotes,
  ],
  requirements: [
    ...spanCoreRequired,
    spanCoreSequence,
    {
      kind: "choose",
      id: "track-lcp-pick-two",
      name: "Track: select two of SPAN318, SPAN370, SPAN371, SPAN372, SPAN373, SPAN374, SPAN375",
      count: 2,
      credits: 6,
      from: { courses: SPAN_LCP_COURSES },
    },
    {
      kind: "choose",
      id: "track-lcp-pick-one",
      name: "Track: select one of SPAN422, SPAN480 (department plan also names SPAN470 in this slot -- see reviewNotes)",
      count: 1,
      credits: 3,
      from: { courses: ["SPAN422", "SPAN480", "SPAN470"] },
    },
    spanLcmElectives(
      "track-lcm-electives",
      "Track: select two 4xx-level courses in Spanish or Latin American Literature, Culture, and Media",
      2,
      6,
    ),
    spanSupportingArea,
  ],
};

export const spanMajorLanguageCultureProfessionalContextsMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Spanish (Language, Culture, and Professional Contexts)",
  major: "span",
  track: "Spanish Language, Culture, and Professional Contexts",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/spanish-language-literatures-culture/spanish-language-literatures-culture-major/",
    department:
      "https://drive.google.com/uc?export=download&id=1Lz_BBrjv7AeI3bf8GHRH5cBrNQBC0baF#Language,-Culture,-and-Professional-Contexts",
  },
};
