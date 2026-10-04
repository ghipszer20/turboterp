// Honors College: Interdisciplinary Business Honors (IBH).
// Source: https://ibh.umd.edu/academics (fetched 2026-09-25). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, HONORS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://ibh.umd.edu/academics";

export const honorsIbh: Program = {
  id: "honors-ibh",
  name: "Interdisciplinary Business Honors",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    ...HONORS_CITATION_NOTES,
    `[check] "IBH students complete a five-course, 15-credit program curriculum in order to earn the Honors College IBH Program Citation". Core: "HBUS100 The Future of Work", "HBUS105 The Future of Analysis", "HBUS200 The Future of Leadership", "HBUS205 IBH Capstone".`,
    `[check] Elective: "IBH students select one elective course to complete. Elective options include opportunities such as the IBH Winter Study Abroad course, an interdisciplinary course on campus, or the IBH internship reflection class, HBUS307." Only HBUS307 has a published id and is encoded.`,
    `[manual] The other elective options (IBH Winter Study Abroad, "an interdisciplinary course on campus") have no published course ids; a student using one confirms it.`,
    `[manual] Residence: "IBH freshmen are required to live in Prince Frederick".`,
  ],
  requirements: [
    { kind: "course", id: "hbus100", name: "The Future of Work", options: ["HBUS100"] },
    { kind: "course", id: "hbus105", name: "The Future of Analysis", options: ["HBUS105"] },
    { kind: "course", id: "hbus200", name: "The Future of Leadership", options: ["HBUS200"] },
    { kind: "course", id: "hbus205", name: "IBH Capstone", options: ["HBUS205"] },
    { kind: "course", id: "elective", name: "IBH elective (internship reflection)", options: ["HBUS307"] },
  ],
};

export const honorsIbhMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://ibh.umd.edu/academics" } };
