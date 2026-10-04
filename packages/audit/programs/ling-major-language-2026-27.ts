// Linguistics Major, Language Track, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/linguistics/linguistics-major/;
// the College of Arts and Humanities' official Linguistics - Language Four Year Academic Plan
// (department source),
// https://drive.google.com/uc?export=download&id=1N4Sf-yodBQvBImqf8enLGN1g3ookBpCy#Music-Education---Language
// (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page/plan and the catalog disagree,
// follow the department source. No disagreement found -- see reviewNotes.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { lingCoreRequired, lingCoreSelectTwo, lingCoreElectives, lingCommonReviewNotes } from "./ling-shared-2026-27.ts";

// Department prefixes eligible as "a single chosen language". The catalog names no list; reused
// from glbc-major-2026-27.ts's LANGUAGE_PREFIXES (that major's own catalog footnote 1: "language
// study may be in any of these prefixes"), plus LATN and GREK (Classics' language departments,
// confirmed real via clas-major-latin-2026-27.ts) since Latin/Greek are plainly "a language" too.
// Approximation, not a source-given list -- flagged in docs/project/owner-review.md.
const LANGUAGE_DEPTS = [
  "ARAB", "CHIN", "FREN", "GERS", "HEBR", "ITAL", "JAPN", "KORA", "LATN", "GREK", "PERS", "PORT", "RUSS", "SPAN",
];

export const lingMajorLanguage: Program = {
  id: "ling-major-language",
  name: "Linguistics Major (Language)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Linguistics Major (Language Track) " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/linguistics/linguistics-major/); " +
    "College of Arts and Humanities, official Linguistics - Language Four Year Academic Plan " +
    "(department source), " +
    "https://drive.google.com/uc?export=download&id=1N4Sf-yodBQvBImqf8enLGN1g3ookBpCy#Music-Education---Language " +
    "(fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Track: '12 credits of a single chosen language' names no department list (see LANGUAGE_DEPTS " +
      "above -- approximated, not source-given). Two further gaps, both engine limitations: (1) the " +
      "'single' constraint (one department only) is NOT enforced -- a `choose` over multiple " +
      "departments would incorrectly accept a mix of, say, FREN and SPAN credits, since no requirement " +
      "type restricts a choose pool to whichever one department the student happens to pick (the " +
      "`concentration` kind does that but has no department allow-list, so it can't also be restricted " +
      "to 'a language'). (2) 'At least 3 of the 12 credits must be at or above the 2xx level' is " +
      "approximated as an overlay requiring at least one course (not credits) at 2xx-4xx, since no " +
      "requirement type expresses a credit-count floor within a larger credit pool. Flagged in " +
      "docs/project/owner-review.md.",
    "'The 12 credits ... must be courses that focus on language (and not, for example, history, " +
      "literature or culture taught in the language)' (catalog) is not enforced: the engine has no way " +
      "to distinguish a language-focused course from a literature/culture/history course within the " +
      "same department by course number alone.",
    "'The structure or history of the language course is no longer required for the Language Track " +
      "but such a course can be taken to count towards the 12 credits' (catalog) needs no separate " +
      "encoding -- it's already eligible via the department-wide pool above.",
    ...lingCommonReviewNotes,
  ],
  requirements: [
    ...lingCoreRequired,
    lingCoreSelectTwo,
    lingCoreElectives,
    {
      kind: "choose",
      id: "track-language",
      name: "Track: 12 credits of a single chosen language",
      credits: 12,
      from: { departments: LANGUAGE_DEPTS },
    },
    {
      kind: "choose",
      id: "track-language-2xx-plus",
      name: "Track: at least one of the language courses at or above the 2xx level (approximates 'at least 3 of the 12 credits')",
      count: 1,
      overlay: true,
      from: { departments: LANGUAGE_DEPTS, minNumber: 200, maxNumber: 499 },
    },
  ],
};

export const lingMajorLanguageMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Linguistics (Language)",
  major: "ling",
  track: "Language",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/linguistics/linguistics-major/",
    department:
      "https://drive.google.com/uc?export=download&id=1N4Sf-yodBQvBImqf8enLGN1g3ookBpCy#Music-Education---Language",
  },
};
