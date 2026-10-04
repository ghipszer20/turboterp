// Environmental Science and Policy Major, Land Use Concentration (BSOS), 2026-27 UMD Academic Catalog.
// Source: program-sources/environmental-science-policy-major.md (catalog + official four-year plan).
// Shared ENSP Core and common review notes: ensp-shared-2026-27.ts. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { enspCatalogUrl, enspCommonReviewNotes, enspCore, enspPickerInfo } from "./ensp-shared-2026-27.ts";

export const enspMajorLandUse: Program = {
  id: "ensp-major-land-use",
  name: "Environmental Science and Policy Major (Land Use Concentration)",
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
    "Open slot 'restricted-electives-lu' (openSlot requirement): restricted electives, 22 credits; the catalog only says 'See ENSP website for list of approved electives' (no list available to us), so the student confirms it with their advisor. The catalog gives 22-24 credits; 22 (the minimum) is counted.",
    "Overlay: the Lower-level focus choose (GEOG130, GEOG140, ENST200) may also serve Core Group 3 or 5; footnote 3 forbids double-counting only Applied Science and Policy.",
  ],
  requirements: [
    ...enspCore,
    { kind: "choose", id: "lower-focus-lu", name: "Lower-level focus: choose one (GEOG130, GEOG140 or ENST200)", overlay: true, count: 1, from: { courses: ["GEOG130", "GEOG140", "ENST200"] } },
    { kind: "course", id: "geog272-lu", name: "Introduction to Earth Observation Science (GEOG272)", options: ["GEOG272"] },
    { kind: "course", id: "geog373-lu", name: "Geographic Information Systems (GEOG373)", options: ["GEOG373"] },
    { kind: "course", id: "ensp386-lu", name: "Internship (ENSP386)", options: ["ENSP386"] },
    { kind: "course", id: "geog431-lu", name: "Culture and Natural Resource Management (GEOG431)", options: ["GEOG431"] },
    { kind: "openSlot", id: "restricted-electives-lu", name: "Restricted electives", credits: 22, note: "8 courses (22-24 credits; 22 counted), at least 3 credits from each of 5 Areas; approved list on the ENSP website." },
  ],
};

export const enspMajorLandUseMeta: ProgramMeta = enspPickerInfo("BSOS", "Land Use");
