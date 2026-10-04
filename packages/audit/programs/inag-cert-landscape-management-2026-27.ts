// Applied Agriculture Certificate, Landscape Management track, 2026-27 UMD Academic Catalog.
// See inag-cert-shared-2026-27.ts for source and shared blocks. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  inagBusiness, inagCommonReviewNotes, inagCourse, inagFundamentalStudies, inagInternship, inagMechanics, inagTrackInfo,
  inagPesticide, inagScienceChoice, inagScienceInag100, inagScienceInagOrHort, inagScienceTurf, inagSoils, inagSource,
} from "./inag-cert-shared-2026-27.ts";

export const inagCertLandscapeManagement: Program = {
  id: "inag-cert-landscape-management",
  name: "Applied Agriculture Certificate (Landscape Management)",
  catalogYear: "2026-27",
  source: inagSource,
  verified: false,
  reviewNotes: [
    ...inagCommonReviewNotes,
    "Arboriculture: printed 'PLSC272 Principles of Arboriculture'; the Environmental Stewardship track prints 'INAG272' for the same title. Both accepted (never narrower); flagged.",
    "Fundamental Agricultural Science: INAG100 or PLSC110/111 (the catalog's shorter 'or' list for this track). No electives line: the listed credits total 60.",
  ],
  requirements: [
    ...inagFundamentalStudies,
    inagScienceInagOrHort,
    inagSoils,
    inagPesticide,
    inagCourse("larc160", "Introduction to Landscape Architecture and Environmental Design (LARC160)"),
    inagCourse("inag226", "Diseases of Ornamentals and Turf (INAG226)"),
    inagCourse("inag231", "Insects of Ornamentals and Turf (INAG231)"),
    inagCourse("inag244", "Herbaceous Plants (INAG244)"),
    inagCourse("plsc205", "Introduction to Turf Science and Management (PLSC205)"),
    inagCourse("arboriculture", "Principles of Arboriculture (PLSC272, or INAG272)", "PLSC272", "INAG272"),
    inagCourse("plsc253", "Woody Plants for Mid-Atlantic Landscapes I (PLSC253)"),
    inagCourse("inag251", "Landscape Construction (INAG251)"),
    inagMechanics,
    ...inagInternship,
    ...inagBusiness("INAG201", "INAG204", "INAG206"),
  ],
};

export const inagCertLandscapeManagementMeta: ProgramMeta = inagTrackInfo("Landscape Management");
