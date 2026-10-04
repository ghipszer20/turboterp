// Honors College: Integrated Life Sciences (ILS).
// Source: https://www.ils.umd.edu/courses ("ILS Course Sequence & Citation Completion"; fetched 2026-09-25). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, HONORS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://www.ils.umd.edu/courses";

export const honorsIls: Program = {
  id: "honors-ils",
  name: "Integrated Life Sciences",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    ...HONORS_CITATION_NOTES,
    `[check] "ILS students will be awarded an Honors College Citation in Integrated Life Sciences for successfully completing this course sequence totaling 16 credits, which includes a service-learning experience and participating in an authentic research experience". Drafted: HLSC100 (1) + HLSC280 (3) + HLSC322 (4) + HLSC102 (1) + one second-year fall course (3–4) + one second-year spring course (3) = 15–16.`,
    `[check] HLSC280: the table reads "HLSC280 … OR BSCI170/180 … (4)*" in year 1 and "HLSC 280 if not completed Semester 1" in year 2, and the footnote says students without AP/IB/transfer credit "will register for BSCI170/171 during their first semester and MUST complete HLSC280 during the first semester of their sophomore year". So HLSC280 is required of everyone; BSCI170/180 is not drafted as a citation course.`,
    `[check] Year 2 fall, "Any one of the following: BSCI330H (4), BSCI411H (4), ENGL390H (3), HLSC374 (4), HLTH234H (3), HLTH264H". Year 2 spring, "Either of the following: ENGL390H (3), HLTH285H (3), HLTH264H, HLSC227". ENGL390H and HLTH264H are on both lists; one course fills one requirement. Honors "H" ids are distinct from BSCI330, ENGL390 etc.`,
    `[check] "BSCI279H Catalyst Seminar (1) *Suggested" — "this course is not required"; not drafted.`,
    `[check] HLSC100: "(Students entering ILS as rising second-year students may substitute other UNIV 100 courses to satisfy this requirement)". UNIV100 is accepted.`,
    `[manual] "participating in an authentic research experience, as described in the Research page" and the service hours in HLSC102 ("Students complete 25 hours of service").`,
    `[manual] Residence: "ILS students are required to live on campus for one year" (honors.umd.edu Programs at a Glance).`,
  ],
  requirements: [
    { kind: "course", id: "hlsc100", name: "Developing Life Scientists for the Global Good", options: ["HLSC100", "UNIV100"] },
    { kind: "course", id: "hlsc280", name: "Integrative and Quantitative Concepts in Biology", options: ["HLSC280"] },
    { kind: "course", id: "hlsc322", name: "Genetics and Genomics", options: ["HLSC322"] },
    { kind: "course", id: "hlsc102", name: "ILS Service-Learning Practicum", options: ["HLSC102"] },
    { kind: "course", id: "year-2-fall", name: "Second-year fall course", options: ["BSCI330H", "BSCI411H", "ENGL390H", "HLSC374", "HLTH234H", "HLTH264H"] },
    { kind: "course", id: "year-2-spring", name: "Second-year spring course", options: ["ENGL390H", "HLTH285H", "HLTH264H", "HLSC227"] },
  ],
};

export const honorsIlsMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://www.ils.umd.edu/courses" } };
