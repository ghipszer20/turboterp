// Marketing Major, Robert H. Smith School of Business, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/business/marketing/marketing-major/
// (the major's own requirements) and academiccatalog.umd.edu/undergraduate/colleges-schools/business/
// (the College Requirements business core, shared via bmgt-core-2026-27.ts) (both fetched 2026-09-28);
// see program-sources/marketing-major.md. Both sources are the Academic Catalog; no department-vs-
// catalog disagreement to resolve (owner ruling only applies when the two differ).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { bmgtCoreRequirements, bmgtCoreReviewNotes } from "./bmgt-core-2026-27.ts";

export const mktgMajor: Program = {
  id: "mktg-major",
  name: "Marketing Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Marketing Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/marketing/marketing-major/); " +
    "Robert H. Smith School of Business department page (College Requirements business core), " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/ (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    ...bmgtCoreReviewNotes,
    "Like Accounting, Information Systems, and International Business (unlike Finance), the Marketing " +
      "major's own page names no course for the College Requirements table's 'Economics Requirement' " +
      "line; not encoded (undecidable, no list given, matching that precedent).",
    "Not enforced (engine gap -- no at-most rule): the catalog's footnote cap on BMGT458 ('Special Topics " +
      "in Marketing', maximum of 6 credits if content differs) within the 'select three of the following' " +
      "9-credit elective (mktg-electives). Per docs/project/program-batches.md guidance (and matching the " +
      "Management major's BMGT468/BMGT469 precedent and the Finance major's BMGT349/BMGT448/BMGT449 " +
      "precedent), BMGT458 is included as an ordinary member of the mktg-electives pool (widens, never " +
      "narrows); a student who takes BMGT458 three times (9 credits, exceeding the 6-credit cap) and " +
      "nothing else from the pool would incorrectly pass this requirement. Flagged in " +
      "docs/project/owner-review.md.",
    "No official 4-year plan was found for the Marketing major specifically (matching every other Smith " +
      "School major's precedent: the catalog's 'Catalog four-year plan' section only links to the Smith " +
      "School's general roadmaps page and 4yearplans.umd.edu, with no Marketing-specific plan reachable " +
      "from the fetched source; the general Smith BS 'Typical Program' table also stops after the " +
      "sophomore year). The sample plan is therefore CONSTRUCTED from the catalog's own requirements " +
      "tables, not lifted from a published plan; flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    ...bmgtCoreRequirements,
    { kind: "course", id: "mktg-bmgt354", name: "Consumer Analysis (BMGT354)", options: ["BMGT354"] },
    { kind: "course", id: "mktg-bmgt351", name: "Marketing Research Methods (BMGT351)", options: ["BMGT351"] },
    { kind: "course", id: "mktg-bmgt457", name: "Marketing Policies and Strategies (BMGT457)", options: ["BMGT457"] },
    {
      kind: "choose",
      id: "mktg-electives",
      name: "Marketing Electives (select three)",
      count: 3,
      from: {
        courses: [
          "BMGT456",
          "BMGT453",
          "BMGT357",
          "BMGT372",
          "BMGT450",
          "BMGT454",
          "BMGT455",
          "BMGT458",
          "BMGT484",
        ],
      },
    },
  ],
};

export const mktgMajorMeta: ProgramMeta = {
  kind: "major",
  college: "BMGT",
  short: "Marketing",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/marketing/marketing-major/",
    department: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/",
  },
};
