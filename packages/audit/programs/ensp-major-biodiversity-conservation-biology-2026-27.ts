// Environmental Science and Policy Major, Biodiversity and Conservation Biology Concentration (CMNS), 2026-27 UMD Academic Catalog.
// Source: program-sources/environmental-science-policy-major.md (catalog + official four-year plan).
// Shared ENSP Core and common review notes: ensp-shared-2026-27.ts. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { enspCatalogUrl, enspCommonReviewNotes, enspCore, enspPickerInfo } from "./ensp-shared-2026-27.ts";

export const enspMajorBiodiversityConservation: Program = {
  id: "ensp-major-biodiversity-conservation-biology",
  name: "Environmental Science and Policy Major (Biodiversity and Conservation Biology Concentration)",
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
    "Open slot 'restricted-electives-bcb' (openSlot requirement): restricted electives, 15 credits; the catalog only says 'See ENSP website for list of approved electives' (no list available to us), so the student confirms it with their advisor.",
    "Overlay: the BSCI180/BSCI171 lab may also serve Core Group 1 (footnote 3 forbids double-counting only Applied Science and Policy). The plan fills its 'App Sci & Pol' slot with ENSP330 and its fourth Core group with AREC240.",
  ],
  requirements: [
    ...enspCore,
    { kind: "course", id: "bsci170-bcb", name: "Principles of Molecular & Cellular Biology (BSCI170)", options: ["BSCI170"] },
    { kind: "course", id: "bio-lab-bcb", name: "Principles Biology Laboratory or Molecular & Cellular Biology Laboratory (BSCI180 or BSCI171)", options: ["BSCI180", "BSCI171"], overlay: true },
    { kind: "course", id: "bsci207-bcb", name: "Principles of Biology III - Organismal Biology (BSCI207)", options: ["BSCI207"] },
    { kind: "course", id: "bsci222-bcb", name: "Principles of Genetics (BSCI222)", options: ["BSCI222"] },
    { kind: "course", id: "bsci361-bcb", name: "Principles of Ecology (BSCI361)", options: ["BSCI361"] },
    { kind: "course", id: "bsci363-bcb", name: "The Biology of Conservation and Extinction (BSCI363)", options: ["BSCI363"] },
    { kind: "course", id: "bsci370-bcb", name: "Principles of Evolution (BSCI370)", options: ["BSCI370"] },
    { kind: "sets", id: "orgchem1-bcb", name: "Organic Chemistry I and Laboratory I (CHEM231 & CHEM232)", count: 1, options: [["CHEM231", "CHEM232"]] },
    { kind: "sets", id: "orgchem2-bcb", name: "Organic Chemistry II and Laboratory II (CHEM241 & CHEM242)", count: 1, options: [["CHEM241", "CHEM242"]] },
    { kind: "choose", id: "calc2-bcb", name: "Calculus II or Discrete Mathematics (MATH141, MATH121 or MATH135)", count: 1, from: { courses: ["MATH141", "MATH121", "MATH135"] } },
    { kind: "openSlot", id: "restricted-electives-bcb", name: "Restricted electives", credits: 15, note: "5 courses from the approved list on the ENSP website." },
  ],
};

export const enspMajorBiodiversityConservationMeta: ProgramMeta = enspPickerInfo("CMNS", "Biodiversity and Conservation Biology");
