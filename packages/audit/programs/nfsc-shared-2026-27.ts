// Shared building blocks for the Nutrition and Food Science Major's three concentrations
// (Dietetics, Food Science, Nutritional Science), 2026-27 UMD Academic Catalog (fetched 2026-09-28).
// Not a program file (no *Meta export). Source: program-sources/nutrition-food-science-major.md.
// Catalog only; department page not checked.

import type { Requirement } from "../src/audit.ts";

export const nfscCatalogUrl =
  "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/nutrition-food-science/nutrition-food-science-major/";

export const nfscC = (id: string, name: string, ...options: string[]): Requirement => ({ kind: "course", id, name, options });

/** Base Curriculum for All Concentrations. */
export const nfscBase: Requirement[] = [
  nfscC("nfsc100", "Elements of Nutrition (NFSC100)", "NFSC100"),
  nfscC("nfsc112", "Food: Science and Technology (NFSC112)", "NFSC112"),
  nfscC("bsci170", "Principles of Molecular & Cellular Biology (BSCI170)", "BSCI170"),
  nfscC("bio-lab", "Principles Biology Laboratory or BSCI171 (BSCI180 or BSCI171)", "BSCI180", "BSCI171"),
  nfscC("bsci223", "General Microbiology (BSCI223)", "BSCI223"),
  nfscC("chem131", "Chemistry I - Fundamentals of General Chemistry (CHEM131)", "CHEM131"),
  nfscC("chem132", "General Chemistry I Laboratory (CHEM132)", "CHEM132"),
  nfscC("chem231", "Organic Chemistry I (CHEM231)", "CHEM231"),
  nfscC("chem232", "Organic Chemistry Laboratory I (CHEM232)", "CHEM232"),
  nfscC("chem241", "Organic Chemistry II (CHEM241)", "CHEM241"),
  nfscC("chem242", "Organic Chemistry Laboratory II (CHEM242)", "CHEM242"),
  nfscC("chem271", "General Chemistry and Energetics (CHEM271)", "CHEM271"),
  nfscC("chem272", "General Bioanalytical Chemistry Laboratory (CHEM272)", "CHEM272"),
];

export const nfscCommonReviewNotes: string[] = [
  "Department page not checked (none in program-sources); encoded from the catalog alone.",
  "The catalog's 'select one concentration' (Dietetics, Food Science, Nutritional Science) is encoded as three programs sharing the nfsc major key; Dietetics (first-listed) is the default track. The Base Curriculum is shared (nfsc-shared-2026-27.ts).",
  "The C- rule (all NFSC courses and certain supporting courses; the list is available only from the department office) is encoded as the program minGrade C- on every requirement, which is wider than the catalog's 'certain supporting courses'.",
  "'Alternate course by approval of advisor' on every restricted elective list is not encodable (manual).",
  "Not encoded (engine gap): total-credit ranges and cumulative GPA. No official four-year plan (the catalog only links the college's general roadmap page), so the sample plan is CONSTRUCTED (official: false).",
];
