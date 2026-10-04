// Environmental Science and Policy Major, Wildlife Ecology and Management Concentration (AGNR),
// 2026-27 UMD Academic Catalog.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/
//   environmental-science-policy/environmental-science-policy-major/ (fetched 2026-09-28).
// See ensp-shared-2026-27.ts for the shared ENSP Core and common review notes; this file adds the
// Wildlife Ecology and Management concentration's own requirements. No official four-year plan was
// gathered for this concentration (only the seven BSOS/CMNS concentrations have one); the sample
// plan is constructed from the catalog (docs/project/owner-review.md flags this).
// Encoded by hand from the catalog alone. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { enspCommonReviewNotes, enspCore } from "./ensp-shared-2026-27.ts";

export const enspMajorWildlifeEcology: Program = {
  id: "ensp-major-wildlife-ecology",
  name: "Environmental Science and Policy Major (Wildlife Ecology and Management Concentration)",
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
    "ENSP305 is required directly by this concentration's Requirements row, and is also one of the " +
      "seven options for the shared ENSP Core's Applied Science and Policy choose. A student cannot " +
      "double-count a single ENSP305 for both; the sample plan uses a different Applied Science and " +
      "Policy course for the Core.",
    "'Restricted Electives - Choose at least 6 courses (3 courses in each Area)' (18 credits; Area 1 " +
      "- Ecological and Taxonomic Dimensions, Area 2 - Management) names zero courses or departments " +
      "-- only 'See ENSP website for list of approved electives'. Not encoded; flagged in " +
      "docs/project/owner-review.md.",
  ],
  requirements: [
    ...enspCore,
    { kind: "course", id: "bsci170-wild", name: "Principles of Molecular & Cellular Biology (BSCI170)", options: ["BSCI170"] },
    {
      kind: "course",
      id: "bio-lab-wild",
      overlay: true,
      name: "Principles Biology Laboratory or Principles of Molecular & Cellular Biology Laboratory (BSCI180 or BSCI171)",
      options: ["BSCI180", "BSCI171"],
    },
    { kind: "course", id: "enst214-wild", name: "Introduction to Natural Resources Management (ENST214)", options: ["ENST214"] },
    { kind: "course", id: "bsci222-wild", name: "Principles of Genetics (BSCI222)", options: ["BSCI222"] },
    { kind: "course", id: "chem231-wild", name: "Organic Chemistry I (CHEM231)", options: ["CHEM231"] },
    { kind: "course", id: "chem232-wild", name: "Organic Chemistry Laboratory I (CHEM232)", options: ["CHEM232"] },
    { kind: "course", id: "enst460-wild", name: "Principles of Wildlife Management (ENST460)", options: ["ENST460"] },
    { kind: "course", id: "bsci361-wild", name: "Principles of Ecology (BSCI361)", options: ["BSCI361"] },
    { kind: "course", id: "phys121-wild", name: "Fundamentals of Physics I (PHYS121; required)", options: ["PHYS121"] },
    { kind: "course", id: "ensp305-wild", name: "Applied Spatial Analysis in Environmental Science and Policy (ENSP305)", options: ["ENSP305"] },
    {
      kind: "choose",
      id: "internship-research-wild",
      name: "Internship/Research: ENSP386 or ENSP499 (3-6 credits)",
      count: 1,
      from: { courses: ["ENSP386", "ENSP499"] },
    },
  ],
};

export const enspMajorWildlifeEcologyMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Environmental Science & Policy (Wildlife Ecology and Management)",
  major: "ensp",
  track: "Wildlife Ecology and Management",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/environmental-science-policy/environmental-science-policy-major/",
    department: "https://ensp.umd.edu/",
  },
};
