// Shared requirement building blocks for the Environmental Science and Policy Major's areas of
// concentration, 2026-27 UMD Academic Catalog. Not a program file itself (no `*Meta` export, so
// the registry generator ignores it); imported by ensp-major-*-2026-27.ts, which share the ENSP
// Core and add their own concentration requirements.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/
//   environmental-science-policy/environmental-science-policy-major/ (fetched 2026-09-28).
// Department page (ensp.umd.edu) is a general welcome page naming no requirement, so it does not
// disagree with the catalog for the Core (program-sources/environmental-science-policy-major.md).
// Encoded by hand from the catalog alone. UNVERIFIED until owner sign-off.

import type { ProgramMeta, Requirement } from "../src/audit.ts";

/** ENSP Core, identical across all areas of concentration (18-19 credits per the catalog). */
export const enspCore: Requirement[] = [
  { kind: "course", id: "ensp101", name: "Introduction to Environmental Science (ENSP101)", options: ["ENSP101"] },
  { kind: "course", id: "ensp102", name: "Introduction to Environmental Policy (ENSP102)", options: ["ENSP102"] },
  {
    kind: "course",
    id: "ensp400",
    name: "Capstone in Environmental Science and Policy (ENSP400; senior standing)",
    options: ["ENSP400"],
  },
  {
    kind: "choose",
    id: "applied-science-policy",
    name: "Applied Science and Policy: Select one (junior/senior year; not double-counted with a concentration requirement)",
    count: 1,
    credits: 3,
    from: { courses: ["ENSP305", "ENSP306", "ENSP330", "ENSP340", "ENSP342", "ENSP350", "ENSP370"] },
  },
  {
    kind: "choose",
    id: "core-calculus",
    name: "Calculus: Select one",
    count: 1,
    from: { courses: ["MATH120", "MATH136", "MATH140"] },
  },
  {
    kind: "choose",
    id: "core-statistics",
    name: "Statistics: Select one",
    count: 1,
    from: { courses: ["BIOM301", "SOCY201", "PSYC200", "GEOG306", "ECON321"] },
  },
  {
    kind: "sets",
    id: "core-four-of-five-groups",
    name: "Select at least one course each from four of the five groups (12-14 credits): Biology, Chemistry, Earth Sciences, Economics, Geography",
    count: 4,
    options: [
      // Group 1 - Biology
      ["BSCI160", { count: 1, from: { courses: ["BSCI180", "BSCI161"] } }],
      // Group 2 - Chemistry
      ["CHEM131", "CHEM132"],
      // Group 3 - Earth Sciences: five alternative course combinations, each its own set option
      // (flattened from the catalog's single "Group 3" into five sets so each pairing/lab
      // alternate is representable; unlike Groups 4 and 5 below, this is the one group whose
      // flattening is permissive rather than exact -- a student could in theory complete two of
      // these five combinations and have both count toward the "four of five groups" total
      // instead of one, a permissive edge case flagged rather than narrowed -- see program note).
      ["AOSC200", "AOSC201"],
      ["ENST200"],
      ["GEOG201", "GEOG211"],
      ["GEOL100", "GEOL110"],
      ["GEOL120", "GEOL110"],
      // Group 4 - Economics: one set, satisfied by any one of its three courses (not three
      // independent groups -- see the flattening note below, which applies only to Group 3).
      [{ count: 1, from: { courses: ["AREC240", "AREC241", "ECON200"] } }],
      // Group 5 - Geography: one set, satisfied by any one of its four courses.
      [{ count: 1, from: { courses: ["GEOG130", "GEOG140", "GEOG170", "GEOG202"] } }],
    ],
  },
];

/** reviewNotes common to every area of concentration. Each track file appends its own notes. */
export const enspCommonReviewNotes: string[] = [
  "Department page (ensp.umd.edu, program-sources/environmental-science-policy-major.md) is a " +
    "general welcome page naming no requirement, so it does not disagree with the catalog and the " +
    "owner's 'department page wins' ruling does not apply to the ENSP Core; the seven official " +
    "four-year plans (AGNR-hosted PDFs) are the department source for the seven concentrations that " +
    "have one, and win over the catalog where they disagree (flagged per-track below).",
  "The catalog's Group 3 (Earth Sciences) of the 'four of five groups' requirement offers five " +
    "alternative course combinations (AOSC200&201; ENST200 alone; GEOG201&211; GEOL100&110; " +
    "GEOL120&110). The engine's `sets` requirement has no nested 'choose 1 of 5, then that one " +
    "counts as one of your four groups' structure, so all five combinations are flattened into the " +
    "top-level `count: 4` set list, which also has one set each for Biology, Chemistry, Economics " +
    "(itself a 1-of-3 filter member) and Geography (a 1-of-4 filter member) -- 9 total set options. " +
    "Group 3's flattening is permissive rather than narrowing: a student could in theory complete " +
    "two Group-3 combinations and have both count as separate 'groups' toward the four required, " +
    "which the catalog likely does not intend, but no student is made to fail who should pass. " +
    "Groups 1, 2, 4 and 5 have no such looseness: each is encoded as exactly one set requiring one " +
    "qualifying course (or course pair) from that group, matching the catalog exactly.",
  "Footnote 1 on the ENSP Core ('Requirements may vary slightly depending on concentration; please " +
    "refer to complete list of requirements on http://ensp.umd.edu') is not encodable (no web " +
    "access to ensp.umd.edu); the catalog's own Core table is encoded as-is for every concentration.",
  "Footnote 2 ('Applied Science and Policy... to be taken in the junior or senior year') and " +
    "ENSP400's '(senior standing)' class-standing gates are not encoded (engine gap: no concept of " +
    "class standing/credit-hour gates).",
  "Footnote 3 ('Students shall not double-count the Applied Science and Policy requirement with " +
    "another requirement for their concentration') is not encoded (engine gap: no general " +
    "cross-requirement double-count exclusion within a single program; `maxSharedWith` only limits " +
    "sharing across different programs).",
  "The Grading Policy ('grades of C- or higher in all courses taken within the ENSP core, in all " +
    "required courses, and restricted electives of the selected area of concentration') is encoded " +
    "as the Program's minGrade: 'C-', applying to every requirement.",
  "Not encoded (engine gap, matches other majors' precedent): the major's own top-level credit " +
    "totals (30-33 for the Core alone, concentration totals vary), which the audit has no concept " +
    "for; no cumulative GPA or residency rule is stated on this catalog page beyond the C- grading " +
    "policy above.",
];

/** One required course (or "X or Y" when several codes are given). */
export const enspCourse = (id: string, name: string, ...options: string[]): Requirement => ({
  kind: "course",
  id,
  name,
  options,
});

/** Catalog URL every ENSP track cites. */
export const enspCatalogUrl =
  "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/environmental-science-policy/environmental-science-policy-major/";

/** Picker metadata for one ENSP area of concentration. */
export const enspPickerInfo = (college: ProgramMeta["college"], track: string): ProgramMeta => ({
  kind: "major",
  college,
  short: `Environmental Science & Policy (${track})`,
  major: "ensp",
  track,
  sources: { catalog: enspCatalogUrl, department: "https://ensp.umd.edu/" },
});
