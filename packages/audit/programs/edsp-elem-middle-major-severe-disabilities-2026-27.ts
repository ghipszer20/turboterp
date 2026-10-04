// Elementary/Middle Special Education Major, Track 1: Severe Disabilities, College of Education (CHSE),
// 2026-27 UMD Academic Catalog. Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/education/
// counseling-higher-special-education/elementary-middle-special-education-major/ and the College of Education
// major-four page (both fetched 2026-09-28); see program-sources/elementary-middle-special-education-major.md.
// Shared pieces come from edsp-elem-middle-shared-2026-27.ts. Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { edspShared, edspSharedReviewNotes } from "./edsp-elem-middle-shared-2026-27.ts";

export const edspElemMiddleMajorSevereDisabilities: Program = {
  id: "edsp-elem-middle-major-severe-disabilities",
  name: "Elementary/Middle Special Education Major: Severe Disabilities",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Elementary/Middle Special Education Major, Track 1: Severe Disabilities " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/counseling-higher-special-education/elementary-middle-special-education-major/); " +
    "College of Education major-four page, https://education.umd.edu/student-resources/student-services/coe-undergraduate-studies-student-services-office/major-four (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...edspSharedReviewNotes,
    "The catalog's two professional tracks (Track 1: Severe Disabilities, Track 2: Inclusive Education) are encoded as two programs sharing the `edsp-elem-middle` major key; defaultTrack is on Track 1 (first listed).",
    "EDSP495 (Internship II) is listed at 12 credits for this track; the audit matches the course, not the credit amount.",
  ],
  requirements: [
    ...edspShared,
    { kind: "course", id: "edsp403", name: "Supporting Access for Students with Multiple Disabilities Across Settings (EDSP403)", options: ["EDSP403"] },
    { kind: "course", id: "edsp410", name: "Instruction of Students with Severe Disabilities II (EDSP410)", options: ["EDSP410"] },
  ],
};

export const edspElemMiddleMajorSevereDisabilitiesMeta: ProgramMeta = {
  kind: "major",
  college: "EDUC",
  short: "Elem/Middle Special Ed: Severe Disabilities",
  major: "edsp-elem-middle",
  track: "Track 1: Severe Disabilities",
  defaultTrack: true,
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/counseling-higher-special-education/elementary-middle-special-education-major/",
    department:
      "https://education.umd.edu/student-resources/student-services/coe-undergraduate-studies-student-services-office/major-four",
  },
};
