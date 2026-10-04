// Classical Languages and Literatures (Classics) Major, Option C: Classics in Translation (Classical
// Humanities), 2026-27 UMD Academic Catalog. Sources: academiccatalog.umd.edu/undergraduate/
// colleges-schools/arts-humanities/classical-languages-literature/classics-major/; the College of Arts
// and Humanities' official "Classics - Humanities" Four Year Academic Plan (department source, converted
// from PDF), https://drive.google.com/uc?export=download&id=18tFM357KN3rEkZqtASqHL4ZDB-z-2EYt
// (fetched 2026-09-28). No numeric disagreement found between the catalog and the plan for this track.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const clasMajorHumanities: Program = {
  id: "clas-major-humanities",
  name: "Classics Major (Classical Humanities)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Classical Languages and Literatures Major " +
    "(Option C: Classics in Translation / Classical Humanities); " +
    "College of Arts and Humanities, official Classics - Humanities Four Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=18tFM357KN3rEkZqtASqHL4ZDB-z-2EYt (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Foundation Courses (footnote 1): 'the introductory Latin or Greek sequence... if taken at College Park, fulfills this requirement... If no language is taken, four courses in English translation, including at least two in Classics, are required. Students who are capable of working at a higher level may request departmental approval to substitute 3xx or 4xx-level courses for some of the introductory credits.' These conditional substitution paths (language sequence vs. translation courses, and the higher-level substitution option) aren't encoded; simplified to the base rule: 12 credits at the 1xx-2xx level, at least 6 of which are CLAS. Encoded as an overlay minimum of 6 CLAS credits plus a consuming 12-credit total across CLAS/LATN/GREK at the 1xx-2xx level.",
    "Advanced Courses footnote 2's special exception (LATN201 or GREK201 may count as one of the eight advanced courses) is not encoded -- both are 2xx courses and the filter here is 3xx-and-above only.",
    "The catalog doesn't restrict the four non-Classics 'advanced' courses to LATN/GREK specifically (the plan's own benchmark table labels some slots 'DEPT 3xx-4xx***', footnoted 'Courses selected with CLAS advisor', implying any advisor-approved department). Encoded conservatively as CLAS/LATN/GREK only (the Academic Catalog's approved course-number lists don't cover other departments); please confirm whether advisor-approved courses outside CLAS/LATN/GREK should also count. Marked advisorMayApprove (advanced-total): other courses may count with advisor approval; only the listed courses count.",
    "The College Requirements summary row states a range of '39-42' credits covering all three options, but Option C's own detailed breakdown totals 36 (12 Foundation + 24 Advanced) -- likely the summary row is a PDF-conversion artifact carried over from Options A/B; the option's own total (36) was used.",
    "Known engine gaps (one note): the College of Arts and Humanities' overall 39 3xx-or-4xx-level-credit requirement (spans the whole degree; this track's major requirements alone provide only 24 such credits, made up elsewhere by other coursework), residency rules, and the 120-credit graduation minimum are not encoded. Program GPA 2.0 encoded as minGpa.",
  ],
  requirements: [
    {
      kind: "choose",
      id: "foundation-clas-minimum",
      name: "At least 6 credits in CLAS at the 1xx-2xx level",
      overlay: true,
      credits: 6,
      from: { departments: ["CLAS"], minNumber: 100, maxNumber: 299 },
    },
    {
      kind: "choose",
      id: "foundation-total",
      name: "Foundation Courses: 12 credits at the 1xx-2xx level (at least 6 in CLAS)",
      credits: 12,
      from: { departments: ["CLAS", "LATN", "GREK"], minNumber: 100, maxNumber: 299 },
    },
    {
      kind: "course",
      id: "capstone",
      name: "Classics Capstone Seminar",
      overlay: true,
      options: ["CLAS409"],
    },
    {
      kind: "choose",
      id: "advanced-clas-minimum",
      name: "At least 4 of the advanced courses in CLAS",
      overlay: true,
      count: 4,
      from: { departments: ["CLAS"], minNumber: 300, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "advanced-total",
      advisorMayApprove: true,
      name: "Advanced Courses: eight 3xx-level-or-above courses (at least 4 CLAS, including CLAS409)",
      count: 8,
      from: { departments: ["CLAS", "LATN", "GREK"], minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const clasMajorHumanitiesMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Classics (Humanities)",
  major: "clas",
  track: "Classical Humanities",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/classical-languages-literature/classics-major/",
    department: "https://drive.google.com/uc?export=download&id=18tFM357KN3rEkZqtASqHL4ZDB-z-2EYt",
  },
};
