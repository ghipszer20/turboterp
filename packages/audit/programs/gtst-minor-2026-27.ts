// Global Terrorism Studies Minor, 2026-27 UMD Academic Catalog (National Consortium for the Study of
// Terrorism and Responses to Terrorism, START, College of Behavioral and Social Sciences).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/global-terrorism-studies-minor/;
// START, https://start.umd.edu/education/global-terrorism-studies-minor-program (both fetched 2026-09-28).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const gtstMinor: Program = {
  id: "gtst-minor",
  name: "Global Terrorism Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Global Terrorism Studies Minor; START, " +
    "https://start.umd.edu/education/global-terrorism-studies-minor-program (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Catalog and department page agree on the 17 credits: BSST200, BSST331 or BSST335 (Innovative Ideas), BSST377, BSST386, 6 BSST elective credits, and one Global Perspectives course.",
    "Not encoded: program GPA 2.0 across the minor's courses is encoded as minGpa; separate application to START (12 earned credits, UMD undergraduates only, deadlines each fall and spring).",
    "Electives: 'six credits within BSST' accepts any BSST course; BSST200, 377, 386 and the Innovative Ideas course cannot double-count (each course counts toward one requirement). Taking both BSST331 and BSST335 lets the second count as an elective, per both sources. The catalog footnote that the Director may approve a relevant course outside BSST is a manual substitution, not encoded.",
    "Global Perspectives list: the catalog names ENES316/464/474 without titles and lists GVPT409 as sections GVPT409J and GVPT409K; encoded as those two section ids only (other GVPT409 sections are not on either list). Some catalog and department course titles differ (e.g. AREC345, ENES269); the course ids match, so the difference is only in titles.",
    "Neither source states a cap on overlap with a major or other programs; no sharing limit is set.",
    "No published sample plan; the sample plan is constructed.",
  ],
  requirements: [
    { kind: "course", id: "intro", name: "Terrorism Studies", options: ["BSST200"] },
    { kind: "course", id: "innovative", name: "Innovative Ideas Requirement", options: ["BSST331", "BSST335"] },
    { kind: "course", id: "capstone", name: "Applying Theory to the Practice of Countering Terrorism", options: ["BSST377"] },
    { kind: "course", id: "experiential", name: "Experiential Learning in Terrorism Studies", options: ["BSST386"] },
    {
      kind: "choose",
      id: "electives",
      name: "Terrorism Studies (BSST) electives",
      credits: 6,
      from: { departments: ["BSST"] },
    },
    {
      kind: "choose",
      id: "global",
      name: "Global Perspectives course",
      count: 1,
      from: {
        courses: [
          "ANTH265", "AREC345", "AREC365", "ENES269", "ENES316", "ENES464", "ENES472", "ENES474",
          "GEOG330", "GVPT200", "GVPT204", "GVPT206", "GVPT210", "GVPT280", "GVPT282", "GVPT306",
          "GVPT309", "GVPT354", "GVPT359", "GVPT409J", "GVPT409K",
        ],
      },
    },
  ],
};

export const gtstMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "BSOS",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/global-terrorism-studies-minor/",
    department: "https://start.umd.edu/education/global-terrorism-studies-minor-program",
  },
};
