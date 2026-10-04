// College Park Scholars: Global Public Health (Fall 2026 curriculum PDF). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, SCHOLARS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsGPH2026.pdf";

export const scholarsGph: Program = {
  id: "scholars-gph",
  name: "College Park Scholars: Global Public Health",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    ...SCHOLARS_CITATION_NOTES,
    `[check] Courses: "CPGH 100: Colloquium I 1 cr; FMSC110S: Families and Global Health (DSHS, DVCC) 3 cr; CPGH 101: Colloquium II 1 cr; CPGH 200: Colloquium III (DSSP) 1 cr; CPGH 210: Practicum Capstone 1 cr". FMSC110S is a Scholars-designated id; plain FMSC110 is not accepted.`,
    `[manual] Supporting courses (not drafted): "Students will take two courses (6 credits) that will enrich your understanding of Global Public Health … All students will complete a proposal for their chosen courses in their first colloquium." The PDF gives only "Examples of courses students have proposed: ANTH 210, ANTH 222, ANTH 265, ECON 175, FMSC 190, GEOG 202, GVPT 200, HLTH 140, HLTH 230, HLTH234, HLTH292, NFSC 100, PSYC100, SPHL100, SPHL291", which is not a closed list, so the student confirms their two approved courses.`,
  ],
  requirements: [
    { kind: "course", id: "cpgh100", name: "Colloquium I", options: ["CPGH100"] },
    { kind: "course", id: "fmsc110s", name: "Families and Global Health", options: ["FMSC110S"] },
    { kind: "course", id: "cpgh101", name: "Colloquium II", options: ["CPGH101"] },
    { kind: "course", id: "cpgh200", name: "Colloquium III", options: ["CPGH200"] },
    { kind: "course", id: "cpgh210", name: "Practicum Capstone", options: ["CPGH210"] },
  ],
};

export const scholarsGphMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsGPH2026.pdf" } };
