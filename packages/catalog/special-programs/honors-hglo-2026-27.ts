// Honors College: Honors Global Challenges & Solutions (HGLO; formerly Honors Global Communities).
// Source: "HGLO Advising Guide for First-Year Students (entering Fall 2026)", a Google Doc linked from
// https://hglo.umd.edu/currentstudents/academicrequirements (fetched 2026-09-25). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, HONORS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://hglo.umd.edu/currentstudents/academicrequirements";

/** UMD Fellows fall seminars (UGST catalog, "UMD Fellows Program"). */
const FELLOWS_SEMINARS = [
  "FGSM310", "FGSM315", "FGSM320", "FGSM325", "FGSM330", "FGSM340", "FGSM350", "FGSM355", "FGSM360", "FGSM365", "FGSM370", "FGSM390",
];

export const honorsHglo: Program = {
  id: "honors-hglo",
  name: "Honors Global Challenges & Solutions",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  minGrade: "C-",
  reviewNotes: [
    ...HONORS_CITATION_NOTES,
    `[check] "To earn the Honors Citation, HGLO students must have a 3.2 cumulative GPA and earn at least a C- or better in all HGLO required courses." Encoded as a program-wide C- minimum.`,
    `[check] First year: "HGLO 100: The Student in the University (1 cr)", "HGLO 101: Saving the World with Data (3 cr)", "GVPT 201: Quantitative Methods for Political Science Research (3 cr) … MUST register for a section designated as "Open to HGLO students only."" The HGLO-only section isn't checked.`,
    `[check] Second year, "Choose ONE track": UMD Fellows Track ("FGSM UMD Fellows Fall Course (3 cr)", then "FGSM 398F UMD Fellows Internship or equivalent (3 cr)") or Global Problem Solving Track ("HGLO 208: Solving Hard Problems with Data (3 cr) or HGLO 207: Leadership for Global Challenges", then "HGLO 298: Independent Experiential Learning (3 cr) or HGLO 396: Social Issues in Brazil* HGLO 397: Challenges & Solutions in Panama* (3 cr)"). Encoded per semester (fall: HGLO207/208 or a Fellows seminar; spring: HGLO298/396/397 or FGSM398F/FGSM398), so the audit doesn't stop a student mixing tracks. The Fellows seminar ids come from the UGST catalog's Fellows list, not from the guide.`,
    `[manual] "Plus one (1) Supporting Course (any semester) (3 cr) Interdisciplinary 300- or 400-level or H-course involving Global Issues or Social Data Science, selected from HGLO list of approved supporting courses." The approved list isn't public, so this is a Manual Item.`,
    `[manual] "Any Education Abroad course that is at least 3 credits will count towards the HGLO citation requirement" (in place of HGLO396/397); "FGSM 398F … or equivalent". Not encoded.`,
    `[manual] Fellows track: "Must apply to the UMD Fellows Program in Spring 2026" (sic, for the Fall 2026 cohort's second year).`,
  ],
  requirements: [
    { kind: "course", id: "hglo100", name: "The Student in the University", options: ["HGLO100"] },
    { kind: "course", id: "hglo101", name: "Saving the World with Data", options: ["HGLO101"] },
    { kind: "course", id: "gvpt201", name: "Quantitative Methods for Political Science Research", options: ["GVPT201"] },
    { kind: "choose", id: "second-year-fall", name: "Second-year fall track course", count: 1, from: { courses: ["HGLO208", "HGLO207", ...FELLOWS_SEMINARS] } },
    { kind: "course", id: "second-year-spring", name: "Second-year spring track course", options: ["HGLO298", "HGLO396", "HGLO397", "FGSM398F", "FGSM398"] },
  ],
};

export const honorsHgloMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://hglo.umd.edu/currentstudents/academicrequirements" } };
