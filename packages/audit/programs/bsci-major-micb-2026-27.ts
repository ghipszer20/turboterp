// Biological Sciences Major, Microbiology (MICB) Specialization, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/biological-sciences/;
// Biological Sciences Undergraduate Program, "Microbiology MICB (0404D)" degree sheet
// (effective August 2026), https://bsci.umd.edu/s/MICB-Curriculum-2026.pdf (fetched 2026-09-27),
// and the MICB Model Grad Plan, https://bsci.umd.edu/s/BSCI_MICB-fall-2026-gradplan-ADA-2.pdf.
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

// Either BSCI424 (w/Lab, 4cr) or BSCI348J (3cr) satisfies this pool member.
const MICB_AREA = ["BSCI348M", "BSCI411", "BSCI417", "BSCI422", "BSCI423", "BSCI424", "BSCI348J", "BSCI437", "BSCI464"];

export const bsciMajorMicb: Program = {
  id: "bsci-major-micb",
  name: "Biological Sciences Major (Microbiology Specialization)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Biological Sciences Major; " +
    "Biological Sciences Undergraduate Program, Microbiology MICB (0404D) degree sheet, " +
    "https://bsci.umd.edu/s/MICB-Curriculum-2026.pdf (fetched 2026-09-27)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Basic Program and Supporting Courses are identical across every Biological Sciences specialization (see bsci-major-genb-2026-27.ts's review notes for the biology-lab, math-sequence and freshman-seminar encodings, which repeat here).",
    "The department's own Model Grad Plan labels BSCI412 '(Lab 1)' at 4 credits; the degree sheet's required-courses table lists it at 3 credits. The degree sheet's figure is used (department requirements page over department sample plan).",
    "Biochemistry I (footnote 7: 'Or BCHM463 and BCHM465') is encoded as `sets`: [BCHM461] or [BCHM463, BCHM465].",
    "'Area Courses: 7 credits' has no stated per-category minimum (unlike CEBG/ECEV/PHNB), so it's a single 7-credit `choose` pool; BSCI424 (w/Lab, 4 credits) or BSCI348J (Medical Microbiology, 3 credits) are pooled as alternatives for the same list item.",
    "'Enrichment: 3 credits, from any 300- or 400-level BSCI, CHEM, or BCHM course' is encoded as a `choose` credit pool over that department/number-range filter.",
    "'Two courses designated as Lab' is not encoded -- no lab-designation field on StudentCourse. BSCI283 is footnoted as NOT counting as one of the two upper-level labs even though it's required; not enforced (same reason).",
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
    { kind: "course", id: "bsci283", name: "Principles of Microbiology", options: ["BSCI283"] },
    { kind: "course", id: "bsci412", name: "Microbial Genetics", options: ["BSCI412"] },
    { kind: "course", id: "bsci443", name: "Microbial Physiology", options: ["BSCI443"] },
    { kind: "sets", id: "biochemistry-1", name: "Biochemistry I", options: [["BCHM461"], ["BCHM463", "BCHM465"]] },
    { kind: "course", id: "bchm462", name: "Biochemistry II", options: ["BCHM462"] },
    { kind: "choose", id: "micb-area-credits", name: "MICB Area courses (7 credits)", credits: 7, from: { courses: MICB_AREA } },
    { kind: "choose", id: "enrichment", name: "Enrichment (3 credits)", credits: 3, from: { departments: ["BSCI", "CHEM", "BCHM"], minNumber: 300, maxNumber: 499 } },
  ],
};

export const bsciMajorMicbMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "Bio Sci (Microbiology)", major: "bsci", track: "Microbiology", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/biological-sciences/", department: "https://bsci.umd.edu/s/MICB-Curriculum-2026.pdf" } };
