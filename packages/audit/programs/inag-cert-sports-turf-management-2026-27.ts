// Applied Agriculture Certificate, Sports Turf Management track, 2026-27 UMD Academic Catalog.
// See inag-cert-shared-2026-27.ts for source and shared blocks. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  inagBusiness, inagCommonReviewNotes, inagCourse, inagFundamentalStudies, inagInternship, inagMechanics, inagTrackInfo,
  inagPesticide, inagScienceChoice, inagScienceInag100, inagScienceInagOrHort, inagScienceTurf, inagSoils, inagSource,
} from "./inag-cert-shared-2026-27.ts";

export const inagCertSportsTurfManagement: Program = {
  id: "inag-cert-sports-turf-management",
  name: "Applied Agriculture Certificate (Sports Turf Management)",
  catalogYear: "2026-27",
  source: inagSource,
  verified: false,
  reviewNotes: [
    ...inagCommonReviewNotes,
    "PLSC205 is listed under Fundamental Agricultural Science and required with INAG100 (no 'or').",
    "Elective: 2 credits, not encoded (no list).",
  ],
  requirements: [
    ...inagFundamentalStudies,
    ...inagScienceTurf,
    inagSoils,
    inagPesticide,
    inagCourse("inag207", "Power and Machinery (INAG207)"),
    inagCourse("inag214", "Agronomic Principles of Golf Turf Management (INAG214)"),
    inagCourse("inag226", "Diseases of Ornamentals and Turf (INAG226)"),
    inagCourse("inag231", "Insects of Ornamentals and Turf (INAG231)"),
    inagCourse("inag235", "Irrigation and Drainage (INAG235)"),
    inagMechanics,
    ...inagInternship,
    ...inagBusiness("INAG102", "INAG201", "INAG206", "INAG215"),
  ],
};

export const inagCertSportsTurfManagementMeta: ProgramMeta = inagTrackInfo("Sports Turf Management");
