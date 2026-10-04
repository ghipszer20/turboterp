// Shared requirement building blocks for the Animal Sciences Major's two specialization tracks
// (Animal Care and Management; Science/Professional & Combined Ag-Veterinary Medicine), 2026-27 UMD
// Academic Catalog. Not a program file itself (no `*Meta` export, so the registry generator ignores
// it); imported by ansc-major-*-2026-27.ts, which share the Animal Sciences Core and Management
// Courses list and define their own Required Courses and Advanced ANSC Electives.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/
//   animal-sciences/animal-sciences-major/ (fetched 2026-09-28). No department page was found for
// this major (see program-sources/animal-sciences-major.md); the owner ruling that the department
// page wins where the two disagree does not apply here.

import type { Requirement } from "../src/audit.ts";

/** Animal Sciences Core, identical across both specializations. */
export const anscCore: Requirement[] = [
  { kind: "course", id: "ansc101", name: "Principles of Animal Science (ANSC101)", options: ["ANSC101"] },
  { kind: "course", id: "ansc103", name: "Principles of Animal Science Laboratory (ANSC103)", options: ["ANSC103"] },
  { kind: "course", id: "ansc201", name: "Anatomy and Physiology of Domestic Animals (ANSC201)", options: ["ANSC201"] },
  { kind: "course", id: "ansc314", name: "Comparative Animal Nutrition (ANSC314)", options: ["ANSC314"] },
  { kind: "course", id: "ansc315", name: "Applied Animal Nutrition (ANSC315)", options: ["ANSC315"] },
  { kind: "course", id: "ansc401", name: "Animal Growth and Development for Production Agriculture (ANSC401)", options: ["ANSC401"] },
  { kind: "course", id: "bsci160", name: "Principles of Ecology and Evolution (BSCI160)", options: ["BSCI160"] },
  { kind: "course", id: "bsci170", name: "Principles of Molecular & Cellular Biology (BSCI170)", options: ["BSCI170"] },
  {
    kind: "sets",
    id: "biology-lab",
    name: "Biology Laboratory: BSCI161 & BSCI171, or BSCI180",
    options: [["BSCI161", "BSCI171"], ["BSCI180"]],
  },
  { kind: "course", id: "bsci223", name: "General Microbiology (BSCI223)", options: ["BSCI223"] },
  { kind: "course", id: "chem131", name: "Chemistry I - Fundamentals of General Chemistry (CHEM131)", options: ["CHEM131"] },
  { kind: "course", id: "chem132", name: "General Chemistry I Laboratory (CHEM132)", options: ["CHEM132"] },
  {
    kind: "course",
    id: "intro-economics-gateway",
    name: "Introductory Economics (AREC250, AREC240, or ECON200)",
    options: ["AREC250", "AREC240", "ECON200"],
  },
  { kind: "course", id: "biom301", name: "Introduction to Biometrics (BIOM301)", options: ["BIOM301"] },
];

/** Management Courses list, identical across both specializations (only the credit target differs). */
export const anscManagementCourses = [
  "ANSC220", "ANSC232", "ANSC237", "ANSC242", "ANSC245", "ANSC246", "ANSC250", "ANSC255", "ANSC260", "ANSC262", "ANSC282",
];

/** reviewNotes common to both specializations. Each track file appends its own notes. */
export const anscCommonReviewNotes: string[] = [
  "No department page was found for the Animal Sciences Major; only the 2026-27 Academic Catalog " +
    "page was available as a source (program-sources/animal-sciences-major.md). The owner ruling " +
    "that the department page wins where the two disagree does not apply since there is no " +
    "department source to compare against.",
  "The catalog's 'Select one of the following specializations' (Animal Care and Management; " +
    "Science/Professional & Combined Ag-Veterinary Medicine) is encoded as two Program files sharing " +
    "the `ansc` major key, per the builder brief. defaultTrack is set on Animal Care and Management, " +
    "the catalog's first-listed specialization. The catalog's narrative 'Other Requirements for the " +
    "Major' section further splits Science/Professional into three admission tracks (Science/" +
    "Professional 0104E; Combined Ag & Vet Sci 1299D) but gives them one shared required-course " +
    "table, so they are not split into separate programs here.",
  "ANSC443 (Advanced ANSC Electives, both specializations), ANSC497 (Advanced ANSC Electives, both " +
    "specializations) and ANSC220 (Management Courses, both specializations) carry no course title " +
    "in the fetched catalog table (a conversion artifact, not a builder omission); kept as valid " +
    "options since the catalog itself names each course number, matching the AREC431 precedent in " +
    "arec-shared-2026-27.ts.",
  "The catalog's footnote '*A complete listing of all currently approved Management and Advanced " +
    "ANSC Elective courses is available from our ANSC Course Listing page' points to a department " +
    "page that was not found/fetched; only the catalog's own printed course lists are encoded here, " +
    "which may be narrower than the department's live, currently-approved list. Flagged in " +
    "docs/project/owner-review.md.",
  "Program GPA 2.0 encoded as minGpa.",
  "Not encoded (engine gap, matches other majors' precedent): the catalog's minimum-grade policy's " +
    "cumulative 2.0 GPA (the per-course C- floor IS " +
    "encoded via minGrade); no residency rule is stated on this catalog page (unlike other majors' " +
    "department checklists); and the major's own 69-76 total-credit range plus each specialization's " +
    "34-37 / 38-39 credit total, which the audit has no concept for.",
];
