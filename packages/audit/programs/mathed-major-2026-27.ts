// Secondary Education Major - Mathematics (7th-12th grade), College of Education (TLPL), 2026-27 UMD Academic
// Catalog. Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/
// mathematics-education-major/ plus the MCERT, terrapinteachers.umd.edu and College of Education four-year-plan
// pages (all fetched 2026-09-28); see program-sources/mathematics-education-major.md. The department pages
// carry no undergraduate requirements, so there is no disagreement to resolve. Shared teacher-prep pieces come
// from educ-shared-2026-27.ts. Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";
import {
  educContentAreaLiteracy,
  educFieldExperience,
  educFoundations,
  educInternship,
  educProfessionalSeminar,
  educSharedReviewNotes,
  educStemInquiry,
} from "./educ-shared-2026-27.ts";

const c = (id: string, name: string, course: string): Requirement => ({
  kind: "course",
  id,
  name: `${name} (${course})`,
  options: [course],
});

export const mathedMajor: Program = {
  id: "mathed-major",
  name: "Secondary Education Major - Mathematics",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Secondary Education Major - Mathematics " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/mathematics-education-major/); " +
    "College of Education major four-year-plan page (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...educSharedReviewNotes,
    "Department pages (MCERT graduate program, Terrapin Teachers, College of Education four-year plans) list no undergraduate requirements, so the catalog alone is encoded.",
    "The catalog table lists only the education and pre-professional courses (39-44 credits). It names no mathematics content courses, so the math content of the degree is not encoded here; check the Mathematics major requirements with the advisor.",
    "The catalog's Professional Education block lists BSCI348 (Special Topics in Cell Biology and Molecular Genetics, 1-4 credits), which looks like a stale or garbled row for a math teaching degree. It is encoded as listed (BSCI348, no substitutes) and left out of the sample plan (a known failure); confirm with the advisor.",
    "TLPL488 appears twice: a Special Topics row (1-3 credits) in the pre-professional block and TLPL488B (Teaching Academically, Culturally, and Linguistically Diverse Students, 2 credits) in the professional block. Encoded as two enrollments of TLPL488; the section is not checked.",
    "TLPL479 (479D, fall of senior year), TLPL478 (478D), TLPL489 (489D, student teaching, 12 credits) and TLPL403 (fall only, senior year) are encoded by course code; section letters and term restrictions are not checked.",
    "No four-year plan is readable in the fetched sources (the College page only links 'Secondary Math Education'). The sample plan is CONSTRUCTED from the catalog table; flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    educContentAreaLiteracy,
    ...educStemInquiry,
    educFoundations,
    c("mathed-math274", "History of Mathematics", "MATH274"),
    c("mathed-math470", "Mathematics for Secondary Education", "MATH470"),
    {
      kind: "choose",
      id: "mathed-tlpl488",
      name: "Special Topics in Education (TLPL488, 2 enrollments: pre-professional topic and TLPL488B diverse students)",
      count: 2,
      from: { courses: ["TLPL488"] },
    },
    c("mathed-bsci348", "Special Topics in Cell Biology and Molecular Genetics", "BSCI348"),
    c("mathed-tlpl401", "Student-Centered Curriculum and Instruction", "TLPL401"),
    c("mathed-tlpl403", "Teaching and Learning High School Mathematics", "TLPL403"),
    educFieldExperience(1),
    educProfessionalSeminar(1),
    educInternship(1),
  ],
};

export const mathedMajorMeta: ProgramMeta = {
  kind: "major",
  college: "EDUC",
  short: "Secondary Education - Mathematics",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/mathematics-education-major/",
    department:
      "https://education.umd.edu/student-resources/student-services/coe-undergraduate-studies-student-services-office/major-four",
  },
};
