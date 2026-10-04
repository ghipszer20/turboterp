// Secondary Education - English Major (grades 7-12), College of Education (TLPL), 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/
// english-education-major/; education.umd.edu/MCERT (a graduate program page), terrapinteachers.umd.edu (no
// requirements) and the College of Education major-four-year-plans page (links only), all fetched 2026-09-28;
// see program-sources/english-education-major.md. The department pages carry no requirements for this major, so
// there is no disagreement to resolve. Shared teacher-prep pieces come from educ-shared-2026-27.ts.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";
import {
  educAdolescentDevelopment,
  educContentAreaLiteracy,
  educDigitalLearningTools,
  educDiverseLearners,
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

export const educEnglishMajor: Program = {
  id: "educ-english-major",
  name: "Secondary Education - English Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Secondary Education Major - English " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/english-education-major/); " +
    "College of Education pages (education.umd.edu/MCERT, terrapinteachers.umd.edu, major four-year-plans page), fetched 2026-09-28",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...educSharedReviewNotes,
    "Department pages checked: the MCERT page describes a graduate certification program, terrapinteachers.umd.edu is a STEM-only landing page and the four-year-plans page only links out. None adds or contradicts a requirement, so the catalog is encoded alone.",
    "Element 2 (Historical Studies, 15 credits: one course in at least five of six periods) and Element 3 (Language, Writing, and Rhetoric, 9 credits: one History/Analysis/Theory course, one Practice/Performance/Pedagogy course, one open) name no courses in the source (approved list at go.umd.edu/EnglishEducation, not fetched). Each is encoded as a credit pool over ENGL and CMLT courses (100-499, excluding ENGL301), matching the English major's precedent; the period and topic distributions are NOT enforced. ",
    "Element 3's remaining 3 credits ('any language, writing, or rhetoric course'; no department or range named) is now an openSlot requirement, 'educ-english-element3-open' (main session 2026-09-28 split it out of the ENGL/CMLT pool, which was narrower than the source). The student confirms the course with their advisor.",
    "Element 4 (Electives, 12 credits) is encoded as stated: any ENGL or CMLT course. It is a separate consuming pool, so no course counts twice across Elements 2-4.",
    "Element 5 (American Literature, Shakespeare, Differences and Diasporas, Methods, Advanced Writing) is a set of co-requirements satisfied by courses already counted in Elements 2-4; no course-to-designation list is in the source, so it is not encoded. Manual: the Fundamental Studies Professional Writing course cannot count toward Advanced Writing.",
    "The catalog's Total Credits line (82) is not checked. TLPL479C must be taken concurrently with TLPL456 and TLPL478C with TLPL489C (footnotes); concurrency is not encoded.",
    "TLPL488 (2 credits) is encoded as the course code TLPL488; the required section (TLPL488B) is not distinguishable.",
    "No official 4-year plan is published for Secondary English Education in the fetched sources (only links). The sample plan is CONSTRUCTED from the catalog table; flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    c("educ-english-engl301", "This is English: Fields and Methods", "ENGL301"),
    {
      kind: "choose",
      id: "educ-english-historical",
      name: "Element 2: Historical Studies (15 credits; one course in at least five of six periods, not enforced)",
      count: 5,
      credits: 15,
      from: { departments: ["ENGL", "CMLT"], minNumber: 100, maxNumber: 499, exclude: ["ENGL301"] },
    },
    {
      kind: "choose",
      id: "educ-english-language-writing",
      name: "Element 3: Language, Writing, and Rhetoric (6 of 9 credits; topic split not enforced)",
      count: 2,
      credits: 6,
      from: { departments: ["ENGL", "CMLT"], minNumber: 100, maxNumber: 499, exclude: ["ENGL301"] },
    },
    {
      kind: "openSlot",
      id: "educ-english-element3-open",
      name: "Element 3: any language, writing, or rhetoric course",
      credits: 3,
      note: "Any language, writing, or rhetoric course; the catalog names no department or range. The approved list is at go.umd.edu/EnglishEducation. Confirm with your advisor.",
    },
    {
      kind: "choose",
      id: "educ-english-electives",
      name: "Element 4: Electives (12 credits, any ENGL or CMLT course)",
      count: 4,
      credits: 12,
      from: { departments: ["ENGL", "CMLT"], minNumber: 100, maxNumber: 499, exclude: ["ENGL301"] },
    },
    {
      kind: "course",
      id: "educ-english-comm",
      name: "Argumentation and Debate, Argumentation and Public Policy, or Communication Theory and Process (COMM230, COMM330 or COMM402)",
      options: ["COMM230", "COMM330", "COMM402"],
    },
    educAdolescentDevelopment,
    educContentAreaLiteracy,
    educDiverseLearners,
    educFoundations,
    c("educ-english-tlpl457", "Literature for Adolescents", "TLPL457"),
    c("educ-english-tlpl456", "Teaching Writing", "TLPL456"),
    c("educ-english-tlpl451", "Teaching and Learning in Secondary Education: English", "TLPL451"),
    c("educ-english-tlpl452", "Bases for English Language Instruction", "TLPL452"),
    educFieldExperience(1),
    educDigitalLearningTools,
    educProfessionalSeminar(1),
    educInternship(1),
  ],
};

export const educEnglishMajorMeta: ProgramMeta = {
  kind: "major",
  college: "EDUC",
  short: "Secondary Education - English",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/english-education-major/",
    department: "https://education.umd.edu/student-resources/student-services/coe-undergraduate-studies-student-services-office/major-four",
  },
};
