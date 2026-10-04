// College Park Scholars: Civic Engagement for Social Good (formerly the CIVICUS
// living-learning program; relaunched in Scholars Fall 2024). Fall 2026 curriculum PDF.
// Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, SCHOLARS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsCESG2026_0.pdf";

const SUPPORTING = [
  "AAAS320", "AGNR301", "AMST310", "AMST328T", "AMST328Y", "AREC200", "ARTH260", "COMM382", "CPSP220", "CPSS340",
  "EDSP311", "FMSC190S", "HESI423", "JOUR175", "LARC151", "LARC162", "LEAD217", "LGBT200", "PEER312", "PEER318",
  "PEER319", "PHIL344", "PLCY213", "PLCY302", "PSYC354", "SOCY241", "URSP250",
];

export const scholarsCesg: Program = {
  id: "scholars-cesg",
  name: "College Park Scholars: Civic Engagement for Social Good",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    ...SCHOLARS_CITATION_NOTES,
    `[check] Courses: "CPCV 100: Colloquium I 1 cr; CPCV 225: Intro to Civic Engagement for Social Good 3 cr; CPCV 101: Colloquium II 1 cr; CPCV200: Colloquium III 1 cr; CHSE 228C: Intergroup Dialogue (DVCC) 1 cr".`,
    `[check] Practicum: "CPCV 230: Internship; or CPCV 240: Service-Learning; or CPCV 250: Research; or" (3 cr). The list ends in a dangling "or" in the PDF; a fourth option may be missing.`,
    `[check] Supporting course: "Select from an approved list of courses … One course (3 credits)", from the "Civic Engagement for Social Good Supporting Course List, Fall 2026".`,
  ],
  requirements: [
    { kind: "course", id: "cpcv100", name: "Colloquium I", options: ["CPCV100"] },
    { kind: "course", id: "cpcv225", name: "Intro to Civic Engagement for Social Good", options: ["CPCV225"] },
    { kind: "course", id: "cpcv101", name: "Colloquium II", options: ["CPCV101"] },
    { kind: "course", id: "cpcv200", name: "Colloquium III", options: ["CPCV200"] },
    { kind: "course", id: "chse228c", name: "Intergroup Dialogue", options: ["CHSE228C"] },
    { kind: "course", id: "practicum", name: "Practicum (internship, service-learning or research)", options: ["CPCV230", "CPCV240", "CPCV250"] },
    { kind: "choose", id: "supporting-course", name: "Supporting course", count: 1, from: { courses: SUPPORTING } },
  ],
};

export const scholarsCesgMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsCESG2026_0.pdf" } };
