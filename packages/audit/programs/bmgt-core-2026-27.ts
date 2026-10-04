// Shared "College Requirements" (business core) for the Robert H. Smith School of Business,
// 2026-27 UMD Academic Catalog: the Bachelor of Science requirements common to all eight BMGT
// majors (Accounting, Finance, Information Systems, International Business, Management, Marketing,
// Operations Management & Business Analytics, Supply Chain Management). Not a program file itself
// (no `*Meta` export, so the registry generator ignores it); each `<major>-major-2026-27.ts` spreads
// `bmgtCoreRequirements` into its own `requirements` array and appends `bmgtCoreReviewNotes` (plus
// any major-specific notes) to its own `reviewNotes`.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/business/ ("Summary of Bachelor of
// Science Degree Requirements (All Curricula)" table, under "College Requirements" / Department page)
// (fetched 2026-09-28); see program-sources/accounting-major.md, "## Department page" section.

import type { Requirement } from "../src/audit.ts";

/**
 * Business Statistics gateway (BMGT230, or BMGT231, or one of the catalog's named approved
 * substitutes for either). The catalog names both substitute lists explicitly (footnote 1 of the
 * Freshman Admission gateway-courses table), so this is a real course list, not an unencodable
 * "or equivalent": "approved substitutes for BMGT230: BIOM301, CCJS200, ECON230, ECON321, QMMS251,
 * EPIB300, EPIB315, GEOG306, HLTH300, INST314, PSYC200, or SOCY201. ... for BMGT231: BIOE372,
 * ENCE302, ENEE324, ENME392, STAT400, or STAT420."
 */
const bmgtCoreBusinessStatistics: Requirement = {
  kind: "course",
  id: "bmgt-core-business-statistics",
  name: "Business Statistics (BMGT230/BMGT231 or an approved substitute)",
  options: [
    "BMGT230",
    "BMGT231",
    "BIOM301",
    "CCJS200",
    "ECON230",
    "ECON321",
    "QMMS251",
    "EPIB300",
    "EPIB315",
    "GEOG306",
    "HLTH300",
    "INST314",
    "PSYC200",
    "SOCY201",
    "BIOE372",
    "ENCE302",
    "ENEE324",
    "ENME392",
    "STAT400",
    "STAT420",
  ],
};

/**
 * Calculus gateway: "MATH120 (Elementary Calculus I) or MATH140 (Calculus I)"; footnote 1 also
 * names MATH136 (Calculus for Life Sciences) as an acceptable substitute, conditioned on the
 * student having completed it "as a part of work toward a previous major" -- that condition isn't
 * modeled (no prior-major concept in the engine), so MATH136 is included unconditionally, which
 * only widens (never wrongly narrows) who this requirement accepts.
 */
const bmgtCoreCalculus: Requirement = {
  kind: "course",
  id: "bmgt-core-calculus",
  name: "Calculus (MATH120, MATH136, or MATH140)",
  options: ["MATH120", "MATH136", "MATH140"],
};

/**
 * Oral Communication: "Select one of the following: COMM100, COMM107, or COMM200." (The catalog
 * footnote adds that any course satisfying the University's Oral Communication Gen Ed also
 * satisfies this; that Gen Ed equivalence isn't modeled, only the three named courses are.)
 */
const bmgtCoreOralCommunication: Requirement = {
  kind: "course",
  id: "bmgt-core-oral-communication",
  name: "Oral Communication (COMM100, COMM107, or COMM200)",
  options: ["COMM100", "COMM107", "COMM200"],
};

/**
 * The full Smith School "College Requirements" business core (Freshman-Sophomore School
 * Requirements + Junior-Senior School Requirements), 43 fixed credits. Every business major spreads
 * this array into its own `requirements`. Does NOT include the catalog's "0-3 credits of approved
 * upper-level economics courses" line (Economics Requirement): the catalog says the specific course
 * is listed with each major's own requirements, and no such course-by-course list was found for
 * Accounting; see `bmgtCoreReviewNotes`.
 */
export const bmgtCoreRequirements: Requirement[] = [
  { kind: "course", id: "bmgt-core-bmgt110", name: "Introduction to the Business Value Chain (BMGT110)", options: ["BMGT110"] },
  { kind: "course", id: "bmgt-core-bmgt220", name: "Principles of Accounting I (BMGT220)", options: ["BMGT220"] },
  { kind: "course", id: "bmgt-core-bmgt221", name: "Principles of Accounting II (BMGT221)", options: ["BMGT221"] },
  { kind: "course", id: "bmgt-core-econ200", name: "Principles of Microeconomics (ECON200)", options: ["ECON200"] },
  { kind: "course", id: "bmgt-core-econ201", name: "Principles of Macroeconomics (ECON201)", options: ["ECON201"] },
  bmgtCoreCalculus,
  bmgtCoreBusinessStatistics,
  bmgtCoreOralCommunication,
  { kind: "course", id: "bmgt-core-bmgt301", name: "Information Systems, AI, and Digital Transformation (BMGT301)", options: ["BMGT301"] },
  { kind: "course", id: "bmgt-core-bmgt340", name: "Business Finance (BMGT340)", options: ["BMGT340"] },
  { kind: "course", id: "bmgt-core-bmgt350", name: "Marketing Principles and Organization (BMGT350)", options: ["BMGT350"] },
  { kind: "course", id: "bmgt-core-bmgt364", name: "Managing People and Organizations (BMGT364)", options: ["BMGT364"] },
  { kind: "course", id: "bmgt-core-bmgt367", name: "Career Search Strategies in Business (BMGT367)", options: ["BMGT367"] },
  { kind: "course", id: "bmgt-core-bmgt380", name: "Business Law I (BMGT380)", options: ["BMGT380"] },
  { kind: "course", id: "bmgt-core-bmgt495", name: "Strategic Management (BMGT495)", options: ["BMGT495"] },
];

/** reviewNotes common to every business major (catalog-wide business-core rules, engine gaps). Each
 * major file appends its own major-specific notes to this array. */
export const bmgtCoreReviewNotes: string[] = [
  "Not encoded: the College Requirements table's 'Economics Requirement' line ('0-3 credits of " +
    "approved upper-level economics courses are required by the Smith School of Business. The " +
    "specific requirements for each major are listed with the majors' specific requirements.') -- the " +
    "fetched source names no such economics course, or list of courses, under the Accounting major's " +
    "own requirements. This is the source's undecidable 'no list given' case (owner ruling); the " +
    "College Requirements table's own 43-46 credit total already accounts for a 0-credit reading here " +
    "(43 without it, matching this file's 14 fixed requirements).",
  "Program GPA 2.0 encoded as minGpa (the Smith School's 2.0 GPA across major-requirement courses, " +
    "beginning Fall 2012 matriculants).",
  "Not encoded (engine gaps, matching other majors' precedent): the Smith School's university-wide " +
    "2.0 cumulative GPA; a 'C-' or better in every required course, which IS partially covered by each program's " +
    "`minGrade`); the LEP freshman/transfer admission gates (45-credit gateway-course review, 3.0/3.6 " +
    "transfer GPA thresholds); residency rules (50% of BMGT credit hours, and at least 45 of 120 total " +
    "hours, must be business/management credits earned at UMD College Park); the 58-hours-at-300/400- " +
    "level floor; and the 120-credit graduation minimum.",
  "MATH136 (Calculus for Life Sciences) is included in the Calculus requirement's options " +
    "unconditionally; the catalog only approves it as a substitute for a student who completed it " +
    "'as a part of work toward a previous major' -- that condition has no representation in the " +
    "engine, so it is accepted for everyone (widens, never narrows).",
];
