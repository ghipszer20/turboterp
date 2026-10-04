// Journalism Major, Sports Specialization, 2026-27 UMD Academic Catalog.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/journalism/journalism-major/
//   (fetched 2026-09-28). See jour-shared-2026-27.ts for the shared requirements and notes.
// Catalog only (department page not checked). UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { jourCommonReviewNotes, jourCore, jourSources } from "./jour-shared-2026-27.ts";

export const jourMajorSports: Program = {
  id: "jour-major-sports",
  name: "Journalism Major (Sports Specialization)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Journalism Major, " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/journalism/journalism-major/ (fetched 2026-09-28)",
  verified: false,
  reviewNotes: [
    ...jourCommonReviewNotes,
    "Sports Specialization (11-21 credits): which JOUR courses count as 'sports' skills or seminar " +
      "courses is not listed in the source, so those rows accept any JOUR course in 321-389 and " +
      "410-469 respectively, as overlays.",
    "Sports capstone course, 3-9 credits: covered by the shared 'capstone-experience' openSlot requirement (no separate slot); if a second " +
      "sports capstone replaces the experiential course, each is limited to 6 credits).",
    "Open slot 'sports-experiential' (openSlot requirement): sports experiential course, 2 credits minimum (range 2-6): an approved sports internship for JOUR396 (the " +
      "core JOUR396 already covers 2 credits) or a second sports-focused capstone. Which internships are " +
      "sports-approved is not stated.",
  ],
  requirements: [
    ...jourCore,
    {
      kind: "openSlot",
      id: "sports-experiential",
      name: "Sports experiential course",
      credits: 2,
      note: "An approved sports internship for JOUR396 or a second sports-focused capstone (2-6 credits); the catalog does not say which internships are sports-approved, so confirm with your advisor.",
    },
    {
      kind: "choose",
      id: "sports-skills",
      name: "Sports skills JOUR course from the 321-389 range",
      overlay: true,
      count: 1,
      from: { departments: ["JOUR"], minNumber: 321, maxNumber: 389 },
    },
    {
      kind: "choose",
      id: "sports-seminar",
      name: "Sports discussion/seminar JOUR course from the 410-469 range",
      overlay: true,
      count: 1,
      from: { departments: ["JOUR"], minNumber: 410, maxNumber: 469 },
    },
  ],
};

export const jourMajorSportsMeta: ProgramMeta = {
  kind: "major",
  college: "JOUR",
  short: "Journalism (Sports)",
  major: "jour",
  track: "Sports",
  sources: jourSources,
};
