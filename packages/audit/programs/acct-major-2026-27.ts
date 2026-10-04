// Accounting Major, Robert H. Smith School of Business, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/business/accounting/accounting-major/
// (the major's own requirements) and academiccatalog.umd.edu/undergraduate/colleges-schools/business/
// (the College Requirements business core, shared via bmgt-core-2026-27.ts) (both fetched 2026-09-28);
// see program-sources/accounting-major.md. Both sources are the Academic Catalog; no department-vs-
// catalog disagreement to resolve (owner ruling only applies when the two differ).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, SetMember } from "../src/audit.ts";
import { bmgtCoreRequirements, bmgtCoreReviewNotes } from "./bmgt-core-2026-27.ts";

/** Public Accounting Track (15 credits): required for CPA eligibility in Maryland. Four fixed
 * courses plus one of six named electives. */
const publicAccountingTrack: SetMember[] = [
  "BMGT311",
  "BMGT323",
  "BMGT411",
  "BMGT422",
  { count: 1, from: { courses: ["BMGT313", "BMGT410", "BMGT417", "BMGT423", "BMGT424", "BMGT428"] } },
];

/** Business and Accounting Advisory Track (9 credits): two of ten named accounting electives, plus
 * one more course from either a second named list or any of the ten accounting electives not
 * already used for the first slot. The engine's `sets` rule counts a course toward only one member
 * of a set, so listing the accounting electives again in the third slot's filter (alongside the
 * eight non-accounting options) naturally enforces "not selected above" without double-counting. */
const businessAndAccountingAdvisoryTrack: SetMember[] = [
  {
    count: 2,
    from: {
      courses: [
        "BMGT311",
        "BMGT313",
        "BMGT323",
        "BMGT410",
        "BMGT411",
        "BMGT417",
        "BMGT422",
        "BMGT423",
        "BMGT424",
        "BMGT428",
      ],
    },
  },
  {
    count: 1,
    from: {
      courses: [
        "BMGT362",
        "BMGT372",
        "BMGT385",
        "BMGT392",
        "BMGT402",
        "BMGT440",
        "BMGT454",
        "BMGT461",
        "BMGT311",
        "BMGT313",
        "BMGT323",
        "BMGT410",
        "BMGT411",
        "BMGT417",
        "BMGT422",
        "BMGT423",
        "BMGT424",
        "BMGT428",
      ],
    },
  },
] as const;

export const acctMajor: Program = {
  id: "acct-major",
  name: "Accounting Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Accounting Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/accounting/accounting-major/); " +
    "Robert H. Smith School of Business department page (College Requirements business core), " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/ (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    ...bmgtCoreReviewNotes,
    "The Public Accounting Track's four required courses (BMGT311, BMGT323, BMGT411, BMGT422) each " +
      "carry a catalog footnote 'Required for CPA in Maryland' -- informational, not a separate " +
      "requirement; the whole track is required as a unit either way.",
    "Not encoded (out of scope for the audit engine, not a course requirement): the Maryland State " +
      "Board of Public Accountancy's CPA-exam education requirements (120 credits to sit, 150 credits " +
      "to be licensed in most states including Maryland) and other states' CPA requirements -- these " +
      "are licensure rules external to the degree, not UMD degree requirements.",
    "No official 4-year plan was found for the Accounting major specifically (the catalog's 'Catalog " +
      "four-year plan' section only links to the Smith School's general roadmaps page and " +
      "4yearplans.umd.edu, with no Accounting-specific plan reachable from the fetched source); the " +
      "general Smith BS 'Typical Program for the Freshman and Sophomore Years' table also stops after " +
      "the sophomore year and never places any Accounting-specific (BMGT31x/32x/4xx) courses. The " +
      "sample plan is therefore CONSTRUCTED from the catalog's own requirements tables, not lifted " +
      "from a published plan; flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    ...bmgtCoreRequirements,
    { kind: "course", id: "acct-bmgt310", name: "Intermediate Accounting I (BMGT310)", options: ["BMGT310"] },
    { kind: "course", id: "acct-bmgt321", name: "Managerial Accounting (BMGT321)", options: ["BMGT321"] },
    { kind: "course", id: "acct-bmgt326", name: "Accounting Systems (BMGT326)", options: ["BMGT326"] },
    {
      kind: "sets",
      id: "acct-track",
      name: "Accounting Track (Public Accounting, or Business and Accounting Advisory)",
      options: [publicAccountingTrack, businessAndAccountingAdvisoryTrack],
    },
  ],
};

export const acctMajorMeta: ProgramMeta = {
  kind: "major",
  college: "BMGT",
  short: "Accounting",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/accounting/accounting-major/",
    department: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/",
  },
};
