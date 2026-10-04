// Environmental Science and Policy Major, Environmental Justice Concentration (SPHL), 2026-27 UMD Academic Catalog.
// Source: program-sources/environmental-science-policy-major.md (catalog only).
// Shared ENSP Core and common review notes: ensp-shared-2026-27.ts. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { enspCatalogUrl, enspCommonReviewNotes, enspCore, enspPickerInfo } from "./ensp-shared-2026-27.ts";

export const enspMajorEnvironmentalJustice: Program = {
  id: "ensp-major-environmental-justice",
  name: "Environmental Science and Policy Major (Environmental Justice Concentration)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Environmental Science and Policy Major, " +
    enspCatalogUrl +
    " (fetched 2026-09-28); no official plan gathered (sample plan constructed)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...enspCommonReviewNotes,
    "No official four-year plan was gathered for this concentration; the sample plan is CONSTRUCTED from the catalog rows (docs/project/owner-review.md flags this).",
    "Open slot 'restricted-electives-ej' (openSlot requirement): restricted electives, 12 credits; the catalog only says 'See ENSP website for list of approved electives' (no list available to us), so the student confirms it with their advisor.",
    "ENSP330 and ENSP370 are required directly and are also Core Applied Science and Policy options (footnote 3: not double-counted); the sample plan uses ENSP340 for the Core.",
  ],
  requirements: [
    ...enspCore,
    { kind: "course", id: "aaas101-ej", name: "Public Policy and the Black Community (AAAS101)", options: ["AAAS101"] },
    { kind: "course", id: "epib301-ej", name: "Epidemiology for Public Health Practice (EPIB301)", options: ["EPIB301"] },
    { kind: "course", id: "ensp330-ej", name: "Introduction to Environmental Law (ENSP330)", options: ["ENSP330"] },
    { kind: "choose", id: "internship-ej", name: "Internship or Environmental Health Research (ENSP386 or MIEH309)", count: 1, from: { courses: ["ENSP386", "MIEH309"] } },
    { kind: "course", id: "ensp370-ej", name: "Principles of Environmental Justice (ENSP370)", options: ["ENSP370"] },
    { kind: "course", id: "gbhl200-ej", name: "Introduction to Global Health (GBHL200)", options: ["GBHL200"] },
    { kind: "choose", id: "gis-ej", name: "Geographic Information Systems or Applied Spatial Analysis (GEOG373 or ENSP305)", count: 1, from: { courses: ["GEOG373", "ENSP305"] } },
    { kind: "course", id: "mieh300-ej", name: "A Public Health Perspective: Introduction to Environmental Health (MIEH300)", options: ["MIEH300"] },
    { kind: "course", id: "mieh330-ej", name: "Environmental Justice, Racism, and Environmental Health Disparities (MIEH330)", options: ["MIEH330"] },
    { kind: "course", id: "mieh331-ej", name: "The Built Environment, Sustainability, and Public Health (MIEH331)", options: ["MIEH331"] },
    { kind: "course", id: "sphl100-ej", name: "Foundations of Public Health (SPHL100)", options: ["SPHL100"] },
    { kind: "course", id: "ursp250-ej", name: "The Sustainable City (URSP250)", options: ["URSP250"] },
    { kind: "openSlot", id: "restricted-electives-ej", name: "Restricted electives", credits: 12, note: "Approved list on the ensp website." },
  ],
};

export const enspMajorEnvironmentalJusticeMeta: ProgramMeta = enspPickerInfo("SPHL", "Environmental Justice");
