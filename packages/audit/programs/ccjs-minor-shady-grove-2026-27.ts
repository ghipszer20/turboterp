// Criminal Justice Minor at Shady Grove, 2026–27 UMD Academic Catalog (Universities at Shady Grove,
// Behavioral and Social Sciences).
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/universities-shady-grove/
// behavioral-social-sciences/criminal-justice-minor/ (fetched 2026-09-28). No department page
// was fetched. No official published sample plan (built from the requirements; see
// docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const ccjsMinorShadyGrove: Program = {
  id: "ccjs-minor-shady-grove",
  name: "Criminal Justice Minor at Shady Grove",
  catalogYear: "2026-27",
  source: "UMD Academic Catalog 2026–27, Criminal Justice Minor at Shady Grove (fetched 2026-09-28)",
  verified: false,
  reviewNotes: [
    "Department page not checked (catalog only).",
    "ProgramMeta college is USG (Universities at Shady Grove), per the owner ruling in rulings.md; CCJS is a College of Behavioral and Social Sciences department.",
    "The catalog page states no minimum grade, no sharing cap with the major, and no residency rule; none is encoded (sharing unlimited).",
    "Electives: 9 credits from the listed courses; CCJS432 appears with no title and is included. CCJS340/342/345 are not in the elective list, so a third one doesn't count as an elective.",
  ],
  requirements: [
    { kind: "course", id: "intro", name: "Introductory course", options: ["CCJS100", "CCJS301"] },
    {
      kind: "choose",
      id: "cj-requirement",
      name: "Criminal Justice Requirement (select 2)",
      count: 2,
      from: { courses: ["CCJS340", "CCJS342", "CCJS345"] },
    },
    {
      kind: "choose",
      id: "electives",
      name: "Elective courses",
      credits: 9,
      from: {
        courses: [
          "CCJS310", "CCJS325", "CCJS330", "CCJS331", "CCJS346", "CCJS352", "CCJS358", "CCJS360",
          "CCJS370", "CCJS418", "CCJS432", "CCJS440", "CCJS453", "CCJS461", "CCJS498",
        ],
      },
    },
  ],
};

export const ccjsMinorShadyGroveMeta: ProgramMeta = { kind: "minor", college: "USG", short: "Criminal Justice (Shady Grove)", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/universities-shady-grove/behavioral-social-sciences/criminal-justice-minor/" } };
