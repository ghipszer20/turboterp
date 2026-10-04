// Middle School Education Major (Middle School Math and Science, grades 4-9), College of Education (TLPL),
// 2026-27 UMD Academic Catalog. Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/education/
// teaching-learning-policy-leadership/middle-school-education-major/ and education.umd.edu/academics/departments/tlpl
// (fetched 2026-09-28); see program-sources/middle-school-education-major.md. The catalog lists one fixed
// course set (no content-area choices), so there are no tracks. The department page has no requirements, so
// there is no disagreement to resolve. Shared teacher-prep pieces come from educ-shared-2026-27.ts.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";
import {
  educAdolescentDevelopment,
  educDigitalLearningTools,
  educDisabilitiesElementary,
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

export const mided: Program = {
  id: "mided-major",
  name: "Middle School Education Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Middle School Education Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/middle-school-education-major/); " +
    "College of Education TLPL department page, https://education.umd.edu/academics/departments/tlpl (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...educSharedReviewNotes,
    "The catalog lists no content-area choices (the major is Middle School Math and Science), so it is one program with no tracks.",
    "Lab-paired science rows (GEOL100 & GEOL110, CHEM131 & CHEM132, AOSC200 & AOSC201) are each a `sets` requirement of two courses taken together. The BSCI row is a `sets` requirement of the three catalog options; per footnotes 2 and 3, BSCI161 may replace BSCI180 (with BSCI160) and BSCI171 may replace BSCI180 (with BSCI170), added as extra options.",
    "The catalog's 'Weather and Climate' row (AOSC200 & AOSC201, 4 credits) sits directly under the BSCI options and is not indented as one of them; it is encoded as its own required science row, not a BSCI option.",
    "Footnote 1 (Professional Writing: any approved course, ENGL398L recommended) is a Gen Ed matter and is not encoded.",
    "Not enforced (manual): total credits (89 in the table).",
    "No official 4-year plan is readable in the fetched sources (the pages only link to 'Middle School Math and Science Education' roadmaps). The sample plan is CONSTRUCTED from the catalog table; flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    { kind: "sets", id: "mided-geol", name: "Physical Geology and Laboratory (GEOL100 & GEOL110)", options: [["GEOL100", "GEOL110"]] },
    {
      kind: "course",
      id: "mided-physics",
      name: "Inquiry into Physics or Fundamentals of Physics I (PHYS115 or PHYS121)",
      options: ["PHYS115", "PHYS121"],
    },
    { kind: "sets", id: "mided-chem", name: "Chemistry I and Laboratory (CHEM131 & CHEM132)", options: [["CHEM131", "CHEM132"]] },
    {
      kind: "sets",
      id: "mided-bsci",
      name: "Biological Science (BSCI103, or BSCI160 or BSCI170 with the laboratory)",
      options: [
        ["BSCI103"],
        ["BSCI160", "BSCI180"],
        ["BSCI160", "BSCI161"],
        ["BSCI170", "BSCI180"],
        ["BSCI170", "BSCI171"],
      ],
    },
    { kind: "sets", id: "mided-aosc", name: "Weather and Climate and Laboratory (AOSC200 & AOSC201)", options: [["AOSC200", "AOSC201"]] },
    c("mided-math212", "Elements of Numbers and Operations", "MATH212"),
    c("mided-math213", "Elements of Geometry and Measurement", "MATH213"),
    c("mided-math214", "Elements of Probability and Statistics", "MATH214"),
    c("mided-math312", "Mathematical Reasoning and Proof for Pre-Service Middle School Teachers", "MATH312"),
    c("mided-math314", "Introduction to Probability, Data, Analysis and Statistics for Preservice Middle School Teachers", "MATH314"),
    c("mided-math315", "Algebra for Preservice Middle School Teachers", "MATH315"),
    ...educStemInquiry,
    educFoundations,
    c("mided-tlpl252", "Students, Schooling, and Communities", "TLPL252"),
    educAdolescentDevelopment,
    c("mided-edhd436", "Cognition and Motivation in Content Area Literacy for Middle-School Students", "EDHD436"),
    c("mided-tlpl413", "Teaching and Learning Middle School Mathematics", "TLPL413"),
    educDisabilitiesElementary,
    c("mided-tlpl420", "Knowledge, Reasoning, and Learning in Science", "TLPL420"),
    c("mided-tlpl423", "Interdisciplinary Teaching in the Middle Grades I", "TLPL423"),
    c("mided-tlpl424", "Interdisciplinary Teaching in the Middle Grades II", "TLPL424"),
    educProfessionalSeminar(1),
    c("mided-tlpl441", "Methods for Teaching Multilingual Learners", "TLPL441"),
    c("mided-tlpl481", "Embracing Diversity in the Classroom Community", "TLPL481"),
    educFieldExperience(1),
    educInternship(1),
    educDigitalLearningTools,
  ],
};

export const midedMeta: ProgramMeta = {
  kind: "major",
  college: "EDUC",
  short: "Middle School Education",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/middle-school-education-major/",
    department: "https://education.umd.edu/academics/departments/tlpl",
  },
};
