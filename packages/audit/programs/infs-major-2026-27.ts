// Information Systems Major, Robert H. Smith School of Business, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/business/decision-operations-
// information-technologies/information-systems-major/ (the major's own requirements) and
// academiccatalog.umd.edu/undergraduate/colleges-schools/business/ (the College Requirements
// business core, shared via bmgt-core-2026-27.ts) (both fetched 2026-09-28); see
// program-sources/information-systems-major.md. Both sources are the Academic Catalog; no
// department-vs-catalog disagreement to resolve (owner ruling only applies when the two differ).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { bmgtCoreRequirements, bmgtCoreReviewNotes } from "./bmgt-core-2026-27.ts";

export const infsMajor: Program = {
  id: "infs-major",
  name: "Information Systems Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Information Systems Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/decision-operations-" +
    "information-technologies/information-systems-major/); " +
    "Robert H. Smith School of Business department page (College Requirements business core), " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/ (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    ...bmgtCoreReviewNotes,
    "Like Accounting (see the bmgtCoreReviewNotes note above about no named economics course being " +
      "found), the Information Systems major's own requirements page names no 'Upper Level Economics " +
      "Requirements' course, so the College Requirements table's 0-3-credit 'Economics Requirement' " +
      "blank is left unfilled for this major, matching Accounting's precedent.",
    "BMGT302's footnote 1 and BMGT402's footnote 2 each name an approved substitute -- CMSC132 " +
      "(Object-Oriented Programming II) or INST326 (Object-Oriented Programming for Information " +
      "Science) for BMGT302, and CMSC424 (Database Design) or INST327 (Database Design and Modeling) " +
      "for BMGT402 -- both included as extra course options (widens, never narrows). Per the owner's " +
      "ruling that CMSC141 counts for CMSC131 and CMSC142 counts for CMSC132 wherever CMSC132 appears, " +
      "CMSC141/CMSC142 are also included as options wherever CMSC132 is named.",
    "BMGT404's footnote 3 names CMSC320 (Introduction to Data Science) as an approved substitute; " +
      "included as an extra option in List A wherever BMGT404 appears (widens, never narrows).",
    "BMGT485's footnote 5 names INST453 (Project Management for Information Science) as an approved " +
      "substitute; included as an extra option in List A wherever BMGT485 appears (widens, never " +
      "narrows).",
    "BMGT408's footnote 4 ('Repeatable if content differs') is not modeled: the engine has no concept " +
      "of a single course number satisfying a requirement more than once under different content. " +
      "BMGT408 is encoded as an ordinary single-use option in the List A pool.",
    "'Select two courses from list A or one course from A and one course from list B' is encoded as " +
      "a 2-course `choose` over List A union List B (infs-list-a-or-b), plus a 1-course `overlay: " +
      "true` `choose` over List A alone (infs-list-a-minimum), per docs/project/program-batches.md's " +
      "guidance for this exact 'two from A, or one from A and one from B' shape. Together these require " +
      "exactly 2 courses total from A∪B with at least 1 of them from A -- matching the source, since " +
      "the source never allows two courses from B alone.",
    "No official 4-year plan was found for the Information Systems major specifically (matching " +
      "Finance's precedent: the catalog's 'Catalog four-year plan' section only links to the Smith " +
      "School's general roadmaps page and 4yearplans.umd.edu, with no Information-Systems-specific " +
      "plan reachable from the fetched source). The sample plan is therefore CONSTRUCTED from the " +
      "catalog's own requirements tables, not lifted from a published plan; flagged in " +
      "docs/project/owner-review.md.",
  ],
  requirements: [
    ...bmgtCoreRequirements,
    {
      kind: "course",
      id: "infs-bmgt302",
      name: "Essential Programming and AI Skills for Business Analytics (BMGT302, or CMSC132/CMSC142/INST326)",
      options: ["BMGT302", "CMSC132", "CMSC142", "INST326"],
    },
    {
      kind: "course",
      id: "infs-bmgt402",
      name: "AI Augmented Database Systems (BMGT402, or CMSC424/INST327)",
      options: ["BMGT402", "CMSC424", "INST327"],
    },
    { kind: "course", id: "infs-bmgt403", name: "Systems Analysis and Design (BMGT403)", options: ["BMGT403"] },
    { kind: "course", id: "infs-bmgt407", name: "Information Systems Projects (BMGT407)", options: ["BMGT407"] },
    {
      kind: "choose",
      id: "infs-list-a-or-b",
      name: "Select two courses from List A, or one from List A and one from List B",
      count: 2,
      from: {
        courses: [
          // List A
          "BMGT400",
          "BMGT401",
          "BMGT404",
          "CMSC320",
          "BMGT406",
          "BMGT408",
          "BMGT485",
          "INST453",
          // List B
          "BMGT326",
          "BMGT430",
          "BMGT461",
          "BMGT476",
          "BMGT484",
        ],
      },
    },
    {
      kind: "choose",
      id: "infs-list-a-minimum",
      name: "At least one of the two above must be from List A",
      overlay: true,
      count: 1,
      from: {
        courses: ["BMGT400", "BMGT401", "BMGT404", "CMSC320", "BMGT406", "BMGT408", "BMGT485", "INST453"],
      },
    },
  ],
};

export const infsMajorMeta: ProgramMeta = {
  kind: "major",
  college: "BMGT",
  short: "Information Systems",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/decision-operations-" +
      "information-technologies/information-systems-major/",
    department: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/",
  },
};
