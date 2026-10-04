// Early Childhood / Early Childhood Special Education Major, Track II: PreK-3rd (6 credits), College of
// Education (HDQM), 2026-27 UMD Academic Catalog. Shared requirements come from ecse-shared-2026-27.ts.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { ecseRequirements, ecseSharedReviewNotes } from "./ecse-shared-2026-27.ts";

export const ecseMajorTrack2: Program = {
  id: "ecse-major-track-2",
  name: "Early Childhood/Early Childhood Special Education Major (Track II: PreK-3rd)",
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
      id: "ecse-track2-edhd415",
      name: "Promoting the Social-Emotional Competence of Young Children in Inclusive Classrooms (EDHD415)",
      options: ["EDHD415"],
    },
    {
      kind: "course",
      id: "ecse-track2-edhd424",
      name: "Culture, School & Community: Contexts for Learning (PreK-3rd) (EDHD424)",
      options: ["EDHD424"],
    },
  ],
};

export const ecseMajorTrack2Meta: ProgramMeta = {
  kind: "major",
  college: "EDUC",
  short: "Early Childhood/ECSE (Track II)",
  major: "ecse",
  track: "Track II: PreK-3rd",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/human-development-quantitative-methodology/early-childhood-special-education-major/",
    department:
      "https://education.umd.edu/student-resources/student-services/coe-undergraduate-studies-student-services-office/major-four",
  },
};
