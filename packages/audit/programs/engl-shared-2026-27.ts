// Shared requirement building blocks for the English Language and Literature Major's four tracks
// (Literary and Cultural Studies, Language Writing and Rhetoric, Media Studies, Creative Writing),
// 2026-27 UMD Academic Catalog. Not a program file itself (no `*Meta` export, so the registry
// generator ignores it); imported by engl-major-*-2026-27.ts, which share Elements 1, 2 and 4
// (identical across all four tracks per the catalog) and define their own Element 3 (Tracks).
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/english-language-literature/english-major/
// (fetched 2026-09-28); see program-sources/english-major.md.

import type { Requirement } from "../src/audit.ts";

/** Element 1: This is English: Fields and Methods 1. The catalog says ENGL301 must be taken
 * before, or concurrently with, other 3xx/4xx ENGL courses; not encoded (no prerequisite/sequencing
 * concept in the engine). */
export const englElement1: Requirement = {
  kind: "course",
  id: "engl301",
  name: "Element 1: This is English: Fields and Methods 1 (ENGL301)",
  options: ["ENGL301"],
};

/**
 * Element 2: Historical Studies (12 credits / 4 courses). The catalog names four broad periods
 * (Beginning/Medieval/Early Modern; Long Eighteenth Century; Long Nineteenth Century; Modern and
 * Contemporary) and requires courses in at least three of the four, but gives no course-to-period
 * list anywhere in the fetched source. Approximated as a generic 4-course choose over ENGL
 * 200-499 (matching the major's own "no more than two 1xx/2xx courses" cap by starting at 200);
 * the "at least 3 of 4 periods" distribution constraint is NOT enforced. Flagged in
 * docs/project/owner-review.md.
 */
export const englHistoricalStudies: Requirement = {
  kind: "choose",
  id: "historical-studies",
  name: "Element 2: Historical Studies (four courses, at least three of the four historical periods)",
  count: 4,
  from: { departments: ["ENGL"], minNumber: 200, maxNumber: 499, exclude: ["ENGL301"] },
};

/**
 * Element 4: Electives (9 credits). The catalog says elective credits "may be filled by any
 * English department course or any approved course outside of the department"; the outside-
 * department "approved course" allowance has no list in the fetched source, so it is NOT modeled
 * -- electives are an ENGL-only pool here. Flagged in docs/project/owner-review.md.
 */
export const englElectives: Requirement = {
  kind: "choose",
  id: "electives",
  name: "Element 4: Electives (any English department course; outside-department approved courses not modeled)",
  count: 3,
  credits: 9,
  from: { departments: ["ENGL"], minNumber: 200, maxNumber: 499, exclude: ["ENGL301"] },
};

/** reviewNotes common to all four tracks (catalog-wide rules, engine gaps). Each track file
 * appends its own track-specific notes to this array. */
export const englCommonReviewNotes: string[] = [
  "Not encoded (engine gap: no requirement type aggregates course level across multiple " +
    "requirements): 'No more than two courses at the 1xx- or 2xx- level may be counted toward the " +
    "major, and at least 12 credits must be at the 4xx-level' (catalog rule 1; the four-year plan " +
    "restates it as 'only two of the 12 ENGL courses may be taken at 1xx-2xx, and at least four of " +
    "the 12 ENGL courses must be at the 4xx level'). Historical Studies, Electives and each track's " +
    "generic choose pools start at ENGL 200 (not 100) so at most the un-enforced two 1xx/2xx slots " +
    "would need to come from outside those pools, but the aggregate cap itself is not checked.",
  "Not encoded (engine gap, matches other ARHU majors' precedent): residency rules; and the 120-credit graduation minimum.",
  "Not encoded: ENGL301 must be taken before, or concurrently with, a student's first other 3xx/4xx " +
    "ENGL course (catalog footnote 1) -- no term-sequencing concept in the engine.",
  "Not encoded: 'Up to six credits of ENGL388 (Internship) may be included..., but not all from the " +
    "same version' and 'No more than three credits of ENGL429 (Independent Study)' (catalog rules 3 " +
    "and 4) are per-course credit caps, not requirements to satisfy; no requirement type expresses a " +
    "cap on how much of a specific course counts. Neither course is used in the sample plan.",
  "'One 3xx- or 4xx-level course in literature, rhetoric, or media in a language other than English " +
    "... may count as an elective' (catalog rule 5) is a permissive elective-source expansion with " +
    "no named course list; not modeled -- the Electives pool here is ENGL-only, which only narrows, " +
    "never wrongly widens, what the engine will accept.",
  "Element 5 (Perspectives, Methods, and Writing: Differences and Diasporas; Methods; Advanced " +
    "Writing) is explicitly a set of co-requirements meant to be satisfied by courses already counted " +
    "in Elements 2-4, adding no credits of its own. The catalog names no course-to-designation list " +
    "for any of the three, so it cannot be checked which of a student's chosen courses (if any) carry " +
    "each designation; not encoded rather than added as a trivially-satisfiable generic pick.",
  "'Students cannot overlap their track credits with credits applied to the Rhetoric or Professional " +
    "Writing minors; students cannot pursue the Creative Writing track and also be a Creative Writing " +
    "minor' (catalog, Element 3 intro) is not encoded: no Rhetoric minor, Professional Writing minor, " +
    "or Creative Writing minor is yet registered in this codebase for `maxSharedWith` to reference.",
  "No numeric disagreement found between the catalog and the College of Arts and Humanities' official " +
    "English Four Year Academic Plan on the major's own requirement structure (element order, credit " +
    "totals, ENGL301 placement); the plan's ARHU/Gen Ed layers (ARHU158, Global Engagement, " +
    "Distributive Studies, etc.) are college/university layers, out of scope here.",
];
