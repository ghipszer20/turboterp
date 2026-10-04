// Leadership Studies Certificate, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/education/counseling-higher-special-education/leadership-studies-certificate/
// (fetched 2026-09-28); Leadership Studies Program, https://education.umd.edu/leadershipstudies (fetched 2026-09-28).
// Owner ruling: where the department page and the catalog disagree, follow the department page.
// Encoded by hand from program-sources/leadership-studies-certificate.md. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

// Core courses moved from the HESI to the LEAD prefix in Fall 2023: accept both.
const both = (n: number) => [`LEAD${n}`, `HESI${n}`];
// Courses offered under a number with letter suffixes (HESI318A, COMM469B, ...).
const lettered = (id: string) => [id, ...Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ", (c) => `${id}${c}`)];
const bothLettered = (n: number) => [...lettered(`HESI${n}`), ...lettered(`LEAD${n}`)];

const leadershipElectives = [
  ...both(221),
  ...both(305),
  ...bothLettered(318),
  ...bothLettered(418),
  ...both(421),
  ...both(422),
  ...both(423),
  ...both(424),
];

const generalElectives = [
  "BMGT361", "BMGT364", "BSCV301",
  "COMM324", "COMM330", "COMM420", "COMM424", "COMM461", ...lettered("COMM469"),
  "EDCP210", "EDCP310", "EDCP220", "EDCP312", "EDCP386", "EDCP420",
  "EDHD230", "EDHD402", "EDHD421",
  ...lettered("EDHI338"),
  ...both(220), ...both(221), ...bothLettered(318), ...bothLettered(418), ...both(470), ...both(489), ...both(498),
  ...lettered("GEMS208"),
  "JOUR300", "JOUR402",
  "PSYC221", "PSYC334", "PSYC361",
  "PLCY201", "PLCY311", "PLCY313",
  "WGSS250", "WMST250",
];

const core300 = [...both(315), ...both(320), ...both(321), ...both(417)];
const num = (c: string) => Number(/(\d{3})/.exec(c)![1]);
const upperCourses = [...core300, ...leadershipElectives, ...generalElectives].filter((c) => num(c) >= 300);

export const leadCert: Program = {
  id: "lead-cert",
  name: "Leadership Studies Certificate",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Leadership Studies Certificate; Leadership Studies Program, " +
    "https://education.umd.edu/leadershipstudies (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Catalog and department both say no more than 6 credits of the minor/certificate may also be applied to the major (department: 'unless exceptions have been made by the student's major program'). Encoded as maxSharedWith: [{ credits: 6 }], which caps overlap with EVERY other program (majors, minors, certificates), not majors only; the engine can't restrict it. Flagged.",
    "Department vs catalog: the catalog table lists HESI217, HESI315, HESI320, HESI321, HESI417; the department page says core courses carry the LEAD prefix beginning Fall 2023 (LEAD217/315/417, Social Action LEAD320/321). Department wins: encoded LEAD as primary and both prefixes accepted for each core course.",
    "Department vs catalog: the catalog says 'HESI Leadership Elective (from pre-approved list)' and 'two elective courses from our pre-approved elective list'; the department page prints the lists (Courses tab). Encoded from the department lists. Every HESI course on those lists is also accepted under the LEAD prefix (the department says HESI courses moved to LEAD). Where a list says 'HESI/LEAD 318' or '418', every lettered variant (318A, 418V, ...) is accepted, so unlisted variants count, as the department's note says.",
    "Department vs catalog: the department lists LEAD320 & 321 among the leadership electives and general electives, but they are separately required Social Action courses; a course counts once, so they can't double as an elective here (encoded as required only).",
    "Not enforced (manual): the 'General Elective Proposal Form' alternatives (a non-listed general elective approved before the course is taken); EDCP386, HESI489 and HESI498 'subject for approval'; EDHI338 and GEMS208 'must be taken for 3 credits to count' (offered for 1-3 credits; the engine does not check credits per course); the course order (217, 315, 417; 320 then 321); LEAD417 taken in the final year after all other requirements; the 21-credit total; the 6-credit cap at institutions other than UMD; the 2.0 GPA; no more than 9 credits of coursework taken before admission counts; program admission (LEAD217 in progress or C- or better, good standing, one full year before graduation, application). The C- minimum per course is encoded.",
    "Encoded overlay: at least 12 credits at 300 level or above (catalog and department agree), drawn from the program's own course lists.",
  ],
  requirements: [
    { kind: "course", id: "lead217", name: "LEAD217 Introduction to Leadership", options: both(217) },
    { kind: "course", id: "lead315", name: "LEAD315 Leadership in Groups and Organizations", options: both(315) },
    { kind: "course", id: "lead320", name: "LEAD320 Social Action Seminar (2 credits)", options: both(320) },
    { kind: "course", id: "lead321", name: "LEAD321 Advanced Social Action Seminar (1 credit)", options: both(321) },
    { kind: "course", id: "lead417", name: "LEAD417 Advanced Leadership Seminar (capstone)", options: both(417) },
    {
      kind: "choose",
      id: "leadership-elective",
      name: "Leadership Elective (3 credits) from the pre-approved list",
      count: 1,
      from: { courses: leadershipElectives },
    },
    {
      kind: "choose",
      id: "general-electives",
      name: "Two general electives (6 credits) from the pre-approved list",
      count: 2,
      from: { courses: generalElectives },
    },
    {
      kind: "choose",
      id: "upper-credits",
      name: "At least 12 credits at the 300 level or above",
      overlay: true,
      credits: 12,
      from: { courses: upperCourses },
    },
  ],
};

export const leadCertMeta: ProgramMeta = {
  kind: "certificate",
  college: "EDUC",
  short: "Leadership Studies Certificate",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/counseling-higher-special-education/leadership-studies-certificate/",
    department: "https://education.umd.edu/leadershipstudies",
  },
};
