// Applied Agriculture Certificate, Agricultural Leadership and Communication track, 2026-27 UMD Academic Catalog.
// See inag-cert-shared-2026-27.ts for source and shared blocks. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  inagBusiness, inagCommonReviewNotes, inagCourse, inagFundamentalStudies, inagInternship, inagMechanics, inagTrackInfo,
  inagPesticide, inagScienceChoice, inagScienceInag100, inagScienceInagOrHort, inagScienceTurf, inagSoils, inagSource,
} from "./inag-cert-shared-2026-27.ts";

export const inagCertAgriculturalLeadershipAndCommunication: Program = {
  id: "inag-cert-agricultural-leadership-and-communication",
  name: "Applied Agriculture Certificate (Agricultural Leadership and Communication)",
  catalogYear: "2026-27",
  source: inagSource,
  verified: false,
  reviewNotes: [
    ...inagCommonReviewNotes,
    "No Fundamentals of Agricultural Mechanics (INAG250) or Pesticide Use and Safety (INAG106): the catalog omits them for this track (INAG250 by its stated exception; INAG106 is simply not listed).",
    "INAG105 'Students pursuing nutrition-related careers may substitute NFSC100 for INAG105': encoded as INAG105 or NFSC100. NFSC100 may also be the science choice; the audit counts a course once, so a student using it for both needs another science option.",
    "'Restricted communication elective' list includes 'JOUR289 ((JOUR289i: Information 3.0))', a garbled catalog line; both JOUR289 and JOUR289I are accepted (flagged). JOUR175 is titled 'Media Literacy (JOUR289i: Information 3.0)' in the catalog.",
    "Electives: prose says 16-17 credits, table says 16; 44 listed credits + 16 = 60. Not encoded (no list); flagged.",
  ],
  requirements: [
    ...inagFundamentalStudies,
    inagScienceChoice,
    inagCourse("inag105", "Soils and Fertilizers (INAG105), or NFSC100 for nutrition-related careers", "INAG105", "NFSC100"),
    ...inagInternship,
    ...inagBusiness("INAG103"),
    { kind: "choose", id: "business-restricted", name: "Business Management Restricted Electives: choose three", count: 3, from: { courses: ["INAG102","INAG201","INAG203","INAG204","INAG206"] } },
    inagCourse("inag131", "Introduction to Agricultural Policy and Communication (INAG131)"),
    inagCourse("inag132", "Agricultural Leadership and Teamwork (INAG132)"),
    inagCourse("inag252", "Agricultural Public Relations (INAG252)"),
    { kind: "choose", id: "communication-elective", name: "Restricted communication elective: choose one", count: 1, from: { courses: ["INAG253","JOUR282","JOUR175","JOUR289","JOUR289I","ENGL282","ENGL293","ENGL294"] } },
  ],
};

export const inagCertAgriculturalLeadershipAndCommunicationMeta: ProgramMeta = inagTrackInfo("Agricultural Leadership and Communication");
