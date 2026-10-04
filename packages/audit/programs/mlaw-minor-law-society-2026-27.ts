// Law and Society Minor, 2026–27 UMD Academic Catalog (BSOS; administered by MLAW).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/law-society-minor/
// (fetched 2026-09-28); https://mlaw.umd.edu/ (fetched 2026-09-28; homepage only, no requirements).
// No official published sample plan (constructed from the requirements below; see
// docs/project/owner-review.md). Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const mlawMinorLawSociety: Program = {
  id: "mlaw-minor-law-society",
  name: "Law and Society Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Law and Society Minor; https://mlaw.umd.edu/ not checked " +
    "(homepage only) (fetched 2026-09-28)",
  verified: false,
  reviewNotes: [
    "Department page not checked: https://mlaw.umd.edu/ fetched as a homepage with no requirements; encoded from the catalog alone.",
    "'Law and Society Electives' (6 credits) names no courses or range on the catalog page, so it is NOT encoded. Manual check: 6 credits of approved Law and Society electives.",
    "The catalog states no minimum grade and no sharing cap; none is set.",
  ],
  requirements: [
    { kind: "course", id: "mlaw304", name: "Introduction to Law and Social Inquiry", options: ["MLAW304"] },
    { kind: "course", id: "mlaw305", name: "Law and Legal Institutions in Social Context", options: ["MLAW305"] },
    { kind: "course", id: "internship", name: "Law and Society Internship", options: ["MLAW388"] },
    { kind: "course", id: "capstone", name: "Law and Society Capstone", options: ["MLAW404"] },
  ],
};

export const mlawMinorLawSocietyMeta: ProgramMeta = { kind: "minor", college: "BSOS", short: "Law and Society", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/law-society-minor/", department: "https://mlaw.umd.edu/" } };
