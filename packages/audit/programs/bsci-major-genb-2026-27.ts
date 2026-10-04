// Biological Sciences Major, General Biology (GENB) Specialization, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/biological-sciences/;
// Biological Sciences Undergraduate Program, "General Biology GENB (0404C)" degree sheet
// (effective August 2026), https://bsci.umd.edu/s/GENB-Curriculum-2026.pdf (fetched 2026-09-27),
// and the General Biology Model Grad Plan, https://bsci.umd.edu/s/BSCI_GENB-fall-2026-gradplan-ADA-2.pdf.
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const GENB_CAT1_GENETICS_EVOLUTION = [
  "BCHM465", "BSCI370", "BSCI381", "BSCI382", "BSCI405", "BSCI410", "BSCI411", "BSCI412", "BSCI414", "BSCI415", "BSCI416", "BSCI471",
];
const GENB_CAT2_CELL_DEV_PHYSIOLOGY = [
  "BCHM462", "BCHM464", "BSCI331", "BSCI332", "BSCI342", "BSCI343", "BSCI353", "BSCI355", "BSCI357", "BSCI404", "BSCI406",
  "BSCI417", "BSCI420", "BSCI422", "BSCI423", "BSCI424", "BSCI425", "BSCI430", "BSCI431", "BSCI432", "BSCI433", "BSCI436",
  "BSCI437", "BSCI442", "BSCI443", "BSCI446", "BSCI447", "BSCI450", "BSCI451", "BSCI452", "BSCI453", "BSCI455", "BSCI456",
];
const GENB_CAT3_ECOLOGY_BEHAVIOR_ORGANISMAL = [
  "BSCI333", "BSCI334", "BSCI335", "BSCI337", "BSCI360", "BSCI361", "BSCI363", "BSCI366", "BSCI392", "BSCI393", "BSCI400",
  "BSCI401", "BSCI403", "BSCI426", "BSCI462", "BSCI464", "BSCI467", "BSCI473", "BSCI476", "BSCI477", "BSCI481", "BSCI483",
  "BSCI484", "BSCI487", "BSCI494", "BSCI497",
];
// "Additional Courses (Optional)": BSCI223/283 may count as GENB Area (but not as an upper-level
// lab); not assigned to any of the three categories.
const GENB_AREA_ADDITIONAL = ["BSCI223", "BSCI283"];
const GENB_AREA_ALL = [...GENB_CAT1_GENETICS_EVOLUTION, ...GENB_CAT2_CELL_DEV_PHYSIOLOGY, ...GENB_CAT3_ECOLOGY_BEHAVIOR_ORGANISMAL, ...GENB_AREA_ADDITIONAL];

export const bsciMajorGenb: Program = {
  id: "bsci-major-genb",
  name: "Biological Sciences Major (General Biology Specialization)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Biological Sciences Major; " +
    "Biological Sciences Undergraduate Program, General Biology GENB (0404C) degree sheet, " +
    "https://bsci.umd.edu/s/GENB-Curriculum-2026.pdf (fetched 2026-09-27)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Basic Program's biology lab is BSCI180, OR BSCI161 AND BSCI171 together; encoded as `sets`. Supporting math is MATH135+MATH136, MATH135+MATH140, or MATH140+MATH141 (the department's own FAQ page drops the discontinued MATH130/131 paths); encoded as `sets`. Freshman seminar (CMNS100, UNIV100, HLSC100, HACS100, HDCC105 or HHUM105) is a `course` requirement; ILS Honors' HLSC322 substitute for BSCI222 is not encoded (a narrow honors-program exception).",
    "'GENB Area Courses: 20-21 credits, including at least one course from each of categories 1, 2, and 3' is encoded as a 20-credit `choose` pool over all three categories (plus the optional BSCI223/283), with three overlay `choose` requirements (count 1 each, one per category) checking the per-category minimum without using up a separate course slot.",
    "'At least two courses designated as Lab' is not encoded -- StudentCourse has no lab-designation field, so the audit can't distinguish a Lab-tagged course from a lecture-only one.",
    "Special Topics courses (BSCI328/338/339/348/439), honors seminars (BSCI378H/398H), and research/internship credit (BSCI349/379/389/399) are not encoded -- variable section codes and/or advisor-gated, and some are credit-count-limited in a way the engine can't track (footnote: 'the maximum number of credits in these repeatable courses that may count towards the advanced program').",
    "The Quantitative Course option 'MATH240 or higher w/ advisor approval' is encoded as literal MATH240 only; the open-ended 'or higher' isn't encoded (advisor-gated, unbounded). Marked advisorMayApprove (quantitative): other courses may count with advisor approval; only the listed courses count.",
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
    { kind: "course", id: "biochemistry", name: "Biochemistry or Biochemistry of Physiology", options: ["BCHM461", "BCHM463"] },
    { kind: "choose", id: "quantitative", name: "Quantitative course", count: 1, from: { courses: ["BIOM301", "BSCI374", "BSCI435", "STAT400", "STAT464", "MATH240"] }, advisorMayApprove: true },
    { kind: "choose", id: "genb-area-credits", name: "GENB Area courses (20 credits)", credits: 20, from: { courses: GENB_AREA_ALL } },
    { kind: "choose", id: "genb-cat1-min", name: "At least one Genetics and Evolution area course", count: 1, overlay: true, from: { courses: GENB_CAT1_GENETICS_EVOLUTION } },
    { kind: "choose", id: "genb-cat2-min", name: "At least one Cell Biology, Development, and Physiology area course", count: 1, overlay: true, from: { courses: GENB_CAT2_CELL_DEV_PHYSIOLOGY } },
    { kind: "choose", id: "genb-cat3-min", name: "At least one Ecology, Behavior, and Organismal Biology area course", count: 1, overlay: true, from: { courses: GENB_CAT3_ECOLOGY_BEHAVIOR_ORGANISMAL } },
  ],
};

export const bsciMajorGenbMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "Bio Sci (General Biology)", major: "bsci", track: "General Biology", defaultTrack: true, sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/biological-sciences/", department: "https://bsci.umd.edu/s/GENB-Curriculum-2026.pdf" } };
