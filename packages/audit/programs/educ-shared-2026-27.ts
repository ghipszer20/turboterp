// Shared requirement factories for the College of Education teacher-preparation majors, 2026-27 UMD
// Academic Catalog (TLPL-housed programs). Not a program file (no `*Meta` export, so the registry
// generator ignores it). Each `<major>-2026-27.ts` imports the pieces it needs and spreads them into its own
// `requirements`, then appends `educSharedReviewNotes` to its own `reviewNotes`.
// Sources: the "## Catalog requirements" sections of program-sources/{elementary,middle-school,
// mathematics,english}-education-major.md (fetched 2026-09-28).
//
// What is common (real overlap found across Elementary, Middle School, Math and English):
//   educFoundations            TLPL250 or TLPL360 (all four; the College requires a Foundations course)
//   educProfessionalSeminar(n) TLPL478 taken n times (credits vary by major and come from the catalog course)
//   educFieldExperience(n)     TLPL479 taken n times
//   educInternship(n)          TLPL489 taken n times (the yearlong internship; the "S" grade is a manual check)
//   educDigitalLearningTools   TLPL300 (Elementary, Middle School, English; NOT listed for Math)
//   educStemInquiry            TLPL101 + TLPL102 (Middle School, Math: the Terrapin Teachers STEM pair)
//   educAdolescentDevelopment  EDHD413 (Middle School, English)
//   educContentAreaLiteracy    EDHD426 (Math, English); Middle School uses EDHD436 instead (its own)
//   educDisabilitiesElementary EDSP401 (Elementary, Middle School)
//   educDiverseLearners        TLPL488, section B "Teaching Academically, Culturally, and Linguistically
//                              Diverse Students in Secondary Education" (Math, English); Middle School
//                              uses TLPL441 + TLPL481 instead
//
// What each sibling adds itself (not encoded here):
//   Elementary: gateway math/science, MATH212-214, TLPL251, area of emphasis, elementary methods block.
//   Middle School: GEOL/PHYS/CHEM/BSCI/AOSC science, MATH212-214 + MATH312/314/315, TLPL413/420/423/424,
//     EDHD436, TLPL441, TLPL481.
//   Math (secondary): MATH274, MATH470, TLPL401, TLPL403, plus the math-major courses.
//   English (secondary): ENGL five-element subject area, COMM230/330/402, TLPL451/452/456/457.
//   Every major: GPA 2.75 after admission, Praxis, admission to the Teacher Education Program (manual).

import type { Requirement } from "../src/audit.ts";

/** Foundations of Education: "Select one of: TLPL250 or TLPL360". */
export const educFoundations: Requirement = {
  kind: "course",
  id: "educ-foundations",
  name: "Foundations of Education (TLPL250 or TLPL360)",
  options: ["TLPL250", "TLPL360"],
};

/** Digital Learning Tools and Communities (1 credit). */
export const educDigitalLearningTools: Requirement = {
  kind: "course",
  id: "educ-tlpl300",
  name: "Digital Learning Tools and Communities (TLPL300)",
  options: ["TLPL300"],
};

/** Teaching Students with Disabilities in Elementary Classrooms (3 credits). */
export const educDisabilitiesElementary: Requirement = {
  kind: "course",
  id: "educ-edsp401",
  name: "Teaching Students with Disabilities in Elementary Classrooms (EDSP401)",
  options: ["EDSP401"],
};

/** Adolescent Development (3 credits). */
export const educAdolescentDevelopment: Requirement = {
  kind: "course",
  id: "educ-edhd413",
  name: "Adolescent Development (EDHD413)",
  options: ["EDHD413"],
};

/** Cognitive and Motivational Literacy in the Content Areas (3 credits). */
export const educContentAreaLiteracy: Requirement = {
  kind: "course",
  id: "educ-edhd426",
  name: "Cognitive and Motivational Literacy Content (EDHD426)",
  options: ["EDHD426"],
};

/** Terrapin Teachers STEM inquiry pair (1 + 2 credits). */
export const educStemInquiry: Requirement[] = [
  { kind: "course", id: "educ-tlpl101", name: "Inquiry Approach to Teaching STEM (TLPL101)", options: ["TLPL101"] },
  { kind: "course", id: "educ-tlpl102", name: "Inquiry Teaching of STEM in Middle School (TLPL102)", options: ["TLPL102"] },
];

/** Secondary diversity course (TLPL488B); the audit matches the course code TLPL488. */
export const educDiverseLearners: Requirement = {
  kind: "course",
  id: "educ-tlpl488b",
  name: "Teaching Academically, Culturally, and Linguistically Diverse Students in Secondary Education (TLPL488B)",
  options: ["TLPL488"],
};

const repeated = (id: string, label: string, course: string, count: number): Requirement => {
  const name = `${label} (${course}${count === 1 ? "" : `, ${count} enrollments`})`;
  return count === 1
    ? { kind: "course", id, name, options: [course] }
    : { kind: "choose", id, name, count, from: { courses: [course] } };
};

/** Professional Seminar in Education (TLPL478), `count` separate enrollments. */
export const educProfessionalSeminar = (count: number): Requirement =>
  repeated("educ-tlpl478", "Professional Seminar in Education", "TLPL478", count);

/** Field Experiences in Education (TLPL479), `count` separate enrollments. */
export const educFieldExperience = (count: number): Requirement =>
  repeated("educ-tlpl479", "Field Experiences in Education", "TLPL479", count);

/** Internship in Education (TLPL489), `count` separate enrollments (the yearlong internship). */
export const educInternship = (count: number): Requirement =>
  repeated("educ-tlpl489", "Internship in Education", "TLPL489", count);

/** Manual checks common to every College of Education teacher-preparation major. */
export const educSharedReviewNotes: string[] = [
  "Not enforced (manual): admission to the College of Education Teacher Education Program before the professional sequence, an overall GPA of 2.75 after admission, satisfactory College of Education Foundational Competencies evaluations, Praxis test of basic skills (admission) and Praxis II (internship and graduation), and an 'S' in the internship.",
  "The catalog says all pre-professional and professional coursework needs a 'C-' or better; encoded as the program-level minimum grade.",
  "Repeated TLPL478/TLPL479/TLPL489 enrollments (separate catalog rows with different section titles and credits) are encoded as one `choose` with a count over the course code; the audit treats each completed enrollment as its own slot, so the per-row credit split is not checked.",
];
