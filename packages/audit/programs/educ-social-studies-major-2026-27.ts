// Secondary Education - Social Studies, Option I: History (default track). College of Education (TLPL),
// 2026-27 UMD Academic Catalog; see educ-social-studies-shared-2026-27.ts for sources.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
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

export const educSocialStudiesMajor: Program = {
  id: "educ-social-studies-major",
  name: "Secondary Education - Social Studies Major: History",
  catalogYear: "2026-27",
  source: `UMD Academic Catalog 2026-27, Secondary Education Major - Social Studies, Option I: History (${CATALOG}); College of Education pages, fetched 2026-09-28`,
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...educSharedReviewNotes,
    ...socSharedReviewNotes,
    "Option I requires the foreign language requirement through the intermediate level and UNIV101 (History major requirements; see ARHU advising); not encoded.",
    "The 24 credits of History electives are encoded as eight HIST courses (100-499) with an overlay for '18 credits at the junior/senior level' (six 300-499 courses). The '15 credits in a concentration' and 'one course must be non-Western' rules name no course lists and are not enforced. The two regional electives accept any HIST course because no course list is in the source.",
    "GVPT170 (American Government) is required by this option; it is included below with the other social-science rows.",
  ],
  requirements: [
    socHistSurvey,
    socHist208,
    { kind: "course", id: "educ-ss-hist408", name: "Senior Seminar (HIST408)", options: ["HIST408"] },
    ...socHistRegional,
    {
      kind: "choose",
      id: "educ-ss-hist-electives",
      name: "History electives (24 credits, eight courses)",
      count: 8,
      credits: 24,
      from: { departments: ["HIST"], minNumber: 100, maxNumber: 499, exclude: ["HIST200", "HIST201", "HIST208", "HIST408"] },
    },
    {
      kind: "choose",
      id: "educ-ss-hist-upper",
      name: "History electives: 18 credits at the junior/senior level",
      overlay: true,
      count: 6,
      credits: 18,
      from: { departments: ["HIST"], minNumber: 300, maxNumber: 499, exclude: ["HIST408"] },
    },
    socGeog202,
    socEcon,
    { kind: "course", id: "educ-ss-gvpt170", name: "American Government (GVPT170)", options: ["GVPT170"] },
    socSociology,
    ...socEducation,
  ],
};

export const educSocialStudiesMajorMeta: ProgramMeta = {
  kind: "major",
  college: "EDUC",
  short: "Secondary Education - Social Studies (History)",
  major: "educ-social-studies",
  track: "History",
  defaultTrack: true,
  sources: {
    catalog: CATALOG,
    department: "https://education.umd.edu/student-resources/student-services/coe-undergraduate-studies-student-services-office/major-four",
  },
};
