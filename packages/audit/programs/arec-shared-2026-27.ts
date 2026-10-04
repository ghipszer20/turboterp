// Shared requirement building blocks for the Agricultural and Resource Economics Major's three
// specialization tracks (Agribusiness, Agricultural and Resource Economics, Environmental and
// Resource Economics), 2026-27 UMD Academic Catalog. Not a program file itself (no `*Meta`
// export, so the registry generator ignores it); imported by arec-major-*-2026-27.ts, which share
// the Foundational Courses and define their own Specialization + Field requirements.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/
//   agricultural-resource-economics/agricultural-resource-economics-major/ (fetched 2026-09-28).
// No department page was found for this major (see program-sources/agricultural-resource-economics-major.md);
// the owner ruling that the department page wins where the two disagree does not apply here.

import type { Requirement } from "../src/audit.ts";

/** Foundational Courses, identical across all three specializations. */
export const arecFoundational: Requirement[] = [
  {
    kind: "course",
    id: "microecon-gateway",
    name: "Principles of Microeconomics (ECON200, AREC240, or AREC250)",
    options: ["ECON200", "AREC240", "AREC250"],
  },
  { kind: "course", id: "econ201", name: "Principles of Macroeconomics (ECON201)", options: ["ECON201"] },
  { kind: "course", id: "arec326", name: "Intermediate Applied Microeconomics (AREC326)", options: ["AREC326"] },
  {
    kind: "course",
    id: "business-stats-gateway",
    name: "Statistics Requirement: Business/Applied Economic Statistics (BMGT230 or ECON230)",
    options: ["BMGT230", "ECON230"],
  },
  {
    kind: "course",
    id: "elementary-stats-gateway",
    name: "Statistics Requirement: Elementary Statistics (STAT100, MATH107, or STAT400)",
    options: ["STAT100", "MATH107", "STAT400"],
  },
  {
    kind: "course",
    id: "calc-gateway",
    name: "Elementary Calculus I (MATH120 or MATH140)",
    options: ["MATH120", "MATH140"],
  },
];

/** Fields: named course lists shared by "Select three courses from one of the following fields"
 * in each specialization. Each field's own catalog header ("Choose three of the following
 * courses") already caps this at 3 of the list, so no `alternatives`/exclusion handling is added
 * beyond what's noted below. */
export const fieldAdvancedDegreePreparation = [
  "ECON406", "ECON414", "ECON415", "ECON422", "ECON423",
  "MATH141", "MATH240", "MATH241",
  "STAT401", "STAT420", "STAT430",
];

export const fieldAgFoodNaturalResourceSystems = [
  "AREC210", "ANSC101", "ANSC227", "ANTH242", "ANTH421", "ENST441", "GEOG431", "GVPT206", "NFSC100", "PLSC112", "PLSC125",
];

export const fieldBusinessManagement = ["BMGT340", "BMGT350", "BMGT364", "BMGT380"];

export const fieldAgManagementEntrepreneurship = [
  "ENES140", "ENES461", "ENES471", "INAG103", "INAG201", "INAG204", "INAG205",
  // catalog "or" trio (BMGT289E / ENES210 / INAG102) flattened -- see arecCommonReviewNotes.
  "BMGT289E", "ENES210", "INAG102",
];

export const fieldGlobalHungerPovertySustainableDevelopment = [
  "AREC260", "AREC345", "AREC365", "AREC445",
  "AASP320",
  // catalog cross-listing "AGNR/PLCY301" flattened -- see arecCommonReviewNotes.
  "AGNR301", "PLCY301",
  "ANTH407", "HLTH325", "SOCY340",
];

export const fieldEnvironmentalDataScience = [
  "AREC280", "AREC380", "AREC422", "FIRE298",
  // catalog "or" pair (AOSC247 / GEOG276) flattened -- see arecCommonReviewNotes.
  "AOSC247", "GEOG276",
  "GEOG272", "GEOG373", "AOSC447",
];

export const fieldEnvironmentalResourceManagementPolicy = [
  "AREC200",
  "AGNR301", "PLCY301",
  // catalog "or" pair (ANTH242 / ANTH266) flattened -- see arecCommonReviewNotes.
  "ANTH242", "ANTH266",
  "AOSC375", "ENST403", "ENST485", "FGSM340", "GEOG332",
];

