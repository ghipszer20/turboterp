// Journalism Major, Investigative Reporting Specialization, 2026-27 UMD Academic Catalog.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/journalism/journalism-major/
//   (fetched 2026-09-28). See jour-shared-2026-27.ts for the shared requirements and notes.
// Catalog only (department page not checked). UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { jourCommonReviewNotes, jourCore, jourSources } from "./jour-shared-2026-27.ts";

export const jourMajorInvestigative: Program = {
  id: "jour-major-investigative",
  name: "Journalism Major (Investigative Reporting Specialization)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Journalism Major, " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/journalism/journalism-major/ (fetched 2026-09-28)",
  verified: false,
  reviewNotes: [
    ...jourCommonReviewNotes,
    "Investigative Reporting Specialization (9 credits): the catalog row shows JOUR343 with no title " +
      "next to 'or JOUR353 (News Bureau: Multimedia Reporting)'; both are accepted. 'An approved JOUR " +
      "seminar course in the 410-469 range' has no approved list, so any JOUR410-469 course counts. All " +
      "three rows are overlays: JOUR472 also fills Media Research and the seminar can double as the " +
      "Journalism and Society course.",
  ],
  requirements: [
    ...jourCore,
    {
      kind: "choose",
      id: "investigative-bureau",
      name: "Investigative: JOUR343 or JOUR353 (News Bureau: Multimedia Reporting)",
      overlay: true,
      count: 1,
      from: { courses: ["JOUR343", "JOUR353"] },
    },
    {
      kind: "choose",
      id: "investigative-jour472",
      name: "Investigative: Data Journalism (JOUR472)",
      overlay: true,
      count: 1,
      from: { courses: ["JOUR472"] },
    },
    {
      kind: "choose",
      id: "investigative-seminar",
      name: "Investigative: approved JOUR seminar numbered 410-469",
      overlay: true,
      count: 1,
      from: { departments: ["JOUR"], minNumber: 410, maxNumber: 469 },
    },
  ],
};

export const jourMajorInvestigativeMeta: ProgramMeta = {
  kind: "major",
  college: "JOUR",
  short: "Journalism (Investigative Reporting)",
  major: "jour",
  track: "Investigative Reporting",
  sources: jourSources,
};
