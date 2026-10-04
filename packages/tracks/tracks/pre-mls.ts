// Pre-Medical Laboratory Science (MLS). Source: ASCP Board of Certification eligibility route
// and NAACLS, as reported by a search-result summary in docs/project/new-tracks-research.md
// section 10 (S). UNVERIFIED until the owner signs off.

import type { Track } from "../src/types.ts";
import { creditsFrom, overlaySets } from "./common.ts";

const NAACLS = "https://naacls.org/";
const ASCP = "https://www.ascp.org/boc/explore-credentials/view-all-credentials/MLS";

export const preMls: Track = {
  id: "pre-mls",
  name: "Pre-Medical Laboratory Science",
  schools: "MLS programs",
  entry: { kind: "after-degree" },
  usesScienceGpa: true,
  categories: [
    creditsFrom(
      "biology-credits",
      "Biology (16 semester hours)",
      16,
      ["BSCI160", "BSCI161", "BSCI170", "BSCI171", "BSCI180", "BSCI201", "BSCI202", "BSCI223", "BSCI283"],
      "16 semester hours of biology (ASCP BOC eligibility)",
    ),
    overlaySets(
      "microbiology",
      "One semester of microbiology (counts toward the 16 biology hours)",
      [["BSCI223"], ["BSCI283"]],
      "including 1 semester of microbiology",
    ),
    creditsFrom(
      "chemistry-credits",
      "Chemistry (16 semester hours)",
      16,
      ["CHEM131", "CHEM132", "CHEM231", "CHEM232", "CHEM241", "CHEM242", "CHEM271", "CHEM272", "BCHM461", "BCHM463"],
      "16 semester hours of chemistry (ASCP BOC eligibility)",
    ),
    overlaySets(
      "organic-or-biochem",
      "One semester of organic chemistry or biochemistry (counts toward the 16 chemistry hours)",
      [["CHEM231", "CHEM232"], ["BCHM461"]],
      "including 1 semester of organic chemistry or biochemistry",
    ),
  ],
  milestones: [
    {
      id: "bachelors-degree",
      kind: "advising",
      name: "Baccalaureate degree",
      detail: "The ASCP route needs a bachelor's degree with the biology and chemistry above, plus a NAACLS-accredited MLS program.",
    },
    {
      id: "naacls-program",
      kind: "application",
      name: "Apply to a NAACLS-accredited MLS program",
      detail: "Most students apply to a post-baccalaureate MLS program; each sets its own deadline and extra prerequisites. The ASCP BOC certification exam follows the program.",
    },
  ],
  disclaimer: "Confirm with NAACLS-accredited programs and each target school.",
  sources: [NAACLS, ASCP],
  verified: false,
  reviewNotes: [
    "(S) The 16 semester hours of biology (including 1 semester of microbiology) and 16 of chemistry (including 1 semester of organic chemistry or biochemistry) come from a search-result summary; the ASCP page returned 403 and the NAACLS 2024 Standards PDF was unparseable. Verify before setting verified: true.",
    "NAACLS's own standards only require \"appropriate prerequisite coursework\", so 16 + 16 is the ASCP eligibility route, common to nearly every post-baccalaureate MLS program.",
    "The microbiology and organic-or-biochemistry categories are overlays: their courses also count toward the 16-credit pools.",
    "The research doc names BSCI170/171, BSCI180, BSCI223, CHEM131/132, CHEM231/232 and BCHM461. Pools also accept courses other tracks already use (BSCI160/161, BSCI201/202, BSCI283, CHEM241/242, CHEM271/272, BCHM463); this widening is TurboTerp's reading.",
  ],
};
