// Computer Engineering Minor, 2026–27 UMD Academic Catalog (Department of Electrical and Computer Engineering).
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/electrical-and-computer/computer-engineering-minor/
// (fetched 2026-09-28). No department page was provided ("department page not checked").
// No official published sample plan (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const compeMinor: Program = {
  id: "compe-minor",
  name: "Computer Engineering Minor",
  catalogYear: "2026-27",
  source: "UMD Academic Catalog 2026–27, Computer Engineering Minor (fetched 2026-09-28); department page not checked",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Department page not checked (none provided); encoded from the catalog alone.",
    "Prerequisites ENEE150 and MATH141 must be passed with B- or higher (catalog); encoded as their own requirements with minGrade B-. They are not part of the 18 minor credits (ENEE244 3 + ENEE245 2 + ENEE350 3 + ENEE351 4 + two electives 6).",
    "Topics courses ENEE359 and ENEE459 are listed by section (ENEE359F/359X, ENEE459C/459E/459P/459V); the audit sees course codes only, so the whole course code is accepted and two different topics of the same code count once. Manual check.",
    "Neither source states a sharing cap, so none is set. The catalog states no eligibility gate; Electrical Engineering majors have satisfied the prerequisites via their major.",
  ],
  requirements: [
    { kind: "course", id: "enee150", name: "Prerequisite: Introduction to Programming Concepts for Engineers", options: ["ENEE150"], minGrade: "B-" },
    { kind: "course", id: "math141", name: "Prerequisite: Calculus II", options: ["MATH141"], minGrade: "B-" },
    { kind: "course", id: "enee244", name: "Digital Logic Design", options: ["ENEE244"] },
    { kind: "course", id: "enee245", name: "Digital Circuits and Systems Laboratory", options: ["ENEE245"] },
    { kind: "course", id: "enee350", name: "Computer Organization", options: ["ENEE350"] },
    { kind: "course", id: "enee351", name: "Algorithms and Data Structures", options: ["ENEE351"] },
    {
      kind: "choose",
      id: "electives",
      name: "Two elective courses",
      count: 2,
      from: { courses: ["ENEE359", "ENEE436", "ENEE440", "ENEE446", "ENEE457", "ENEE459"] },
    },
  ],
};

export const compeMinorMeta: ProgramMeta = { kind: "minor", college: "ENGR", short: "Computer Eng. Minor", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/electrical-and-computer/computer-engineering-minor/" } };
