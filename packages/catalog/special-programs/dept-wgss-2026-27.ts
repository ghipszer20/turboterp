// Departmental Honors: Women, Gender, and Sexuality Studies.
// Source: https://wgss.umd.edu/academic-programs/undergraduate/experiential-learning ("Harriet Tubman Departmental
// Honors Program"; fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://wgss.umd.edu/academic-programs/undergraduate/experiential-learning";

export const deptWgss: Program = {
  id: "dept-honors-wgss",
  name: "Departmental Honors: Women, Gender, and Sexuality Studies",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "3 credits of WGSS 487 Advanced Projects in Gender, Race, and Queer Studies completed as Honors Option in the Spring before thesis writing... 6 credits of WGSS 489A Individual Research: Honors Thesis Writing taken in the final year... Honors students are required to take 2 semesters & 6 total credits of Thesis Writing."`,
    `[manual] Eligibility: "completed three WGSS or LGBT courses at the time of application and have a 3.25 overall GPA and a 3.25 GPA in the WGSS or LGBT courses taken." Not a citation requirement.`,
    `[manual] "Students are able to complete a traditional academic thesis or a creative or activist project... The minimum length of the thesis is generally 40 pages... There must be an oral defense." The thesis document and defense aren't checked.`,
  ],
  requirements: [
    { kind: "choose", id: "wgss487", name: "WGSS487: Advanced Projects (Honors Option)", credits: 3, from: { courses: ["WGSS487"] } },
    { kind: "choose", id: "wgss489a", name: "WGSS489A: Individual Research (Honors Thesis Writing)", credits: 6, from: { courses: ["WGSS489A"] } },
  ],
};

export const deptWgssMeta: ProgramMeta = { kind: "special", college: "ARHU", sources: { department: "https://wgss.umd.edu/academic-programs/undergraduate/experiential-learning" } };
