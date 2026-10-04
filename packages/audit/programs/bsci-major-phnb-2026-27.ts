// Biological Sciences Major, Physiology and Neurobiology (PHNB) Specialization, 2026–27 UMD
// Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/biological-sciences/;
// Biological Sciences Undergraduate Program, "Physiology and Neurobiology PHNB (0404E)" degree
// sheet (effective August 2026), https://bsci.umd.edu/s/PHNB-Curriculum-2026.pdf (fetched
// 2026-09-27), and the PHNB Model Grad Plan, https://bsci.umd.edu/s/BSCI_PHNB-fall-2026-gradplan-ADA-2.pdf.
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const PHNB_LECTURES = [
  "BSCI343", "BSCI355", "BSCI357", "BSCI360", "BSCI370", "BSCI381", "BSCI401", "BSCI402", "BSCI403", "BSCI404", "BSCI406",
  "BSCI410", "BSCI416", "BSCI420", "BSCI422", "BSCI430", "BSCI431", "BSCI433", "BSCI443", "BSCI446", "BSCI447", "BSCI452",
  "BSCI453", "BSCI456", "BSCI483", "BCHM462", "BCHM465",
];
const PHNB_LABS = ["BSCI374", "BSCI414", "BSCI423", "BSCI424", "BSCI425", "BSCI435", "BSCI442", "BSCI451", "BSCI455", "BSCI484", "BCHM464"];
// Optional statistics course (no more than one; not enforced), pooled into the area credit total.
const PHNB_AREA_OPTIONAL = ["BIOM301", "STAT400", "STAT464"];
const PHNB_AREA_ALL = [...PHNB_LECTURES, ...PHNB_LABS, ...PHNB_AREA_OPTIONAL];

export const bsciMajorPhnb: Program = {
  id: "bsci-major-phnb",
  name: "Biological Sciences Major (Physiology and Neurobiology Specialization)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Biological Sciences Major; " +
    "Biological Sciences Undergraduate Program, Physiology and Neurobiology PHNB (0404E) degree sheet, " +
    "https://bsci.umd.edu/s/PHNB-Curriculum-2026.pdf (fetched 2026-09-27)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Basic Program and Supporting Courses are identical across every Biological Sciences specialization (see bsci-major-genb-2026-27.ts's review notes for the biology-lab, math-sequence and freshman-seminar encodings, which repeat here).",
    "'Area courses: 11 credits' plus 'PHNB Area Labs (At least one)' is encoded as an 11-credit `choose` pool over the lecture list, the lab list and the optional statistics course, with an overlay `choose` (count 1) over the lab list for the at-least-one-Lab minimum.",
    "'Enrichment: 3 credits, from any 300- or 400-level BSCI, CHEM, or BCHM course' is encoded as a `choose` credit pool over that department/number-range filter.",
    "Special Topics and honors seminars (BSCI328/338/339/348/439, BSCI378H/398H) toward Area are not encoded -- variable section codes and/or advisor-gated.",
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
    { kind: "course", id: "bsci331", name: "Cell Biology & Physiology", options: ["BSCI331"] },
    { kind: "course", id: "bsci332", name: "Cell Biology & Physiology Lab", options: ["BSCI332"] },
    { kind: "course", id: "bsci353", name: "Cellular and Molecular Neuroscience", options: ["BSCI353"] },
    { kind: "course", id: "bsci450", name: "Mammalian Systems Physiology", options: ["BSCI450"] },
    { kind: "course", id: "biochemistry", name: "Biochemistry I or Biochemistry of Physiology", options: ["BCHM461", "BCHM463"] },
    { kind: "choose", id: "phnb-area-credits", name: "PHNB Area courses (11 credits)", credits: 11, from: { courses: PHNB_AREA_ALL } },
    { kind: "choose", id: "phnb-lab-min", name: "At least one PHNB Area Lab", count: 1, overlay: true, from: { courses: PHNB_LABS } },
    { kind: "choose", id: "enrichment", name: "Enrichment (3 credits)", credits: 3, from: { departments: ["BSCI", "CHEM", "BCHM"], minNumber: 300, maxNumber: 499 } },
  ],
};

export const bsciMajorPhnbMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "Bio Sci (Physiology & Neurobiology)", major: "bsci", track: "Physiology and Neurobiology", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/biological-sciences/", department: "https://bsci.umd.edu/s/PHNB-Curriculum-2026.pdf" } };
