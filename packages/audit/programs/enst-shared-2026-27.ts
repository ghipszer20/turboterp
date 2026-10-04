// Shared building blocks for the Environmental Science and Technology Major's four concentrations
// (Ecological Technology Design, Ecosystem Health, Applied Ecology and Natural Resources, Soil and
// Watershed Science), 2026-27 UMD Academic Catalog (fetched 2026-09-28).
// Not a program file (no *Meta export). Source: program-sources/environmental-science-technology-major.md.

import type { Requirement } from "../src/audit.ts";

export const enstCatalogUrl =
  "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/environmental-science-technology/environmental-science-technology-major/";
export const enstDepartmentUrl = "https://enst.umd.edu/";

export const enstC = (id: string, name: string, ...options: string[]): Requirement => ({ kind: "course", id, name, options });

/** ENST Core for all Areas of Concentration, plus the Senior Integrative Experience. */
export const enstCore: Requirement[] = [
  enstC("bsci160", "Principles of Ecology and Evolution (BSCI160)", "BSCI160"),
  enstC("bsci170", "Principles of Molecular & Cellular Biology (BSCI170)", "BSCI170"),
  enstC("bio-lab", "Principles Biology Laboratory or BSCI171 (BSCI180 or BSCI171)", "BSCI180", "BSCI171"),
  enstC("math120", "Elementary Calculus I (MATH120)", "MATH120"),
  enstC("chem131", "Chemistry I - Fundamentals of General Chemistry (CHEM131)", "CHEM131"),
  enstC("chem132", "General Chemistry I Laboratory (CHEM132)", "CHEM132"),
  enstC("enst200", "Fundamentals of Soil Science (ENST200)", "ENST200"),
  enstC("enst233", "Introduction to Environmental Health (ENST233)", "ENST233"),
  enstC("chem231", "Organic Chemistry I (CHEM231)", "CHEM231"),
  enstC("chem232", "Organic Chemistry Laboratory I (CHEM232)", "CHEM232"),
  enstC("phys121", "Fundamentals of Physics I (PHYS121)", "PHYS121"),
  enstC("statistics", "Statistics (ENST321, GEOG306 or BIOM301)", "ENST321", "GEOG306", "BIOM301"),
  enstC("enst360", "Ecosystem Ecology (ENST360)", "ENST360"),
  enstC("enst389", "Internship (ENST389)", "ENST389"),
  enstC("senior-experience", "Senior Integrative Experience (ENST388, ENST470, ENST486 or ENST472)", "ENST388", "ENST470", "ENST486", "ENST472"),
];

export const enstCommonReviewNotes: string[] = [
  "Department page (enst.umd.edu) is a homepage with no requirements (it announces the new Chesapeake Bay minor only); encoded from the catalog alone.",
  "The catalog's four Areas of Concentration are encoded as four programs sharing the enst major key; Ecological Technology Design (first-listed) is the default track. The ENST Core and Senior Integrative Experience are shared (enst-shared-2026-27.ts).",
  "The catalog's C- rule ('all courses counted toward the major') is the program minGrade C-.",
  "Program GPA 2.0 encoded as minGpa.",
  "Not encoded (engine gap): total credits (120) and 'under some circumstances other 300 or 400 level electives can be substituted with advisor's approval' (manual).",
  "No official four-year plan (the catalog only links the college's general roadmap page and 4yearplans.umd.edu), so the sample plan is CONSTRUCTED (official: false).",
];
