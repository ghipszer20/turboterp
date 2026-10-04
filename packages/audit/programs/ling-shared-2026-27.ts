// Shared requirement building blocks for the Linguistics Major's two tracks (Grammars and
// Cognition, Language), 2026-27 UMD Academic Catalog. Not a program file itself (no `*Meta`
// export, so the registry generator ignores it); imported by ling-major-*-2026-27.ts, which
// share the Core (identical across both tracks per the catalog) and define their own Track
// requirements.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/linguistics/linguistics-major/
// (fetched 2026-09-28); see program-sources/linguistics-major.md.

import type { Requirement } from "../src/audit.ts";

/** Core, required of all majors: LING200, LING240, LING311, LING321. */
export const lingCoreRequired: Requirement[] = [
  { kind: "course", id: "ling200", name: "LING200 Introductory Linguistics", options: ["LING200"] },
  { kind: "course", id: "ling240", name: "LING240 Language and Mind", options: ["LING240"] },
  { kind: "course", id: "ling311", name: "LING311 Syntax I", options: ["LING311"] },
  { kind: "course", id: "ling321", name: "LING321 Phonology I", options: ["LING321"] },
];

/** Core: "Select two of the following" (6 credits): LING312, LING322, LING320, LING410, LING440, LING444. */
export const lingCoreSelectTwo: Requirement = {
  kind: "choose",
  id: "core-select-two",
  name: "Core: select two of LING312, LING322, LING320, LING410, LING440, LING444",
  count: 2,
  credits: 6,
  from: { courses: ["LING312", "LING322", "LING320", "LING410", "LING440", "LING444"] },
};

/**
 * Core: "Three 3xx-4xx level LING electives" (9 credits). LING311 and LING321 are excluded since
 * they're already modeled as their own specific-course requirements above (matches engl-shared's
 * exclusion of ENGL301 from its generic choose pools).
 */
export const lingCoreElectives: Requirement = {
  kind: "choose",
  id: "core-electives",
  name: "Core: three 3xx-4xx level LING electives",
  count: 3,
  credits: 9,
  from: { departments: ["LING"], minNumber: 300, maxNumber: 499, exclude: ["LING311", "LING321"] },
};

/** reviewNotes common to both tracks (catalog-wide rules, engine gaps). Each track file appends
 * its own track-specific notes to this array. */
export const lingCommonReviewNotes: string[] = [
  "Catalog internal inconsistency: the narrative says 'the Linguistics major consists of 39 " +
    "credits: 24 credits of Linguistics Core classes plus 12 credits from one of the Tracks' -- " +
    "but 24 + 12 = 36, not 39, and the Core's own itemized table (LING200/240/311/321 = 12 credits, " +
    "'select two' = 6 credits, three 3xx-4xx electives = 9 credits) sums to 27, not 24. Encoded " +
    "against the itemized table and the table's own 'Total Credits | 39' footer (27 Core + 12 " +
    "Track = 39), which the department's two four-year plans corroborate (each totals the same " +
    "course list). Flagged in docs/project/owner-review.md; the '24 credits of Core' sentence " +
    "appears to be a catalog typo.",
  "Not encoded (no prerequisite/sequencing concept in the engine): 'LING200 followed by LING240 " +
    "must be taken before any other courses in the major' and 'After LING240, students should take " +
    "LING311 and LING321, as they are prerequisites for other required courses.'",
  "Not encoded (no per-course credit cap concept in the engine, matches engl-shared's ENGL388/ENGL429 " +
    "precedent): 'No more than 1 independent study or lab course (3 credits) can be used towards the " +
    "three 3xx-4xx level LING electives.'",
  "'Courses cannot be double-counted for different requirements in the major' (catalog) is upheld by " +
    "the audit engine's own course-to-requirement assignment (a course is assigned to at most one " +
    "requirement, absent an explicit `overlay`), so no separate encoding is needed for the Core's " +
    "overlapping 3xx-4xx LING pools (select-two list vs. the generic three-elective pool).",
  "Not encoded (engine gap, matches other ARHU majors' precedent): residency rules; and the 120-credit graduation minimum.",
];