/**
 * Builds the "Select three courses from one of the following fields" requirement (9 credits) as a
 * `sets` requirement: one set per field, each set holding a single filter member worth 3 courses,
 * so picking a field and completing it means taking 3 courses from that field's own list. The
 * "Student Designed Field" option (every specialization offers it) is never included here -- it
 * requires a written proposal with no catalog-given course list; see arecCommonReviewNotes.
 */
export function fieldChoiceRequirement(id: string, fields: Array<{ name: string; courses: string[] }>): Requirement {
  return {
    kind: "sets",
    id,
    name: `Select three courses from one of the following fields (${fields.map((f) => f.name).join("; ")})`,
    options: fields.map((f) => [{ count: 3, from: { courses: f.courses } }]),
  };
}

/** reviewNotes common to all three specializations. Each track file appends its own notes. */
export const arecCommonReviewNotes: string[] = [
  "No department page was found for the Agricultural and Resource Economics Major; only the " +
    "2026-27 Academic Catalog page was available as a source " +
    "(program-sources/agricultural-resource-economics-major.md). The owner ruling that the " +
    "department page wins where the two disagree does not apply since there is no department " +
    "source to compare against.",
  "The catalog's 'Statistics Requirement' row (labeled '3-6' credits) is really two independent " +
    "gateways -- (BMGT230 or ECON230) AND (STAT100 or MATH107 or STAT400) -- encoded the same way " +
    "as the calculus gateway. The stated 3-6 credit range doesn't match either gateway's 3-credit " +
    "face value times two (6); not investigated further since the engine doesn't check requirement " +
    "credit totals, only per-course grades.",
  "Program GPA 2.0 encoded as minGpa (the catalog's 2.00 GPA across all courses used to satisfy major " +
    "requirements; the per-course C- floor is minGrade).",
  "Not encoded (engine gap, matches other majors' precedent): any UMD/AGNR residency rules (none stated on this catalog page, unlike " +
    "other majors' department checklists); and the major's own 39-42 total-credit range plus each " +
    "specialization's 24-credit total, which the audit has no concept for.",
  "'Other upper-level AREC courses with permission of advisor' (each specialization's 'select five' " +
    "list) and 'Any other upper-level ECON/MATH/STAT course chosen in consultation with advisor' " +
    "(Advanced Degree Preparation field) are permissive, advisor-gated expansions with no named " +
    "course list; not modeled since there's nothing concrete to encode -- this only narrows what's " +
    "checkable against the printed list, never wrongly widens it.",
  "Cross-listed/either-or course pairs inside Field lists (AGNR301/PLCY301 'Sustainability'; " +
    "ANTH242/ANTH266 in Environmental and Resource Management and Policy; AOSC247/GEOG276 in " +
    "Environmental Data Science) and the Agricultural Management and Entrepreneurship field's " +
    "'BMGT289E or ENES210 or INAG102' trio are modeled as flat pools of individually-acceptable " +
    "courses inside the field's `sets` member filter, not a formal `alternatives` group: " +
    "`CourseFilter` (used inside a `sets` member) has no `alternatives` field -- only the top-level " +
    "`choose` kind supports it. This is over-permissive, not narrowing (a student could in " +
    "principle use two of an equivalent pair for two of the field's three slots), consistent with " +
    "'never narrow to make a test pass.'",
  "The 'Student Designed Field' option (offered by every specialization) requires a written " +
    "proposal naming its own courses (Undergraduate Committee approval, 30+ credit hours before " +
    "graduation) with no catalog-given course list; not encoded as a selectable field in " +
    "fieldChoiceRequirement. Flagged in docs/project/owner-review.md.",
  "Footnotes marking AREC380, AREC422 and AREC445 as 'may not double count toward upper level " +
    "specialization requirements' when used in a Field need no special handling here: each lives in " +
    "a different Requirement (the Field choice) from the specialization's own 'select five' list, " +
    "and the audit's course-to-requirement Assignment already uses each completed course for at " +
    "most one requirement (no `overlay: true` is set on either).",
  "AREC431 is listed in every specialization's 'select five' list with no course title in the " +
    "fetched catalog table (a conversion artifact, not a builder omission); kept as a valid option " +
    "since the catalog itself names the course number.",
];
