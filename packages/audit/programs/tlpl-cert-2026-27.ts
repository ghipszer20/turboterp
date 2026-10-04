// Secondary Education Certificate (Upper Division), 2026–27 UMD Academic Catalog.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/secondary-education-certificate/
// (fetched 2026-09-28). The College of Education's education.umd.edu/studentinfo page states no certificate
// requirements, so there is no department page to compare. Encoded by hand from
// program-sources/secondary-education-certificate.md. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const tlplCert: Program = {
  id: "tlpl-cert",
  name: "Secondary Education Certificate",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Secondary Education Certificate (education.umd.edu/studentinfo states no requirements) (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Only the catalog states requirements; the College of Education Student Services page (education.umd.edu/studentinfo) gives none, so no department-vs-catalog difference could be checked.",
    "Part II ('Content Area and Pedagogy Courses, courses vary by content area', 6 credits): the catalog shows only the social studies pair TLPL470 and TLPL471 as an example. Encoded as 6 credits from any TLPL 400-499 course other than the Part I and Part III courses, never narrower than the social studies pair. Flagged: other content areas' methods courses may carry other prefixes, and non-methods TLPL courses are wrongly accepted.",
    "Part III: TLPL478 (Professional Seminar) and TLPL489 (Internship); credits vary by content area (catalog totals 5 credits for Part III and 22 in all, 21-23). Credits per course are not checked.",
    "Not enforced (manual): admission to the certificate (completion of the 11 Part I credits and passing scores on required tests, or a bachelor's degree plus content-area prerequisite courses; 2.5 GPA; two letters of recommendation; prior experience with youth; educational goals statement; application through COE Student Services by December 1); students may not proceed beyond Part I until accepted; the Transcript Notation in Secondary Education, earned with the 11 Part I credits alone if the student does not continue; conditionally certified teachers with a bachelor's degree, who complete the Part I content courses before Part II. The C- minimum per course is encoded.",
    "No sharing limit is encoded: the catalog states none.",
  ],
  requirements: [
    { kind: "course", id: "edhd413", name: "EDHD413 Adolescent Development", options: ["EDHD413"] },
    { kind: "course", id: "tlpl477", name: "TLPL477 Teaching Academically, Culturally, and Linguistically Diverse Students (2 credits)", options: ["TLPL477"] },
    { kind: "course", id: "tlpl481", name: "TLPL481 Embracing Diversity in the Classroom Community", options: ["TLPL481"] },
    { kind: "course", id: "reading", name: "TLPL462 Reading in the Secondary School or EDHD426", options: ["TLPL462", "EDHD426"] },
    {
      kind: "choose",
      id: "part-ii",
      name: "Part II content area and pedagogy courses (6 credits; social studies: TLPL470, TLPL471)",
      credits: 6,
      from: {
        departments: ["TLPL"],
        minNumber: 400,
        maxNumber: 499,
        exclude: ["TLPL462", "TLPL477", "TLPL478", "TLPL481", "TLPL489"],
      },
    },
    { kind: "course", id: "tlpl478", name: "TLPL478 Professional Seminar in Education (Part III)", options: ["TLPL478"] },
    { kind: "course", id: "tlpl489", name: "TLPL489 Internship in Education (Part III)", options: ["TLPL489"] },
  ],
};

export const tlplCertMeta: ProgramMeta = {
  kind: "certificate",
  college: "EDUC",
  short: "Secondary Education Certificate",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/secondary-education-certificate/",
  },
};
