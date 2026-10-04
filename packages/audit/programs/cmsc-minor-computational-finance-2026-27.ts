// Computational Finance Minor (CMSC), 2026–27 UMD Academic Catalog. Not the separate
// Computational Finance Minor (BMGT) offered by the Smith School -- a different program under a
// different college, out of scope for this batch.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/computer-science/computational-finance-minor/
// (fetched 2026-09-27); Department of Computer Science / program site,
// https://sites.google.com/umd.edu/compfinminor/home (fetched 2026-09-27; confirms the program
// exists and its BUFN400-403 course numbers but not the full requirement breakdown -- see
// docs/project/owner-review.md). No official published sample plan (built from the catalog's
// requirements below).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const cmscMinorComputationalFinance: Program = {
  id: "cmsc-minor-computational-finance",
  name: "Computational Finance Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Computational Finance Minor (CMSC); " +
    "https://sites.google.com/umd.edu/compfinminor/home (fetched 2026-09-27)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "The program's own site (sites.google.com/umd.edu/compfinminor) confirms BUFN400-403 and a 15-credit, five-course minor but its 'Requirements' page content wasn't retrievable in full; the catalog's specific breakdown (BUFN400 + CMSC320 + BUFN403 required, one of BUFN401/402, one of CMSC421/422/470/471/472/474) is used since nothing found contradicts it. Flagged in docs/project/owner-review.md for the owner to confirm against the site directly.",
    "'Only open to Computer Science majors' (catalog) is enforced via onlyOpenTo (the CS major and its four specializations). '60 credits completed' (web search summary of the program site) is an eligibility gate, not enforced (no credits-earned concept for this check).",
    "C- per owner ruling (rulings.md).",
    "'Complete CMSC320 (or equivalent) before or during the first semester' is a sequencing rule, not encoded.",
    "Neither source states a sharing cap with another program; none is set (expected to overlap heavily with the CS major, which the minor is restricted to).",
  ],
  requirements: [
    { kind: "course", id: "markets", name: "Introduction to Financial Markets and Financial Datasets", options: ["BUFN400"] },
    { kind: "course", id: "dataScience", name: "Introduction to Data Science", options: ["CMSC320"] },
    { kind: "course", id: "capstone", name: "Capstone Computational Finance Projects", options: ["BUFN403"] },
    { kind: "choose", id: "financeElective", name: "One of BUFN401, BUFN402", count: 1, from: { courses: ["BUFN401", "BUFN402"] } },
    {
      kind: "choose",
      id: "csElective",
      name: "One of CMSC421, CMSC422, CMSC470, CMSC471, CMSC472, CMSC474",
      count: 1,
      from: { courses: ["CMSC421", "CMSC422", "CMSC470", "CMSC471", "CMSC472", "CMSC474"] },
    },
  ],
};

export const cmscMinorComputationalFinanceMeta: ProgramMeta = { kind: "minor", college: "CMNS", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/computer-science/computational-finance-minor/", department: "https://sites.google.com/umd.edu/compfinminor/home" }, onlyOpenTo: { programs: ["cmsc-major", "cmsc-major-cybersecurity", "cmsc-major-data-science", "cmsc-major-machine-learning", "cmsc-major-quantum-information"], reason: "Only open to Computer Science majors." } };
