// Shared building blocks for the Plant Sciences Major's three specializations (Plant Biology,
// Turf and Golf Course Management, Urban Forestry), 2026-27 UMD Academic Catalog (fetched 2026-09-28).
// Not a program file (no *Meta export). Source: program-sources/plant-sciences-major.md.

import type { Requirement } from "../src/audit.ts";

export const plscCatalogUrl =
  "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/plant-sciences-landscape-architecture/plant-sciences-major/";
export const plscDepartmentUrl = "https://psla.umd.edu/undergraduate/plant-sciences";

export const plscC = (id: string, name: string, ...options: string[]): Requirement => ({ kind: "course", id, name, options });

/** A base-table course: the catalog's "C-" applies to it (footnote 1). */
const base = (id: string, name: string, ...options: string[]): Requirement => ({ ...plscC(id, name, ...options), minGrade: "C-" });

/** Requirements for all Areas of Concentration. "C-" or better everywhere except ENGL101 and ENGL393. */
export const plscBase: Requirement[] = [
  base("chem131", "Chemistry I - Fundamentals of General Chemistry (CHEM131)", "CHEM131"),
  base("chem132", "General Chemistry I Laboratory (CHEM132)", "CHEM132"),
  plscC("engl101", "Academic Writing (ENGL101)", "ENGL101"),
  plscC("engl393", "Technical Writing (ENGL393)", "ENGL393"),
  base("enst200", "Fundamentals of Soil Science (ENST200)", "ENST200"),
  base("math-algebra", "College Algebra and Trigonometry or Precalculus (MATH113 or MATH115)", "MATH113", "MATH115"),
  {
    kind: "sets",
    id: "plsc-intro",
    name: "Introduction to Horticulture and Lab (PLSC110 & PLSC111) or Introductory Crop Science and Lab (PLSC112 & PLSC113)",
    options: [
      ["PLSC110", "PLSC111"],
      ["PLSC112", "PLSC113"],
    ],
    minGrade: "C-",
  },
  base("plsc398", "Seminar (PLSC398)", "PLSC398"),
];

export const plscCommonReviewNotes: string[] = [
  "The catalog's 'select a specialization' (Plant Biology, Turf and Golf Course Management, Urban Forestry) is encoded as three programs sharing the plsc major key; Plant Biology (first-listed) is the default track. The all-areas requirements are shared (plsc-shared-2026-27.ts).",
  "The 'C-' or better rule covers the all-areas table except ENGL101 and ENGL393; it is encoded per requirement on exactly those courses, not program-wide.",
  "The department page (psla.umd.edu) lists no course requirements, only the three areas of concentration and their descriptions; requirements are from the catalog alone.",
  "Several catalog rows lost their course titles in the source (for example PLSC202, PLSC361, PLSC403, PLSC456, PLSC474); they are encoded by course id.",
  "Not encoded (engine gap): total-credit ranges (70-77 with the specialization). No official four-year plan (the catalog only links the college's general roadmap page), so the sample plan is CONSTRUCTED (official: false).",
];
