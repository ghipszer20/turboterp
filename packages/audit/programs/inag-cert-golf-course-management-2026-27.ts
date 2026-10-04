// Applied Agriculture Certificate, Golf Course Management track, 2026-27 UMD Academic Catalog.
// See inag-cert-shared-2026-27.ts for source and shared blocks. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  inagBusiness, inagCommonReviewNotes, inagCourse, inagFundamentalStudies, inagInternship, inagMechanics, inagTrackInfo,
  inagPesticide, inagScienceChoice, inagScienceInag100, inagScienceInagOrHort, inagScienceTurf, inagSoils, inagSource,
} from "./inag-cert-shared-2026-27.ts";

export const inagCertGolfCourseManagement: Program = {
  id: "inag-cert-golf-course-management",
  name: "Applied Agriculture Certificate (Golf Course Management)",
  catalogYear: "2026-27",
  source: inagSource,
  verified: false,
  reviewNotes: [
    ...inagCommonReviewNotes,
    "PLSC205 is listed under Fundamental Agricultural Science and required with INAG100 (no 'or').",
    "INAG242 or PLSC253 encoded as one course from either.",
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
    inagCourse("golf-design", "Golf Course Design and Construction (INAG242), or PLSC253", "INAG242", "PLSC253"),
    ...inagInternship,
    ...inagBusiness("INAG201", "INAG206", "INAG215"),
  ],
};

export const inagCertGolfCourseManagementMeta: ProgramMeta = inagTrackInfo("Golf Course Management");
