// American Studies Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/american-studies/american-studies-major/;
// College of Arts and Humanities' official American Studies Four Year Academic Plan (PDF, fetched 2026-09-28
// via program-sources/american-studies-major.md -- Google Drive source of docs.google.com fetch script).
// Owner ruling (docs/project/rulings.md): where the department page (the college's four-year plan counts as
// one) and the catalog disagree, follow the department page.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const NAMED_REQUIRED_COURSES = [
  "AMST101",
  "AMST202",
  "AMST203",
  "AMST204",
  "AMST205",
  "AMST207",
  "AMST212",
  "AMST260",
  "AMST298",
  "AMST340",
  "AMST450",
];

export const amstMajor: Program = {
  id: "amst-major",
  name: "American Studies Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, American Studies Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/american-studies/american-studies-major/); " +
    "College of Arts and Humanities American Studies Four Year Academic Plan (department source), fetched 2026-09-28",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "'Select one AMST 1xx or 2xx level course' names an explicit example list (catalog footnote 1): " +
      "AMST202, AMST203, AMST204, AMST205, AMST207, AMST212, AMST260, AMST298. Encoded as a choose-one " +
      "from exactly that named list (AMST207 and AMST212 are named by the catalog itself but are not on " +
      "the Academic Catalog's AMST course list (supplied by the main session for plan slots); they are kept here because they come " +
      "from the source, not invented).",
      "'Select two Americanist Foundation courses' (catalog footnote 2) references 'a list of approved " +
      "choices...posted on the department's web site' that is not included in either source. Approximated, " +
      "following the socy-major-2026-27.ts pattern, as any 1xx or 2xx-level course from the departments the " +
      "footnote names as examples (AASP, ARTH, ENGL, HIST, SOCY, WMST) -- the footnote says 'departments " +
      "such as', so this is a non-exhaustive approximation. Flagged in docs/project/owner-review.md.",
    "'Select four 3xx or 4xx-level AMST courses' and 'Select a Focus Area' (catalog footnote 4: 'four 3xx " +
      "or 4xx-level courses in another department or university approved minor') have no named list in " +
      "either source, so both are encoded as filters: the former a department + number-range `choose` " +
      "(AMST 300-499, excluding the named requirement courses), the latter a `concentration` (12 credits, " +
      "300-499 level, any single department other than AMST) matching the 'one discipline' shape exactly.",
    "Not encoded (engine gap: no requirement type aggregates credits by level across multiple " +
      "requirements): catalog note 'At least twelve of the 3xx or 4xx level credits must be at the 4xx " +
      "level' spans the AMST 3xx/4xx choose, AMST340, AMST450, and the Focus Area concentration together. " +
      "Flagged in docs/project/owner-review.md.",
    "Not encoded (engine gaps): residency rules (30 credits at UMD, 15 " +
      "of the final 30 credits at 300-400 level, 12 upper-level major credits at UMD), and the 120-credit " +
      "graduation minimum. The audit engine checks per-requirement course assignment and per-course " +
      "minGrade, not residency or credit totals. Program GPA 2.0 encoded as minGpa.",
    "No disagreement found between the catalog and the department's four-year plan on the major's own " +
      "requirement structure (course counts, credits, AMST340/AMST450 sequence); the plan's ARHU-level " +
      "items (ARHU 158, Global Engagement, Gen Ed) are college/university layers, out of scope here.",
  ],
  requirements: [
    { kind: "course", id: "amst101", name: "Introduction to American Studies", options: ["AMST101"] },
    {
      kind: "choose",
      id: "amst-1xx-2xx-choice",
      name: "Select one AMST 1xx or 2xx level course",
      count: 1,
      from: {
        courses: ["AMST202", "AMST203", "AMST204", "AMST205", "AMST207", "AMST212", "AMST260", "AMST298"],
      },
    },
    {
      kind: "choose",
      id: "americanist-foundation",
      name: "Select two Americanist Foundation courses (approved list maintained by the department; not " +
        "available from source, approximated as any 1xx or 2xx-level course in AASP, ARTH, ENGL, HIST, " +
        "SOCY, or WMST)",
      count: 2,
      from: {
        departments: ["AAAS", "AASP", "ARTH", "ENGL", "HIST", "SOCY", "WGSS", "WMST"], // AAAS and WGSS are the current prefixes of AASP and WMST (main session),
        minNumber: 100,
        maxNumber: 299,
      },
    },
    {
      kind: "choose",
      id: "amst-3xx-4xx",
      name: "Select four 3xx or 4xx-level AMST courses",
      count: 4,
      from: {
        departments: ["AMST"],
        minNumber: 300,
        maxNumber: 499,
        exclude: NAMED_REQUIRED_COURSES,
      },
    },
    {
      kind: "course",
      id: "amst340",
      name: "Introduction to History, Theories and Methods in American Studies",
      options: ["AMST340"],
    },
    { kind: "course", id: "amst450", name: "Seminar in American Studies", options: ["AMST450"] },
    {
      kind: "concentration",
      id: "focus-area",
      name: "Focus Area: four 3xx or 4xx-level courses in another department or university approved minor",
      credits: 12,
      minNumber: 300,
      maxNumber: 499,
      excludeDepartments: ["AMST"],
    },
  ],
};

export const amstMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "American Studies",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/american-studies/american-studies-major/",
    department: "https://drive.google.com/uc?export=download&id=1nOsCTmVM4dhwKglqMEblqO2pCujWAY_I#American-Studies",
  },
};
