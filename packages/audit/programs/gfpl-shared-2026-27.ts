// Shared requirement building blocks for the Global and Foreign Policy Major's three thematic tracks
// (Security, Conflict, and Diplomacy; Human Security and Migration; Development and Sustainability),
// 2026-27 UMD Academic Catalog. Not a program file itself (no `*Meta` export); imported by
// gfpl-major-*-2026-27.ts, which add each track's anchor course and track-elective open slot.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/public-policy/global-and-foreign-policy-major/
// and spp.umd.edu/your-education/undergraduate/bachelor-arts-global-and-foreign-policy (both fetched
// 2026-09-28); see program-sources/global-and-foreign-policy-major.md.

import type { Requirement } from "../src/audit.ts";

/**
 * World languages offered by SLLC (School of Languages, Literatures, and Cultures). The source
 * says only "a world language other than English offered by SLLC", so this is the whole set of
 * SLLC language department codes (widens, never narrows).
 */
export const GFPL_LANGUAGE_DEPARTMENTS = [
  "ARAB", "CHIN", "FREN", "GERM", "GREK", "HEBR", "HIND", "ITAL", "JAPN", "KORA", "LATN",
  "PERS", "PORT", "RUSS", "SPAN", "SLLC", "SWAH", "TURK", "URDU", "YORU",
];

export const gfplSharedRequirements: Requirement[] = [
  { kind: "course", id: "gfpl100", name: "GFPL100 War, Peace, and Crisis: Foundations of Global and Foreign Policy", options: ["GFPL100"] },
  { kind: "course", id: "gfpl102", name: "GFPL102 Global Order and Policy Structures: Power, Access and Influence", options: ["GFPL102"] },
  {
    kind: "course",
    id: "gfpl203",
    name: "GFPL203 Ethics of Global Action (currently offered as a section of PLCY203)",
    options: ["GFPL203", "PLCY203"],
  },
  { kind: "course", id: "arec345", name: "AREC345 Global Poverty and Economic Development", options: ["AREC345"] },
  {
    kind: "course",
    id: "pluralism",
    name: "Pluralism and Global Policy: GFPL302 (currently offered as a section of PLCY302) or SLLC200/GLBC200 Global Movements",
    options: ["GFPL302", "PLCY302", "SLLC200", "GLBC200"],
  },
  {
    kind: "choose",
    id: "global-history",
    name: "Global history course (approved list; the department page says 'offered by History')",
    count: 1,
    from: { departments: ["HIST"], minNumber: 100, maxNumber: 499 },
  },
  {
    kind: "choose",
    id: "world-language",
    name: "World Language Requirement: at least two semesters (6 credits) of a language other than English offered by SLLC",
    count: 2,
    from: { departments: GFPL_LANGUAGE_DEPARTMENTS, minNumber: 100, maxNumber: 499 },
  },
  {
    kind: "choose",
    id: "statistics",
    name: "Statistical Analysis course (BMGT230, CCJS200, QMMS251, PSYC200, SOCY201 or STAT100)",
    count: 1,
    from: { courses: ["BMGT230", "CCJS200", "QMMS251", "PSYC200", "SOCY201", "STAT100"] },
  },
  { kind: "course", id: "plcy200", name: "PLCY200 Introduction to Research Methods for Policy Analysis", options: ["PLCY200"] },
  { kind: "course", id: "plcy304", name: "PLCY304 Evaluating Evidence: Finding Truth in Numbers", options: ["PLCY304"] },
  {
    kind: "course",
    id: "experiential",
    name: "Experiential Applications: PLCY400 Senior Capstone or PLCY309 Internship (approved study abroad also counts; not encodable)",
    options: ["PLCY400", "PLCY309"],
  },
  {
    kind: "openSlot",
    id: "track-or-general-electives",
    name: "Track or general electives",
    credits: 6,
    note: "Two courses from the approved list, within your track and/or other tracks (including anchor courses); confirm with your advisor.",
  },
];

export const gfplSharedReviewNotes: string[] = [
  "Department page vs. catalog: the catalog lists 'GLBC200 Global Movements' for the Pluralism requirement; the " +
    "department page (which wins) says 'SLLC200 Global Movements'. Both ids are accepted. The department page " +
    "also says GFPL203 and GFPL302 are 'currently offered as a section of PLCY203 / PLCY302', so PLCY203 and " +
    "PLCY302 are accepted alongside the GFPL ids.",
  "Global history course: the catalog says 'choose from list of approved options, speak to advisor' and the " +
    "department page says 'offered by History (pre-approved list)'; the list itself is not in the source, so " +
    "the whole HIST department (100-499) is accepted (widens, never narrows).",
  "World language: modeled as two courses from any SLLC language department. Not encoded: placement-exam " +
    "rules, AP/IB credit for up to one course, native-speaker test-out, languages needing more than 3 credits " +
    "per semester, and 'courses used for the language requirement cannot also count as elective credit' " +
    "(the elective slots are openSlot requirements, so this can't be checked).",
  "Open slot 'track-or-general-electives' (openSlot requirement): 6 credits, Track or General Elective Courses (two courses, from within the chosen track and/or " +
    "other tracks including anchor courses). The source names only 'the list of approved courses' at a link " +
    "that is not in the fetched source, and allows petitions for other university courses, so the student confirms it with their advisor.",
  "Statistics: the catalog also lets students petition for a statistics or research methods course from " +
    "another unit; not encodable.",
  "Experiential Applications: approved study abroad also satisfies the requirement; not encodable (no course " +
    "ids). PLCY400 needs 90 credits and PLCY200; not enforced beyond the plan ordering.",
  "Not encoded (manual): the 'at least 15 credits at the 300-level or higher for the major' rule (no course " +
    "set to test it against, since the elective slots are open); benchmark timing (GFPL100/102 within the " +
    "first 2 semesters in the major; anchor course within the first 6); the 52-53 total major credits; and " +
    "the 120-credit graduation minimum. The C- minimum is applied via minGrade.",
  "No official four-year plan is published in the fetched sources; the sample plans are CONSTRUCTED from the " +
    "catalog requirements. Flagged in docs/project/owner-review.md.",
];
