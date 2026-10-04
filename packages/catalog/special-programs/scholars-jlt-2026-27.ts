// College Park Scholars: Justice and Legal Thought (Fall 2026 curriculum PDF). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, SCHOLARS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsJLT2026.pdf";

export const scholarsJlt: Program = {
  id: "scholars-jlt",
  name: "College Park Scholars: Justice and Legal Thought",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    ...SCHOLARS_CITATION_NOTES,
    `[check] Courses: "CPJT 100: Colloquium I 1 cr; MLAW 100: Justice and the Law (DSHS) 3 cr; CPJT 101: Colloquium II 1 cr; MLAW 150: Law in a Just Society (DSHS, SCIS) 3 cr; CPJT 200: Colloquium III 1 cr; CPJT 230: Internship (DSSP); or CPJT 240: Service-Learning (DSSP); or CPJT 250: Research (DSSP)".`,
    `[check] Supporting course: "Select from list of approved courses, One course (3 credits)". "MLAW315 & MLAW325: Citizenship and Naturalization in America (two-part course for sophomores)" is one option taken as a pair, so the requirement is a choice of one course set.`,
  ],
  requirements: [
    { kind: "course", id: "cpjt100", name: "Colloquium I", options: ["CPJT100"] },
    { kind: "course", id: "mlaw100", name: "Justice and the Law", options: ["MLAW100"] },
    { kind: "course", id: "cpjt101", name: "Colloquium II", options: ["CPJT101"] },
    { kind: "course", id: "mlaw150", name: "Law in a Just Society", options: ["MLAW150"] },
    { kind: "course", id: "cpjt200", name: "Colloquium III", options: ["CPJT200"] },
    { kind: "course", id: "practicum", name: "Practicum (internship, service-learning or research)", options: ["CPJT230", "CPJT240", "CPJT250"] },
    {
      kind: "sets",
      id: "supporting-course",
      name: "Supporting course",
      options: [["CPSP220"], ["FMSC190S"], ["HIST134S"], ["PHIL140"], ["PHIL170"], ["PHIL245"], ["MLAW378R"], ["MLAW315", "MLAW325"]],
    },
  ],
};

export const scholarsJltMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsJLT2026.pdf" } };
