// Secondary Education - Science Major (Terrapin Teachers), College of Education (TLPL), 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/.../science-education-major/ and education.umd.edu/academics/programs/undergraduate/
// science-education-terrapin-teachers-bachelor-science-bs (both fetched 2026-09-28); see
// program-sources/science-education-major.md. The department pages list no requirements beyond the catalog's, so there
// is no disagreement to resolve. Shared teacher-prep pieces come from educ-shared-2026-27.ts.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";
import {
  educContentAreaLiteracy,
  educDiverseLearners,
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

export const scieMajor: Program = {
  id: "scie-major",
  name: "Secondary Education - Science Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Secondary Education Major - Science " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/science-education-major/); " +
    "College of Education Science Education (Terrapin Teachers) page, " +
    "https://education.umd.edu/academics/programs/undergraduate/science-education-terrapin-teachers-bachelor-science-bs (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...educSharedReviewNotes,
    "No tracks: the sources list the science areas (Agriculture, Biology, Chemistry, Computer Science, Geology, Physics) only as separate double-major content areas and give no per-area requirements, so this is one program covering the 41-credit education component. The content-area major is audited as its own program; its courses are not encoded here.",
    "TLPL401 needs a 'B-' or better (department page admission requirement), encoded as a requirement-level minimum grade.",
    "Not enforced (manual): admission needs 45 credits, fundamental English and math at 'C-', a content-area GPA (advisor), resume, goal statement and two recommendation letters. TLPL425 is Fall only in senior year.",
    "BSCI348 is encoded as the course code only; the catalog notes section BSCI348T (Research Methods). TLPL488 is encoded as the code only (section B, Teaching Academically, Culturally, and Linguistically Diverse Students in Secondary Education); TLPL478/479/489 sections (F) are likewise matched by code.",
    "No official 4-year plan is readable in the fetched sources (the COE page only links to per-area plans). The sample plan is CONSTRUCTED from the catalog table; flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    ...educStemInquiry,
    educContentAreaLiteracy,
    c("scie-tlpl414", "Knowing and Learning in Mathematics and Science", "TLPL414"),
    c("scie-tlpl415", "Perspectives in Science", "TLPL415"),
    educFoundations,
    c("scie-bsci348", "Special Topics in Cell Biology and Molecular Genetics", "BSCI348"),
    { ...c("scie-tlpl401", "Student-Centered Curriculum and Instruction", "TLPL401"), minGrade: "B-" },
    c("scie-tlpl425", "Learning and Teaching in Science", "TLPL425"),
    educFieldExperience(1),
    educProfessionalSeminar(1),
    educInternship(1),
    educDiverseLearners,
  ],
};

export const scieMajorMeta: ProgramMeta = {
  kind: "major",
  college: "EDUC",
  short: "Secondary Education - Science",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/science-education-major/",
    department:
      "https://education.umd.edu/academics/programs/undergraduate/science-education-terrapin-teachers-bachelor-science-bs",
  },
};
