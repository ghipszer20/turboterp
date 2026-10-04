// Leadership Studies Minor, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/education/counseling-higher-special-education/leadership-studies-minor/
// (fetched 2026-09-28); Leadership Studies Program, https://education.umd.edu/leadershipstudies (fetched 2026-09-28).
// Owner ruling: where the department page and the catalog disagree, follow the department page.
// Encoded by hand from program-sources/leadership-studies-minor.md. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

// Core courses moved from the HESI to the LEAD prefix in Fall 2023: accept both.
const both = (n: number) => [`LEAD${n}`, `HESI${n}`];
// Courses offered under a number with letter suffixes (HESI318A, COMM469B, ...).
const lettered = (id: string) => [id, ...Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ", (c) => `${id}${c}`)];
const bothLettered = (n: number) => [...lettered(`HESI${n}`), ...lettered(`LEAD${n}`)];

const socialAction = [...both(320), ...both(321)];

const leadershipElectives = [
  ...both(221), ...both(305), ...bothLettered(318), ...bothLettered(418),
  ...both(421), ...both(422), ...both(423), ...both(424),
  ...socialAction,
];

const generalElectives = [
  "BMGT361", "BMGT364", "BSCV301",
  "COMM324", "COMM330", "COMM420", "COMM424", "COMM461", ...lettered("COMM469"),
  "EDCP210", "EDCP310", "EDCP220", "EDCP312", "EDCP386", "EDCP420",
  "EDHD230", "EDHD402", "EDHD421",
  ...lettered("EDHI338"),
  ...both(220), ...both(221), ...bothLettered(318), ...bothLettered(418), ...both(470), ...both(489), ...both(498),
  ...socialAction,
  ...lettered("GEMS208"),
  "JOUR300", "JOUR402",
  "PSYC221", "PSYC334", "PSYC361",
  "PLCY201", "PLCY311", "PLCY313",
  "WGSS250", "WMST250",
];

const num = (c: string) => Number(/(\d{3})/.exec(c)![1]);
const upperCourses = [...both(315), ...both(417), ...leadershipElectives, ...generalElectives].filter((c) => num(c) >= 300);

export const leadMinor: Program = {
  id: "lead-minor",
  name: "Leadership Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Leadership Studies Minor; Leadership Studies Program, " +
    "https://education.umd.edu/leadershipstudies (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Catalog and department both say no more than 6 credits of the minor may also be applied to the major (department: 'unless exceptions have been made by the student's major program'). Encoded as maxSharedWith: [{ credits: 6 }], which caps overlap with EVERY other program, not majors only; the engine can't restrict it.",
    "Department vs catalog: the catalog table lists HESI217, HESI315, HESI417; the department page says core courses carry the LEAD prefix beginning Fall 2023. Department wins: both prefixes accepted for each core course.",
    "Department vs catalog: the catalog only says 'from our pre-approved elective list'; the department page prints the Leadership Elective and General Elective lists (Courses tab). Encoded from the department lists; HESI courses on them are also accepted under the LEAD prefix. Where a list says 'HESI/LEAD 318' or '418', every lettered variant is accepted (the department note says unlisted 318/418 options also count).",
    "The department says the Social Action Sequence (LEAD320 2 credits + LEAD321 1 credit) can count as an elective toward the minor, and that Leadership Elective courses may also count as the General Elective. Both elective slots are therefore 3-credit choose rules that accept LEAD320/321 (any combination summing to 3 credits), and the general slot also accepts the Leadership Elective list.",
    "Not enforced (manual): the General Elective Proposal Form alternatives (a non-listed course approved before it is taken); EDCP386, HESI489 and HESI498 'subject for approval'; EDHI338 and GEMS208 'must be taken for 3 credits'; course order (217, 315, 417); LEAD417 as a final-year capstone after all other requirements; the 6-credit cap at institutions other than UMD; no more than 9 credits of leadership coursework taken before admission counts; program admission (LEAD217 in progress or C- or better, good standing, a full year before graduation, application). The C- minimum per course is encoded.",
    "Encoded overlay: at least 9 credits at the 300 level or above (catalog and department agree), drawn from the program's own course lists.",
  ],
  requirements: [
    { kind: "course", id: "lead217", name: "LEAD217 Introduction to Leadership", options: both(217) },
    { kind: "course", id: "lead315", name: "LEAD315 Leadership in Groups and Organizations", options: both(315) },
    { kind: "course", id: "lead417", name: "LEAD417 Advanced Leadership Seminar (capstone)", options: both(417) },
    {
      kind: "choose",
      id: "leadership-elective",
      name: "Leadership Elective (3 credits) from the pre-approved list",
      credits: 3,
      from: { courses: leadershipElectives },
    },
    {
      kind: "choose",
      id: "general-elective",
      name: "General Elective (3 credits) from the pre-approved list",
      credits: 3,
      from: { courses: [...generalElectives, ...leadershipElectives] },
    },
    {
      kind: "choose",
      id: "upper-credits",
      name: "At least 9 credits at the 300 level or above",
      overlay: true,
      credits: 9,
      from: { courses: upperCourses },
    },
  ],
};

export const leadMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "EDUC",
  short: "Leadership Studies Minor",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/counseling-higher-special-education/leadership-studies-minor/",
    department: "https://education.umd.edu/leadershipstudies",
  },
};
