// Arts Leadership Minor (Theatre, Dance, and Performance Studies), 2026-27 UMD Academic Catalog.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/theatre-dance-performance-studies/
// arts-leadership-minor/ (fetched 2026-09-28). No department page was provided.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const artsLeadershipMinor: Program = {
  id: "arts-leadership-minor",
  name: "Arts Leadership Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Arts Leadership Minor " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/theatre-dance-performance-studies/arts-leadership-minor/), fetched 2026-09-28",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Department page not checked: none was provided. Encoded from the catalog alone.",
    "ARHU/TDPS240 and ARHU/TDPS440 are cross-listed; both prefixes are accepted. ARHU/TDPS441 is one course under two codes, so the 'choose 2' slot lists it as an alternatives pair (taking both codes counts once).",
    "'ARHU386 (ARHU386A or approved equivalent Professional Internship)': only ARHU386 is accepted; other internship codes need advisor approval (manual). Marked advisorMayApprove (choose-two): other courses may count with advisor approval; only the listed courses count.",
    "BMGT355 is listed without a title in the catalog; encoded as printed.",
    "Last slot ('3 credits from one prefix at 300/400 level with approval of a minor advisor') accepts every 300-499 course in the nine listed prefixes (ARHU, ARTH, ARTT, BMGT, DANC, MUSC, PLCY, TDPS, THET); the advisor approval and the 'one prefix' wording are manual.",
    "C- per owner ruling (rulings.md). The catalog gives no GPA or sharing cap; none is set.",
  ],
  requirements: [
    { kind: "course", id: "arts-orgs", name: "Arts Organizations and Audiences in the United States", options: ["ARHU240", "TDPS240"] },
    { kind: "course", id: "writing", name: "Writing for the Arts, or Writing for Non-Profit Organizations", options: ["ENGL398A", "ENGL398N"] },
    { kind: "course", id: "seminar", name: "Arts Leadership Seminar", options: ["ARHU440", "TDPS440"] },
    {
      kind: "choose",
      id: "choose-two",
      advisorMayApprove: true,
      name: "Two of: ARHU340, BMGT355, ARHU386, ARHU/TDPS441 (6 credits)",
      count: 2,
      from: { courses: ["ARHU340", "BMGT355", "ARHU386", "ARHU441", "TDPS441"] },
      alternatives: [["ARHU441", "TDPS441"]],
    },
    {
      kind: "choose",
      id: "advisor-approved",
      name: "3 credits at 300/400 level in ARHU, ARTH, ARTT, BMGT, DANC, MUSC, PLCY, TDPS or THET (minor advisor approval)",
      credits: 3,
      from: {
        departments: ["ARHU", "ARTH", "ARTT", "BMGT", "DANC", "MUSC", "PLCY", "TDPS", "THET"],
        minNumber: 300,
        maxNumber: 499,
      },
    },
  ],
};

export const artsLeadershipMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Arts Leadership",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/theatre-dance-performance-studies/arts-leadership-minor/",
  },
};
