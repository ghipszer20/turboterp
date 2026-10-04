// Management Major, Robert H. Smith School of Business, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/business/management/management-major/
// (the major's own requirements) and academiccatalog.umd.edu/undergraduate/colleges-schools/business/
// (the College Requirements business core, shared via bmgt-core-2026-27.ts) (both fetched 2026-09-28);
// see program-sources/management-major.md. Both sources are the Academic Catalog; no department-vs-
// catalog disagreement to resolve (owner ruling only applies when the two differ).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { bmgtCoreRequirements, bmgtCoreReviewNotes } from "./bmgt-core-2026-27.ts";

export const mgmtMajor: Program = {
  id: "mgmt-major",
  name: "Management Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Management Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/management/management-major/); " +
    "Robert H. Smith School of Business department page (College Requirements business core), " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/ (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    ...bmgtCoreReviewNotes,
    "Like Accounting and International Business (unlike Finance), the Management major's own page names " +
      "no course for the College Requirements table's 'Economics Requirement' line; not encoded " +
      "(undecidable, no list given, matching that precedent).",
    "Not enforced (engine gap -- no at-most rule): the catalog's footnote cap ('A maximum combined total " +
      "of 6 credits of BMGT468 and BMGT469 coursework can satisfy Management major requirements') on the " +
      "'select four of the following' 12-credit elective (mgmt-electives). Per docs/project/program-batches.md " +
      "guidance, both BMGT468 and BMGT469 are included as ordinary members of the mgmt-electives pool " +
      "(widens, never narrows); a student who takes three or four of BMGT468/BMGT469 and nothing else from " +
      "the pool would incorrectly pass this requirement. Flagged in docs/project/owner-review.md.",
    "No official 4-year plan was found for the Management major specifically (matching every other Smith " +
      "School major's precedent: the catalog's 'Catalog four-year plan' section only links to the Smith " +
      "School's general roadmaps page and 4yearplans.umd.edu, with no Management-specific plan reachable " +
      "from the fetched source; the general Smith BS 'Typical Program' table also stops after the " +
      "sophomore year). The sample plan is therefore CONSTRUCTED from the catalog's own requirements " +
      "tables, not lifted from a published plan; flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    ...bmgtCoreRequirements,
    { kind: "course", id: "mgmt-bmgt363", name: "Leadership and Teamwork in Organizations (BMGT363)", options: ["BMGT363"] },
    { kind: "course", id: "mgmt-bmgt362", name: "Negotiations (BMGT362)", options: ["BMGT362"] },
    {
      kind: "choose",
      id: "mgmt-electives",
      name: "Management Electives (select four)",
      count: 4,
      from: {
        courses: ["BMGT360", "BMGT366", "BMGT461", "BMGT463", "BMGT466", "BMGT468", "BMGT469"],
      },
    },
  ],
};

export const mgmtMajorMeta: ProgramMeta = {
  kind: "major",
  college: "BMGT",
  short: "Management",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/management/management-major/",
    department: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/",
  },
};
