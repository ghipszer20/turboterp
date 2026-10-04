// Applied Agriculture Certificate, General Turfgrass Management track, 2026-27 UMD Academic Catalog.
// See inag-cert-shared-2026-27.ts for source and shared blocks. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  inagBusiness, inagCommonReviewNotes, inagCourse, inagFundamentalStudies, inagInternship, inagMechanics, inagTrackInfo,
  inagPesticide, inagScienceChoice, inagScienceInag100, inagScienceInagOrHort, inagScienceTurf, inagSoils, inagSource,
} from "./inag-cert-shared-2026-27.ts";

export const inagCertGeneralTurfgrassManagement: Program = {
  id: "inag-cert-general-turfgrass-management",
  name: "Applied Agriculture Certificate (General Turfgrass Management)",
  catalogYear: "2026-27",
  source: inagSource,
  verified: false,
  reviewNotes: [
    ...inagCommonReviewNotes,
    "PLSC205 is listed under Fundamental Agricultural Science and required with INAG100 (no 'or').",
    "Electives: 8 credits of advisor-approved electives, not encoded (no list).",
  ],
  requirements: [
    ...inagFundamentalStudies,
    ...inagScienceTurf,
    inagSoils,
    inagPesticide,
    inagCourse("inag207", "Power and Machinery (INAG207)"),
    inagCourse("inag235", "Irrigation and Drainage (INAG235)"),
    inagCourse("inag237", "GPS & Drone Applications in Surveying (INAG237)"),
    inagMechanics,
    ...inagInternship,
    ...inagBusiness("INAG102", "INAG201", "INAG204", "INAG206"),
  ],
};

export const inagCertGeneralTurfgrassManagementMeta: ProgramMeta = inagTrackInfo("General Turfgrass Management");
