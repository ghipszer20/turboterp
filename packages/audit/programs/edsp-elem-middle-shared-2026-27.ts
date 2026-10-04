// Shared requirements for the Elementary/Middle Special Education Major's two tracks (Track 1: Severe
// Disabilities; Track 2: Inclusive Education), College of Education (CHSE), 2026-27 UMD Academic Catalog.
// Not a program file (no `*Meta` export, so the registry generator ignores it). Imported by
// edsp-elem-middle-major-*-2026-27.ts.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/education/counseling-higher-special-education/
// elementary-middle-special-education-major/ and the College of Education "Major Four Year Plans" page,
// education.umd.edu/student-resources/student-services/coe-undergraduate-studies-student-services-office/major-four
// (both fetched 2026-09-28); see program-sources/elementary-middle-special-education-major.md.

import type { Requirement } from "../src/audit.ts";
import { educFoundations } from "./educ-shared-2026-27.ts";

const c = (id: string, name: string, course: string): Requirement => ({
  kind: "course",
  id,
  name: `${name} (${course})`,
  options: [course],
});

const oneOf = (id: string, name: string, options: string[]): Requirement => ({
  kind: "course",
  id,
  name: `${name} (${options.join(" or ")})`,
  options,
});

/** College Requirements and the professional courses both tracks share. */
export const edspShared: Requirement[] = [
  { ...oneOf("edsp-foundations-sped", "Foundations of Special Education: Inclusive Practices", ["EDSP210", "EDSP211"]), minGrade: "B-" },
  c("edsp-psyc100", "Introduction to Psychology", "PSYC100"),
  oneOf("edsp-sociology", "Introduction to Sociology or Understanding Contemporary Social Problems", ["SOCY100", "SOCY105"]),
  oneOf("edsp-american-history", "Interpreting American History", ["HIST200", "HIST201"]),
  oneOf("edsp-hearing-sign", "Introduction to Hearing and Speech Sciences or Fundamentals of Sign Language", ["HESP202", "CHSE376"]),
  c("edsp-stat100", "Elementary Statistics and Probability", "STAT100"),
  oneOf("edsp-child-development", "Child Growth and Development or Developmental Psychology", ["EDHD411", "PSYC355"]),
  c("edsp-math212", "Elements of Numbers and Operations", "MATH212"),
  c("edsp-math213", "Elements of Geometry and Measurement", "MATH213"),
  {
    kind: "choose",
    id: "edsp-engl-literature",
    name: "ENGL Literature (HU), 1 course",
    count: 1,
    from: { departments: ["ENGL"] },
  },
  educFoundations,
  // Professional Semester I (fall)
  c("edsp411", "Foundations of Technology Integration for Curriculum Access", "EDSP411"),
  c("edsp413", "Principles and Practices in Positive Behavior Interventions and Classroom Supports", "EDSP413"),
  c("edsp400", "Instruction of Students with Severe Disabilities I", "EDSP400"),
  c("edsp451", "Curriculum and Instruction: Elementary/Middle Special Education", "EDSP451"),
  c("edsp443", "Language and Literacy Acquisition in Children with Disabilities", "EDSP443"),
  c("edsp425", "Pre-Internship I", "EDSP425"),
  // Professional Semester II (spring)
  c("edsp415", "Assessment Techniques and Practices in Special Education", "EDSP415"),
  c("edsp416", "Reading and Writing Instruction in Special Education I", "EDSP416"),
  c("edsp485", "Assessment and Instruction in Mathematics in Special Education", "EDSP485"),
  c("edsp426", "Pre-Internship II", "EDSP426"),
  // Professional Semester III (fall)
  c("edsp484", "Reading and Writing Instruction in Special Education II", "EDSP484"),
  c("edsp487", "Collaborative Partnerships in Special Education", "EDSP487"),
  c("edsp404", "Methods of Teaching Autistic Students", "EDSP404"),
  c("edsp452", "Internship I: Elementary/Middle Special Education", "EDSP452"),
  // Professional Semester IV (spring)
  c("edsp490", "Teacher Candidate Research Seminar in Special Education", "EDSP490"),
  c("edsp495", "Internship II: Elementary/Middle Special Education", "EDSP495"),
  {
    kind: "openSlot",
    id: "edsp-physical-science",
    name: "Physical science with lab",
    credits: 4,
    note: "The catalog names no course or department (also counts toward Gen Ed). Confirm with your advisor.",
  },
  {
    kind: "openSlot",
    id: "edsp-biological-science",
    name: "Biological science with lab",
    credits: 4,
    note: "The catalog names no course or department (also counts toward Gen Ed). Confirm with your advisor.",
  },
];

/** reviewNotes common to both tracks. Each track file appends its own. */
export const edspSharedReviewNotes: string[] = [
  "The College of Education page (education.umd.edu .../major-four) lists only the college's four-year-plan links and general policies (120-credit minimum, 'C-' in pre-professional and professional work, 2.75 GPA after admission, 'S' in the internship); it gives no course requirements and no plan for this major, so there is no disagreement with the catalog. The catalog is encoded.",
  "Not enforced (manual): admission to Teacher Education, an overall GPA of 2.75 after admission, satisfactory College of Education Foundational Competencies evaluations, a Maryland Test of Basic Skills for admission, Praxis II Special Education for the internship and graduation, the yearlong PDS internship, and total credits (151-161).",
  "EDSP210/EDSP211 (Foundations of Special Education) needs a 'B-' or better, encoded as a requirement-level minimum grade; the other college requirements use the catalog's 'C-', encoded as the program-level minimum grade (the College also states 'C-' for all pre-professional and professional coursework).",
  "Physical Science with lab, 4 credits (a Gen Ed double count), is now an openSlot requirement ('edsp-physical-science'). The catalog names no course or department.",
  "Biological Science with lab, 4 credits (a Gen Ed double count), is now an openSlot requirement ('edsp-biological-science'). The catalog names no course or department.",
  "'ENGL Literature (HU)' names only the department, so any one ENGL course is accepted (a narrower literature list would wrongly fail real students); flagged so the owner can decide whether a literature-only filter is wanted.",
  "EDSP452 (Internship I) is listed at 2-4 credits; the audit matches the course, not the credit amount.",
  "No official four-year plan is published in the fetched sources. The sample plan is CONSTRUCTED from the catalog table; flagged in docs/project/owner-review.md.",
];
