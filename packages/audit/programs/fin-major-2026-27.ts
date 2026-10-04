// Finance Major, Robert H. Smith School of Business, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/business/finance/finance-major/
// (the major's own requirements) and academiccatalog.umd.edu/undergraduate/colleges-schools/business/
// (the College Requirements business core, shared via bmgt-core-2026-27.ts) (both fetched 2026-09-28);
// see program-sources/finance-major.md. Both sources are the Academic Catalog; no department-vs-
// catalog disagreement to resolve (owner ruling only applies when the two differ).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { bmgtCoreRequirements, bmgtCoreReviewNotes } from "./bmgt-core-2026-27.ts";

export const finMajor: Program = {
  id: "fin-major",
  name: "Finance Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Finance Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/finance/finance-major/); " +
    "Robert H. Smith School of Business department page (College Requirements business core), " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/ (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    ...bmgtCoreReviewNotes,
    "Unlike Accounting (see the bmgtCoreReviewNotes note above about no named economics course being " +
      "found), Finance's own requirements page DOES name an 'Upper Level Economics Requirements for the " +
      "Finance major' course: ECON330 (Money and Banking) or BMGT341 (Financial Markets). That fills the " +
      "College Requirements table's 0-3-credit 'Economics Requirement' blank for this major specifically, " +
      "and is encoded below as its own course requirement (fin-econ-requirement).",
    "The 'Select four of the following courses' 12-credit elective (fin-electives) includes the catalog's " +
      "'Intermediate ECON' row -- 'One intermediate Macro (ECON305/ECON325) or Micro (ECON306/ECON326) " +
      "course' -- widened to all four named ECON course numbers as individual pool members, since any one " +
      "of them satisfies that row and the engine has no 'one of this sub-list counts as one slot' concept " +
      "narrower than listing them all as options.",
    "Not enforced (engine gap -- no at-most rule): the catalog's 'a MAXIMUM OF ONE of the following " +
      "courses (3cr) may be applied towards this 12 cr requirement' cap on BMGT349, BMGT448, and BMGT449. " +
      "Per docs/project/program-batches.md guidance, all three are included as ordinary members of the " +
      "fin-electives pool (widens, never narrows); a student who takes two or three of them and nothing " +
      "else from the pool would incorrectly pass this requirement. Flagged in docs/project/owner-review.md.",
    "The 'Select one of the following' 3-credit requirement (fin-select-one: BMGT310, BMGT313, BMGT332, " +
      "BMGT430) carries a footnote naming approved substitutes -- BMGT438A (Applied Quantitative Analysis, " +
      "QUEST) unconditionally, and ECON423 (Econometrics II) conditioned on 'ECON majors' -- a condition " +
      "with no representation in the engine (no declared-major concept for a course substitution). Both " +
      "are included unconditionally as extra options, matching the bmgt-core-2026-27.ts precedent for " +
      "MATH136 (widens, never narrows).",
    "No official 4-year plan was found for the Finance major specifically (the catalog's 'Catalog " +
      "four-year plan' section only links to the Smith School's general roadmaps page and " +
      "4yearplans.umd.edu, with no Finance-specific plan reachable from the fetched source); the general " +
      "Smith BS 'Typical Program for the Freshman and Sophomore Years' table also stops after the " +
      "sophomore year and never places any Finance-specific (BMGT34x/44x) courses. The sample plan is " +
      "therefore CONSTRUCTED from the catalog's own requirements tables, not lifted from a published " +
      "plan; flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    ...bmgtCoreRequirements,
    { kind: "course", id: "fin-bmgt343", name: "Investments (BMGT343)", options: ["BMGT343"] },
    { kind: "course", id: "fin-bmgt440", name: "Advanced Financial Management (BMGT440)", options: ["BMGT440"] },
    {
      kind: "choose",
      id: "fin-electives",
      name: "Finance Electives (select four)",
      count: 4,
      from: {
        courses: [
          "BMGT342",
          "BMGT347",
          "BMGT441",
          "BMGT442",
          "BMGT443",
          "BMGT444",
          "BMGT445",
          "BMGT446",
          "BMGT447",
          "ECON305",
          "ECON325",
          "ECON306",
          "ECON326",
          "BMGT349",
          "BMGT448",
          "BMGT449",
        ],
      },
    },
    {
      kind: "course",
      id: "fin-select-one",
      name: "Accounting/Quantitative Elective (BMGT310, BMGT313, BMGT332, BMGT430, or approved substitute)",
      options: ["BMGT310", "BMGT313", "BMGT332", "BMGT430", "BMGT438A", "ECON423"],
    },
    {
      kind: "course",
      id: "fin-econ-requirement",
      name: "Upper Level Economics Requirement (ECON330 or BMGT341)",
      options: ["ECON330", "BMGT341"],
    },
  ],
};

export const finMajorMeta: ProgramMeta = {
  kind: "major",
  college: "BMGT",
  short: "Finance",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/finance/finance-major/",
    department: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/",
  },
};
