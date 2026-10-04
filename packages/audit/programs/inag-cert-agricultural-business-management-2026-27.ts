// Applied Agriculture Certificate, Agricultural Business Management track, 2026-27 UMD Academic Catalog.
// See inag-cert-shared-2026-27.ts for source and shared blocks. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  inagBusiness, inagCommonReviewNotes, inagFundamentalStudies, inagInternship, inagMechanics, inagTrackInfo,
  inagPesticide, inagScienceChoice, inagSoils, inagSource,
} from "./inag-cert-shared-2026-27.ts";

export const inagCertAgriculturalBusinessManagement: Program = {
  id: "inag-cert-agricultural-business-management",
  name: "Applied Agriculture Certificate (Agricultural Business Management)",
  catalogYear: "2026-27",
  source: inagSource,
  verified: false,
  reviewNotes: [
    ...inagCommonReviewNotes,
    "Electives: the catalog prose says 'choose 17-18 credits of advisor-approved electives', the table says 16 credits, and 44 listed credits + 16 = 60. Not encoded (no course list); flagged.",
  ],
  requirements: [
    ...inagFundamentalStudies,
    inagScienceChoice,
    inagSoils,
    inagPesticide,
    inagMechanics,
    ...inagInternship,
    ...inagBusiness("INAG102", "INAG103", "INAG201", "INAG203", "INAG204", "INAG206"),
  ],
};

export const inagCertAgriculturalBusinessManagementMeta: ProgramMeta = inagTrackInfo("Agricultural Business Management", true);
