// International Development and Conflict Management Minor, 2026–27 UMD Academic Catalog
// (Department of Government and Politics).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/government-politics/
// international-development-conflict-management-minor/ (fetched 2026-09-28); program site
// https://idcm.umd.edu/ (fetched 2026-09-28; homepage only, no requirements). No official
// published sample plan (constructed from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const gvptMinorIdcm: Program = {
  id: "gvpt-minor-idcm",
  name: "International Development and Conflict Management Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, International Development and Conflict Management Minor; " +
    "https://idcm.umd.edu/ not checked (homepage only) (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Department page not checked: https://idcm.umd.edu/ fetched as a marketing homepage with no requirements; encoded from the catalog alone.",
    "The 'Global Perspectives Elective' and 'one research methodology course' slots point to approved lists that the catalog page does not reproduce, so they are NOT encoded (no course range is named to accept). Manual check: 3 credits global perspectives elective + 3 credits research methods from the approved lists.",
    "'Six credits (or two courses) can be double counted for your major and the minor' -> maxSharedWith: [{ courses: 2 }] (same reading as the GEOL minors' 'six credits or two courses').",
    "'Classes must generally be completed after acceptance into the minor program' (except the elective and methods) is a timing rule, not encoded. Program GPA 2.0 encoded as minGpa.",
    "Total is 16 credits (GVPT357 practicum is 1 credit).",
  ],
  requirements: [
    { kind: "course", id: "idcm-intro", name: "International Development and Conflict Management", options: ["GVPT354"] },
    { kind: "course", id: "capstone-conflict", name: "Capstone in International Conflict Management", options: ["GVPT355"] },
    { kind: "course", id: "capstone-development", name: "Capstone in International Development", options: ["GVPT356"] },
    { kind: "course", id: "practicum", name: "IDCM Practicum Course", options: ["GVPT357"] },
  ],
};

export const gvptMinorIdcmMeta: ProgramMeta = { kind: "minor", college: "BSOS", short: "Intl Development and Conflict Mgmt", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/government-politics/international-development-conflict-management-minor/", department: "https://idcm.umd.edu/" } };
