// Early Childhood / Early Childhood Special Education Major, Track I: Birth-5 (6 credits), College of
// Education (HDQM), 2026-27 UMD Academic Catalog. Shared requirements come from ecse-shared-2026-27.ts.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { ecseRequirements, ecseSharedReviewNotes } from "./ecse-shared-2026-27.ts";

export const ecseMajorTrack1: Program = {
  id: "ecse-major-track-1",
  name: "Early Childhood/Early Childhood Special Education Major (Track I: Birth-5)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Early Childhood/Early Childhood Special Education Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/human-development-quantitative-methodology/early-childhood-special-education-major/); " +
    "College of Education Major Four Year Plans page, https://education.umd.edu/student-resources/student-services/coe-undergraduate-studies-student-services-office/major-four (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: ecseSharedReviewNotes,
  requirements: [
    ...ecseRequirements,
    {
      kind: "course",
      id: "ecse-track1-edsp430",
      name: "Early Intervention: Early Childhood Special Education (EDSP430)",
      options: ["EDSP430"],
    },
    {
      kind: "course",
      id: "ecse-track1-edsp433",
      name: "Families and Culture in Early Intervention (Birth-5) (EDSP433)",
      options: ["EDSP433"],
    },
  ],
};

export const ecseMajorTrack1Meta: ProgramMeta = {
  kind: "major",
  college: "EDUC",
  short: "Early Childhood/ECSE (Track I)",
  major: "ecse",
  track: "Track I: Birth-5",
  defaultTrack: true,
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/human-development-quantitative-methodology/early-childhood-special-education-major/",
    department:
      "https://education.umd.edu/student-resources/student-services/coe-undergraduate-studies-student-services-office/major-four",
  },
};
