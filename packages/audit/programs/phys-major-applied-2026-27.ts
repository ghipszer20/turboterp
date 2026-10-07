// Physics Major, Applied Physics Specialization, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/physics/physics-major/;
// UMD Physics, "Degree Requirements and Policies" (effective Fall 2024),
// https://www.umdphysics.umd.edu/academics/undergraduate/ugrad-requirements.html (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const physMajorApplied: Program = {
  id: "phys-major-applied",
  name: "Physics Major (Applied Physics Specialization)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Physics Major; " +
    "UMD Physics, Degree Requirements and Policies (effective Fall 2024), " +
    "https://www.umdphysics.umd.edu/academics/undergraduate/ugrad-requirements.html (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Posted advisor-approved substitution (owner, 2026-10-07: posted alternatives are encoded): 'Students completing a second major from a CMNS or Engineering department may use an upper-level course from that program in place of one of the Advanced Physics Electives.' The substitute isn't a fixed course list, so advanced-elective carry advisorMayApprove (the Advisor tells the student another course may count with approval).",
    "The catalog and the department page agree closely on course codes and credits for this specialization; no disagreement found worth flagging. Both list ENME272 (Introduction to Computer Aided Design), a full course list of PHYS313/371/375/401/404/413/456/474, a 'one of PHYS485 or PHYS487' choice, and a separate 'PHYS4XY Advanced Physics Elective' slot on top of those.",
    "Math methods is a `sets` choice per both sources: MATH243, or MATH240 + MATH246, same as the Physics specialization.",
    "'One of PHYS485 (Electronic Circuits) or PHYS487 (Computerized Instrumentation)' is encoded as a `choose` of 1 from those two courses.",
    "The 'PHYS4XY Advanced Physics Elective' slot is encoded as a `choose` pool of 1 course from any 400-level PHYS course not already required by name in this track (including PHYS485/PHYS487, matching how the Physics specialization excludes its own named upper-level PHYS courses from its elective pool).",
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
    { kind: "course", id: "enme272", name: "Introduction to Computer Aided Design", options: ["ENME272"] },
    { kind: "course", id: "phys313", name: "Electricity and Magnetism I", options: ["PHYS313"] },
    { kind: "course", id: "phys371", name: "Modern Physics", options: ["PHYS371"] },
    { kind: "course", id: "phys375", name: "Experimental Physics III: Waves, Optics and Modern Physics", options: ["PHYS375"] },
    { kind: "course", id: "phys401", name: "Quantum Physics I", options: ["PHYS401"] },
    { kind: "course", id: "phys404", name: "Introduction to Statistical Thermodynamics", options: ["PHYS404"] },
    { kind: "course", id: "phys413", name: "Electricity and Magnetism II", options: ["PHYS413"] },
    { kind: "course", id: "phys456", name: "Making Physics Experiments", options: ["PHYS456"] },
    { kind: "course", id: "phys474", name: "Computational Physics", options: ["PHYS474"] },
    {
      kind: "choose",
      id: "circuits-or-instrumentation",
      name: "One of PHYS485, PHYS487",
      count: 1,
      from: { courses: ["PHYS485", "PHYS487"] },
    },
    {
      kind: "choose",
      id: "advanced-elective", advisorMayApprove: true,
      name: "Advanced Physics Elective",
      count: 1,
      from: {
        departments: ["PHYS"],
        minNumber: 400,
        maxNumber: 499,
        exclude: ["PHYS375", "PHYS401", "PHYS404", "PHYS413", "PHYS456", "PHYS474", "PHYS485", "PHYS487"],
      },
    },
  ],
};

export const physMajorAppliedMeta: ProgramMeta = {
  kind: "major",
  college: "CMNS",
  short: "Physics (Applied)",
  major: "phys",
  track: "Applied Physics",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/physics/physics-major/",
    department: "https://www.umdphysics.umd.edu/academics/undergraduate/ugrad-requirements.html",
  },
};
