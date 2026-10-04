// Applied Agriculture Certificate, Sustainable Food Systems track, 2026-27 UMD Academic Catalog.
// See inag-cert-shared-2026-27.ts for source and shared blocks. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  inagBusiness, inagCommonReviewNotes, inagCourse, inagFundamentalStudies, inagInternship, inagMechanics, inagTrackInfo,
  inagPesticide, inagScienceChoice, inagScienceInag100, inagScienceInagOrHort, inagScienceTurf, inagSoils, inagSource,
} from "./inag-cert-shared-2026-27.ts";

export const inagCertSustainableFoodSystems: Program = {
  id: "inag-cert-sustainable-food-systems",
  name: "Applied Agriculture Certificate (Sustainable Food Systems)",
  catalogYear: "2026-27",
  source: inagSource,
  verified: false,
  reviewNotes: [
    ...inagCommonReviewNotes,
    "Restricted Electives: 'Choose three from the following list. Additional business/leadership courses are also acceptable as restricted electives. Others may be accepted with advisor permission.' Encoded as three from the five listed courses plus every course on the Business and Leadership list (never narrower); 'others with advisor permission' is not encodable (manual). 'Courses may not be counted both' is what the audit already does (a course fills one requirement).",
    "'Sustainable Agriculture students may choose INAG099, Cooperative Education, in lieu of the electives': the 11 elective credits are unaudited, so nothing to encode; consult an advisor (manual).",
  ],
  requirements: [
    ...inagFundamentalStudies,
    inagScienceChoice,
    inagSoils,
    inagPesticide,
    inagCourse("inag123", "People, Planet, and Profit: Digging Into Sustainable Agriculture (INAG123)"),
    inagCourse("inag248", "Topics in Sustainable Agriculture (INAG248)"),
    inagMechanics,
    ...inagInternship,
    { kind: "choose", id: "business-leadership", name: "Business and Leadership: choose three", count: 3, from: { courses: ["INAG102","INAG103","INAG131","INAG132","INAG205","INAG201","INAG203","INAG204","INAG206","INAG252","INAG253"] } },
    { kind: "choose", id: "restricted-electives", name: "Restricted Electives: choose three (INAG207, INAG213, INAG224, INAG235, INAG237, or another business/leadership course)", count: 3, from: { courses: ["INAG207","INAG213","INAG224","INAG235","INAG237","INAG102","INAG103","INAG131","INAG132","INAG205","INAG201","INAG203","INAG204","INAG206","INAG252","INAG253"] } },
  ],
};

export const inagCertSustainableFoodSystemsMeta: ProgramMeta = inagTrackInfo("Sustainable Food Systems");
