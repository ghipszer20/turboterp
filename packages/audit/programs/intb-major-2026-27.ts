// International Business Major, Robert H. Smith School of Business, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/business/logistics-business-public-
// policy/international-business-major/ (the major's own requirements) and academiccatalog.umd.edu/
// undergraduate/colleges-schools/business/ (the College Requirements business core, shared via
// bmgt-core-2026-27.ts) (both fetched 2026-09-28); see program-sources/international-business-major.md.
// Both sources are the Academic Catalog; no department-vs-catalog disagreement to resolve (owner
// ruling only applies when the two differ).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { bmgtCoreRequirements, bmgtCoreReviewNotes } from "./bmgt-core-2026-27.ts";

export const intbMajor: Program = {
  id: "intb-major",
  name: "International Business Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, International Business Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/logistics-business-" +
    "public-policy/international-business-major/); " +
    "Robert H. Smith School of Business department page (College Requirements business core), " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/ (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    ...bmgtCoreReviewNotes,
    "Like Accounting and Information Systems (unlike Finance), the International Business major's own " +
      "page names no course for the College Requirements table's 'Economics Requirement' line; not " +
      "encoded (undecidable, no list given, matching that precedent).",
    "'Select four of the following: 12 credits' is encoded as a single 4-course `choose` " +
      "(intb-electives) over the union of every row's course(s). Rows that are themselves 'select one " +
      "course from X or Y (or Z...)' -- BMGT321/BMGT428, BMGT341/ECON330, BMGT354/BMGT458, " +
      "BMGT430/BMGT438, BMGT446/BMGT448/ECON305/ECON306, BMGT466/BMGT469, and BMGT477/BMGT478 -- are " +
      "each one `alternatives` group so a pair or quad counts once toward the 4-course total, matching " +
      "`compe-major-cybersecurity-2026-27.ts`'s pattern. BMGT454 and BMGT485 have no named alternate " +
      "and are plain pool members.",
    "The 'MAXIMUM OF ONE of the following language courses may be applied towards this 4 course " +
      "requirement' footnote (11 named 3xx-level language courses) is encoded as its own " +
      "`alternatives` group spanning all 11 courses, added to the same intb-electives pool. Unlike " +
      "Finance's unenforced BMGT349/448/449 cap (a plain engine gap there), this cap IS fully enforced " +
      "here: `alternatives` caps how many courses from one group can count toward the requirement at " +
      "once, which is exactly 'at most one of this list counts', regardless of group size.",
    "BMGT469 (Management and Organization Short-term Study Abroad), named only as BMGT466's " +
      "alternate, is the major's only mention of study abroad; there is no separate, freestanding " +
      "study-abroad requirement to flag as unencodable.",
    "No official 4-year plan was found for the International Business major specifically (matching " +
      "every other Smith School major's precedent: the catalog's 'Catalog four-year plan' section " +
      "only links to the Smith School's general roadmaps page and 4yearplans.umd.edu, with no " +
      "International-Business-specific plan reachable from the fetched source; the general Smith BS " +
      "'Typical Program' table also stops after the sophomore year). The sample plan is therefore " +
      "CONSTRUCTED from the catalog's own requirements tables, not lifted from a published plan; " +
      "flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    ...bmgtCoreRequirements,
    { kind: "course", id: "intb-bmgt392", name: "Introduction to International Business Management (BMGT392)", options: ["BMGT392"] },
    { kind: "course", id: "intb-bmgt463", name: "Cross-cultural Challenges in Business (BMGT463)", options: ["BMGT463"] },
    {
      kind: "choose",
      id: "intb-electives",
      name: "International Business Electives (select four)",
      count: 4,
      alternatives: [
        ["BMGT321", "BMGT428"],
        ["BMGT341", "ECON330"],
        ["BMGT354", "BMGT458"],
        ["BMGT430", "BMGT438"],
        ["BMGT446", "BMGT448", "ECON305", "ECON306"],
        ["BMGT466", "BMGT469"],
        ["BMGT477", "BMGT478"],
        [
          "ARAB304",
          "CHIN301",
          "FREN301",
          "GERS301",
          "HEBR313",
          "ITAL301",
          "JAPN301",
          "PERS301",
          "PORT405",
          "RUSS301",
          "SPAN301",
        ],
      ],
      from: {
        courses: [
          "BMGT321",
          "BMGT428",
          "BMGT341",
          "ECON330",
          "BMGT354",
          "BMGT458",
          "BMGT430",
          "BMGT438",
          "BMGT446",
          "BMGT448",
          "ECON305",
          "ECON306",
          "BMGT454",
          "BMGT466",
          "BMGT469",
          "BMGT477",
          "BMGT478",
          "BMGT485",
          "ARAB304",
          "CHIN301",
          "FREN301",
          "GERS301",
          "HEBR313",
          "ITAL301",
          "JAPN301",
          "PERS301",
          "PORT405",
          "RUSS301",
          "SPAN301",
        ],
      },
    },
  ],
};

export const intbMajorMeta: ProgramMeta = {
  kind: "major",
  college: "BMGT",
  short: "International Business",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/logistics-business-" +
      "public-policy/international-business-major/",
    department: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business/",
  },
};
