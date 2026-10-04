// Secondary Education - Social Studies, Option III: Government and Politics. See
// educ-social-studies-shared-2026-27.ts. Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";
import { educSharedReviewNotes } from "./educ-shared-2026-27.ts";
import {
  socEcon,
  socEducation,
  socGeog202,
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

export const educSocialStudiesGovernmentMajor: Program = {
  id: "educ-social-studies-government-major",
  name: "Secondary Education - Social Studies Major: Government and Politics",
  catalogYear: "2026-27",
  source: `UMD Academic Catalog 2026-27, Secondary Education Major - Social Studies, Option III: Government and Politics (${CATALOG}); College of Education pages, fetched 2026-09-28`,
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...educSharedReviewNotes,
    ...socSharedReviewNotes,
    "The catalog says the Government and Politics option is under review and to check with the Government department; encoded as printed.",
    "Manual: GVPT is a Limited Enrollment Program (admission requirements via the GVPT advisor); all GVPT majors must also complete an approved skills option (a foreign language or three quantitative courses; the catalog row 'Social Science Quantitative Courses or Foreign Language' names no courses and no credits) - not encoded.",
    "The 36 GVPT credits are encoded as GVPT170/201/241 (9), 18 credits of GVPT 300-499 and 9 credits of GVPT electives (any GVPT 100-499), in separate consuming pools so no course counts twice.",
  ],
  requirements: [
    c("educ-ss-gvpt170", "American Government", "GVPT170"),
    c("educ-ss-gvpt201", "Scope and Methods for Political Science Research", "GVPT201"),
    c("educ-ss-gvpt241", "The Study of Political Philosophy: Ancient and Modern", "GVPT241"),
    {
      kind: "choose",
      id: "educ-ss-gvpt-upper",
      name: "GVPT Upper Level Courses (18 credits, 300-499)",
      count: 6,
      credits: 18,
      from: { departments: ["GVPT"], minNumber: 300, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "educ-ss-gvpt-electives",
      name: "GVPT Electives (9 credits)",
      count: 3,
      credits: 9,
      from: { departments: ["GVPT"], minNumber: 100, maxNumber: 499, exclude: ["GVPT170", "GVPT201", "GVPT241"] },
    },
    socHistSurvey,
    socHist208,
    ...socHistRegional,
    socEcon,
    socGeog202,
    socSociology,
    ...socEducation,
  ],
};

export const educSocialStudiesGovernmentMajorMeta: ProgramMeta = {
  kind: "major",
  college: "EDUC",
  short: "Secondary Education - Social Studies (Government and Politics)",
  major: "educ-social-studies",
  track: "Government and Politics",
  sources: {
    catalog: CATALOG,
    department: "https://education.umd.edu/student-resources/student-services/coe-undergraduate-studies-student-services-office/major-four",
  },
};
