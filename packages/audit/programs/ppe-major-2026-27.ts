// Philosophy, Politics, and Economics (PPE) Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/philosophy/philosophy-politics-economics-major/;
// College of Arts and Humanities' official Philosophy, Politics, and Economics Four Year Academic Plan (PDF, fetched
// 2026-09-28 via program-sources/philosophy-politics-economics-major.md -- Google Drive source of docs.google.com fetch script).
// Owner ruling (docs/project/rulings.md): where the department page (the college's four-year plan counts as
// one) and the catalog disagree, follow the department page.
// Encoded by hand. UNVERIFIED until the owner signs off.
// Not the Philosophy major (built in parallel on a different branch).

import type { Program, ProgramMeta } from "../src/audit.ts";

const PHPE_CORE = ["PHPE400", "PHPE401", "PHPE402"];

// Named elective courses from the catalog's "Select four courses" list, excluding WMST400 (see reviewNotes).
const PPE_NAMED_ELECTIVES = [
  "AASP301",
  "AASP314",
  "AASP499",
  "BMGT468",
  "COMM330",
  "COMM458",
  "COMM469",
  "ECON311",
  "ECON312",
  "GVPT409",
  "GVPT439",
  "HIST319",
  "HIST326",
  "HIST328",
  "HIST329",
  "HIST339",
  "HIST415",
  "HIST419",
  "HIST428",
  "HIST450",
  "HIST451",
  "PHIL341",
  "PHIL344",
  "PHIL347",
  "PHIL440",
  "PHIL445",
  "PHIL446",
  "WGSS302",
];

export const ppeMajor: Program = {
  id: "ppe-major",
  name: "Philosophy, Politics, and Economics Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Philosophy, Politics, and Economics Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/philosophy/philosophy-politics-economics-major/); " +
    "College of Arts and Humanities Philosophy, Politics, and Economics Four Year Academic Plan (department source), fetched 2026-09-28",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Catalog's elective list includes a bare 'WMST400' entry (no title/credits, likely a stray cross-listing " +
      "artifact in the source conversion) alongside 'WGSS302 | Feminist, Critical Race, and Queer Theories'. " +
      "The department's four-year plan lists the elective options explicitly ('WGSS 302' only, no WMST400). " +
      "Per the owner ruling that the department page wins on disagreement, WMST400 is NOT included in the " +
      "encoded elective list. Flagged in docs/project/owner-review.md.",
    "Catalog footnote 1 ('A student may petition the Program Director to have an individual course (300-level " +
      "or above) count as an elective') is a case-by-case manual override, not encodable as a course filter; " +
      "not encoded.",
    "Electives requirement ('Select four courses (12 credits)') is encoded as one `choose` (count: 4) whose " +
      "filter combines the catalog's named course list with a department+range match on PHPE 300-400 level, " +
      "excluding PHPE400/401/402 (the Core Sequence, named separately) -- this is an exact encoding of 'Any " +
      "PHPE course at the 300-400 level besides PHPE400, PHPE401, and PHPE402' plus the named list, not an " +
      "approximation.",
    "No other disagreement found between the catalog and the department's four-year plan on the major's own " +
      "requirement structure (Disciplinary Foundations six courses, Core Sequence three courses, four " +
      "electives/12 credits, 39 total credits); the plan's ARHU-level items (ARHU 158, Global Engagement, Gen " +
      "Ed, generic 'Elective 1xx-4xx' breadth slots) are college/university layers, out of scope here.",
    "Not encoded (engine gaps): residency rules (30 credits at UMD, 15 of the final 30 " +
      "credits at 300-400 level, 12 upper-level major credits at UMD), and the 120-credit graduation minimum " +
      "(with 39 of those credits at 3xx-4xx level, a college-wide rule, not specific to this major). The audit " +
      "engine checks per-requirement course assignment and per-course minGrade and program minGpa, not residency, or credit " +
      "totals.",
  ],
  requirements: [
    { kind: "course", id: "econ200", name: "Principles of Microeconomics", options: ["ECON200"] },
    { kind: "course", id: "econ201", name: "Principles of Macroeconomics", options: ["ECON201"] },
    { kind: "course", id: "gvpt170", name: "American Government", options: ["GVPT170"] },
    { kind: "course", id: "phil140", name: "Contemporary Moral Issues", options: ["PHIL140"] },
    { kind: "course", id: "phil245", name: "Political and Social Philosophy I", options: ["PHIL245"] },
    { kind: "course", id: "plcy100", name: "Foundations of Public Policy", options: ["PLCY100"] },
    {
      kind: "course",
      id: "phpe400",
      name: "Individual and Group Decision-Making",
      options: ["PHPE400"],
    },
    {
      kind: "course",
      id: "phpe401",
      name: "Social Philosophy and Political Economy",
      options: ["PHPE401"],
    },
    {
      kind: "course",
      id: "phpe402",
      name: "Senior Capstone in Philosophy, Politics, and Economics",
      options: ["PHPE402"],
    },
    {
      kind: "choose",
      id: "ppe-electives",
      name: "Select four courses (12 credits): any PHPE course at the 300-400 level besides PHPE400, " +
        "PHPE401, and PHPE402, or a course from the catalog's named elective list",
      count: 4,
      from: {
        courses: PPE_NAMED_ELECTIVES,
        departments: ["PHPE"],
        minNumber: 300,
        maxNumber: 499,
        exclude: PHPE_CORE,
      },
    },
  ],
};

export const ppeMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Philosophy, Politics, and Economics",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/philosophy/philosophy-politics-economics-major/",
    department:
      "https://drive.google.com/uc?export=download&id=1GLntl2I-ebb7jVOIAnhkCy1F2Jvd5530#Philosophy,-Politics,-and-Economics",
  },
};
