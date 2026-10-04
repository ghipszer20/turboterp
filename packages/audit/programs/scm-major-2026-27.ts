// Supply Chain Management Major, Robert H. Smith School of Business, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/business/logistics-business-public-policy/supply-chain-management-major/
// (the major's own requirements) and academiccatalog.umd.edu/undergraduate/colleges-schools/business/
// (the College Requirements business core, shared via bmgt-core-2026-27.ts) (both fetched 2026-09-28);
// see program-sources/supply-chain-management-major.md. Both sources are the Academic Catalog; no department-vs-
// catalog disagreement to resolve.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { bmgtCoreRequirements, bmgtCoreReviewNotes } from "./bmgt-core-2026-27.ts";

export const scmMajor: Program = {
  id: "scm-major",
  name: "Supply Chain Management Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Supply Chain Management Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/logistics-business-public-policy/supply-chain-management-major/); " +
    "Robert H. Smith School of Business department page (College Requirements business core), " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/ (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    ...bmgtCoreReviewNotes,
    "The Smith School's 'Economics Requirement' line (0-3 credits of approved upper-level economics) names no " +
      "course on this major's page; not encoded (undecidable, matching the other BMGT majors' precedent).",
    "Not enforced (engine gap -- no at-most rule): 'a maximum of 3 credits of BMGT373 and a maximum of 6 " +
      "credits of BMGT478 (if content differs) can fulfill Supply Chain Management major requirements'. " +
      "BMGT373 and BMGT478 are ordinary members of the pools (widens, never narrows); a repeated BMGT478 " +
      "beyond 6 credits would incorrectly count. Flagged in docs/project/owner-review.md.",
    "'Select three of the following' plus 'select one ... or one of the following not selected above' is encoded " +
      "as a 3-course choose over the seven supply chain electives and a 1-course choose over those seven plus " +
      "the eight listed outside courses; the engine assigns each course to one requirement, so the fourth " +
      "course cannot repeat one of the three.",
    "No official 4-year plan was found for this major specifically (the catalog's 'Catalog four-year plan' " +
      "section only links to the Smith School's general roadmaps page and 4yearplans.umd.edu). The sample plan " +
      "is CONSTRUCTED from the catalog's own requirements tables; flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    ...bmgtCoreRequirements,
    { kind: "course", id: "scm-bmgt370", name: "Introduction to Transportation (BMGT370)", options: ["BMGT370"] },
    { kind: "course", id: "scm-bmgt372", name: "Introduction to Logistics and Supply Chain Management (BMGT372)", options: ["BMGT372"] },
    {
      kind: "choose",
      id: "scm-electives",
      name: "Supply Chain Management Electives (select three)",
      count: 3,
      from: { courses: ["BMGT373", "BMGT374", "BMGT472", "BMGT475", "BMGT476", "BMGT477", "BMGT478"] },
    },
    {
      kind: "choose",
      id: "scm-fourth",
      name: "One more course: a listed business course or an unselected supply chain elective",
      count: 1,
      from: {
        courses: [
          "BMGT302", "BMGT332", "BMGT385", "BMGT392", "BMGT454", "BMGT461", "BMGT484", "BMGT490",
          "BMGT373", "BMGT374", "BMGT472", "BMGT475", "BMGT476", "BMGT477", "BMGT478",
        ],
      },
    },
  ],
};

export const scmMajorMeta: ProgramMeta = {
  kind: "major",
  college: "BMGT",
  short: "Supply Chain Management",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/logistics-business-public-policy/supply-chain-management-major/",
    department: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/",
  },
};
