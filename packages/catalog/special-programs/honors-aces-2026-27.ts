// Honors College: Advanced Cybersecurity Experience for Students (ACES) living-learning program.
// Source: https://aces.umd.edu/llp-course-requirements (and /curriculum-llp; fetched 2026-09-25). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, HONORS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://aces.umd.edu/llp-course-requirements";

export const honorsAces: Program = {
  id: "honors-aces",
  name: "Advanced Cybersecurity Experience for Students (ACES)",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    ...HONORS_CITATION_NOTES,
    `[check] "Students must complete 15 credits to earn the ACES Living-Learning Program citation from the Honors College" (aces.umd.edu/curriculum-llp). Foundation (6) + seminars (6) + experiential learning (3) = 15.`,
    `[check] Foundation Courses (6 credits): "HACS100 Foundations of Cybersecurity (2 credits)", "HACS101 Applied Cybersecurity Foundations I (2 credits)", "HACS200 Applied Cybersecurity Foundations II (2 credits)".`,
    `[check] Seminars: "HACS208 Seminar in Cybersecurity (3 credits each) Choose 2 seminars for a total of 6 credits", with topics lettered A, C, E, I, N, P, Z. Encoded as two courses numbered HACS208 (any lettered topic); two sections of the same topic would also count.`,
    `[check] Experiential Learning: "Students will complete 3 credits of experiential learning from research and/or practical experiences": "HACS287 Undergraduate Research in Cybersecurity (3 credits)" and "HACS297 Cybersecurity Experience Reflection". Encoded as 3 credits from HACS287 and HACS297.`,
    `[manual] HACS297: "To be eligible to take 297 you need 135 completed hours of cybersecurity-related practical experience".`,
    `[manual] Residence: "ACES students are required to live on campus for two years" (honors.umd.edu Programs at a Glance).`,
  ],
  requirements: [
    { kind: "course", id: "hacs100", name: "Foundations of Cybersecurity", options: ["HACS100"] },
    { kind: "course", id: "hacs101", name: "Applied Cybersecurity Foundations I", options: ["HACS101"] },
    { kind: "course", id: "hacs200", name: "Applied Cybersecurity Foundations II", options: ["HACS200"] },
    { kind: "choose", id: "seminars", name: "Seminars in Cybersecurity (two)", count: 2, from: { departments: ["HACS"], minNumber: 208, maxNumber: 208 } },
    { kind: "choose", id: "experiential", name: "Experiential learning (3 credits)", credits: 3, from: { courses: ["HACS287", "HACS297"] } },
  ],
};

export const honorsAcesMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://aces.umd.edu/llp-course-requirements" } };
