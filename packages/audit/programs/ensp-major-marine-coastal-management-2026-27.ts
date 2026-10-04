// Environmental Science and Policy Major, Marine and Coastal Management Concentration (BSOS), 2026-27 UMD Academic Catalog.
// Source: program-sources/environmental-science-policy-major.md (catalog + official four-year plan).
// Shared ENSP Core and common review notes: ensp-shared-2026-27.ts. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { enspCatalogUrl, enspCommonReviewNotes, enspCore, enspPickerInfo } from "./ensp-shared-2026-27.ts";

export const enspMajorMarineCoastal: Program = {
  id: "ensp-major-marine-coastal-management",
  name: "Environmental Science and Policy Major (Marine and Coastal Management Concentration)",
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
    "Open slot 'restricted-electives-mcm' (openSlot requirement): restricted electives, 15 credits; the catalog only says 'See ENSP website for list of approved electives' (no list available to us), so the student confirms it with their advisor.",
    "ENSP342 is required directly and is also a Core Applied Science and Policy option (footnote 3: not double-counted); the plan fills a Restricted Elective with ENSP340 for the Core.",
  ],
  requirements: [
    ...enspCore,
    { kind: "choose", id: "blue-ocean-mc", name: "Introduction to the Blue Ocean (AOSC375 or GEOL375)", count: 1, from: { courses: ["AOSC375", "GEOL375"] } },
    { kind: "course", id: "ensp342-mc", name: "Environmental Threats to Oceans and Coasts (ENSP342)", options: ["ENSP342"] },
    { kind: "course", id: "geog441-mc", name: "The Coastal Ocean (GEOG441)", options: ["GEOG441"] },
    { kind: "course", id: "enst450-mc", name: "Wetland Ecology (ENST450)", options: ["ENST450"] },
    { kind: "course", id: "geog272-mc", name: "Introduction to Earth Observation Science (GEOG272)", options: ["GEOG272"] },
    { kind: "course", id: "geog373-mc", name: "Geographic Information Systems (GEOG373)", options: ["GEOG373"] },
    { kind: "course", id: "ensp386-mc", name: "Internship (ENSP386)", options: ["ENSP386"] },
    { kind: "openSlot", id: "restricted-electives-mcm", name: "Restricted electives", credits: 15, note: "5 courses; at least 2 from Area 1 Coastal Science and at least 1 from Area 2 Management; approved list on the ENSP website." },
  ],
};

export const enspMajorMarineCoastalMeta: ProgramMeta = enspPickerInfo("BSOS", "Marine and Coastal Management");
