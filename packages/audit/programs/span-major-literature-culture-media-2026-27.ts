// Spanish Language, Literatures, and Culture Major, Spanish and Latin American Literature,
// Culture, and Media Track ("Track 1" in the catalog), 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/spanish-language-literatures-culture/spanish-language-literatures-culture-major/;
// the College of Arts and Humanities' official "Spanish and Latin American Literature, Culture,
// and Media" Four Year Academic Plan (department source),
// https://drive.google.com/uc?export=download&id=1eL0ki-g1XSznVOHn0HAHu_yuCddYjLpq#Spanish-and-Latin-American-Literature,-Culture,-and-Media
// (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md, 2026-09-26): where the department page/plan and the
// catalog disagree, the department page wins. No disagreement found -- see reviewNotes.
// This is the catalog's first-listed track ("Select one of the following Tracks: Track 1: Spanish
// and Latin American Literature, Culture, and Media / Track 2: ... / Track 3: ..."), so it carries
// `defaultTrack: true`.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  spanCoreRequired,
  spanCoreSequence,
  spanSupportingArea,
  spanLcmElectives,
  spanCommonReviewNotes,
  SPAN_LCP_COURSES,
  SPAN_LCP_4XX,
} from "./span-shared-2026-27.ts";

export const spanMajorLiteratureCultureMedia: Program = {
  id: "span-major-literature-culture-media",
  name: "Spanish Language, Literatures, and Culture Major (Spanish and Latin American Literature, Culture, and Media)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Spanish Language, Literatures, and Culture Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/spanish-language-literatures-culture/spanish-language-literatures-culture-major/); " +
    "College of Arts and Humanities, official Spanish and Latin American Literature, Culture, and " +
    "Media Four Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1eL0ki-g1XSznVOHn0HAHu_yuCddYjLpq#Spanish-and-Latin-American-Literature,-Culture,-and-Media " +
    "(fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Track: 'Select one of the following' (3 credits) is SPAN318, SPAN370, SPAN371, SPAN372, " +
      "SPAN373, SPAN374, SPAN375, or SPAN480 -- named directly by the catalog (SPAN318 has no title " +
      "given there, kept as named).",
    "Track: 'Select four 4xx-level courses in Spanish or Latin American Literature, Culture, and " +
      "Media' (12 credits) has no course list in the catalog beyond distinguishing it from the " +
      "'language, culture, and professional contexts' courses (SPAN370/371/372/373/374/375/422/480), " +
      "so it is modeled as the whole SPAN 4xx range minus those (never narrower -- see " +
      "docs/project/program-batches.md). Flagged in docs/project/owner-review.md.",
    "Department plan vs. catalog: no disagreement found. The plan's course list (SPAN203/103/204 " +
      "prerequisites; SPAN301/306, SPAN207/206, SPAN303, SPAN311/316; SPAN331/361, SPAN332/362, " +
      "SPAN333/363; four 'SPAN 4xx (Literature, Culture, Media)' slots and 'SPAN 318, 370, 371, 372, " +
      "373, 374, 375, 470' as the one Language/Professional-Contexts pick; a Supporting Area) matches " +
      "the catalog's Track 1 structure. Note the plan's professional-contexts pick list says 'SPAN " +
      "... 470' where the catalog's own Track 1 table says 'SPAN480' -- flagged below.",
    "Disagreement: the department plan's Track-1 'Choice of Spanish or Latin American Focus' legend " +
      "lists the one-course pick as 'SPAN 318, 370, 371, 372, 373, 374, 375, 470', but the catalog's " +
      "Track 1 table lists 'SPAN480' (Spanish for Business II) in that same slot, not SPAN470. Per " +
      "the owner's department-page-wins ruling this is encoded with the department plan's SPAN470 " +
      "swapped in for the catalog's SPAN480 -- but 470 is not in the approved SPAN course list the " +
      "owner supplied for unnamed slots, while SPAN480 IS a real, named catalog course. To avoid " +
      "inventing or dropping a course number, BOTH SPAN470 and SPAN480 are kept as options in this " +
      "requirement (encoding what either source says, never narrower). Flagged in " +
      "docs/project/owner-review.md for the owner to confirm which is correct.",
    "The four-year plan PDF's term-grid text conversion is garbled (Fall/Spring columns and the Gen " +
      "Ed/Major-Requirements legend appear interleaved), but the major course list and its relative " +
      "order (SPAN207/206 -> SPAN301/306 -> SPAN303 -> SPAN311/316 -> SPAN331/361 -> SPAN332/362 -> " +
      "SPAN333/363, professional-contexts pick, four 4xx Literature/Culture/Media courses, three " +
      "Supporting Area slots) are legible. `packages/programs/sample-plans/span-major-literature-culture-media.json` " +
      "is `official: true`, but its exact year/semester placement is reconstructed from that ordering, " +
      "not read verbatim. Flagged in docs/project/owner-review.md.",
    ...spanCommonReviewNotes,
  ],
  requirements: [
    ...spanCoreRequired,
    spanCoreSequence,
    {
      kind: "choose",
      id: "track-lcp-pick",
      name: "Track: select one of SPAN318, SPAN370, SPAN371, SPAN372, SPAN373, SPAN374, SPAN375, " +
        "SPAN480 (department plan also names SPAN470 in this slot -- see reviewNotes)",
      count: 1,
      credits: 3,
      from: { courses: [...SPAN_LCP_COURSES, ...SPAN_LCP_4XX, "SPAN470"] },
    },
    spanLcmElectives(
      "track-lcm-electives",
      "Track: select four 4xx-level courses in Spanish or Latin American Literature, Culture, and Media",
      4,
      12,
    ),
    spanSupportingArea,
  ],
};

export const spanMajorLiteratureCultureMediaMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Spanish (Literature, Culture, and Media)",
  major: "span",
  track: "Spanish and Latin American Literature, Culture, and Media",
  defaultTrack: true,
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/spanish-language-literatures-culture/spanish-language-literatures-culture-major/",
    department:
      "https://drive.google.com/uc?export=download&id=1eL0ki-g1XSznVOHn0HAHu_yuCddYjLpq#Spanish-and-Latin-American-Literature,-Culture,-and-Media",
  },
};
