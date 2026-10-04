// Secondary Education - Social Studies, Option II: Geography. See educ-social-studies-shared-2026-27.ts.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";
import { educSharedReviewNotes } from "./educ-shared-2026-27.ts";
import {
  socEcon,
  socEducation,
  socHist208,
  socHistRegional,
  socHistSurvey,
  socSharedReviewNotes,
  socSociology,
} from "./educ-social-studies-shared-2026-27.ts";

const CATALOG =
  "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/social-studies-education-major/";

const c = (id: string, name: string, course: string): Requirement => ({
  kind: "course",
  id,
  name: `${name} (${course})`,
  options: [course],
});

export const educSocialStudiesGeographyMajor: Program = {
  id: "educ-social-studies-geography-major",
  name: "Secondary Education - Social Studies Major: Geography",
  catalogYear: "2026-27",
  source: `UMD Academic Catalog 2026-27, Secondary Education Major - Social Studies, Option II: Geography (${CATALOG}); College of Education pages, fetched 2026-09-28`,
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...educSharedReviewNotes,
    ...socSharedReviewNotes,
    "Gateway courses (one 300-level each in physical geography, human geography and geographic techniques, 9 credits) name no courses in the source; encoded as three GEOG 300-399 courses (GEOG306 excluded because it is its own row). The physical/human/technique split is not enforced.",
    "Upper Level Geography Electives (15 credits) are encoded as five GEOG 300-499 courses (the catalog's 'upper level systematic geography courses'), a separate consuming pool from the gateways.",
  ],
  requirements: [
    c("educ-ss-geog201", "Geography of Environmental Systems", "GEOG201"),
    c("educ-ss-geog211", "Geography of Environmental Systems Laboratory", "GEOG211"),
    c("educ-ss-geog202", "Introduction to Human Geography", "GEOG202"),
    c("educ-ss-geog212", "Career Planning for Geographical Sciences, GIS, and ENSP Majors", "GEOG212"),
    c("educ-ss-geog306", "Introduction to Quantitative Methods for the Geographical Environmental Sciences", "GEOG306"),
    {
      kind: "choose",
      id: "educ-ss-geog-gateway",
      name: "Geography gateway courses (9 credits: physical, human, technique; split not enforced)",
      count: 3,
      credits: 9,
      from: { departments: ["GEOG"], minNumber: 300, maxNumber: 399, exclude: ["GEOG306"] },
    },
    {
      kind: "choose",
      id: "educ-ss-geog-upper",
      name: "Upper Level Geography Electives (15 credits)",
      count: 5,
      credits: 15,
      from: { departments: ["GEOG"], minNumber: 300, maxNumber: 499, exclude: ["GEOG306"] },
    },
    socEcon,
    c("educ-ss-gvpt170", "American Government", "GVPT170"),
    socHistSurvey,
    socHist208,
    ...socHistRegional,
    socSociology,
    ...socEducation,
  ],
};

export const educSocialStudiesGeographyMajorMeta: ProgramMeta = {
  kind: "major",
  college: "EDUC",
  short: "Secondary Education - Social Studies (Geography)",
  major: "educ-social-studies",
  track: "Geography",
  sources: {
    catalog: CATALOG,
    department: "https://education.umd.edu/student-resources/student-services/coe-undergraduate-studies-student-services-office/major-four",
  },
};
