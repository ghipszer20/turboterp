// Data Science Minor, 2026–27 UMD Academic Catalog. Listed twice in the catalog navigation, once
// under Computer Science and once under Mathematics (identical requirement tables, same DATA
// course numbers and substitution rules on both pages, same restriction list by specialization
// code) -- one interdisciplinary minor administered jointly, encoded once here rather than as two
// registry entries a student could double-declare.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/computer-science/data-science-minor/
// and .../mathematics/data-science-minor/ (fetched 2026-09-27, identical content); program site
// https://data.umd.edu/prospective/ (fetched 2026-09-27). Owner ruling (docs/project/rulings.md):
// where the department page and the catalog disagree, follow the department page. No official
// published sample plan (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const dataScienceMinor: Program = {
  id: "data-minor",
  name: "Data Science Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Data Science Minor (CMSC and MATH listings, identical); " +
    "https://data.umd.edu/prospective/ (fetched 2026-09-27)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Department-vs-catalog difference (owner ruling: follow the department page): the catalog's DATA400 substitution list is 'STAT400, STAT410, or ENEE324'; the program site (data.umd.edu) adds SURV410. SURV410 is included here.",
    "DATA250's substitution ('CMSC250 and MATH240, MATH341, or MATH461') is encoded as a sets requirement: DATA250 alone, or CMSC250 paired with one of the three math courses. DATA320's substitution (CMSC320) and DATA400's substitution list are 'course' requirements with every accepted code as an option.",
    "'No more than six credits (or two courses) may overlap with the student's major' (program site; the catalog states only a transfer-credit limit) -> maxSharedWith: [{ courses: 2 }]. 'No course may satisfy the requirements of more than one minor' isn't enforced (the audit doesn't currently model cross-minor sharing, only major/minor).",
    "Prerequisite to declare (DATA100, STAT100, MATH135, DATA400, a 400-level STAT course, or an approved equivalent, C- or better) is an admission gate, not a minor requirement itself; not encoded, matching how the CS minor's gateway courses are kept separate from its core requirements.",
    "Ineligible if declared in the Math-Statistics specialization (1701S), CS-Data-Science specialization (0701B), or CS-Machine-Learning specialization (0701F): Enforced via notOpenTo for the two Computer Science specializations; the Math-Statistics specialization (1701S) is not a registered major, so it is left out.",
  ],
  requirements: [
    { kind: "course", id: "dataR", name: "Applications of R for Data Science", options: ["DATA110"] },
    { kind: "course", id: "dataPython", name: "Python Programming for Data Science", options: ["DATA120"] },
    { kind: "course", id: "ethics", name: "Knowledge in Society: Science, Data and Ethics", options: ["DATA200"] },
    {
      kind: "sets",
      id: "discreteMath",
      name: "DATA250, or CMSC250 + linear algebra",
      options: [["DATA250"], ["CMSC250", "MATH240"], ["CMSC250", "MATH341"], ["CMSC250", "MATH461"]],
    },
    { kind: "course", id: "introDataScience", name: "Introduction to Data Science", options: ["DATA320", "CMSC320"] },
    { kind: "course", id: "dataViz", name: "Data Visualization and Presentation", options: ["DATA350"] },
    { kind: "course", id: "appliedProb", name: "Applied Probability and Statistics I", options: ["DATA400", "STAT400", "STAT410", "ENEE324", "SURV410"] },
  ],
};

export const dataScienceMinorMeta: ProgramMeta = { kind: "minor", notOpenTo: { programs: ["cmsc-major-data-science", "cmsc-major-machine-learning"], reason: "Not open to students in the Computer Science Data Science or Machine Learning specializations." }, college: "CMNS", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/computer-science/data-science-minor/", department: "https://data.umd.edu/prospective/" } };
