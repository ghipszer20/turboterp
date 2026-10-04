// Elementary Education Major (1st-6th grade), College of Education (TLPL), 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/
// elementary-education-major/ and education.umd.edu/academics/departments/tlpl (both fetched 2026-09-28);
// see program-sources/elementary-education-major.md. The department page has no requirements beyond the
// catalog's, so there is no disagreement to resolve. Shared teacher-prep pieces come from educ-shared-2026-27.ts.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";
import {
  educDigitalLearningTools,
  educDisabilitiesElementary,
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

export const elemMajor: Program = {
  id: "elem-major",
  name: "Elementary Education Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Elementary Education Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/elementary-education-major/); " +
    "College of Education TLPL department page, https://education.umd.edu/academics/departments/tlpl (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...educSharedReviewNotes,
    "Biological Science with lab, 4 credits (gateway requirement, also a Gen Ed double count), is now an openSlot requirement ('elem-biological-science'). The catalog names no course or department.",
    "Physical Science with lab, 4 credits (gateway requirement, also a Gen Ed double count), is now an openSlot requirement ('elem-physical-science'). The catalog names no course or department.",
    "Social Science, 3 credits (double counts with Gen Ed), is now an openSlot requirement ('elem-social-science'). The catalog only recommends GEOG100, GVPT170, PSYC100 or SOCY100; it names no required list.",
    "Area of Emphasis, 18 credits (World Language, Literature, Mathematics, Science or Social Studies), is now an openSlot requirement ('elem-area-of-emphasis'). The catalog defers the course lists to the Student Services Advising Office.",
    "Not enforced (manual): the 14-16 credits of gateway math and science need a 'C-' in each course and an overall 2.7 GPA; total credits (115).",
    "TLPL251 needs a minimum grade of 'B-' (footnote 2), encoded as a requirement-level minimum grade.",
    "The catalog lists TLPL478 three times (1, 1 and 2 credits), TLPL479 twice (479B and 479C, 1 credit each) and TLPL489 twice (9 and 2 credits) under the Year Long Internship block; each is encoded as a count of enrollments.",
    "No official 4-year plan is published for Elementary Education in the fetched sources (the department page only lists 'Major Four Year Plans' links). The sample plan is CONSTRUCTED from the catalog table; flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    c("elem-math212", "Elements of Numbers and Operations", "MATH212"),
    c("elem-math213", "Elements of Geometry and Measurement", "MATH213"),
    { ...c("elem-tlpl251", "Community, Learners, and Classroom Climate", "TLPL251"), minGrade: "B-" },
    c("elem-hist200", "Interpreting American History: Beginnings to 1877", "HIST200"),
    c("elem-math214", "Elements of Probability and Statistics", "MATH214"),
    c("elem-tlpl340", "Introduction to Children's Literature and Critical Literacy", "TLPL340"),
    {
      kind: "course",
      id: "elem-social-psychology",
      name: "Social Psychology (SOCY230 or PSYC221)",
      options: ["SOCY230", "PSYC221"],
    },
    educFoundations,
    c("elem-edhd411", "Child Growth and Development", "EDHD411"),
    educDisabilitiesElementary,
    c("elem-tlpl332", "Arts Integration in Elementary Classrooms", "TLPL332"),
    c("elem-tlpl341", "Assessing Language and Literacy Development in Elementary Classrooms", "TLPL341"),
    c("elem-tlpl342", "Promoting Skilled and Motivated Readers in Diverse Elementary Classrooms, Part 1", "TLPL342"),
    c("elem-tlpl361", "Community, Learners, and Classroom Engagement", "TLPL361"),
    c("elem-tlpl362", "Curriculum and Instruction in Elementary Education: Social Studies", "TLPL362"),
    educDigitalLearningTools,
    c("elem-tlpl312", "Curriculum and Instruction in Elementary Education: Mathematics", "TLPL312"),
    c("elem-tlpl321", "Curriculum and Instruction in Elementary Education: Science", "TLPL321"),
    c("elem-tlpl343", "Promoting Skilled and Motivated Readers in Diverse Elementary Classrooms, Part 2", "TLPL343"),
    c("elem-tlpl344", "Culturally Responsive Language and Literacy Instruction in Diverse Elementary Classrooms", "TLPL344"),
    c("elem-tlpl446", "Language Variation and Multilingualism in Elementary Classrooms", "TLPL446"),
    educProfessionalSeminar(3),
    educFieldExperience(2),
    educInternship(2),
    {
      kind: "openSlot",
      id: "elem-biological-science",
      name: "Biological science with lab",
      credits: 4,
      note: "Gateway requirement (also counts toward Gen Ed). The catalog names no course; confirm with your advisor.",
    },
    {
      kind: "openSlot",
      id: "elem-physical-science",
      name: "Physical science with lab",
      credits: 4,
      note: "Gateway requirement (also counts toward Gen Ed). The catalog names no course; confirm with your advisor.",
    },
    {
      kind: "openSlot",
      id: "elem-social-science",
      name: "Social science",
      credits: 3,
      note: "The catalog recommends GEOG100, GVPT170, PSYC100 or SOCY100 but names no required list. Confirm with your advisor.",
    },
    {
      kind: "openSlot",
      id: "elem-area-of-emphasis",
      name: "Area of emphasis",
      credits: 18,
      note: "World Language, Literature, Mathematics, Science or Social Studies. The course lists are held by the Student Services Advising Office.",
    },
  ],
};

export const elemMajorMeta: ProgramMeta = {
  kind: "major",
  college: "EDUC",
  short: "Elementary Education",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/elementary-education-major/",
    department: "https://education.umd.edu/academics/departments/tlpl",
  },
};
