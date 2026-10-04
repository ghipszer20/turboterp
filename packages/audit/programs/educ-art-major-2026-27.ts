// Secondary Education - Art Major (Art Education, P-12), College of Education (TLPL), 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/
// art-education-major/; education.umd.edu/MCERT (a graduate program page), terrapinteachers.umd.edu (no
// requirements) and the College of Education major-four-year-plans page (links only), all fetched 2026-09-28;
// see program-sources/art-education-major.md. The department pages carry no requirements for this major, so
// there is no disagreement to resolve. Shared teacher-prep pieces come from educ-shared-2026-27.ts.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";
import {
  educAdolescentDevelopment,
  educContentAreaLiteracy,
  educFieldExperience,
  educFoundations,
  educInternship,
  educProfessionalSeminar,
  educSharedReviewNotes,
} from "./educ-shared-2026-27.ts";

const c = (id: string, name: string, course: string): Requirement => ({
  kind: "course",
  id,
  name: `${name} (${course})`,
  options: [course],
});

export const educArtMajor: Program = {
  id: "educ-art-major",
  name: "Secondary Education - Art Major (Art Education)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Secondary Education Major - Art " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/art-education-major/); " +
    "College of Education pages (education.umd.edu/MCERT, terrapinteachers.umd.edu, major four-year-plans page), fetched 2026-09-28",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...educSharedReviewNotes,
    "Department pages checked: the MCERT page describes a graduate certification program, terrapinteachers.umd.edu is a STEM-only landing page and the four-year-plans page only links out. None adds or contradicts a requirement, so the catalog is encoded alone.",
    "The printmaking row's options are garbled in the fetched catalog: ARTT341 (Woodcut and Relief) and ARTT343 (Screen Printing) have titles, but ARTT340 and ARTT344 appear without titles. All four are accepted as the 'select one' options; verify against the catalog.",
    "ARTH 300-400 level (6 credits) names a department and range only, so it accepts any ARTH course numbered 300-499.",
    "The catalog says TLPL430 must be taken concurrently with TLPL447, but TLPL430 is not in the requirement table; it is not encoded. TLPL435 is spring only and TLPL433 fall only (footnotes); term offering and course sequencing ('under review' per the catalog) are not encoded.",
    "TLPL478 appears twice (3 credits spring senior year, 1 credit fall senior year); encoded as two enrollments of TLPL478. TLPL479 is the Art section (TLPL479A) and TLPL489 the internship (12 credits); section titles are not distinguishable by course code.",
    "The catalog's Total Credits line (85) is not checked.",
    "No official 4-year plan is published for Art Education in the fetched sources (only links). The sample plan is CONSTRUCTED from the catalog table; flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    c("educ-art-arth200", "Art and Society in Ancient and Medieval Europe and the Mediterranean", "ARTH200"),
    c("educ-art-arth201", "Art and Society in the West from the Renaissance to the Present", "ARTH201"),
    c("educ-art-artt100", "Two-Dimensional Design Fundamentals", "ARTT100"),
    c("educ-art-artt110", "Elements of Drawing I", "ARTT110"),
    c("educ-art-artt150", "Introduction to Art Theory", "ARTT150"),
    c("educ-art-artt200", "Three-Dimensional Art Fundamentals", "ARTT200"),
    c("educ-art-artt210", "Elements of Drawing II", "ARTT210"),
    {
      kind: "choose",
      id: "educ-art-arth-upper",
      name: "Art History, 300-400 level (6 credits)",
      count: 2,
      credits: 6,
      from: { departments: ["ARTH"], minNumber: 300, maxNumber: 499 },
    },
    c("educ-art-artt320", "Elements of Painting", "ARTT320"),
    c("educ-art-artt418", "Advanced Drawing Studio", "ARTT418"),
    c("educ-art-artt428", "Advanced Painting Studio", "ARTT428"),
    c("educ-art-tlpl437", "Studio Processes and Materials: 3D", "TLPL437"),
    {
      kind: "course",
      id: "educ-art-printmaking",
      name: "Printmaking: one of ARTT340, ARTT341 (Woodcut and Relief), ARTT343 (Screen Printing) or ARTT344",
      options: ["ARTT340", "ARTT341", "ARTT343", "ARTT344"],
    },
    educAdolescentDevelopment,
    educContentAreaLiteracy,
    educFoundations,
    c("educ-art-tlpl435", "Art Education Methods I", "TLPL435"),
    c("educ-art-edsp470", "Introduction to Special Education", "EDSP470"),
    c("educ-art-tlpl433", "Foundations of Art Education", "TLPL433"),
    c("educ-art-tlpl447", "Art Education Methods II", "TLPL447"),
    educFieldExperience(1),
    c("educ-art-tlpl436", "Studio Processes and Materials: 2D", "TLPL436"),
    educInternship(1),
    educProfessionalSeminar(2),
  ],
};

export const educArtMajorMeta: ProgramMeta = {
  kind: "major",
  college: "EDUC",
  short: "Secondary Education - Art",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/art-education-major/",
    department: "https://education.umd.edu/student-resources/student-services/coe-undergraduate-studies-student-services-office/major-four",
  },
};
