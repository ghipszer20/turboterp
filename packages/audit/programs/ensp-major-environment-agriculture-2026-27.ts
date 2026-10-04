// Environmental Science and Policy Major, Environment and Agriculture Concentration (AGNR),
// 2026-27 UMD Academic Catalog.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/
//   environmental-science-policy/environmental-science-policy-major/ (fetched 2026-09-28).
// See ensp-shared-2026-27.ts for the shared ENSP Core and common review notes; this file adds the
// Environment and Agriculture concentration's own requirements. No official four-year plan was
// gathered for this concentration (only the seven BSOS/CMNS concentrations have one); the sample
// plan is constructed from the catalog (docs/project/owner-review.md flags this).
// Encoded by hand from the catalog alone. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { enspCommonReviewNotes, enspCore } from "./ensp-shared-2026-27.ts";

export const enspMajorEnvironmentAgriculture: Program = {
  id: "ensp-major-environment-agriculture",
  name: "Environmental Science and Policy Major (Environment and Agriculture Concentration)",
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
    "The 'Restricted Electives (choose 5 courses in one Area)' line (15-19 credits; Area 1 - Crop " +
      "production and plant protection, Area 2 - Human dimensions) names zero courses or departments " +
      "for either Area -- only 'See ENSP website for list of approved electives' (no web access). " +
      "Not encoded; flagged in docs/project/owner-review.md.",
    "'CHEM131& CHEM232' in the catalog's Fundamentals and Background row literally pairs Chemistry I " +
      "(CHEM131) with Organic Chemistry Laboratory I (CHEM232), skipping CHEM132/CHEM231; encoded " +
      "exactly as the catalog states rather than 'corrected' to a more usual sequence.",
  ],
  requirements: [
    ...enspCore,
    { kind: "course", id: "ansc101-envag", name: "Principles of Animal Science (ANSC101)", options: ["ANSC101"] },
    {
      kind: "course",
      id: "ansc103-envag",
      name: "Principles of Animal Science Laboratory (ANSC103)",
      options: ["ANSC103"],
    },
    { kind: "course", id: "bsci170-envag", name: "Principles of Molecular & Cellular Biology (BSCI170)", options: ["BSCI170"] },
    {
      kind: "course",
      id: "bio-lab-envag",
      overlay: true,
      name: "Principles Biology Laboratory or Principles of Molecular & Cellular Biology Laboratory (BSCI180 or BSCI171)",
      options: ["BSCI180", "BSCI171"],
    },
    {
      kind: "course",
      id: "genetics-envag",
      name: "Principles of Genetics or Plants, Genes and Biotechnology (BSCI222 or PLSC203)",
      options: ["BSCI222", "PLSC203"],
    },
    { kind: "course", id: "chem131-envag", overlay: true, name: "Chemistry I - Fundamentals of General Chemistry (CHEM131)", options: ["CHEM131"] },
    { kind: "course", id: "chem232-envag", name: "Organic Chemistry Laboratory I (CHEM232)", options: ["CHEM232"] },
    { kind: "course", id: "plsc112-envag", name: "Introductory Crop Science (PLSC112)", options: ["PLSC112"] },
    { kind: "course", id: "plsc113-envag", name: "Introductory Crop Science Laboratory (PLSC113)", options: ["PLSC113"] },
    {
      kind: "choose",
      id: "cartography-gis-envag",
      name: "Cartography, Remote Sensing, and GIS: Select two (6 credits)",
      count: 2,
      credits: 6,
      from: { courses: ["GEOG272", "GEOG475", "GEOG472", "GEOG373", "ENST415", "GEOG473"] },
      alternatives: [["GEOG373", "ENST415"]],
    },
    { kind: "course", id: "ensp386-envag", name: "Internship (ENSP386)", options: ["ENSP386"] },
  ],
};

export const enspMajorEnvironmentAgricultureMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Environmental Science & Policy (Environment and Agriculture)",
  major: "ensp",
  track: "Environment and Agriculture",
  defaultTrack: true,
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/environmental-science-policy/environmental-science-policy-major/",
    department: "https://ensp.umd.edu/",
  },
};
