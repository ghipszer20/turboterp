// Honors College: Design Cultures & Creativity (DCC).
// Source: https://dcc.umd.edu/learning/curriculum/ ("Academic Program Requirements"; fetched 2026-09-25). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, HONORS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://dcc.umd.edu/learning/curriculum/";

export const honorsDcc: Program = {
  id: "honors-dcc",
  name: "Design Cultures & Creativity",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  minGrade: "C-",
  reviewNotes: [
    ...HONORS_CITATION_NOTES,
    `[check] "All students must earn at least a C- semester grade or higher in all HDCC coursework." Encoded as a program-wide C- minimum, which also applies to the non-HDCC 3-credit option.`,
    `[check] "All DCC students must complete 16 credits by the end of their sophomore year: HDCC105 (3 credits), HDCC106 (3 credits), HDCC201 (1 credit), HDCC208 (3 credits), HDCC209 (3 credits) And, 3 credits from ONE of the following four options". 13 + 3 = 16. The sophomore-year deadline isn't checked.`,
    `[check] HDCC106 and HDCC208 are seminars whose topics change yearly ("HDCC208A Music Composition", "HDCC208J GamePlay and Game Mechanics", …): encoded as any course numbered HDCC106 or HDCC208.`,
    `[check] 3-credit option: "HDCC379 Independent Study; HDCC378 Design & Creativity Abroad" are encoded.`,
    `[manual] The other 3-credit options: "a university 300/400-level course that centers methods, concepts, or technical skills of design, creative process, and/or technology, resulting in tangible deliverables", "another university-approved Study Abroad program", "a university-approved Internship Course". "No matter which option is chosen for the final 3 credits, students must communicate with the DCC Director to solicit approval of their choice."`,
    `[manual] "All students must successfully complete and present an original Capstone Project." / "maintain a GPA of 3.2 to remain in the Honors College, enroll in DCC courses, reside in Prince Frederick Hall".`,
  ],
  requirements: [
    { kind: "course", id: "hdcc105", name: "Introduction to Design Cultures & Creativity", options: ["HDCC105"] },
    { kind: "choose", id: "hdcc106", name: "Seminar in Design Cultures & Creativity (first year)", count: 1, from: { departments: ["HDCC"], minNumber: 106, maxNumber: 106 } },
    { kind: "course", id: "hdcc201", name: "Capstone Proposal through Design Thinking", options: ["HDCC201"] },
    { kind: "choose", id: "hdcc208", name: "Seminar in Design Cultures & Creativity (second year)", count: 1, from: { departments: ["HDCC"], minNumber: 208, maxNumber: 208 } },
    { kind: "course", id: "hdcc209", name: "Capstone in Design Cultures & Creativity", options: ["HDCC209"] },
    { kind: "course", id: "three-credit-option", name: "3-credit option (independent study or DCC abroad)", options: ["HDCC379", "HDCC378"] },
  ],
};

export const honorsDccMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://dcc.umd.edu/learning/curriculum/" } };
