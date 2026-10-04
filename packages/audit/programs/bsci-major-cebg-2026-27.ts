// Biological Sciences Major, Cell Biology and Genetics (CEBG) Specialization, 2026–27 UMD
// Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/biological-sciences/;
// Biological Sciences Undergraduate Program, "Cell Biology and Genetics CEBG (0404A)" degree sheet
// (effective August 2026), https://bsci.umd.edu/s/CEBG-Curriculum-2026.pdf (fetched 2026-09-27),
// and the CEBG Model Grad Plan, https://bsci.umd.edu/s/BSCI_CEBG-fall-2026-gradplan-ADA-2.pdf.
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const CEBG_CELL_BIOLOGY_GROUP = [
  "BSCI343", "BSCI353", "BSCI404", "BSCI406", "BSCI417", "BSCI422", "BSCI423", "BSCI430", "BSCI432", "BSCI433", "BSCI436", "BSCI442", "BSCI443", "BSCI455",
];
const CEBG_GENETICS_GROUP = ["BSCI381", "BSCI382", "BSCI405", "BSCI411", "BSCI412", "BSCI414", "BSCI415", "BSCI416", "BCHM465"];
// Optional (no more than one statistics course; not enforced) and optional additional courses --
// pooled into the area credit total but not assigned to either group.
const CEBG_AREA_OPTIONAL = ["BIOM301", "STAT400", "STAT464", "BSCI223", "BSCI283", "BSCI374", "BSCI425", "BSCI427", "BSCI435", "BSCI437", "BCHM464"];
const CEBG_AREA_ALL = [...CEBG_CELL_BIOLOGY_GROUP, ...CEBG_GENETICS_GROUP, ...CEBG_AREA_OPTIONAL];

export const bsciMajorCebg: Program = {
  id: "bsci-major-cebg",
  name: "Biological Sciences Major (Cell Biology and Genetics Specialization)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Biological Sciences Major; " +
    "Biological Sciences Undergraduate Program, Cell Biology and Genetics CEBG (0404A) degree sheet, " +
    "https://bsci.umd.edu/s/CEBG-Curriculum-2026.pdf (fetched 2026-09-27)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Basic Program and Supporting Courses are identical across every Biological Sciences specialization (see bsci-major-genb-2026-27.ts's review notes for the biology-lab, math-sequence and freshman-seminar encodings, which repeat here).",
    "'Area Courses: 8 credits, including at least one from the Cell Biology group and one from the Genetics Group' is encoded as an 8-credit `choose` pool over both groups (plus the optional statistics and additional courses), with two overlay `choose` requirements (count 1 each) checking each group's minimum without using up a separate course slot.",
    "'Enrichment: 3 credits, from any 300- or 400-level BSCI, CHEM, or BCHM course' is encoded as a `choose` credit pool over that department/number-range filter directly (the department page's own wording is already filter-shaped, unlike the Area courses above).",
    "'Two courses designated as Lab' is not encoded -- no lab-designation field on StudentCourse.",
    "Special Topics, honors seminars, and research/internship/teaching-practicum credit toward Enrichment (BSCI328/338/339/348/439, BSCI378H/398H, BSCI349/359/379/389/399) are not encoded -- variable section codes and/or advisor-gated, credit-count-limited in ways the engine can't track.",
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
    { kind: "course", id: "bchm461", name: "Biochemistry I", options: ["BCHM461"] },
    { kind: "course", id: "bchm462", name: "Biochemistry II", options: ["BCHM462"] },
    { kind: "course", id: "bsci331", name: "Cell Biology & Physiology", options: ["BSCI331"] },
    { kind: "course", id: "bsci332", name: "Cell Biology & Physiology Lab", options: ["BSCI332"] },
    { kind: "course", id: "bsci410", name: "Molecular Genetics", options: ["BSCI410"] },
    { kind: "course", id: "bsci420", name: "Cell Biology Lectures", options: ["BSCI420"] },
    { kind: "choose", id: "cebg-area-credits", name: "CEBG Area courses (8 credits)", credits: 8, from: { courses: CEBG_AREA_ALL } },
    { kind: "choose", id: "cebg-cellbio-min", name: "At least one Cell Biology area course", count: 1, overlay: true, from: { courses: CEBG_CELL_BIOLOGY_GROUP } },
    { kind: "choose", id: "cebg-genetics-min", name: "At least one Genetics area course", count: 1, overlay: true, from: { courses: CEBG_GENETICS_GROUP } },
    { kind: "choose", id: "enrichment", name: "Enrichment (3 credits)", credits: 3, from: { departments: ["BSCI", "CHEM", "BCHM"], minNumber: 300, maxNumber: 499 } },
  ],
};

export const bsciMajorCebgMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "Bio Sci (Cell Biology & Genetics)", major: "bsci", track: "Cell Biology and Genetics", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/biological-sciences/", department: "https://bsci.umd.edu/s/CEBG-Curriculum-2026.pdf" } };
