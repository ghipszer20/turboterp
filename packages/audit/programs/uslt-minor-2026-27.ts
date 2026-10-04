// U.S. Latina/o Studies Minor, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/american-studies/us-latina-latino-studies-minor/
// (fetched 2026-09-28); American Studies, https://amst.umd.edu/academic-programs/undergraduate/us-latina-o-studies-minor
// (fetched 2026-09-28). Owner ruling: where the department page and the catalog disagree, follow the department page.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

// The approved elective list is circulated by the USLT advisor each semester and is not published.
// Humanities, Social Sciences, Languages and Education departments (plus the LASC/GVPT/AMST the sources name).
const USLT_ELECTIVE_DEPARTMENTS = [
  "USLT", "AMST", "LACS", "LASC", "GVPT", "HIST", "SPAN", "PORT", "ANTH", "SOCY", "ENGL", "ARTH", "MUSC",
  "WGSS", "AASP", "CMLT", "ECON", "GEOG", "EDUC", "EDCP", "EDHD", "EDHI", "EDMS", "EDSP", "TLPL", "TLTC",
];

export const usltMinor: Program = {
  id: "uslt-minor",
  name: "U.S. Latina/o Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, U.S. Latina/o Studies Minor; American Studies, " +
    "https://amst.umd.edu/academic-programs/undergraduate/us-latina-o-studies-minor (fetched 2026-09-28)",
  minGrade: "C",
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Catalog and department page agree on the 15 credits: USLT201, USLT202, USLT488, and two 3xx/4xx electives from two different categories (Humanities, Social Sciences, Languages, Education). Difference: the department page names AMST as well as LASC and GVPT as sources of comparative Latino courses; the catalog names only LASC and GVPT. AMST is accepted.",
    "Grade floor: the department page says no course below C (2.0) counts toward a minor; encoded as minGrade C.",
    "Sharing: 'a maximum of six credits (or two courses) for both a major and a minor' -> maxSharedWith courses: 2 against every program. 'Courses completed in one minor may not be used in another minor' is not encoded (the cap cannot be limited to minors).",
    "Electives: the approved course list is circulated by the USLT advisor each semester and is not published. Encoded as two 3xx/4xx courses from the USLT/LASC/GVPT/AMST and the wider Humanities, Social Sciences, Languages and Education departments listed in the file, so courses without Latina/o content in those departments are wrongly accepted; the student must confirm each with the USLT advisor. 'LASC' in the sources looks like an old code for LACS; both are accepted. Not enforced (manual): electives from two different categories.",
    "Not encoded (manual): eligibility and application (30 credits completed, USLT201 or 202 with a C or better, apply before add/drop); at most six credits (two courses) transferred in; at least six upper-division credits at UMD College Park.",
  ],
  requirements: [
    { kind: "course", id: "uslt201", name: "USLT201 U.S. Latina/o Studies I", options: ["USLT201"] },
    { kind: "course", id: "uslt202", name: "USLT202 U.S. Latina/o Studies II", options: ["USLT202"] },
    { kind: "course", id: "uslt488", name: "USLT488 Senior Seminar in U.S. Latina/o Studies", options: ["USLT488"] },
    {
      kind: "choose",
      id: "electives",
      name: "Two upper-level electives (3xx or 4xx) with U.S. Latina/o content",
      count: 2,
      from: { departments: USLT_ELECTIVE_DEPARTMENTS, minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const usltMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "U.S. Latina/o Studies Minor",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/american-studies/us-latina-latino-studies-minor/",
    department: "https://amst.umd.edu/academic-programs/undergraduate/us-latina-o-studies-minor",
  },
};
