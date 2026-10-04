// Agricultural and Resource Economics Major, "Agricultural and Resource Economics" Specialization
// (same name as the major itself, per the catalog), 2026-27 UMD Academic Catalog.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/
//   agricultural-resource-economics/agricultural-resource-economics-major/ (fetched 2026-09-28).
// See arec-shared-2026-27.ts for the shared Foundational Courses, Field lists and common review
// notes; this file adds this specialization's own "select five" list and Field choice.
// Encoded by hand from the catalog alone (no department page found). UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  arecCommonReviewNotes,
  arecFoundational,
  fieldAdvancedDegreePreparation,
  fieldAgFoodNaturalResourceSystems,
  fieldChoiceRequirement,
  fieldGlobalHungerPovertySustainableDevelopment,
} from "./arec-shared-2026-27.ts";

export const arecMajorAgResourceEcon: Program = {
  id: "arec-major-ag-resource-econ",
  name: "Agricultural and Resource Economics Major (Agricultural and Resource Economics Specialization)",
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
    "This specialization shares its name with the major itself in the catalog ('Agricultural and " +
      "Resource Economics'); the program id/short name here use 'ag-resource-econ' to disambiguate " +
      "from the major's other two specializations (Agribusiness; Environmental and Resource " +
      "Economics).",
    "This specialization's 'select five' list and Field choice (Advanced Degree Preparation; " +
      "Agricultural, Food and Natural Resource Systems; Global Hunger, Poverty and Sustainable " +
      "Development; Student Designed Field, not encoded) are exactly as the catalog states.",
  ],
  requirements: [
    ...arecFoundational,
    {
      kind: "choose",
      id: "ag-resource-econ-select-five",
      name: "Agricultural and Resource Economics Specialization: Select Five of the Following Courses",
      count: 5,
      credits: 15,
      from: {
        courses: [
          "AREC306", "AREC380", "AREC405", "AREC422", "AREC426", "AREC427", "AREC430", "AREC431",
          "AREC433", "AREC435", "AREC445", "AREC446", "AREC447", "AREC453", "AREC454", "AREC455",
          "AREC456", "AREC466", "AREC481", "AREC489",
        ],
      },
    },
    fieldChoiceRequirement("ag-resource-econ-field-choice", [
      { name: "Advanced Degree Preparation", courses: fieldAdvancedDegreePreparation },
      { name: "Agricultural, Food and Natural Resource Systems", courses: fieldAgFoodNaturalResourceSystems },
      { name: "Global Hunger, Poverty and Sustainable Development", courses: fieldGlobalHungerPovertySustainableDevelopment },
    ]),
  ],
};

export const arecMajorAgResourceEconMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Agricultural and Resource Economics (Ag & Resource Econ)",
  major: "arec",
  track: "Agricultural and Resource Economics",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/agricultural-resource-economics/agricultural-resource-economics-major/",
  },
};
