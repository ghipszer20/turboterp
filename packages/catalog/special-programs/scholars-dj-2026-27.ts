// College Park Scholars: Data Justice (Fall 2026 curriculum PDF). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, SCHOLARS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsDJ2026_1.pdf";

const SUPPORTING = [
  "AASP187", "AMST205", "AMST260", "ARCH170", "CHSE205", "CMSC116", "COMM200", "DATA200", "ENES200", "ENEE200",
  "ENES240", "ENGL255", "ENGL290", "ENGL293", "ENGL294", "ENGL295", "ENMA201", "GEOG140", "GEOG201", "IMDM150",
  "JOUR130", "JOUR175", "JOUR282", "JOUR289", "LARC162", "PHIL100", "PHIL140", "PHIL202", "PHIL203", "PHIL211",
  "PHIL220", "PHIL245", "PHIL271", "PHYS137", "PLCY215", "PLCY240", "SOCY200", "SOCY241", "WGSS115",
];

export const scholarsDj: Program = {
  id: "scholars-dj",
  name: "College Park Scholars: Data Justice",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    ...SCHOLARS_CITATION_NOTES,
    `[check] Courses: "CPDJ 100: Colloquium I 1 cr; INST204S: Designing Fair Systems (DSHS, SCIS) 3 cr; CPDJ 101: Colloquium II 1 cr; CPDJ 200: Colloquium III 1 cr". INST204S is a Scholars-designated id; plain INST204 is not accepted.`,
    `[check] Practicum: "Semester 4 CPDJ 240: Service-Learning Practicum 3 cr, CPDJ230: Internship Practicum 3 cr, CPDJ250: Research Practicum 3 cr" (no "or" between them). Encoded as one of the three, like every other Scholars program's practicum.`,
    `[check] Supporting course: "Select from list of approved courses", one course (3 cr). "ENES/ENEE200" is a cross-listing: only one of ENES200 and ENEE200 counts.`,
  ],
  requirements: [
    { kind: "course", id: "cpdj100", name: "Colloquium I", options: ["CPDJ100"] },
    { kind: "course", id: "inst204s", name: "Designing Fair Systems", options: ["INST204S"] },
    { kind: "course", id: "cpdj101", name: "Colloquium II", options: ["CPDJ101"] },
    { kind: "course", id: "cpdj200", name: "Colloquium III", options: ["CPDJ200"] },
    { kind: "course", id: "practicum", name: "Practicum (service-learning, internship or research)", options: ["CPDJ240", "CPDJ230", "CPDJ250"] },
    { kind: "choose", id: "supporting-course", name: "Supporting course", count: 1, from: { courses: SUPPORTING }, alternatives: [["ENES200", "ENEE200"]] },
  ],
};

export const scholarsDjMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsDJ2026_1.pdf" } };
