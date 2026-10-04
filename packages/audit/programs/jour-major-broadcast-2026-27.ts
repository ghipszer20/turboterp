// Journalism Major, Broadcast Specialization, 2026-27 UMD Academic Catalog.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/journalism/journalism-major/
//   (fetched 2026-09-28). See jour-shared-2026-27.ts for the shared requirements and notes.
// Catalog only (department page not checked). UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { jourCommonReviewNotes, jourCore, jourSources } from "./jour-shared-2026-27.ts";

export const jourMajorBroadcast: Program = {
  id: "jour-major-broadcast",
  name: "Journalism Major (Broadcast Specialization)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Journalism Major, " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/journalism/journalism-major/ (fetched 2026-09-28)",
  verified: false,
  reviewNotes: [
    ...jourCommonReviewNotes,
    "Broadcast Specialization (9-15 credits): JOUR347 and JOUR360 are overlays because they also fill " +
      "Menu 1 and Menu 2. The third row, an approved broadcast capstone (3-9 credits; several also " +
      "require JOUR361), is covered by the shared 'capstone-experience' openSlot requirement (no separate slot, to avoid double-counting).",
  ],
  requirements: [
    ...jourCore,
    {
      kind: "choose",
      id: "broadcast-jour347",
      name: "Broadcast: News Videography (JOUR347)",
      overlay: true,
      count: 1,
      minGrade: "C-",
      from: { courses: ["JOUR347"] },
    },
    {
      kind: "choose",
      id: "broadcast-jour360",
      name: "Broadcast: News Writing and Reporting II: Broadcast (JOUR360)",
      overlay: true,
      count: 1,
      minGrade: "C-",
      from: { courses: ["JOUR360"] },
    },
  ],
};

export const jourMajorBroadcastMeta: ProgramMeta = {
  kind: "major",
  college: "JOUR",
  short: "Journalism (Broadcast)",
  major: "jour",
  track: "Broadcast",
  sources: jourSources,
};
