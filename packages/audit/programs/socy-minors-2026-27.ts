// Sociology Minor and Demography Minor, 2026–27 UMD Academic Catalog (Department of Sociology).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/sociology/sociology-minor/
// and .../sociology/demography-minor/ (fetched 2026-09-28). No department page was provided
// (department page not checked). No official published sample plans (built from the requirements
// below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const SOURCE_SOCY_MINORS =
  "UMD Academic Catalog 2026–27, Sociology minors (fetched 2026-09-28); department page not checked";

const DEMOG_SOCY_ELECTIVES = [
  "SOCY335", "SOCY386", "SOCY412", "SOCY413", "SOCY418", "SOCY428", "SOCY441", "SOCY445",
];

export const socyMinorSociology: Program = {
  id: "socy-minor-sociology",
  name: "Sociology Minor",
  catalogYear: "2026-27",
  source: SOURCE_SOCY_MINORS,
  verified: false,
  reviewNotes: [
    "Department page not checked (none provided); encoded from the catalog alone.",
    "The catalog states no grade minimum, sharing cap or eligibility rule; none is encoded.",
    "Electives are 'Sociology Elective Courses, 300-400 level' (9 credits): 3 courses from SOCY 300-499. A course used for the SOCY241/441 slot doesn't double-count as an elective (SOCY441 fills one or the other).",
    "Total credits print as 18-19 (SOCY200 vs SOCY230 credit count differs); not encoded.",
  ],
  requirements: [
    { kind: "course", id: "socy100", name: "Introduction to Sociology", options: ["SOCY100"] },
    { kind: "course", id: "socy200-230", name: "SOCY200 or SOCY230", options: ["SOCY200", "SOCY230"] },
    { kind: "course", id: "socy241-441", name: "SOCY241 or SOCY441", options: ["SOCY241", "SOCY441"] },
    {
      kind: "choose",
      id: "electives",
      name: "Three 300-400 level Sociology electives",
      count: 3,
      from: { departments: ["SOCY"], minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const socyMinorDemography: Program = {
  id: "socy-minor-demography",
  name: "Demography Minor",
  catalogYear: "2026-27",
  source: SOURCE_SOCY_MINORS,
  verified: false,
  reviewNotes: [
    "Department page not checked (none provided); encoded from the catalog alone.",
    "SOCY201 is 'or an equivalent course from another department' with no equivalents named. Encoded as SOCY201 only; the requirement is marked advisorMayApprove so the Advisor says an equivalent may count with advisor approval.",
    "'Up to two electives may be taken from outside of the Sociology Department' is encoded as a 3-course choose over the whole list plus a 1-course overlay requiring at least one elective from the SOCY list (3 electives minus at most 2 outside).",
    "Total credits print as 19 while the text says 18 (SOCY201 is 4 credits); not encoded.",
    "AAST498 is listed with the topic AAST498B (Urban Demography and Community); any AAST498 is accepted (the engine has no topic concept). AAST222, GEOG335 and NFSC425 are listed with no title.",
    "No grade minimum, sharing cap or eligibility rule is stated; none encoded.",
  ],
  requirements: [
    { kind: "course", id: "socy201", advisorMayApprove: true, name: "Introductory Statistics for Sociology (or equivalent)", options: ["SOCY201"] },
    { kind: "course", id: "socy410", name: "Social Demography", options: ["SOCY410"] },
    { kind: "course", id: "socy411", name: "Demographic Techniques", options: ["SOCY411"] },
    {
      kind: "choose",
      id: "electives",
      name: "Three electives (at most two from outside Sociology)",
      count: 3,
      from: {
        courses: [
          ...DEMOG_SOCY_ELECTIVES,
          "AAST222", "AAST498", "ANTH265", "AREC365", "ECON315", "EPIB301", "FMSC381", "GEOG335", "NFSC425",
        ],
      },
    },
    {
      kind: "choose",
      id: "electives-socy",
      name: "At least one elective from the SOCY list (at most two from outside Sociology)",
      overlay: true,
      count: 1,
      from: { courses: DEMOG_SOCY_ELECTIVES },
    },
  ],
};

export const socyMinorSociologyMeta: ProgramMeta = { kind: "minor", college: "BSOS", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/sociology/sociology-minor/" } };

export const socyMinorDemographyMeta: ProgramMeta = { kind: "minor", college: "BSOS", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/sociology/demography-minor/" } };
