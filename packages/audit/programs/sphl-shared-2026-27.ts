// Shared requirement factories for School of Public Health (SPHL) majors, 2026-27 UMD Academic Catalog.
// Not a program file (no `*Meta` export, so the registry generator ignores it). Each
// `<major>-2026-27.ts` imports the pieces it needs and spreads them into its own `requirements`, then
// appends `sphlSharedReviewNotes` to its own `reviewNotes`.
// Sources: the "## Catalog requirements" and four-year-plan benchmark sections of
// program-sources/{kinesiology,family-health,public-health-science}-major.md (fetched 2026-09-28).
// Global Health and Public Health Practice catalog sections were NOT read for this file; their
// benchmarks (sph.umd.edu four-year-plans page) name SPHL100, BSCI170/171 and BSCI201, so those siblings
// should confirm against their own catalog tables before using the pieces marked "(confirm)".
//
// What is common (real overlap):
//   sphlFoundations         SPHL100 Foundations of Public Health. Kinesiology, Family Health and Public
//                           Health Science list it; Public Health Practice and Global Health benchmarks too.
//   sphlBiologyLecture      BSCI170. Kinesiology, Public Health Science; Public Health Practice and Global
//                           Health (confirm). Not Family Health.
//   sphlBiologyLab          BSCI180 or BSCI171 (same siblings as above).
//   sphlAnatomyPhysiology   BSCI201 and BSCI202. Kinesiology and Public Health Science. (Public Health
//                           Practice's benchmark says HLTH212 or BSCI201: confirm before using this pair.)
//   sphlEpidemiology        EPIB301. Public Health Science (catalog); Public Health Practice (confirm).
//
// What each sibling adds itself (not encoded here):
//   Kinesiology: KNES core, options, activities, MATH113, statistics.
//   Family Health: FMSC courses, social-science / statistics / communication / economics pick-ones.
//   Public Health Science: MATH120, chemistry, genetics, microbiology, PHSC/HLTH/EPIB/MIEH/HLSA courses.
// The statistics requirement is NOT shared: it differs by major (Kinesiology MATH/STAT, Family Health
// STAT100 or QMMS251, Public Health Science EPIB315).
// School-wide policy (manual, in sphlSharedReviewNotes): SPH benchmarks with "C-" or better.

import type { Requirement } from "../src/audit.ts";

/** Foundations of Public Health (3 credits). */
export const sphlFoundations: Requirement = {
  kind: "course",
  id: "sphl-sphl100",
  name: "Foundations of Public Health (SPHL100)",
  options: ["SPHL100"],
};

/** Principles of Molecular & Cellular Biology (3 credits). */
export const sphlBiologyLecture: Requirement = {
  kind: "course",
  id: "sphl-bsci170",
  name: "Principles of Molecular & Cellular Biology (BSCI170)",
  options: ["BSCI170"],
};

/** "BSCI180 Principles Biology Laboratory or BSCI171 Principles of Molecular & Cellular Biology Laboratory" (1 credit). */
export const sphlBiologyLab: Requirement = {
  kind: "course",
  id: "sphl-biology-lab",
  name: "Biology Laboratory (BSCI180 or BSCI171)",
  options: ["BSCI180", "BSCI171"],
};

/** Human Anatomy and Physiology I and II (4 credits each). */
export const sphlAnatomyPhysiology: Requirement[] = [
  { kind: "course", id: "sphl-bsci201", name: "Human Anatomy and Physiology I (BSCI201)", options: ["BSCI201"] },
  { kind: "course", id: "sphl-bsci202", name: "Human Anatomy and Physiology II (BSCI202)", options: ["BSCI202"] },
];

/** Epidemiology for Public Health Practice (3 credits). */
export const sphlEpidemiology: Requirement = {
  kind: "course",
  id: "sphl-epib301",
  name: "Epidemiology for Public Health Practice (EPIB301)",
  options: ["EPIB301"],
};

/** Notes every SPH major appends to its own reviewNotes. */
export const sphlSharedReviewNotes: string[] = [
  "Not enforced (manual): SPH benchmarks (sph.umd.edu four-year-plans page) require named courses with 'C-' or better by the end of two, three or four semesters into the major; missing one can mean dismissal from the major. The audit checks the courses, not the semester deadlines.",
  "Not enforced (manual): total credits (120 including Gen Ed).",
];
