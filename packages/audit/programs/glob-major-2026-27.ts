// Global Health Major, School of Public Health (Department of Global, Environmental and Occupational Health),
// 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/global-environmental-occupational-health/global-health-major/,
// sph.umd.edu/gbhl-ug (404), sph.umd.edu/declare and sph.umd.edu/content/four-year-plans (all fetched 2026-09-28);
// see program-sources/global-health-major.md. SPHL100, BSCI170, BSCI180-or-171 and the shared manual notes come
// from sphl-shared-2026-27.ts (checked against the Global Health catalog table: all three appear). Encoded by hand.
// UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";
import {
  sphlBiologyLab,
  sphlBiologyLecture,
  sphlFoundations,
  sphlSharedReviewNotes,
} from "./sphl-shared-2026-27.ts";

const c = (id: string, name: string, course: string): Requirement => ({
  kind: "course",
  id,
  name: `${name} (${course})`,
  options: [course],
});

export const globMajor: Program = {
  id: "glob-major",
  name: "Global Health Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Global Health Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/global-environmental-occupational-health/global-health-major/); " +
    "SPH four-year plans and benchmarks page, https://sph.umd.edu/content/four-year-plans (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...sphlSharedReviewNotes,
    "Department pages: sph.umd.edu/gbhl-ug returned 404 (not converted); the declare page has no course requirements; the four-year-plans page gives only benchmarks (GBHL200 and two other supporting/core courses by end of two semesters; GBHL210, BSCI170, BSCI180/171, intermediate world language and four more supporting/core courses by end of four semesters). No disagreement with the catalog found; benchmarks are manual (see shared note).",
    "Grade floor: the source does not state a course grade minimum for the major; 'C-' is applied because the SPH benchmarks require 'C-' or better. Confirm with the owner.",
    "'BSCI213 (or BSCI223 for students considering allied health, not both)' is one row accepting either course.",
    "'GVPT200 or GVPT282' is one row. If a student completes both, the other counts toward the Global Health Options (catalog footnote); Options are not encoded, so this is manual.",
    "Open slot 'glob-world-language' (openSlot requirement): the catalog lists 6-12 credits, two levels of one world language, but the range is not explained in the sources, so the minimum of 6 is used (a student who needs more should confirm with their advisor). The approved list and exceptions are on sph.umd.edu/gbhl-bs. 'At least 2 courses in the same language' is not encoded.",
    "Open slot 'glob-experiential' (openSlot requirement): 3 credits, one global health experiential learning course subject to advisor approval (internship, research, independent study, global classroom, field experience or study abroad). GBHL386 is encoded as the other experiential course (3-6 credits). Catalog footnote: the two must be different courses with prior approval.",
    "Open slot 'glob-options' (openSlot requirement): 12 credits, four Global Health Options courses of 3 credits (two at 100-400 level, two at 300-400 level; approved menu on sph.umd.edu/gbhl-bs). A single course cannot count as both an Option and Experiential Learning (manual).",
    "Math eligibility of MATH120 or higher is a prerequisite for the supporting courses (manual, not encoded). Credit ranges (77-86 total) depend on the language and experiential choices; total credits are manual.",
    "The catalog lists no term-by-term four-year plan for Global Health (it links to the SPH roadmaps page, which has only benchmarks); the sample plan is CONSTRUCTED from the catalog table. Flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    // Supporting courses
    sphlBiologyLecture,
    sphlBiologyLab,
    {
      kind: "course",
      id: "glob-bsci213",
      name: "The Public Microbe (BSCI213; BSCI223 accepted for allied-health students)",
      options: ["BSCI213", "BSCI223"],
    },
    c("glob-nfsc100", "Elements of Nutrition", "NFSC100"),
    {
      kind: "course",
      id: "glob-gvpt",
      name: "International Political Relations (GVPT200) or The Politics of Global Development (GVPT282)",
      options: ["GVPT200", "GVPT282"],
    },
    // Core
    c("glob-gbhl200", "Introduction to Global Health", "GBHL200"),
    c("glob-gbhl210", "Careers in Global Health", "GBHL210"),
    sphlFoundations,
    c("glob-fmsc110", "Families and Global Health", "FMSC110"),
    c("glob-hlth230", "Introduction to Health Behavior", "HLTH230"),
    c("glob-anth210", "Introduction to Medical Anthropology and Global Health", "ANTH210"),
    c("glob-epib301", "Epidemiology for Public Health Practice", "EPIB301"),
    c("glob-epib315", "Biostatistics for Public Health Practice", "EPIB315"),
    c("glob-anth310", "Method & Theory in Medical Anthropology and Global Health", "ANTH310"),
    c("glob-gbhl310", "Introduction to Global Health Literacy", "GBHL310"),
    c("glob-mieh321", "Environmental Determinants of Emerging Infectious Diseases", "MIEH321"),
    c("glob-hlsa320", "Comparative Global Health Care Delivery Systems", "HLSA320"),
    c("glob-inst420", "Data Applications in Global Health", "INST420"),
    c("glob-gbhl497", "Global Health Capstone", "GBHL497"),
    // Experiential learning
    c("glob-gbhl386", "Global Health Experiential Learning", "GBHL386"),
    {
      kind: "openSlot",
      id: "glob-world-language",
      name: "World language (two levels of one language)",
      credits: 6,
      note: "Two levels of one world language, at least 2 courses in the same language; the catalog says 6-12 credits. Approved list and exceptions: sph.umd.edu/gbhl-bs.",
    },
    {
      kind: "openSlot",
      id: "glob-experiential",
      name: "Global health experiential learning (advisor-approved)",
      credits: 3,
      note: "One experiential learning course (internship, research, independent study, global classroom, field experience or study abroad) with prior advisor approval, different from GBHL386. See sph.umd.edu/gbhl-bs.",
    },
    {
      kind: "openSlot",
      id: "glob-options",
      name: "Global Health options",
      credits: 12,
      note: "Four 3-credit Global Health Options courses: two at 100-400 level and two at 300-400 level. Approved menu: sph.umd.edu/gbhl-bs.",
    },
  ],
};

export const globMajorMeta: ProgramMeta = {
  kind: "major",
  college: "SPHL",
  short: "Global Health",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/global-environmental-occupational-health/global-health-major/",
    department: "https://sph.umd.edu/content/four-year-plans",
  },
};
