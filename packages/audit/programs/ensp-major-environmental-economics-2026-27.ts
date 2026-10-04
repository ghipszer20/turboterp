// Environmental Science and Policy Major, Environmental Economics Concentration (AGNR),
// 2026-27 UMD Academic Catalog.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/
//   environmental-science-policy/environmental-science-policy-major/ (fetched 2026-09-28).
// See ensp-shared-2026-27.ts for the shared ENSP Core and common review notes; this file adds the
// Environmental Economics concentration's own requirements. No official four-year plan was
// gathered for this concentration (only the seven BSOS/CMNS concentrations have one); the sample
// plan is constructed from the catalog (docs/project/owner-review.md flags this).
// Encoded by hand from the catalog alone. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { enspCommonReviewNotes, enspCore } from "./ensp-shared-2026-27.ts";

export const enspMajorEnvironmentalEconomics: Program = {
  id: "ensp-major-environmental-economics",
  name: "Environmental Science and Policy Major (Environmental Economics Concentration)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Environmental Science and Policy Major, " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/environmental-science-policy/environmental-science-policy-major/ " +
    "(fetched 2026-09-28); ensp.umd.edu names no requirement (see program-sources/environmental-science-policy-major.md)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...enspCommonReviewNotes,
    "No official four-year plan exists for this concentration (the seven gathered PDFs cover only " +
      "the BSOS and CMNS concentrations); the sample plan is CONSTRUCTED from the catalog's own " +
      "requirement rows instead (docs/project/owner-review.md flags this).",
    "'Restricted Electives inside Economics (Choose 5 courses from an approved list)' (15 credits) " +
      "and 'Restricted Electives outside Economics (choose from one Supporting Area below)' (12 " +
      "credits; Areas 1-4) name zero courses or departments -- only 'See ENSP website for list of " +
      "approved electives' (no web access). Not encoded; flagged in docs/project/owner-review.md.",
    "The catalog's 'Select one of the following courses' list under Track 2 includes a bare " +
      "'AREC382' row with no course title in the source (a table-conversion artifact); encoded as-is " +
      "since AREC382 is a real UMD course code, not invented.",
    "'Economics Foundation - Choose Track 1 or Track 2' is encoded as a `sets` choose of one of two " +
      "full course lists (Track 1: PhD/quantitative preparation; Track 2: Master's/policy " +
      "preparation), since the catalog presents them as mutually exclusive alternative sequences.",
  ],
  requirements: [
    ...enspCore,
    {
      kind: "sets",
      id: "economics-foundation-envecon",
      name: "Economics Foundation: Choose Track 1 (PhD/quantitative) or Track 2 (Master's/policy)",
      count: 1,
      options: [
        // Track 1
        [
          "ECON201",
          "MATH141",
          { count: 1, from: { courses: ["ECON321", "STAT400"] } },
          "ECON326",
        ],
        // Track 2
        [
          "ECON201",
          { count: 1, from: { courses: ["ECON230", "BMGT230"] } },
          { count: 1, from: { courses: ["AREC326", "ECON326"] } },
          {
            count: 1,
            from: {
              courses: ["MATH121", "ECON424", "AREC422", "AREC380", "AREC382", "ENSP305", "ENSP306"],
            },
          },
        ],
      ],
    },
  ],
};

export const enspMajorEnvironmentalEconomicsMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Environmental Science & Policy (Environmental Economics)",
  major: "ensp",
  track: "Environmental Economics",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/environmental-science-policy/environmental-science-policy-major/",
    department: "https://ensp.umd.edu/",
  },
};
