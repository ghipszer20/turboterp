// Language House living-learning program (School of Languages, Literatures, and Cultures).
// Source: https://sllc.umd.edu/special-programs/language-house/info-current-students-mentors
// ("Coursework & Residency Requirements"; fetched 2026-09-25). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://sllc.umd.edu/special-programs/language-house/info-current-students-mentors";

export const languageHouse: Program = {
  id: "llp-language-house",
  name: "Language House",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "Enroll in SLLC 329, Language House Immersion (1-credit course). This course is repeatable and may be taken for a letter grade or pass/fail." Encoded as SLLC329 once; the program's length varies ("Students from any year … are encouraged to apply"), so the per-semester repetition isn't checked.`,
    `[manual] "Enroll in and complete at least one 3-credit course in the target language and/or culture each semester you are enrolled in the Language House and work to receive a final grade of "B" or higher." The target language and semesters vary by student; the student confirms it.`,
    `[manual] "students in the Language House are required to have one meeting per week with their cluster members and mentor" and "are required to live in St. Mary's Hall".`,
  ],
  requirements: [{ kind: "course", id: "sllc329", name: "Language House Immersion", options: ["SLLC329"] }],
};

export const languageHouseMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://sllc.umd.edu/special-programs/language-house/info-current-students-mentors" } };
