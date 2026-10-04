// Environmental Science and Policy Major, Soil, Water, and Land Resources Concentration (AGNR),
// 2026-27 UMD Academic Catalog.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/
//   environmental-science-policy/environmental-science-policy-major/ (fetched 2026-09-28).
// See ensp-shared-2026-27.ts for the shared ENSP Core and common review notes; this file adds the
// Soil, Water, and Land Resources concentration's own requirements. No official four-year plan was
// gathered for this concentration (only the seven BSOS/CMNS concentrations have one); the sample
// plan is constructed from the catalog (docs/project/owner-review.md flags this).
// Encoded by hand from the catalog alone. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { enspCommonReviewNotes, enspCore } from "./ensp-shared-2026-27.ts";

export const enspMajorSoilWaterLand: Program = {
  id: "ensp-major-soil-water-land",
  name: "Environmental Science and Policy Major (Soil, Water, and Land Resources Concentration)",
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
    "The catalog's first 'Select one:' row names only GEOG272 -- no second option is given (likely a " +
      "table-conversion artifact of the source PDF/HTML), so it is encoded as a plain required course " +
      "rather than a choose.",
    "ENST417 (Soil Hydrology and Physics) appears in both the 'Groundwater/Hydrology' select-one row " +
      "and the final 'select two' row; encoded exactly as the catalog lists it in both places. Since " +
      "a single completed ENST417 can only satisfy one of the two requirements at a time (no overlay " +
      "stated), a student relying on ENST417 for both slots would need a second qualifying course for " +
      "the other slot; flagged for the owner.",
    "'Restricted Electives (at least 3 courses)' (9 credits) names zero courses or departments -- only " +
      "'See ENSP website for list of approved electives'. Not encoded; flagged in " +
      "docs/project/owner-review.md.",
  ],
  requirements: [
    ...enspCore,
    { kind: "course", id: "geog272-swl", name: "Introduction to Earth Observation Science (GEOG272)", options: ["GEOG272"] },
    {
      kind: "choose",
      id: "geomorphology-swl",
      name: "Geomorphology: Select one (GEOL340 or GEOG340)",
      count: 1,
      from: { courses: ["GEOL340", "GEOG340"] },
    },
    {
      kind: "choose",
      id: "hydrology-swl",
      name: "Select one (GEOL451, GEOL452, or ENST417)",
      count: 1,
      from: { courses: ["GEOL451", "GEOL452", "ENST417"] },
    },
    {
      kind: "sets",
      id: "select-two-a-swl",
      name: "Select two: ENST301 & ENST302 & ENST303 (Field Soil Morphology I-III), ENST415, or ENST423",
      count: 2,
      options: [["ENST301", "ENST302", "ENST303"], ["ENST415"], ["ENST423"]],
    },
    {
      kind: "choose",
      id: "select-two-b-swl",
      name: "Select two (ENST411, ENST414, ENST417, ENST421, or ENST422)",
      count: 2,
      credits: 6,
      from: { courses: ["ENST411", "ENST414", "ENST417", "ENST421", "ENST422"] },
    },
  ],
};

export const enspMajorSoilWaterLandMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Environmental Science & Policy (Soil, Water, and Land Resources)",
  major: "ensp",
  track: "Soil, Water, and Land Resources",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/environmental-science-policy/environmental-science-policy-major/",
    department: "https://ensp.umd.edu/",
  },
};
