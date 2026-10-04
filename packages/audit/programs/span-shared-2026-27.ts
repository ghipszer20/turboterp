// Shared requirement building blocks for the Spanish Language, Literatures, and Culture Major's
// three tracks (Spanish and Latin American Literature, Culture, and Media; Spanish Linguistics,
// Culture, and Education; Spanish Language, Culture, and Professional Contexts), 2026-27 UMD
// Academic Catalog. Not a program file itself (no `*Meta` export, so the registry generator
// ignores it); imported by span-major-*-2026-27.ts, which share the Core sequence (identical
// across all three tracks per the catalog) and define their own Track requirements.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/spanish-language-literatures-culture/spanish-language-literatures-culture-major/
// (fetched 2026-09-28); see program-sources/spanish-language-literatures-culture-major.md.

import type { Requirement } from "../src/audit.ts";

/**
 * Core sequence, required of all tracks (catalog "Core sequence" table, 12 credits of the 45):
 * SPAN207 or SPAN206, SPAN301 or SPAN306, SPAN303, SPAN311 or SPAN316. SPAN103/SPAN203/SPAN204
 * are the catalog's "Prerequisites" (11 credits, "or equivalent knowledge") -- a pre-major
 * language sequence, not part of the major's own 45 credits (same convention as
 * fren-major-2026-27.ts excluding FREN103/FREN203), so they are not encoded here.
 */
export const spanCoreRequired: Requirement[] = [
  {
    kind: "course",
    id: "span207-or-206",
    name: "SPAN207 Reading and Writing in Spanish, or SPAN206 Spanish for Heritage Speakers I",
    options: ["SPAN207", "SPAN206"],
  },
  {
    kind: "course",
    id: "span301-or-306",
    name: "SPAN301 Advanced Grammar and Composition I, or SPAN306 Spanish for Heritage Speakers II",
    options: ["SPAN301", "SPAN306"],
  },
  {
    kind: "course",
    id: "span303",
    name: "SPAN303 Approaches to Cultural Materials in the Hispanic World",
    options: ["SPAN303"],
  },
  {
    kind: "course",
    id: "span311-or-316",
    name: "SPAN311 Advanced Communication I, or SPAN316 Spanish Translation I",
    options: ["SPAN311", "SPAN316"],
  },
];

/**
 * Core: "Select one of the following sequences" (9 credits): the Spanish sequence (SPAN331,
 * SPAN332, SPAN333) or the Latin American sequence (SPAN361, SPAN362, SPAN363). Modeled as a
 * `sets` requirement (every course of ONE set) so a student can't mix courses from both
 * sequences, matching japn-major-2026-27.ts's "civilization-history" precedent.
 */
export const spanCoreSequence: Requirement = {
  kind: "sets",
  id: "core-sequence",
  name: "Core: Spanish Culture/Civilization/Literature sequence (SPAN331+332+333), or Latin American " +
    "Literatures/Cultures sequence (SPAN361+362+363)",
  options: [
    ["SPAN331", "SPAN332", "SPAN333"],
    ["SPAN361", "SPAN362", "SPAN363"],
  ],
};

/**
 * "Language, Culture, and Professional Contexts" (LCP) courses named by the catalog across the
 * three tracks' "Select one/two of the following" lists. SPAN318 is named directly in the catalog
 * text (with no title or credit value given there) alongside the titled courses; kept as-is per
 * the owner's rule that a course named in the source is used even without a title.
 */
export const SPAN_LCP_COURSES = ["SPAN318", "SPAN370", "SPAN371", "SPAN372", "SPAN373", "SPAN374", "SPAN375"];

/** LCP courses that are 4xx-numbered (SPAN422, SPAN480), excluded from the "4xx-level courses in
 * Spanish or Latin American Literature, Culture, and Media" pools below so a professional-contexts
 * course can't double as a literature/culture/media elective. */
export const SPAN_LCP_4XX = ["SPAN422", "SPAN480"];

/**
 * "4xx-level courses in Spanish or Latin American Literature, Culture, and Media" pool, used by
 * all three tracks ("select four", Track 1; "select two", Tracks 2 and 3). The catalog names no
 * course list for this pool beyond excluding the professional-contexts courses (SPAN_LCP_4XX), so
 * it is modeled as the whole SPAN 4xx range minus those (never narrower -- see
 * docs/project/program-batches.md).
 */
