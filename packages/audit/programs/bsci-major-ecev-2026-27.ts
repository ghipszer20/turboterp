// Biological Sciences Major, Ecology and Evolution (ECEV) Specialization, 2026–27 UMD Academic
// Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/biological-sciences/;
// Biological Sciences Undergraduate Program, "Ecology and Evolution ECEV (0404B)" degree sheet
// (effective August 2026), https://bsci.umd.edu/s/ECEV-Curriculum-2026.pdf (fetched 2026-09-27),
// and the ECEV Model Grad Plan, https://bsci.umd.edu/s/BSCI_ECEV-fall-2026-gradplan-ADA-2.pdf.
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const ECEV_300_LEVEL = ["BSCI331", "BSCI332", "BSCI333", "BSCI334", "BSCI335", "BSCI337", "BSCI360", "BSCI363", "BSCI366", "BSCI374", "BSCI392", "BSCI393"];
const ECEV_400_LEVEL = [
  "BSCI400", "BSCI401", "BSCI403", "BSCI405", "BSCI410", "BSCI426", "BSCI430", "BSCI431", "BSCI435", "BSCI462", "BSCI464",
  "BSCI467", "BSCI471", "BSCI473", "BSCI476", "BSCI477", "BSCI481", "BSCI483", "BSCI484", "BSCI487", "BSCI494", "BSCI497",
];
const ECEV_AREA_ALL = [...ECEV_300_LEVEL, ...ECEV_400_LEVEL];

export const bsciMajorEcev: Program = {
  id: "bsci-major-ecev",
  name: "Biological Sciences Major (Ecology and Evolution Specialization)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Biological Sciences Major; " +
    "Biological Sciences Undergraduate Program, Ecology and Evolution ECEV (0404B) degree sheet, " +
    "https://bsci.umd.edu/s/ECEV-Curriculum-2026.pdf (fetched 2026-09-27)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Basic Program and Supporting Courses are identical across every Biological Sciences specialization (see bsci-major-genb-2026-27.ts's review notes for the biology-lab, math-sequence and freshman-seminar encodings, which repeat here).",
    "The department's own Model Grad Plan lists BSCI361 (Principles of Ecology) at 3 credits; the degree sheet's own required-courses table lists it at 4 credits. The degree sheet's figure is used (department requirements page over department sample plan, per the owner's verification ruling).",
    "'14 credits of area courses, including two courses designated as Lab and two 400-level courses' is encoded as a 14-credit `choose` pool over the 300- and 400-level area lists, plus an overlay `choose` (count 2) over the 400-level list for the 400-level minimum. The Lab-designation minimum is not encoded -- no lab field on StudentCourse. BSCI484's footnote ('may act as an area Lab but may not fulfill one of the two 400-level courses required') is not enforced -- the 400-level overlay treats every 400-level course alike.",
    "'Enrichment: 3 credits, from any 300- or 400-level BSCI, CHEM, or BCHM course' is encoded as a `choose` credit pool over that department/number-range filter.",
    "Special Topics and honors seminars (BSCI328/338/339/348/439, BSCI378H/398H) and research/teaching credit toward Enrichment are not encoded -- variable section codes and/or advisor-gated.",
    "Not encoded (engine gap, both sources agree): the 2.0 cumulative (university) GPA requirement. Program GPA 2.0 encoded as minGpa.",
  ],
  requirements: [
    { kind: "course", id: "bsci160", name: "Ecology and Evolution 1", options: ["BSCI160"] },
    { kind: "course", id: "bsci170", name: "Molecular and Cellular Biology 1", options: ["BSCI170"] },
    { kind: "sets", id: "biology-lab", name: "Principles of Biology Lab", options: [["BSCI180"], ["BSCI161", "BSCI171"]] },
    { kind: "course", id: "bsci207", name: "Organismal Biology", options: ["BSCI207"] },
    { kind: "course", id: "bsci222", name: "Principles of Genetics", options: ["BSCI222"] },
    { kind: "course", id: "freshman-seminar", name: "Freshman seminar", options: ["CMNS100", "UNIV100", "HLSC100", "HACS100", "HDCC105", "HHUM105"] },
    { kind: "course", id: "chem131", name: "General Chemistry I Lecture", options: ["CHEM131"] },
    { kind: "course", id: "chem132", name: "General Chemistry I Lab", options: ["CHEM132"] },
    { kind: "course", id: "chem231", name: "Organic Chemistry I Lecture", options: ["CHEM231"] },
    { kind: "course", id: "chem232", name: "Organic Chemistry I Lab", options: ["CHEM232"] },
    { kind: "course", id: "chem241", name: "Organic Chemistry II Lecture", options: ["CHEM241"] },
    { kind: "course", id: "chem242", name: "Organic Chemistry II Lab", options: ["CHEM242"] },
    { kind: "course", id: "chem271", name: "General Chemistry II Lecture", options: ["CHEM271"] },
    { kind: "course", id: "chem272", name: "General Chemistry II Lab", options: ["CHEM272"] },
    { kind: "sets", id: "math-sequence", name: "Math sequence", options: [["MATH135", "MATH136"], ["MATH135", "MATH140"], ["MATH140", "MATH141"]] },
    { kind: "course", id: "phys131", name: "Physics I", options: ["PHYS131"] },
    { kind: "course", id: "phys132", name: "Physics II", options: ["PHYS132"] },
    { kind: "course", id: "bsci361", name: "Principles of Ecology", options: ["BSCI361"] },
    { kind: "course", id: "bsci370", name: "Principles of Evolution", options: ["BSCI370"] },
    { kind: "choose", id: "statistics", name: "Statistics course", count: 1, from: { courses: ["BIOM301", "STAT400", "STAT464"] } },
    { kind: "choose", id: "ecev-area-credits", name: "ECEV Area courses (14 credits)", credits: 14, from: { courses: ECEV_AREA_ALL } },
    { kind: "choose", id: "ecev-400level-min", name: "At least two 400-level area courses", count: 2, overlay: true, from: { courses: ECEV_400_LEVEL } },
    { kind: "choose", id: "enrichment", name: "Enrichment (3 credits)", credits: 3, from: { departments: ["BSCI", "CHEM", "BCHM"], minNumber: 300, maxNumber: 499 } },
  ],
};

export const bsciMajorEcevMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "Bio Sci (Ecology & Evolution)", major: "bsci", track: "Ecology and Evolution", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/biological-sciences/", department: "https://bsci.umd.edu/s/ECEV-Curriculum-2026.pdf" } };
