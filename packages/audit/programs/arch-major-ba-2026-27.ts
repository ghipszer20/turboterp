// Architecture Major, Bachelor of Arts option, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/architecture-planning-preservation/architecture-major/
// and arch.umd.edu degree-planning page (fetched 2026-09-28); see program-sources/architecture-major.md.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { archCommonReviewNotes, archCore } from "./arch-shared-2026-27.ts";

export const archMajorBa: Program = {
  id: "arch-major-ba",
  name: "Architecture Major (BA)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Architecture Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/architecture-planning-preservation/architecture-major/); " +
    "School of Architecture, Planning and Preservation degree-planning page " +
    "(https://arch.umd.edu/programs/architecture/resources/student-resources/advising/undergraduate-advising/degree-planning), fetched 2026-09-28",
  verified: false,
  reviewNotes: [
    ...archCommonReviewNotes,
    "The catalog offers a BS and a BA option; encoded as two programs of major key 'arch' (see the BS file for the default).",
    "BA electives: 'Select 30 additional credits in upper level Architecture electives, of which a maximum of 9 credits may be directed electives inside or outside the major.' " +
      "Encoded as 21 credits of ARCH courses numbered 300-499 ('upper level'; the catalog gives no number) plus an openSlot requirement ('directed-electives') for the 9 credits of directed electives. " +
      "Encoding all 30 as ARCH 300-499 would wrongly fail students using directed electives outside the major.",
    "Open slot 'directed-electives' (openSlot requirement): 9 credits of directed electives, inside or outside the major; no course, department or range is published, so the student confirms with their advisor.",
  ],
  requirements: [
    ...archCore,
    {
      kind: "choose",
      id: "arch-upper-electives",
      name: "Upper-level Architecture electives: 21 credits of ARCH 300-499 (the other 9 of the 30 may be directed electives; see reviewNotes)",
      credits: 21,
      from: { departments: ["ARCH"], minNumber: 300, maxNumber: 499 },
    },
    {
      kind: "openSlot",
      id: "directed-electives",
      name: "Directed electives (inside or outside the major)",
      credits: 9,
      note: "Up to 9 of the 30 upper-level elective credits may be directed electives inside or outside the major; no list is published, so confirm the courses with your advisor.",
    },
  ],
};

export const archMajorBaMeta: ProgramMeta = {
  kind: "major",
  college: "ARCH",
  short: "Architecture (BA)",
  major: "arch",
  track: "Bachelor of Arts",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/architecture-planning-preservation/architecture-major/",
    department:
      "https://arch.umd.edu/programs/architecture/resources/student-resources/advising/undergraduate-advising/degree-planning",
  },
};
