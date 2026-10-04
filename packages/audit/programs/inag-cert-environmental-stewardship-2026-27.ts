// Applied Agriculture Certificate, Environmental Stewardship track, 2026-27 UMD Academic Catalog.
// See inag-cert-shared-2026-27.ts for source and shared blocks. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  inagBusiness, inagCommonReviewNotes, inagCourse, inagFundamentalStudies, inagInternship, inagMechanics, inagTrackInfo,
  inagPesticide, inagScienceChoice, inagScienceInag100, inagScienceInagOrHort, inagScienceTurf, inagSoils, inagSource,
} from "./inag-cert-shared-2026-27.ts";

export const inagCertEnvironmentalStewardship: Program = {
  id: "inag-cert-environmental-stewardship",
  name: "Applied Agriculture Certificate (Environmental Stewardship)",
  catalogYear: "2026-27",
  source: inagSource,
  verified: false,
  reviewNotes: [
    ...inagCommonReviewNotes,
    "Fundamental Agricultural Science lists only INAG100 for this track (no 'or' list); encoded exactly.",
    "Arboriculture: this track prints 'INAG272 Principles of Arboriculture' while Landscape Management prints 'PLSC272' for the same title. Both codes are accepted here (never narrower); flagged.",
    "Electives 'at least 16 credits of advisor-approved electives': not encoded (no list).",
  ],
  requirements: [
    ...inagFundamentalStudies,
    inagScienceInag100,
    inagSoils,
    inagPesticide,
    inagCourse("inag123", "People, Planet, and Profit: Digging Into Sustainable Agriculture (INAG123)"),
    inagCourse("inag231", "Insects of Ornamentals and Turf (INAG231)"),
    inagMechanics,
    inagCourse("arboriculture", "Principles of Arboriculture (INAG272, or PLSC272)", "INAG272", "PLSC272"),
    ...inagInternship,
    { kind: "choose", id: "business-leadership", name: "Business and Leadership: choose three", count: 3, from: { courses: ["INAG102","INAG103","INAG131","INAG132","INAG201","INAG203","INAG204","INAG206"] } },
  ],
};

export const inagCertEnvironmentalStewardshipMeta: ProgramMeta = inagTrackInfo("Environmental Stewardship");
