// Environmental Science and Policy Major, Environmental Geosciences and Restoration Concentration (CMNS), 2026-27 UMD Academic Catalog.
// Source: program-sources/environmental-science-policy-major.md (catalog + official four-year plan).
// Shared ENSP Core and common review notes: ensp-shared-2026-27.ts. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { enspCatalogUrl, enspCommonReviewNotes, enspCore, enspPickerInfo } from "./ensp-shared-2026-27.ts";

export const enspMajorEnvironmentalGeosciences: Program = {
  id: "ensp-major-environmental-geosciences-restoration",
  name: "Environmental Science and Policy Major (Environmental Geosciences and Restoration Concentration)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Environmental Science and Policy Major, " +
    enspCatalogUrl +
    " (fetched 2026-09-28); the official four-year plan (agnr.umd.edu ENSP FourYrPlan PDF for this concentration) is the department source",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...enspCommonReviewNotes,
    "Official four-year plan (agnr.umd.edu PDF) transcribed; placeholders filled with real catalog courses (each fill is in the sample plan's notes). The plan's Restricted Elective, Techniques & Methods and similar unnamed slots are left out of the sample plan because they are not encoded.",
    "Open slot 'areas-of-depth-egr' (openSlot requirement): areas of depth, 15 credits; the catalog only says 'See ENSP website for list of approved electives' (no list available to us), so the student confirms it with their advisor.",
    "The official plan lacks a fourth Core group (its Year 1 box says 'ENSP Econ'); the sample plan fills a FREE ELECTIVE with AREC240.",
  ],
  requirements: [
    ...enspCore,
    { kind: "sets", id: "orgchem-egr", name: "Organic Chemistry I and Laboratory I (CHEM231 & CHEM232)", count: 1, options: [["CHEM231", "CHEM232"]] },
    { kind: "course", id: "math141-egr", name: "Calculus II (MATH141)", options: ["MATH141"] },
    { kind: "sets", id: "physics-egr", name: "PHYS161 & PHYS174, or PHYS141", count: 1, options: [["PHYS161", "PHYS174"], ["PHYS141"]] },
    { kind: "course", id: "bsci361-egr", name: "Principles of Ecology (BSCI361)", options: ["BSCI361"] },
    { kind: "course", id: "geol340-egr", name: "Geomorphology (GEOL340)", options: ["GEOL340"] },
    { kind: "choose", id: "hydro-egr", name: "Groundwater or Watershed and Wetland Hydrology (GEOL451 or GEOL452)", count: 1, from: { courses: ["GEOL451", "GEOL452"] } },
    { kind: "course", id: "geol453-egr", name: "Ecosystem Restoration (GEOL453)", options: ["GEOL453"] },
    { kind: "course", id: "ensp386-egr", name: "Internship (ENSP386)", options: ["ENSP386"] },
    { kind: "openSlot", id: "areas-of-depth-egr", name: "Areas of depth", credits: 15, note: "At least 5 classes: 6 credits from each of two Areas or 9 credits in one Area; approved list on the ENSP website." },
  ],
};

export const enspMajorEnvironmentalGeosciencesMeta: ProgramMeta = enspPickerInfo("CMNS", "Environmental Geosciences and Restoration");
