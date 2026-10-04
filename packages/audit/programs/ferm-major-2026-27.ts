// Fermentation Science Major, 2026-27 UMD Academic Catalog (fetched 2026-09-28).
// Source: program-sources/fermentation-science-major.md. Catalog only; department page not checked.
// Encoded by hand. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";

const c = (id: string, name: string, ...options: string[]): Requirement => ({ kind: "course", id, name, options });

export const fermMajor: Program = {
  id: "ferm-major",
  name: "Fermentation Science Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Fermentation Science Major, https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/nutrition-food-science/fermentation-science-major/ (fetched 2026-09-28); department page not checked",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Department page not checked (none in program-sources); encoded from the catalog alone.",
    "The catalog's two AGST3XX rows (Viticulture and Enology; Brewing and Distilling, 4 credits each) name no course numbers. Encoded as one choose of 2 courses from all AGST 300-399 (never narrower); the two topic areas are not distinguished.",
    "The catalog's three NFSC4XX rows (Fermentation Science Laboratory, 4 credits; Cheese and Fermented Dairy Products, 3; Sensory Analysis Lab, 3) name no course numbers. Encoded as one choose of 3 courses from all NFSC 400-499 (a course counted by another requirement is not reused); the three topics are not distinguished.",
    "NFSC386 Experiential Learning is 3-6 credits; encoded as the required course, the credit range is not checked.",
    "Not encoded (engine gap): 87-90 total-credit range and cumulative GPA. The C- rule is applied as the program minGrade to every requirement. Suggested electives are not requirements. The catalog's four-year-plan section only links the college's general roadmap page, so the sample plan is CONSTRUCTED (official: false).",
  ],
  requirements: [
    c("bsci170", "Principles of Molecular & Cellular Biology (BSCI170)", "BSCI170"),
    c("bio-lab", "Principles Biology Laboratory or BSCI171 (BSCI180 or BSCI171)", "BSCI180", "BSCI171"),
    c("bsci223", "General Microbiology (BSCI223)", "BSCI223"),
    c("chem131", "Chemistry I - Fundamentals of General Chemistry (CHEM131)", "CHEM131"),
    c("chem132", "General Chemistry I Laboratory (CHEM132)", "CHEM132"),
    c("chem231", "Organic Chemistry I (CHEM231)", "CHEM231"),
    c("chem232", "Organic Chemistry Laboratory I (CHEM232)", "CHEM232"),
    c("chem241", "Organic Chemistry II (CHEM241)", "CHEM241"),
    c("chem242", "Organic Chemistry Laboratory II (CHEM242)", "CHEM242"),
    c("chem271", "General Chemistry and Energetics (CHEM271)", "CHEM271"),
    c("chem272", "General Bioanalytical Chemistry Laboratory (CHEM272)", "CHEM272"),
    c("engl101", "Academic Writing (ENGL101)", "ENGL101"),
    c("engl393", "Technical Writing 1 (ENGL393)", "ENGL393"),
    c("math120", "Elementary Calculus I (MATH120)", "MATH120"),
    c("nfsc112", "Food: Science and Technology (NFSC112)", "NFSC112"),
    c("bchm463", "Biochemistry of Physiology (BCHM463)", "BCHM463"),
    c("nfsc398", "Seminar (NFSC398)", "NFSC398"),
    c("nfsc421", "Food Chemistry (NFSC421)", "NFSC421"),
    c("nfsc423", "Food Chemistry Laboratory (NFSC423)", "NFSC423"),
    c("nfsc430", "Food Microbiology (NFSC430)", "NFSC430"),
    c("nfsc431", "Food Quality Control (NFSC431)", "NFSC431"),
    c("horticulture-crop", "Introduction to Horticulture or Introductory Crop Science (PLSC110 or PLSC112)", "PLSC110", "PLSC112"),
    c("plsc130", "Did Yeast Create Civilization? (PLSC130)", "PLSC130"),
    { kind: "choose", id: "agst-3xx", name: "Viticulture and Enology; Brewing and Distilling (two AGST 300-level courses)", count: 2, from: { departments: ["AGST"], minNumber: 300, maxNumber: 399 } },
    c("nfsc412", "Food Processing Technology (NFSC412)", "NFSC412"),
    c("nfsc341", "Fermented Food, Feed, and Pharmaceuticals (NFSC341)", "NFSC341"),
    { kind: "choose", id: "nfsc-4xx", name: "Fermentation Science Laboratory; Cheese and Fermented Dairy Products; Sensory Analysis Lab (three NFSC 400-level courses)", count: 3, from: { departments: ["NFSC"], minNumber: 400, maxNumber: 499 } },
    c("nfsc386", "Experiential Learning (NFSC386)", "NFSC386"),
  ],
};

export const fermMajorMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Fermentation Science",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/nutrition-food-science/fermentation-science-major/",
  },
};
