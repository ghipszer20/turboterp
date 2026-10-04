// Elementary/Middle Special Education Major, Track 2: Inclusive Education, College of Education (CHSE),
// 2026-27 UMD Academic Catalog. Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/education/
// counseling-higher-special-education/elementary-middle-special-education-major/ and the College of Education
// major-four page (both fetched 2026-09-28); see program-sources/elementary-middle-special-education-major.md.
// Shared pieces come from edsp-elem-middle-shared-2026-27.ts. Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { edspShared, edspSharedReviewNotes } from "./edsp-elem-middle-shared-2026-27.ts";

export const edspElemMiddleMajorInclusiveEducation: Program = {
  id: "edsp-elem-middle-major-inclusive-education",
  name: "Elementary/Middle Special Education Major: Inclusive Education",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Elementary/Middle Special Education Major, Track 2: Inclusive Education " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/counseling-higher-special-education/elementary-middle-special-education-major/); " +
    "College of Education major-four page, https://education.umd.edu/student-resources/student-services/coe-undergraduate-studies-student-services-office/major-four (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...edspSharedReviewNotes,
    "The catalog's two professional tracks (Track 1: Severe Disabilities, Track 2: Inclusive Education) are encoded as two programs sharing the `edsp-elem-middle` major key; defaultTrack is on Track 1 (first listed).",
    "EDSP495 (Internship II) is listed at 6-12 credits for this track; the audit matches the course, not the credit amount.",
  ],
  requirements: [
    ...edspShared,
    { kind: "course", id: "tlpl362", name: "Curriculum and Instruction in Elementary Education: Social Studies (TLPL362)", options: ["TLPL362"] },
    { kind: "course", id: "tlpl321", name: "Curriculum and Instruction in Elementary Education: Science (TLPL321)", options: ["TLPL321"] },
  ],
};

export const edspElemMiddleMajorInclusiveEducationMeta: ProgramMeta = {
  kind: "major",
  college: "EDUC",
  short: "Elem/Middle Special Ed: Inclusive Education",
  major: "edsp-elem-middle",
  track: "Track 2: Inclusive Education",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/counseling-higher-special-education/elementary-middle-special-education-major/",
    department:
      "https://education.umd.edu/student-resources/student-services/coe-undergraduate-studies-student-services-office/major-four",
  },
};
