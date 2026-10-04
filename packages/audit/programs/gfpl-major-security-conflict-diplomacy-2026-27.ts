// Global and Foreign Policy Major, Security, Conflict, and Diplomacy track, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/public-policy/global-and-foreign-policy-major/
// and spp.umd.edu/your-education/undergraduate/bachelor-arts-global-and-foreign-policy (fetched
// 2026-09-28). Owner ruling: the department page wins where it disagrees with the catalog; see
// gfpl-shared-2026-27.ts reviewNotes for the differences found.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { gfplSharedRequirements, gfplSharedReviewNotes } from "./gfpl-shared-2026-27.ts";

export const gfplMajorSecurityConflictDiplomacy: Program = {
  id: "gfpl-major-security-conflict-diplomacy",
  name: "Global and Foreign Policy Major (Security, Conflict, and Diplomacy)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Global and Foreign Policy Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/public-policy/global-and-foreign-policy-major/); " +
    "School of Public Policy department page " +
    "(https://spp.umd.edu/your-education/undergraduate/bachelor-arts-global-and-foreign-policy) (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Open slot 'track-electives' (openSlot requirement): 6 credits, Security, Conflict, and Diplomacy Track Elective Courses (two courses 'linked to that track', from SPP or " +
      "elsewhere on campus). The linked approved-course list is not in the fetched source, so the student confirms it with their advisor rather than the audit narrowing it.",
    ...gfplSharedReviewNotes,
  ],
  requirements: [
    ...gfplSharedRequirements,
    {
      kind: "openSlot",
      id: "track-electives",
      name: "Security, Conflict, and Diplomacy track electives",
      credits: 6,
      note: "Two courses linked to the track, from SPP or elsewhere on campus, from the approved list; confirm with your advisor.",
    },
    { kind: "course", id: "track-anchor", name: "Track Anchor Course: GFPL371 Foundations of Security, Conflict, and Diplomacy", options: ["GFPL371"] },
  ],
};

export const gfplMajorSecurityConflictDiplomacyMeta: ProgramMeta = {
  kind: "major",
  college: "PLCY",
  short: "Global and Foreign Policy (Security, Conflict, and Diplomacy)",
  major: "gfpl",
  track: "Security, Conflict, and Diplomacy",
  defaultTrack: true,
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/public-policy/global-and-foreign-policy-major/",
    department: "https://spp.umd.edu/your-education/undergraduate/bachelor-arts-global-and-foreign-policy",
  },
};
