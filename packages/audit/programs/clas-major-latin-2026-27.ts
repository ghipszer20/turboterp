// Classical Languages and Literatures (Classics) Major, Option A: Latin, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/classical-languages-literature/classics-major/;
// the College of Arts and Humanities' official "Classics - Latin" Four Year Academic Plan (department
// source, converted from PDF), https://drive.google.com/uc?export=download&id=1XOy6bx6sHIZ2Hkse1JrH1PCCMuFAFiKi
// (fetched 2026-09-28). No numeric disagreement found between the catalog and the plan for this track.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const clasMajorLatin: Program = {
  id: "clas-major-latin",
  name: "Classics Major (Latin)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Classical Languages and Literatures Major (Option A: Latin); " +
    "College of Arts and Humanities, official Classics - Latin Four Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1XOy6bx6sHIZ2Hkse1JrH1PCCMuFAFiKi (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "The department's own plan names 'CLAS 271 or Supporting Area #2' as a specific supporting-area course; CLAS271 is not on the Academic Catalog's approved CLAS course-number list, but it is named directly in the source (department plans win per the owner ruling), so it is kept as-is in the sample plan and flagged in docs/project/owner-review.md for the owner to confirm the number is current.",
    "Only three real LATN 4xx-or-higher course numbers exist on the Academic Catalog's approved list (LATN405, LATN415, LATN472); to reach the required 12 credits (four 3-credit courses) the sample plan enrolls in LATN472 twice, as a repeatable directed-study/topics course -- flagged in the sample plan's own notes.",
    "Known engine gaps (one note): the College of Arts and Humanities' overall 39 3xx-or-4xx-level-credit requirement (spans the whole degree, not just this major), residency rules (30 credits at UMD, 15 of the final 30 at the 300-400 level, 12 upper-level major credits at UMD), and the 120-credit graduation minimum are not encoded. Program GPA 2.0 encoded as minGpa.",
  ],
  requirements: [
    {
      kind: "choose",
      id: "latn-200-399",
      name: "LATN courses at the 2xx/3xx level",
      credits: 18,
      from: { departments: ["LATN"], minNumber: 200, maxNumber: 399 },
    },
    {
      kind: "choose",
      id: "latn-400",
      name: "LATN courses at the 4xx level or higher",
      credits: 12,
      from: { departments: ["LATN"], minNumber: 400, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "supporting",
      name: "Supporting courses at any level in CLAS, GREK, or related fields such as HIST and ARTH",
      credits: 9,
      from: { departments: ["CLAS", "GREK", "HIST", "ARTH"], minNumber: 0, maxNumber: 499 },
    },
  ],
};

export const clasMajorLatinMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Classics (Latin)",
  major: "clas",
  track: "Latin",
  defaultTrack: true,
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/classical-languages-literature/classics-major/",
    department: "https://drive.google.com/uc?export=download&id=1XOy6bx6sHIZ2Hkse1JrH1PCCMuFAFiKi",
  },
};
