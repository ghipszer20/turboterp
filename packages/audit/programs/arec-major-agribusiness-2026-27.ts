// Agricultural and Resource Economics Major, Agribusiness Specialization, 2026-27 UMD Academic
// Catalog. Source: academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/
//   agricultural-resource-economics/agricultural-resource-economics-major/ (fetched 2026-09-28).
// See arec-shared-2026-27.ts for the shared Foundational Courses, Field lists and common review
// notes; this file adds the Agribusiness specialization's own "select five" list and Field choice.
// Encoded by hand from the catalog alone (no department page found). UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  arecCommonReviewNotes,
  arecFoundational,
  fieldAgManagementEntrepreneurship,
  fieldBusinessManagement,
  fieldChoiceRequirement,
} from "./arec-shared-2026-27.ts";

export const arecMajorAgribusiness: Program = {
  id: "arec-major-agribusiness",
  name: "Agricultural and Resource Economics Major (Agribusiness Specialization)",
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
    "Agribusiness's 'select five' list and Field choice (Business Management; Agricultural " +
      "Management and Entrepreneurship; Student Designed Field, not encoded) are exactly as the " +
      "catalog states.",
  ],
  requirements: [
    ...arecFoundational,
    {
      kind: "choose",
      id: "agribusiness-select-five",
      name: "Agribusiness Specialization: Select Five of the Following Courses",
      count: 5,
      credits: 15,
      from: {
        courses: [
          "AREC306", "AREC380", "AREC405", "AREC422", "AREC426", "AREC427", "AREC430",
          "AREC431", "AREC433", "AREC435", "AREC447", "AREC455", "AREC489",
        ],
      },
    },
    fieldChoiceRequirement("agribusiness-field-choice", [
      { name: "Business Management", courses: fieldBusinessManagement },
      { name: "Agricultural Management and Entrepreneurship", courses: fieldAgManagementEntrepreneurship },
    ]),
  ],
};

export const arecMajorAgribusinessMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Agricultural and Resource Economics (Agribusiness)",
  major: "arec",
  track: "Agribusiness",
  defaultTrack: true,
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/agricultural-resource-economics/agricultural-resource-economics-major/",
  },
};
