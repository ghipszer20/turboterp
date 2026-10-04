// Operations Management & Business Analytics Major, Robert H. Smith School of Business, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/business/decision-operations-information-technologies/operations-management-business-analytics-major/
// (the major's own requirements) and academiccatalog.umd.edu/undergraduate/colleges-schools/business/
// (the College Requirements business core, shared via bmgt-core-2026-27.ts) (both fetched 2026-09-28);
// see program-sources/operations-management-business-analytics-major.md. Both sources are the Academic Catalog; no department-vs-
// catalog disagreement to resolve.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { bmgtCoreRequirements, bmgtCoreReviewNotes } from "./bmgt-core-2026-27.ts";

export const ombaMajor: Program = {
  id: "omba-major",
  name: "Operations Management & Business Analytics Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Operations Management & Business Analytics Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/decision-operations-information-technologies/operations-management-business-analytics-major/); " +
    "Robert H. Smith School of Business department page (College Requirements business core), " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/ (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    ...bmgtCoreReviewNotes,
    "The Smith School's 'Economics Requirement' line (0-3 credits of approved upper-level economics) names no " +
      "course on this major's page; not encoded (undecidable, matching the other BMGT majors' precedent).",
    "List A / List B rule ('select two courses from list A or one from A and one from B') is encoded as one " +
      "2-course choose over all seven listed courses plus an overlay choose requiring at least one List A " +
      "course (BMGT434, BMGT490, BMGT435). BMGT490 is open to QUEST students only (catalog); not enforced.",
    "The catalog's advice that graduate-school-bound students also take MATH141, MATH240 and MATH241 is not a requirement; not encoded.",
    "No official 4-year plan was found for this major specifically (the catalog's 'Catalog four-year plan' " +
      "section only links to the Smith School's general roadmaps page and 4yearplans.umd.edu). The sample plan " +
      "is CONSTRUCTED from the catalog's own requirements tables; flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    ...bmgtCoreRequirements,
    { kind: "course", id: "omba-bmgt332", name: "Quantitative Models for Management Decisions (BMGT332)", options: ["BMGT332"] },
    { kind: "course", id: "omba-bmgt385", name: "Operations Analytics (BMGT385)", options: ["BMGT385"] },
    { kind: "course", id: "omba-bmgt430", name: "Data Modeling in Business (BMGT430)", options: ["BMGT430"] },
    { kind: "course", id: "omba-bmgt431", name: "Data Analytics and AI for Business (BMGT431)", options: ["BMGT431"] },
    {
      kind: "choose",
      id: "omba-electives",
      name: "Two courses from List A, or one from List A and one from List B",
      count: 2,
      from: { courses: ["BMGT434", "BMGT490", "BMGT435", "BMGT400", "BMGT401", "BMGT404", "BMGT485"] },
    },
    {
      kind: "choose",
      id: "omba-list-a",
      name: "At least one List A course (BMGT434 or BMGT490, or BMGT435)",
      overlay: true,
      count: 1,
      from: { courses: ["BMGT434", "BMGT490", "BMGT435"] },
    },
  ],
};

export const ombaMajorMeta: ProgramMeta = {
  kind: "major",
  college: "BMGT",
  short: "Operations Mgmt & Business Analytics",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/decision-operations-information-technologies/operations-management-business-analytics-major/",
    department: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/",
  },
};
