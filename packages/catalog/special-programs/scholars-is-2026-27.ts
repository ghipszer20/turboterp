// College Park Scholars: International Studies (Fall 2026 curriculum PDF). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, SCHOLARS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsIS2026.pdf";

const SUPPORTING = [
  "BMGT207", "BSST230", "ANTH264", "ANTH266", "ARCH271", "AREC260", "AREC365", "ARTH260", "ENEE200", "ENCE215",
  "GVPT200", "GVPT241", "GVPT282", "GVPT306", "GVPT309", "GVPT354", "GVPT356", "IMMR200", "INST204", "PHIL341",
  "PHIL344", "PLCY201", "PLCY203", "PLCY213", "PLCY310", "PLCY380", "SOCY343", "URSP250", "WGSS275",
];

export const scholarsIs: Program = {
  id: "scholars-is",
  name: "College Park Scholars: International Studies",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    ...SCHOLARS_CITATION_NOTES,
    `[check] Courses: "CPSN 100: Colloquium I 1 cr; CPSN 101: Colloquium II (DVCC) 1 cr; GVPT 200: International Political Relations (DSHS, DVUP); or GVPT 241: The Study of Political Philosophy: Ancient and Modern (DSSP) 3 cr; CPSN 200: Colloquium III 1 cr".`,
    `[check] Practicum: "CPSN 230: Internship; or CPSN 240: Service-Learning; or CPSN 250: Research; or CPSP 359S: Discovery Research (DSSP); or CPSP300: Intergroup Dialogue Facilitation (DSSP); or Study Abroad" (2-3 cr). The course options are encoded; "Study Abroad" is manual.`,
    `[check] Dialogue: "CPSP110: Bridging Divides thru Intergroup Dialogue Across Disciplines (DVCC) or Alternate Dialogue Course (EDDI110, ENES138, etc.)" 1 cr. The named alternates are encoded; "etc." is manual.`,
    `[check] Supporting course: "Choose ONE from the list below." GVPT200 and GVPT241 are also on the list; one course can't fill both the GVPT requirement and the supporting course.`,
    `[manual] "Subject to Director approval, students may propose another course … Students may also select ANY Global Classroom Signature course (not Global Connections)" and RIT-Kosovo summer courses "are pre-approved for CPS-IS". Not encoded.`,
  ],
  requirements: [
    { kind: "course", id: "cpsn100", name: "Colloquium I", options: ["CPSN100"] },
    { kind: "course", id: "cpsn101", name: "Colloquium II", options: ["CPSN101"] },
    { kind: "course", id: "gvpt", name: "International Political Relations or Political Philosophy", options: ["GVPT200", "GVPT241"] },
    { kind: "course", id: "cpsn200", name: "Colloquium III", options: ["CPSN200"] },
    { kind: "course", id: "practicum", name: "Practicum", options: ["CPSN230", "CPSN240", "CPSN250", "CPSP359S", "CPSP300"] },
    { kind: "course", id: "dialogue", name: "Intergroup dialogue course", options: ["CPSP110", "EDDI110", "ENES138"] },
    { kind: "choose", id: "supporting-course", name: "Supporting course", count: 1, from: { courses: SUPPORTING } },
  ],
};

export const scholarsIsMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsIS2026.pdf" } };
