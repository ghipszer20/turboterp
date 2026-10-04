// Honors College: Honors Humanities (HHUM) citation requirements.
// Source: https://arhu.umd.edu/academics/undergraduate-studies/living-and-learning-programs/honors-humanities/prospective-students/academics
// (linked from https://honors.umd.edu/academics/honors-citation/; page fetched 2026-09-25).
// Hand-transcribed (prose page). UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, HONORS_CITATION_NOTES } from "./common.ts";

export const SOURCE =
  "https://arhu.umd.edu/academics/undergraduate-studies/living-and-learning-programs/honors-humanities/prospective-students/academics";

/**
 * Course prefixes of the undergraduate programs listed at https://arhu.umd.edu/academics
 * (the page HHUM links as the "list of academic departments"). The prefixes are
 * Claude's mapping from program names; see the review note.
 */
const ARHU_PREFIXES = [
  "ARHU", "AMST", "ARAB", "ARTT", "ARTH", "CHIN", "CINE", "CLAS", "GREK", "LATN", "COMM", "DANC", "ENGL",
  "FREN", "GERM", "HIST", "IMDM", "ITAL", "JAPN", "JWST", "LING", "MUSC", "MUED", "PERS", "PHIL", "RUSS",
  "SPAN", "THET", "WGSS",
];

export const honorsHumanities: Program = {
  id: "honors-humanities",
  name: "Honors Humanities",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  minGrade: "C-",
  reviewNotes: [
    ...HONORS_CITATION_NOTES,
    `[check] Grade: "To earn the Honors Humanities citation, you must complete 15 Honors Humanities credits with a C- or higher in each course." Encoded as a program-wide minimum grade of C-, which also applies to the 3-credit experience.`,
    `[check] Credit count: the page says both "Each Honors Humanities student completes 15 Honors Humanities course credits, a 3-credit experience and a keystone project" and "complete 15 Honors Humanities credits". The four HHUM courses total 12 credits; with the 3-credit experience the total is 15. Encoded as the four courses plus the experience (15 credits).`,
    `[check] "HHUM205 (3 credits): Global Humanities Each fall we offer three different seminars": encoded as any HHUM205 section or lettered topic (HHUM 205–205).`,
    `[check] Experience Option 1: "Upper-level Course ( 300 or 400 level ) in the College of Arts & Humanities." Encoded as 3 credits of 300–499 courses with an ARHU prefix. The prefixes (${ARHU_PREFIXES.join(", ")}) are Claude's mapping of the undergraduate programs listed at arhu.umd.edu/academics; Human-Centered AI, Global Culture and Thought, Philosophy Politics and Economics, and Religions of the Ancient Middle East are left out because the page gives no prefix for them.`,
    `[manual] "Note: Your required professional writing course does not count toward this citation requirement." Not enforced (the ENGL professional-writing courses would match the ARHU filter).`,
    `[manual] Experience Options 2 and 3: "An internship in which you examine and document the applications and manifestations of the arts & humanities" or "A credited study abroad experience", each after an approval request form. The student confirms these.`,
    `[manual] Keystone: "HHUM206 … you complete the keystone project"; the project itself is not a course requirement beyond HHUM206.`,
    `[manual] Timing: "you may take up to four years to complete any of the requirements." Not checked.`,
  ],
  requirements: [
    { kind: "course", id: "hhum105", name: "Introduction to the Humanities", options: ["HHUM105"] },
    { kind: "course", id: "hhum106", name: "Arts and Humanities in Practice", options: ["HHUM106"] },
    { kind: "choose", id: "hhum205", name: "Global Humanities seminar", count: 1, from: { departments: ["HHUM"], minNumber: 205, maxNumber: 205 } },
    { kind: "course", id: "hhum206", name: "Keystone Project", options: ["HHUM206"] },
    {
      kind: "choose",
      id: "experience",
      name: "3-credit experience: upper-level Arts & Humanities course",
      credits: 3,
      from: { departments: ARHU_PREFIXES, minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const honorsHumanitiesMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://arhu.umd.edu/academics/undergraduate-studies/living-and-learning-programs/honors-humanities/prospective-students/academics" } };
