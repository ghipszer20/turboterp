// Departmental Honors: Art (Studio Art).
// Source: https://art.umd.edu/academic-programs/honors-programs (fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://art.umd.edu/academic-programs/honors-programs";

export const deptArt: Program = {
  id: "dept-honors-art",
  name: "Departmental Honors: Art",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "The Program consists of four courses: One 300- or 400-level studio honors elective, One 400-level studio honors elective, ARTT 480H 'Honors Seminar' (fall), ARTT 498H 'Honors Thesis' (spring)." 12 credits total. Only the two named courses (ARTT480H, ARTT498H) are drafted; the two studio honors electives have no published course ids (they vary by area of study) and aren't enumerated, since ARTT's regular 300–400 courses aren't honors sections.`,
    `[manual] "Minimum grade of 'B' in Honors coursework." Not checked.`,
    `[manual] Eligibility: "Minimum overall 3.0 GPA and 3.5 GPA in ARTT courses... Completion of all foundation art courses: ARTT 100, 110, 150, 200, 210 and 255... Minimum of one 300-level intermediate studio course... No less than 75 credits towards the degree." Admission requirements, not a citation requirement.`,
    `[manual] "Honors students are assigned private or semi-private studios... responsible for programming and installing student exhibitions in the Herman Maril Gallery." Studio space and gallery duties aren't course requirements.`,
  ],
  requirements: [
    { kind: "course", id: "artt480h", name: "Honors Seminar", options: ["ARTT480H"] },
    { kind: "course", id: "artt498h", name: "Honors Thesis", options: ["ARTT498H"] },
  ],
};

export const deptArtMeta: ProgramMeta = { kind: "special", college: "ARHU", sources: { department: "https://art.umd.edu/academic-programs/honors-programs" } };
