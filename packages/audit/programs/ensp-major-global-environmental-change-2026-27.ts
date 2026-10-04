// Environmental Science and Policy Major, Global Environmental Change Concentration (BSOS), 2026-27 UMD Academic Catalog.
// Source: program-sources/environmental-science-policy-major.md (catalog + official four-year plan).
// Shared ENSP Core and common review notes: ensp-shared-2026-27.ts. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { enspCatalogUrl, enspCommonReviewNotes, enspCore, enspPickerInfo } from "./ensp-shared-2026-27.ts";

export const enspMajorGlobalEnvironmentalChange: Program = {
  id: "ensp-major-global-environmental-change",
  name: "Environmental Science and Policy Major (Global Environmental Change Concentration)",
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
    "Open slot 'techniques-methods-gec' (openSlot requirement): techniques and methods, 9 credits; the catalog only says 'See ENSP website for list of approved electives' (no list available to us), so the student confirms it with their advisor.",
    "Open slot 'restricted-electives-gec' (openSlot requirement): restricted electives, 9 credits; the catalog only says 'See ENSP website for list of approved electives' (no list available to us), so the student confirms it with their advisor.",
    "Overlays: GEOL100 and the ENST200/GEOL102 row may also serve Core Group 3 (footnote 3 forbids double-counting only Applied Science and Policy). The GVPT306/ENSP340/ENSP342/ENSP350 row is not an overlay: ENSP340/342/350 are Core Applied options; the plan fills the row with GVPT306 and a Restricted Elective with ENSP330 for the Core.",
    "GEOG342 and GEOG345 appear in the catalog rows with no title (table-conversion artifact); encoded as the course codes given.",
  ],
  requirements: [
    ...enspCore,
    { kind: "course", id: "geol100-gec", name: "Physical Geology (GEOL100)", options: ["GEOL100"], overlay: true },
    { kind: "choose", id: "calc2-gec", name: "Calculus II (MATH141 or MATH121)", count: 1, from: { courses: ["MATH141", "MATH121"] } },
    { kind: "sets", id: "physics-gec", name: "PHYS161 & PHYS174, or PHYS121", count: 1, options: [["PHYS161", "PHYS174"], ["PHYS121"]] },
    { kind: "sets", id: "orgchem-gec", name: "Organic Chemistry I and Laboratory I (CHEM231 & CHEM232)", count: 1, options: [["CHEM231", "CHEM232"]] },
    { kind: "choose", id: "soil-hist-gec", name: "Fundamentals of Soil Science or Historical Geology (ENST200 or GEOL102)", overlay: true, count: 1, from: { courses: ["ENST200", "GEOL102"] } },
    { kind: "choose", id: "ecology-gec", name: "Principles of Ecology (BSCI361 or GEOG342)", count: 1, from: { courses: ["BSCI361", "GEOG342"] } },
    { kind: "course", id: "geog331-gec", name: "Introduction to Human Dimensions of Global Change (GEOG331)", options: ["GEOG331"] },
    { kind: "choose", id: "geog301-gec", name: "Advanced Geographical Environmental Systems (GEOG301 or GEOG345)", count: 1, from: { courses: ["GEOG301", "GEOG345"] } },
    { kind: "choose", id: "policy-gec", name: "Global Environmental Politics or an ENSP policy course (GVPT306, ENSP340, ENSP342 or ENSP350)", count: 1, from: { courses: ["GVPT306", "ENSP340", "ENSP342", "ENSP350"] } },
    { kind: "choose", id: "climate-gec", name: "GEOG442, AOSC400 or GEOL437", count: 1, from: { courses: ["GEOG442", "AOSC400", "GEOL437"] } },
    { kind: "course", id: "ensp386-gec", name: "Internship (ENSP386)", options: ["ENSP386"] },
    { kind: "openSlot", id: "techniques-methods-gec", name: "Techniques and methods", credits: 9, note: "Approved list on the ensp website." },
    { kind: "openSlot", id: "restricted-electives-gec", name: "Restricted electives", credits: 9, note: "6 credits from one Area, 3 from the other; approved list on the ENSP website." },
  ],
};

export const enspMajorGlobalEnvironmentalChangeMeta: ProgramMeta = enspPickerInfo("BSOS", "Global Environmental Change");
