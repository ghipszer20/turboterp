// Survey Methodology Minor, 2026–27 UMD Academic Catalog (Joint Program in Survey Methodology, BSOS).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/survey-methodology-minor/
// (fetched 2026-09-28); JPSM, https://jpsm.umd.edu/ (fetched 2026-09-28; homepage only, no requirements).
// No official published sample plan (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const survMinor: Program = {
  id: "surv-minor",
  name: "Survey Methodology Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Survey Methodology Minor; JPSM, https://jpsm.umd.edu/ (fetched 2026-09-28; department page not checked beyond the homepage)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Department page not checked: jpsm.umd.edu is only a homepage with no minor requirements, so this is encoded from the catalog.",
    "Catalog: 'Apply no more than two courses from the minor to satisfying the requirements of the student's major' -> maxSharedWith: [{ courses: 2 }].",
    "Minimum grade C- in all minor courses is encoded on the whole program (catalog states it). Program GPA 2.0 encoded as minGpa. The 'no more than two courses at another institution' cap are manual notes, not encoded.",
    "Statistics and research methods: the catalog says similar courses, including ones at other institutions, may be accepted as substitutes; only the listed courses are accepted here, other courses may count with JPSM advisor approval (stats1 and stats2 are marked advisorMayApprove).",
    "Catalog inconsistency: the totals say 16-19 credits, then 'all 16-18 required credits'; SOCY201/SOCY401 are 4-credit courses. Credit totals are not enforced; course slots are.",
    "The 1-2 credit introductory 600-level SURV slot is encoded as any SURV course numbered 600-699 other than SURV621/625/630/632 (the engine cannot filter by credit count), so a 3-credit 600-level SURV course would wrongly count here; manual check of credits.",
    "Catalog names the core course 'Fundamentals of Survey and Data Science' in the table and 'Fundamentals of Survey Design' in the text; both are SURV400.",
    "Recommended sequence (SURV400 and SURV630 in spring of junior year; SURV400 is a prerequisite of the two additional SURV courses) is advice, not encoded.",
  ],
  requirements: [
    {
      kind: "course",
      id: "stats1",
      advisorMayApprove: true,
      name: "Statistics",
      options: ["BIOM301", "CCJS200", "ECON230", "ECON321", "GVPT422", "PSYC200", "QMMS251", "SOCY201", "STAT400", "STAT410"],
    },
    {
      kind: "course",
      id: "stats2",
      advisorMayApprove: true,
      name: "Second statistics or research methods course",
      options: ["AREC422", "ECON422", "ECON424", "SOCY401", "STAT401", "PSYC300", "STAT420"],
    },
    { kind: "course", id: "surv400", name: "Fundamentals of Survey and Data Science", options: ["SURV400"] },
    { kind: "course", id: "surv630", name: "Questionnaire Design and Evaluation", options: ["SURV630"] },
    { kind: "course", id: "surv-additional", name: "Additional survey methodology course", options: ["SURV621", "SURV632", "SURV625"] },
    {
      kind: "choose",
      id: "surv-intro",
      name: "One 1-2 credit introductory 600-level SURV course",
      count: 1,
      from: { departments: ["SURV"], minNumber: 600, maxNumber: 699, exclude: ["SURV621", "SURV625", "SURV630", "SURV632"] },
    },
  ],
};

export const survMinorMeta: ProgramMeta = { kind: "minor", college: "BSOS", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/survey-methodology-minor/", department: "https://jpsm.umd.edu/" } };
