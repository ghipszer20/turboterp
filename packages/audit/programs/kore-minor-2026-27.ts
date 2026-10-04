// Korean Studies Minor, 2026–27 UMD Academic Catalog (School of Languages, Literatures, and Cultures).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/korean-studies-minor/
// and https://sllc.umd.edu/korean (both fetched 2026-09-28). The department page is a program homepage
// with no requirements, so the encoding follows the catalog. No official sample plan (built from the
// requirements; see docs/project/owner-review.md). Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const LANGUAGE = ["KORA201", "KORA202", "KORA211", "KORA212", "KORA241", "KORA242", "KORA311", "KORA312", "KORA345"];
const KOREA_RELATED = ["HIST319", "SOCY398", "HIST284", "HIST285", "EALL300", "GVPT359", "ARTH290"];

export const koreMinor: Program = {
  id: "kore-minor-studies",
  name: "Korean Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Korean Studies Minor; SLLC Korean program, https://sllc.umd.edu/korean (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Department page not checked: https://sllc.umd.edu/korean carries no requirements. Encoded from the catalog.",
    "Korea-related slot: the catalog names seven example courses (some are special-topics sections such as HIST319N, SOCY398K, HIST319C, GVPT359C, recorded by base course) 'from fields such as history, sociology, and art history', and allows other Korea-related courses with Korean Program advisor approval. Encoded as three of the seven listed courses; other Korea-related courses may count with advisor approval (the korea-related requirement is marked advisorMayApprove). This is narrower than the source, so flagged.",
    "Not enforced: at least one Korea-related course with broad East Asian content (HIST284, HIST285, EALL300, ARTH290 and HIST319C are marked); the engine cannot check it. Both language courses must be at the second-year level or above (all listed ones are).",
    "'Three of the five courses at 3xx/4xx' is an overlay over the listed courses numbered 300-499 (KORA311/312/345, HIST319, SOCY398, GVPT359); advisor-approved 3xx/4xx courses are not counted.",
    "'No more than six credits can overlap with the major' -> maxSharedWith: [{ credits: 6 }]. Manual: no more than six credits off-campus (study abroad, transfer); Big10 CIC courseshare courses are considered by the advisor.",
  ],
  requirements: [
    { kind: "choose", id: "language", name: "Two Korean language or language-related courses (second-year level or above)", count: 2, from: { courses: LANGUAGE } },
    { kind: "choose", id: "korea-related", advisorMayApprove: true, name: "Three Korea-related courses", count: 3, from: { courses: KOREA_RELATED } },
    {
      kind: "choose",
      id: "upper-level",
      name: "Three of the five courses at the 3xx or 4xx level",
      overlay: true,
      count: 3,
      from: { courses: [...LANGUAGE, ...KOREA_RELATED], minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const koreMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Korean Studies",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/korean-studies-minor/",
    department: "https://sllc.umd.edu/korean",
  },
};
