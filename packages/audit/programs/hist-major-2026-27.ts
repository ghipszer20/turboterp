// History Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/history/history-major/;
// College of Arts and Humanities' official History Four Year Academic Plan (PDF, fetched 2026-09-28
// via program-sources/history-major.md -- Google Drive source of docs.google.com fetch script).
// Owner ruling (docs/project/rulings.md): where the department page (the college's four-year plan counts as
// one) and the catalog disagree, follow the department page.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const NAMED_REQUIRED_COURSES = ["HIST208", "HIST408", "HIST396"];

export const histMajor: Program = {
  id: "hist-major",
  name: "History Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, History Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/history/history-major/); " +
    "College of Arts and Humanities History Four Year Academic Plan (department source), fetched 2026-09-28",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "39 total credits: HIST208 (3) + three 1xx/2xx introductory courses (9) + 24 credits of electives + " +
      "HIST408/HIST396 capstone (3). The catalog also requires '21 of the 39 total credits at the " +
      "junior-senior (3xx or 4xx) level'; the department plan's own elective legend adds 'Maximum of two " +
      "lower-level courses total' among the 24 elective credits. Both sources agree numerically (12 " +
      "introductory + at most 6 more lower-level credits in electives leaves at least 21 credits at " +
      "3xx-4xx: the capstone's 3 plus at least 18 of the 24 elective credits). Encoded as two elective " +
      "buckets to capture both constraints at once: 'hist-electives-upper' (18 fixed credits, HIST 300-499) " +
      "and 'hist-electives-flex' (6 credits, HIST 100-499), so the flexible bucket can hold at most 2 " +
      "lower-level courses -- exactly the plan's cap -- while never blocking a student from taking more " +
      "than 18 credits at the 3xx-4xx level.",
    "'HIST408 Senior Seminar' may be substituted by HIST396 (Honors Colloquium II) per the catalog's own " +
      "footnote and the department plan's 'HIST408 or HIST396 (Scholarship in Practice #2)' entry; encoded " +
      "as a choose-one-of-two course requirement. The footnote's 'HIST208 is a prerequisite for HIST408' " +
      "is a sequencing rule with no matching engine concept and isn't enforced.",
    "Geographic-region distribution ('at least three of: Africa and the African Diaspora; Latin America " +
      "and the Caribbean; Middle East, Asia, Europe, and transregional') has no course-to-region list in " +
      "either source, so it cannot be encoded as a `distribution` requirement. Not encoded. Flagged in " +
      "docs/project/owner-review.md.",
    "Period distribution ('at least one course in the pre-1750 period and one course in the post-1750 " +
      "period') has no course-to-period list in either source. Not encoded. Flagged in " +
      "docs/project/owner-review.md.",
    "'No more than 6 credits can be fulfilled by AP and IB credits' is not encoded: the engine has no " +
      "concept of a course's credit source (AP/IB vs. in-residence).",
    "The petition allowing up to two courses taught outside the History Department to count toward the " +
      "major (with Undergraduate Committee approval, and never toward the capstone) is a discretionary " +
      "approval process with no named course list; not encoded.",
    "Not encoded (engine gaps, matches other ARHU majors' precedent): residency rules (30 credits at UMD, 15 of the final 30 credits at the 300-400 level, 12 upper-level " +
      "major credits at UMD); and the 120-credit graduation minimum.",
    "No disagreement found between the catalog and the department's four-year plan on the major's own " +
      "requirement structure (course counts, credits, HIST208/HIST408 sequence, the lower-level elective " +
      "cap); the plan's ARHU-level items (ARHU 158, Global Engagement, Gen Ed) are college/university " +
      "layers, out of scope here.",
  ],
  requirements: [
    {
      kind: "course",
      id: "hist208",
      name: "Historical Research and Methods Seminar",
      options: ["HIST208"],
    },
    {
      kind: "choose",
      id: "hist-intro-1xx-2xx",
      name: "Three courses at the 1xx or 2xx level",
      count: 3,
      from: {
        departments: ["HIST"],
        minNumber: 100,
        maxNumber: 299,
        exclude: ["HIST208"],
      },
    },
    {
      kind: "choose",
      id: "hist-electives-upper",
      name: "History Electives, 3xx or 4xx level (18 of the 24 elective credits)",
      credits: 18,
      from: {
        departments: ["HIST"],
        minNumber: 300,
        maxNumber: 499,
        exclude: NAMED_REQUIRED_COURSES,
      },
    },
    {
      kind: "choose",
      id: "hist-electives-flex",
      name: "History Electives, 1xx-4xx level (remaining 6 elective credits; at most 2 lower-level courses per the department plan)",
      credits: 6,
      from: {
        departments: ["HIST"],
        minNumber: 100,
        maxNumber: 499,
        exclude: NAMED_REQUIRED_COURSES,
      },
    },
    {
      kind: "course",
      id: "hist408-capstone",
      name: "Senior Seminar (HIST408, or HIST396 Honors Colloquium II)",
      options: ["HIST408", "HIST396"],
    },
  ],
};

export const histMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "History",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/history/history-major/",
    department: "https://drive.google.com/uc?export=download&id=1ZjfdW75RKk-Hm41Hm4ylcpcjg908TFYP#History",
  },
};
