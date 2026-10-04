// Reusable pieces of the College Park Information Science (InfoSci) curriculum, 2026-27 catalog
// (program-sources/information-science-major.md). Exports requirements only (no Meta), so sibling INFO
// majors can import the pieces they share. Requirement ids are prefixed "infosci-".

import type { Requirement } from "../src/audit.ts";

const c = (code: string, name: string): Requirement => ({
  kind: "course",
  id: `infosci-${code.toLowerCase()}`,
  name: `${name} (${code})`,
  options: [code],
});

/** Benchmark Courses table (12 credits). */
export const infosciBenchmarkRequirements: Requirement[] = [
  c("MATH115", "Precalculus"),
  c("PSYC100", "Introduction to Psychology"),
  c("STAT100", "Elementary Statistics and Probability"),
  c("INST126", "Introduction to Programming for Information Science 1"),
];

/** Major Core Requirements table (30 credits). */
export const infosciCoreRequirements: Requirement[] = [
  c("INST201", "Introduction to Information Science"),
  c("INST311", "Information Organization"),
  c("INST314", "Statistics for Information Science"),
  c("INST326", "Object-Oriented Programming for Information Science"),
  c("INST327", "Database Design and Modeling"),
  c("INST335", "Organizations, Management and Teamwork"),
  c("INST346", "Technologies, Infrastructure and Architecture"),
  c("INST352", "Information User Needs and Assessment"),
  c("INST362", "User-Centered Design"),
  c("INST490", "Integrated Capstone for Information Science"),
];
