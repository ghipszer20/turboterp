// Journalism Major, no specialization (default track), 2026-27 UMD Academic Catalog.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/journalism/journalism-major/
//   (fetched 2026-09-28). See jour-shared-2026-27.ts for the shared requirements and notes.
// Catalog only (department page not checked). UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { jourCommonReviewNotes, jourCore, jourSources } from "./jour-shared-2026-27.ts";

export const jourMajor: Program = {
  id: "jour-major",
  name: "Journalism Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Journalism Major, " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/journalism/journalism-major/ (fetched 2026-09-28)",
  verified: false,
  reviewNotes: [
    ...jourCommonReviewNotes,
    "No specialization: the catalog's specializations are optional, so this default track is the bare required courses.",
  ],
  requirements: [...jourCore],
};

export const jourMajorMeta: ProgramMeta = {
  kind: "major",
  college: "JOUR",
  short: "Journalism",
  major: "jour",
  track: "General",
  defaultTrack: true,
  sources: jourSources,
};
