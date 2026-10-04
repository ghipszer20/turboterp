// Agricultural and Resource Economics Major, Environmental and Resource Economics Specialization,
// 2026-27 UMD Academic Catalog. Source: academiccatalog.umd.edu/undergraduate/colleges-schools/
//   agriculture-natural-resources/agricultural-resource-economics/agricultural-resource-economics-major/
//   (fetched 2026-09-28).
// See arec-shared-2026-27.ts for the shared Foundational Courses, Field lists and common review
// notes; this file adds this specialization's own "select five" list and Field choice.
// Encoded by hand from the catalog alone (no department page found). UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  arecCommonReviewNotes,
  arecFoundational,
  fieldAdvancedDegreePreparation,
  fieldChoiceRequirement,
  fieldEnvironmentalDataScience,
  fieldEnvironmentalResourceManagementPolicy,
} from "./arec-shared-2026-27.ts";

export const arecMajorEnvironmentalResourceEcon: Program = {
  id: "arec-major-environmental-resource-econ",
  name: "Agricultural and Resource Economics Major (Environmental and Resource Economics Specialization)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Agricultural and Resource Economics Major, " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/agricultural-resource-economics/agricultural-resource-economics-major/ " +
    "(fetched 2026-09-28); no department page found (see program-sources/agricultural-resource-economics-major.md)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    ...arecCommonReviewNotes,
    "This specialization's 'select five' list and Field choice (Advanced Degree Preparation; " +
      "Environmental Data Science; Environmental and Resource Management and Policy; Student " +
      "Designed Field, not encoded) are exactly as the catalog states. The Environmental and " +
      "Resource Management and Policy field's course list has no 'Choose three of the following " +
      "courses' header in the fetched catalog table (unlike the other fields), presumably a " +
      "fetch/formatting drop rather than a different rule; treated the same as every other field " +
      "(choose 3) for consistency. Flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    ...arecFoundational,
    {
      kind: "choose",
      id: "environmental-resource-econ-select-five",
      name: "Environmental and Resource Economics Specialization: Select Five of the Following Courses",
      count: 5,
      credits: 15,
      from: {
        courses: [
          "AREC380", "AREC405", "AREC422", "AREC431", "AREC445", "AREC446", "AREC453", "AREC454",
          "AREC455", "AREC456", "AREC466", "AREC481",
        ],
      },
    },
    fieldChoiceRequirement("environmental-resource-econ-field-choice", [
      { name: "Advanced Degree Preparation", courses: fieldAdvancedDegreePreparation },
      { name: "Environmental Data Science", courses: fieldEnvironmentalDataScience },
      { name: "Environmental and Resource Management and Policy", courses: fieldEnvironmentalResourceManagementPolicy },
    ]),
  ],
};

export const arecMajorEnvironmentalResourceEconMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Agricultural and Resource Economics (Environmental & Resource Econ)",
  major: "arec",
  track: "Environmental and Resource Economics",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/agricultural-resource-economics/agricultural-resource-economics-major/",
  },
};
