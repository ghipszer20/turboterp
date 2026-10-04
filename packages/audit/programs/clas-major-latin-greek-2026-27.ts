// Classical Languages and Literatures (Classics) Major, Option B: Latin and Greek, 2026-27 UMD
// Academic Catalog. Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/
// classical-languages-literature/classics-major/; the College of Arts and Humanities' official
// "Classics - Latin & Greek" Four Year Academic Plan (department source, converted from PDF),
// https://drive.google.com/uc?export=download&id=1Go4fyz59qBM5GgDt7xvqJXxnuWw3b3WO (fetched 2026-09-28).
// No numeric disagreement found between the catalog and the plan for this track.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const clasMajorLatinGreek: Program = {
  id: "clas-major-latin-greek",
  name: "Classics Major (Latin and Greek)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Classical Languages and Literatures Major (Option B: Latin and Greek); " +
    "College of Arts and Humanities, official Classics - Latin & Greek Four Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1Go4fyz59qBM5GgDt7xvqJXxnuWw3b3WO (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "The catalog requires 18 credits in ONE of LATN/GREK (primary) and 12 in the OTHER (secondary), a choice the plan itself leaves generic ('LATN or GREK'). Engine gap: there is no requirement kind that expresses 'reach 18 in exactly one of two departments, 12 in the other' as a disjunction of credit totals. Encoded instead as three requirements: an overlay minimum of 12 credits in LATN, an overlay minimum of 12 credits in GREK, and a consuming 30-credit total across LATN+GREK -- together these force both languages to appear with at least 12 credits each and 30 combined (which arithmetically forces one language to reach 18), without pinning down which language is primary. Flagged in docs/project/owner-review.md.",
    "Footnote 1 ('students with no previous training in the second language may count introductory level courses as part of the 12-hour requirement') is read as: the 12-credit secondary-language minimum has no level floor -- already true of the department + no-minNumber filter used here.",
    "Supporting courses (9 credits, footnote 2: 'For example, CLAS170, HIST110, and a 3xx- or 4xx-level course in Greek or Roman history') are encoded as CLAS/HIST/ARTH at any level, matching Option A's broader 'related fields such as HIST and ARTH' wording (Option B's own footnote names only CLAS and HIST examples, but doesn't rule out ARTH); the sample plan uses only the two courses actually named in the source (CLAS170, HIST110) plus one more real CLAS course, since no specific 'Greek or Roman history' course number is named or on an approved list.",
    "Known engine gaps (one note): the College of Arts and Humanities' overall 39 3xx-or-4xx-level-credit requirement (spans the whole degree, not just this major), residency rules, and the 120-credit graduation minimum are not encoded. Program GPA 2.0 encoded as minGpa.",
  ],
  requirements: [
    {
      kind: "choose",
      id: "latin-minimum",
      name: "At least 12 credits in LATN (part of the 18-in-one/12-in-the-other language split)",
      overlay: true,
      credits: 12,
      from: { departments: ["LATN"] },
    },
    {
      kind: "choose",
      id: "greek-minimum",
      name: "At least 12 credits in GREK (part of the 18-in-one/12-in-the-other language split)",
      overlay: true,
      credits: 12,
      from: { departments: ["GREK"] },
    },
    {
      kind: "choose",
      id: "language-total",
      name: "30 credits combined in LATN and GREK (18 in one language, 12 in the other)",
      credits: 30,
      from: { departments: ["LATN", "GREK"] },
    },
    {
      kind: "choose",
      id: "supporting",
      name: "Supporting courses (e.g. CLAS170, HIST110, a Greek/Roman history course)",
      credits: 9,
      from: { departments: ["CLAS", "HIST", "ARTH"], minNumber: 0, maxNumber: 499 },
    },
  ],
};

export const clasMajorLatinGreekMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Classics (Latin and Greek)",
  major: "clas",
  track: "Latin and Greek",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/classical-languages-literature/classics-major/",
    department: "https://drive.google.com/uc?export=download&id=1Go4fyz59qBM5GgDt7xvqJXxnuWw3b3WO",
  },
};
