// Applied Agriculture Certificate, Ornamental Horticulture track, 2026-27 UMD Academic Catalog.
// See inag-cert-shared-2026-27.ts for source and shared blocks. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  inagBusiness, inagCommonReviewNotes, inagCourse, inagFundamentalStudies, inagInternship, inagMechanics, inagTrackInfo,
  inagPesticide, inagScienceChoice, inagScienceInag100, inagScienceInagOrHort, inagScienceTurf, inagSoils, inagSource,
} from "./inag-cert-shared-2026-27.ts";

export const inagCertOrnamentalHorticulture: Program = {
  id: "inag-cert-ornamental-horticulture",
  name: "Applied Agriculture Certificate (Ornamental Horticulture)",
  catalogYear: "2026-27",
  source: inagSource,
  verified: false,
  reviewNotes: [
    ...inagCommonReviewNotes,
    "Fundamental Agricultural Science: INAG100 or PLSC110/111 (the catalog's shorter 'or' list for this track).",
    "Electives: 10 credits of advisor-approved electives, not encoded (no list).",
  ],
  requirements: [
    ...inagFundamentalStudies,
    inagScienceInagOrHort,
    inagSoils,
    inagPesticide,
    inagCourse("inag224", "Greenhouse and Plant Production Management (INAG224)"),
    inagCourse("inag226", "Diseases of Ornamentals and Turf (INAG226)"),
    inagCourse("inag231", "Insects of Ornamentals and Turf (INAG231)"),
    inagMechanics,
    ...inagInternship,
    inagCourse("plsc253", "Woody Plants for Mid-Atlantic Landscapes I (PLSC253)"),
    ...inagBusiness("INAG102", "INAG201", "INAG204", "INAG206"),
  ],
};

export const inagCertOrnamentalHorticultureMeta: ProgramMeta = inagTrackInfo("Ornamental Horticulture");
