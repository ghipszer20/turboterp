// Jiménez-Porter Writers' House: transcript notation track.
// Source: https://arhu.umd.edu/academics/undergraduate-studies/living-and-learning-programs/jimenez-porter-writers-house/current-students/handbook
// ("JIMÉNEZ-PORTER WRITERS' HOUSE NOTATION TRACK CURRICULAR REQUIREMENTS"; page fetched 2026-09-25).
// Hand-transcribed (prose page). UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE =
  "https://arhu.umd.edu/academics/undergraduate-studies/living-and-learning-programs/jimenez-porter-writers-house/current-students/handbook";

/** "Three-Credit Supporting Course Options … APPROVED COURSES" */
const SUPPORTING = [
  "AASP298L", "ARAB401", "ARHU350", "ARHU269I", "ARHU351", "ARHU269A", "ENGL269M", "CMLT235", "CMLT242", "CMLT270",
  "ENGL234", "ENGL235", "ENGL250", "ENGL265", "ENGL271", "ENGL272", "ENGL273", "ENGL275", "ENGL348", "ENGL352",
  "ENGL353", "ENGL354", "ENGL358", "ENGL362", "ENGL379", "ENGL388D", "ENGL398R", "ENGL439D", "ENGL433", "ENGL471",
  "ENGL472", "ENGL479", "ENGL498", "ENGL499", "JOUR456", "LGBT265",
];

export const writersHouse: Program = {
  id: "llp-writers-house",
  name: "Jiménez-Porter Writers' House",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  minGrade: "B",
  reviewNotes: [
    `[check] Grade: "Obtain a grade of B or better in all classes (12 credits total)". Encoded as a program-wide minimum grade of B (a B- does not count). The drafted courses total 12 credits: ARHU300 (1), ARHU309 (1), ARHU318 (1), ARHU319 (3), ARHU320 (3) and the 3-credit supporting course.`,
    `[check] ARHU309: "take any of the following sections: ARHU309-0101 – Prose, ARHU309-0201 – Poetry, ARHU309-0301 – Fantasy/Sci-fi". These are sections of one course, so ARHU309.`,
    `[check] ARHU318: "take any of the following sections: ARHU318A – Prose, ARHU318B – Spoken Word Poetry (TOTUS), ARHU318W – Script/Screenwriting". These are lettered course ids, so any of the three.`,
    `[check] Second-year fall: "Take one of the following 3-credit courses: ARHU319 … ARHU319A – Prose, ARHU319B – Poetry, ARHU375 – The TV Writers' Room". Encoded as one of ARHU319, ARHU319A, ARHU319B, ARHU375.`,
    `[manual] "Or substitute ARHU319 for the following classes with Director permission: ARHU275 …, ENGL398R …, ENGL 352, 353, 498, 499 (Pre-Req: 200-level CRWR with a grade of "A")". Not encoded (needs Director permission).`,
    `[check] ARHU320: "ENGL477 – BookLab may be substituted for ARHU320, when offered, on the condition that students bring the book they create in the course to LitFest for public display." ENGL477 is accepted; the LitFest condition is manual. "ARHU320 must be taken in order for students to receive the Writers' House notation" (FAQ) contradicts the substitution; the owner should decide.`,
    `[check] Supporting course: "Students are required to take one outside three-credit course in creative writing during or before the first year of residency", from the APPROVED COURSES list. "ARHU269I or 351" and "ARHU269A or ENGL 269M" are each listed as both ids. Timing ("during or before the first year") is not checked.`,
    `[manual] "Other courses in the following departments, with a focus on writing, are also possible for acceptance pending Director evaluation: Arabic, Asian American Studies, …" and "Spanish (including 206, 207, 301, …)". Not encoded (Director evaluation).`,
    `[manual] Non-course requirements: "Public display of your culminating chapbook at LitFest during your second year", "Student group involvement during one semester, 1st or 2nd year", "Attend LitFest and JPWH Retreat each year", "Attend the Writers Here and Now Event Series".`,
    `[manual] Residence: the program is a "two-year living and learning program"; residence is not a course requirement.`,
  ],
  requirements: [
    { kind: "course", id: "arhu300", name: "Writers' House Colloquium: Welcome to Writers' House", options: ["ARHU300"] },
    { kind: "course", id: "arhu309", name: "Writers' House Colloquium: Creative Writing in Community", options: ["ARHU309"] },
    { kind: "course", id: "arhu318", name: "Writers' House Workshop", options: ["ARHU318A", "ARHU318B", "ARHU318W"] },
    { kind: "course", id: "arhu319", name: "Second Year Colloquium: Form and Theory of Creative Writing", options: ["ARHU319", "ARHU319A", "ARHU319B", "ARHU375"] },
    { kind: "course", id: "arhu320", name: "Writing for Publication", options: ["ARHU320", "ENGL477"] },
    { kind: "choose", id: "supporting-course", name: "Supporting three-credit creative writing course", count: 1, from: { courses: SUPPORTING } },
  ],
};

export const writersHouseMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://arhu.umd.edu/academics/undergraduate-studies/living-and-learning-programs/jimenez-porter-writers-house/current-students/handbook" } };
