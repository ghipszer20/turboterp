// Physics Major, Biophysics Specialization, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/physics/physics-major/;
// UMD Physics, "Degree Requirements and Policies" (effective Fall 2024),
// https://www.umdphysics.umd.edu/academics/undergraduate/ugrad-requirements.html (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const physMajorBiophysics: Program = {
  id: "phys-major-biophysics",
  name: "Physics Major (Biophysics Specialization)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Physics Major; " +
    "UMD Physics, Degree Requirements and Policies (effective Fall 2024), " +
    "https://www.umdphysics.umd.edu/academics/undergraduate/ugrad-requirements.html (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Posted advisor-approved substitution (owner, 2026-10-07: posted alternatives are encoded): 'Students completing a second major from a CMNS or Engineering department may use an upper-level course from that program in place of one of the Advanced Physics Electives.' The substitute isn't a fixed course list, so advanced-elective carry advisorMayApprove (the Advisor tells the student another course may count with approval).",
    "Department-vs-catalog difference (owner ruling: follow the department page): the catalog offers 'BSCI180 (Principles Biology Laboratory) or BSCI171 (Principles of Molecular & Cellular Biology Laboratory)'; the department page's own list names only BSCI171. The department's single course (BSCI171) is required here, not the catalog's either/or.",
    "Math methods is a `sets` choice per both sources: MATH243, or MATH240 + MATH246, same as the Physics specialization.",
    "The catalog lists PHYS313 at 3 credits for this specialization, vs. 4 credits everywhere else (including the department page's own Biophysics list); credit counts aren't modeled on individual requirements here, so this doesn't change the encoding -- PHYS313 either way.",
    "'PHYS4XY (3)' and 'One of PHYS375 or an approved 400-level BSCI elective' are two separate slots on both sources (on top of the required PHYS483). The first is encoded as a `choose` pool of 1 course from any 400-level PHYS course not already required by name; the second as a `sets` choice between PHYS375 and one 400-level BSCI course (the catalog/department's 'any approved 400-level BSCI elective' -- an open department-approved pool, encoded as a department+number filter rather than a fixed course list since neither source names specific courses).",
    "Not encoded (engine gap, not a disagreement): the department page's pre-med note directing students toward a pre-health advisor is advising guidance, not a requirement.",
    "No official sample graduation plan was found for this specialization in the fetched sources (program-sources/physics-major.md); the CMNS four-year-plans page only links out to the department's Physics page, not a per-specialization plan. The sample plan fixture is constructed from these requirements, `official: false`, and flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    { kind: "course", id: "phys170", name: "Professional Physics Seminar", options: ["PHYS170"] },
    { kind: "course", id: "phys171", name: "Introductory Physics: Mechanics", options: ["PHYS171"] },
    { kind: "course", id: "phys265", name: "Introduction to Scientific Programming", options: ["PHYS265"] },
    { kind: "course", id: "phys272", name: "Introductory Physics: Fields", options: ["PHYS272"] },
    { kind: "course", id: "phys273", name: "Intermediate Oscillations and Waves", options: ["PHYS273"] },
    { kind: "course", id: "phys275", name: "Experimental Physics I: Mechanics and Waves", options: ["PHYS275"] },
    { kind: "course", id: "phys276", name: "Experimental Physics II: Analog Circuits", options: ["PHYS276"] },
    { kind: "course", id: "math140", name: "Calculus I", options: ["MATH140"] },
    { kind: "course", id: "math141", name: "Calculus II", options: ["MATH141"] },
    { kind: "course", id: "math241", name: "Calculus III", options: ["MATH241"] },
    { kind: "sets", id: "math-methods", name: "Linear algebra and differential equations", options: [["MATH243"], ["MATH240", "MATH246"]] },
    { kind: "course", id: "bsci170", name: "Principles of Molecular & Cellular Biology", options: ["BSCI170"] },
    { kind: "course", id: "bsci171", name: "Principles of Molecular & Cellular Biology Laboratory", options: ["BSCI171"] },
    { kind: "course", id: "chem131", name: "Chemistry I - Fundamentals of General Chemistry", options: ["CHEM131"] },
    { kind: "course", id: "chem132", name: "General Chemistry I Laboratory", options: ["CHEM132"] },
    { kind: "course", id: "chem231", name: "Organic Chemistry I", options: ["CHEM231"] },
    { kind: "course", id: "chem232", name: "Organic Chemistry Laboratory I", options: ["CHEM232"] },
    { kind: "course", id: "chem241", name: "Organic Chemistry II", options: ["CHEM241"] },
    { kind: "course", id: "chem242", name: "Organic Chemistry Laboratory II", options: ["CHEM242"] },
    { kind: "course", id: "chem271", name: "General Chemistry and Energetics", options: ["CHEM271"] },
    { kind: "course", id: "chem272", name: "General Bioanalytical Chemistry Laboratory", options: ["CHEM272"] },
    { kind: "course", id: "bsci330", name: "Cell Biology and Physiology", options: ["BSCI330"] },
    { kind: "course", id: "bchm461", name: "Biochemistry I", options: ["BCHM461"] },
    { kind: "course", id: "phys313", name: "Electricity and Magnetism I", options: ["PHYS313"] },
    { kind: "course", id: "phys371", name: "Modern Physics", options: ["PHYS371"] },
    { kind: "course", id: "phys404", name: "Introduction to Statistical Thermodynamics", options: ["PHYS404"] },
    { kind: "course", id: "phys483", name: "Biophysics", options: ["PHYS483"] },
    {
      kind: "choose",
      id: "advanced-elective", advisorMayApprove: true,
      name: "Advanced Physics Elective",
      count: 1,
      from: {
        departments: ["PHYS"],
        minNumber: 400,
        maxNumber: 499,
        exclude: ["PHYS375", "PHYS404", "PHYS483"],
      },
    },
    {
      kind: "sets",
      id: "optics-or-bsci-elective",
      name: "PHYS375, or an approved 400-level BSCI elective",
      options: [["PHYS375"], [{ count: 1, from: { departments: ["BSCI"], minNumber: 400, maxNumber: 499 } }]],
    },
  ],
};

export const physMajorBiophysicsMeta: ProgramMeta = {
  kind: "major",
  college: "CMNS",
  short: "Physics (Biophysics)",
  major: "phys",
  track: "Biophysics",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/physics/physics-major/",
    department: "https://www.umdphysics.umd.edu/academics/undergraduate/ugrad-requirements.html",
  },
};
