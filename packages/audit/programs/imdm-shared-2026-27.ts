// Shared requirement building blocks for the Immersive Media Design Major's two tracks
// (Computing, Emerging Creatives), 2026-27 UMD Academic Catalog. Not a program file itself (no
// `*Meta` export, so the registry generator ignores it); imported by imdm-major-*-2026-27.ts,
// which share the ENGL elective, the IMDM courses common to both tracks, and the ARTT courses
// common to both tracks, and define their own track-specific requirements.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art/immersive-media-design-major/
// (fetched 2026-09-28); see program-sources/art-immersive-media-design-major.md. The department
// page cited by the source (lep.umd.edu) is a generic Limited Enrollment Program overview with no
// IMDM-specific course list, so it can't be used for a department-vs-catalog comparison here --
// the catalog is the only concrete source. No official four-year plan could be read either (the
// linked PDF converts to garbled, unreadable text); both tracks' sample plans are constructed from
// the catalog (`official: false`).

import type { Requirement } from "../src/audit.ts";

/** ENGL Elective (3 credits): identical "choose one" list on both tracks. */
export const imdmEnglElective: Requirement = {
  kind: "choose",
  id: "engl-elective",
  name: "ENGL Elective (choose one)",
  count: 1,
  from: { courses: ["ENGL143", "ENGL245", "ENGL255", "ENGL290", "ENGL294", "ENGL295"] },
};

/** IMDM courses required by both tracks' own course tables. Track-specific IMDM courses
 * (IMDM327 for Computing; IMDM127 and IMDM350 for Emerging Creatives) live in each track file. */
export const imdmCommonCourses: Requirement[] = [
  { kind: "course", id: "imdm101", name: "Introduction to Immersive Media", options: ["IMDM101"] },
  { kind: "course", id: "imdm150", name: "Digital Media Theory and Culture", options: ["IMDM150"] },
  { kind: "course", id: "imdm227", name: "Introduction to Computational Media", options: ["IMDM227"] },
  { kind: "course", id: "imdm290", name: "Collaborative Studio I: Image + Time", options: ["IMDM290"] },
  { kind: "course", id: "imdm390", name: "Collaborative Studio II: Experiential Computing", options: ["IMDM390"] },
  { kind: "course", id: "imdm490", name: "Senior Capstone I", options: ["IMDM490"] },
  { kind: "course", id: "imdm491", name: "Senior Capstone II", options: ["IMDM491"] },
];

/** ARTT courses required by both tracks' own course tables. Track-specific ARTT courses
 * (the ARTT37x/47x Digital Media elective for Computing; ARTT110/210/370/47X for Emerging
 * Creatives) live in each track file. */
export const artCommonCourses: Requirement[] = [
  { kind: "course", id: "artt100", name: "Two-Dimensional Design Fundamentals", options: ["ARTT100"] },
  { kind: "course", id: "artt200", name: "Three-Dimensional Art Fundamentals", options: ["ARTT200"] },
  { kind: "course", id: "artt255", name: "Introduction to Digital Art and Design Processes", options: ["ARTT255"] },
];

/** reviewNotes common to both tracks (catalog-wide rules, engine gaps, unencodable LEP items).
 * Each track file appends its own track-specific notes to this array. */
export const imdmCommonReviewNotes: string[] = [
  "Immersive Media Design is a Limited Enrollment Program (lep.umd.edu lists both 'Immersive Media " +
    "Design- Computing' and 'Immersive Media Design- Emerging Creatives (BA)'). LEP admission gates " +
    "(Gateway courses/grades, space-available admission, one-time application, dismissal for falling " +
    "below a 2.00 major GPA after admission) are not encoded -- no admission-gate concept in the " +
    "engine, and the fetched lep.umd.edu page is a generic cross-program overview with no IMDM-specific " +
    "gateway course list to encode from. Flagged in docs/project/owner-review.md.",
  "Not encoded (engine gap, matches other ARHU majors' precedent): residency rules, and the 120-credit graduation minimum.",
  "Track 1 (Computing) footnote: 'the Computer Science Department offers exemption exams for CMSC131, " +
    "CMSC132, CMSC216 and CMSC250' for transferring students -- not encoded (no proficiency-exam/exemption " +
    "concept in the engine, matches cmsc-major-2026-27.ts's own precedent for the same four courses).",
  "The official College of Arts and Humanities four-year plan PDF for this major converts to garbled, " +
    "unreadable text (no legible course codes or term structure survive conversion); both tracks' sample " +
    "plans are constructed from the catalog's own course table instead (`official: false`), term " +
    "placement is TurboTerp's own reasonable ordering (not read off any plan), and Gen Ed/general-elective " +
    "slots are left out entirely (only the major is audited). Flagged in docs/project/owner-review.md.",
];
