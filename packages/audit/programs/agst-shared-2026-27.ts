// Shared requirement building blocks for the Agricultural Science and Technology Major's four
// specialization tracks (Agronomy; Environmental Horticulture; Agricultural and Extension
// Education: Teaching Certificate; Agricultural and Extension Education: Extension/Industry),
// 2026-27 UMD Academic Catalog. Not a program file itself (no `*Meta` export, so the registry
// generator ignores it); imported by agst-major-*-2026-27.ts, which share the Major Core Courses
// (Foundational Science, Foundational Agricultural, Plant Protection) and add their own
// specialization requirements.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/
//   plant-sciences-landscape-architecture/agricultural-science-technology-major/ (fetched 2026-09-28).
// Two department pages were also fetched (program-sources/agricultural-science-technology-major.md):
// psla.umd.edu is the department's general home page (site navigation and news, no curriculum table
// for this major) and agnr.umd.edu/about/directory/melissa-welsh is one faculty member's profile.
// Neither names any requirement, so neither disagrees with the catalog and the "department page
// wins" owner ruling does not come into play here; only the catalog is encoded.

import type { Requirement } from "../src/audit.ts";

/** Major Core Courses, identical across all four specializations. */
export const agstCore: Requirement[] = [
  { kind: "course", id: "chem131", name: "Chemistry I - Fundamentals of General Chemistry (CHEM131)", options: ["CHEM131"] },
  { kind: "course", id: "chem132", name: "General Chemistry I Laboratory (CHEM132)", options: ["CHEM132"] },
  {
    kind: "sets",
    id: "organic-chem-or-plsc275",
    name: "Organic Chemistry I & Laboratory, or PLSC275: CHEM231 & CHEM232, or PLSC275",
    options: [["CHEM231", "CHEM232"], ["AGST275"]],
  },
  { kind: "course", id: "plsc201", name: "Plant Structure and Function (PLSC201)", options: ["PLSC201"] },
  { kind: "course", id: "plsc206", name: "Plant Structure and Function Laboratory (PLSC206)", options: ["PLSC206"] },
  { kind: "course", id: "enst200", name: "Fundamentals of Soil Science (ENST200)", options: ["ENST200"] },
  {
    kind: "course",
    id: "insect-pest-gateway",
    name: "Biology of Insects, IPM, or Insect Pests of Ornamentals and Turf (BSCI337, BSCI487, or BSCI497)",
    options: ["BSCI337", "BSCI487", "BSCI497"],
  },
  { kind: "course", id: "plsc420", name: "Principles of Plant Pathology (PLSC420)", options: ["PLSC420"] },
  { kind: "course", id: "plsc453", name: "Weed Science (PLSC453)", options: ["PLSC453"] },
];

/** reviewNotes common to all four specializations. Each track file appends its own notes. */
export const agstCommonReviewNotes: string[] = [
  "Two department pages were fetched alongside the catalog (program-sources/agricultural-science-" +
    "technology-major.md): psla.umd.edu is the Plant Science and Landscape Architecture department's " +
    "general home page (navigation, news, a one-line list of undergraduate program names) and " +
    "agnr.umd.edu/about/directory/melissa-welsh is a single faculty member's biography. Neither page " +
    "states any course requirement for this major, so neither disagrees with the catalog and the " +
    "owner's 'department page wins' ruling does not apply; only the 2026-27 Academic Catalog page is " +
    "encoded here.",
  "The Grading Policy ('grades of C- or higher in all required courses including courses used to " +
    "satisfy elective requirements') is encoded as the Program's minGrade: 'C-', applying to every " +
    "requirement including the restricted-elective choose rules.",
  "The catalog's 'Select one of the following specializations' (Agronomy; Environmental " +
    "Horticulture; Agricultural and Extension Education) is encoded as four Program files sharing " +
    "the `agst` major key, per the builder brief: Agronomy, Environmental Horticulture, and the " +
    "catalog's own further split of Agricultural and Extension Education into 'Teaching Certificate' " +
    "and 'Extension/Industry' variants (each with its own required-course table). defaultTrack is set " +
    "on Agronomy, the catalog's first-listed specialization.",
  "Not encoded (engine gap, matches other majors' precedent): the cumulative 2.0 GPA policy; no " +
    "residency rule is stated on this catalog page; and the major's own top-level 80-102 total-credit " +
    "range (Major Core 26-27 + Specialization 54-75), which the audit has no concept for. Each track's " +
    "own 'General Electives' line (unrestricted free credits) is likewise not encoded, matching every " +
    "other major's convention of leaving unrestricted elective credit out of the requirements list.",
];