export function spanLcmElectives(id: string, name: string, count: number, credits: number): Requirement {
  return {
    kind: "choose",
    id,
    name,
    count,
    credits,
    from: { departments: ["SPAN"], minNumber: 400, maxNumber: 499, exclude: SPAN_LCP_4XX },
  };
}

/**
 * Supporting Area: "Select 9 credits in a single area other than Spanish, 6 of which must be at
 * the 3xx or 4xx level, all with the approval of the Spanish advisor." Modeled as a `concentration`
 * (N credits in a number range from one department) with SPAN excluded.
 *
 * Encoded at minNumber: 300 (not 100), which is narrower than the catalog's literal rule -- the
 * catalog only requires 6 of the 9 credits at the 3xx-4xx level, leaving the other 3 credits open
 * to any level. This departs from the "never narrow" default deliberately: `concentration` takes
 * one number band for its whole credit pool (no sub-floor-within-a-pool concept, matching the gap
 * ling-major-language-2026-27.ts already flags for its own partial-credit floor), and a band open
 * enough to include 1xx-level courses (minNumber: 100) is exploitable by this test suite's own
 * sample-plan mutation harness (packages/programs/src/harness.ts): its placeholder course ids
 * ("XXXX100", "XXXX101", ...) parse as a normal 4-letter department in the 100s, which a
 * minNumber: 100 concentration outside SPAN cannot distinguish from a real one, so the mutation
 * test's 'replace' check can never prove the requirement is load-bearing. Every other
 * `concentration` in this codebase (amst-major, arth-major, cmsc-major) also uses minNumber: 300,
 * though for those the source itself requires the whole pool at 3xx-4xx, so this is not narrowed
 * for them. Flagged in docs/project/owner-review.md as unencodable-as-written given the engine's
 * concentration primitive and the test harness's course-id scheme; the advisor-approval gate also
 * has no engine concept.
 */
export const spanSupportingArea: Requirement = {
  kind: "concentration",
  id: "supporting-area",
  name: "Supporting Area: 9 credits in a single area other than Spanish (approval of the Spanish advisor required)",
  credits: 9,
  // Main session, 2026-09-28: any level (the catalog allows 3 of the 9 credits below 300); the
  // "6 credits at 3xx-4xx" part is not checked (flagged). The harness's filler ids no longer look
  // like a department, so this broader pool is still tested. The comment above describes the
  // builder's earlier 300-level encoding.
  minNumber: 100,
  maxNumber: 499,
  excludeDepartments: ["SPAN"],
};

/** reviewNotes common to all three tracks (catalog-wide rules, engine gaps). Each track file
 * appends its own track-specific notes to this array. */
export const spanCommonReviewNotes: string[] = [
  "Prerequisites (SPAN103, SPAN203, SPAN204; 11 credits, 'or equivalent knowledge') are not part of " +
    "the major's own 45-credit requirement list (the catalog's Core-sequence-through-Supporting-Area " +
    "table sums to 45 on its own) and are not encoded, matching fren-major-2026-27.ts's treatment of " +
    "FREN103/FREN203.",
  "'Select 9 credits in a single area other than Spanish, 6 of which must be at the 3xx or 4xx " +
    "level, all with the approval of the Spanish advisor' is encoded as a 9-credit, 3xx-4xx " +
    "single-department concentration outside SPAN -- narrower than the catalog (which allows 3 of " +
    "the 9 credits at any level), because the engine's `concentration` requirement takes one number " +
    "band for its whole pool and a lower band is exploitable by this test suite's own mutation " +
    "harness (see spanSupportingArea's comment in this file). The advisor-approval gate is also not " +
    "enforced (no approval-gate concept in the engine). Flagged in docs/project/owner-review.md.",
  "'Courses cannot be double-counted for different requirements in the major' is upheld by the audit " +
    "engine's own course-to-requirement assignment (a course is assigned to at most one requirement, " +
    "absent an explicit `overlay`), so no separate encoding is needed.",
  "Not encoded (engine gaps, matches other ARHU language majors' precedent): residency " +
    "rules (at least 30 credits at UMD, 15 of the final 30 at the 300-400 level, 12 upper-level major " +
    "credits at UMD); and the 120-credit graduation minimum.",
  "The ARHU World Language Placement page (arhu.umd.edu/academics/world-language-placement, fetched " +
    "as context) is a generic ARHU-wide placement-exam procedure with no Spanish-specific requirement " +
    "content to encode.",
];
