// Physics Major (Physics Specialization), 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/physics/physics-major/;
// UMD Physics, "Degree Requirements and Policies" (effective Fall 2024),
// https://www.umdphysics.umd.edu/academics/undergraduate/ugrad-requirements.html (fetched 2026-09-27),
// and its linked sample graduation plan, https://docs.google.com/document/d/1N21ppgKrQJRXlUopLHYxV0BUBVKM182xYiTIliwB2Ww/
// (fetched 2026-09-27). Only the general "Physics" specialization is encoded here; the other
// three specializations (Education Physics, Biophysics, Applied Physics) are separate tracks of
// this same major, encoded in their own phys-major-<track>-2026-27.ts files.
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const physMajor: Program = {
  id: "phys-major",
  name: "Physics Major (Physics Specialization)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Physics Major; " +
    "UMD Physics, Degree Requirements and Policies (effective Fall 2024), " +
    "https://www.umdphysics.umd.edu/academics/undergraduate/ugrad-requirements.html (fetched 2026-09-27)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Posted advisor-approved substitution (owner, 2026-10-07: posted alternatives are encoded): 'Students completing a second major from a CMNS or Engineering department may use an upper-level course from that program in place of one of the Advanced Physics Electives.' (Which course is the department's call.) The substitute isn't a fixed course list, so advanced-elective carry advisorMayApprove (the Advisor tells the student another course may count with approval).",
    "The catalog and the current department requirements page agree closely on course codes and credits for the core and the Physics specialization; no department-vs-catalog disagreement found worth flagging. (An older department PDF found via search, 'Physics_Major_Requirements_NEW.pdf', still used pre-Fall-2024 course numbers -- PHYS165/174/274, PHYS411 instead of PHYS313/413 -- and was not used, since the live department page states an effective date of Fall 2024 and gives different, current codes.)",
    "Math methods is a `sets` choice per both sources: MATH243, or MATH240 + MATH246.",
    "PHYS405 (Advanced Experiments lab) or PHYS407 (Undergraduate Experimental Research) is a `course` choice between the two, per both sources.",
    "The two 'Advanced Physics Elective' slots (PHYS4XX, PHYS4XY on both sources) are encoded as a `choose` pool of 2 courses from any 400-level PHYS course not already required by name; the sample graduation plan (Google Doc, linked from the live requirements page) leaves both as literal placeholders. Filled in the sample-plan fixture with PHYS474 (Computational Physics) and PHYS483 (Biophysics), both real 400-level PHYS electives; the fill is noted in the fixture, not the requirement itself, which stays open to any 400-level PHYS course.",
    "Not encoded (engine gap, neither source's own requirements page states a program-specific GPA/residency rule beyond the university-wide C- minimum, already set as minGrade): general university degree requirements (120 credits, 2.0 cumulative GPA) aren't modeled here.",
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
    { kind: "course", id: "phys313", name: "Electricity and Magnetism I", options: ["PHYS313"] },
    { kind: "course", id: "phys371", name: "Modern Physics", options: ["PHYS371"] },
    { kind: "course", id: "phys375", name: "Experimental Physics III: Waves, Optics and Modern Physics", options: ["PHYS375"] },
    { kind: "course", id: "phys401", name: "Quantum Physics I", options: ["PHYS401"] },
    { kind: "course", id: "phys402", name: "Quantum Physics II", options: ["PHYS402"] },
    { kind: "course", id: "phys404", name: "Introduction to Statistical Thermodynamics", options: ["PHYS404"] },
    { kind: "course", id: "phys405", name: "Advanced Experiments Lab or Undergraduate Experimental Research", options: ["PHYS405", "PHYS407"] },
    { kind: "course", id: "phys410", name: "Classical Mechanics", options: ["PHYS410"] },
    { kind: "course", id: "phys413", name: "Electricity and Magnetism II", options: ["PHYS413"] },
    {
      kind: "choose",
      id: "advanced-elective", advisorMayApprove: true,
      name: "Advanced Physics Electives (2 courses)",
      count: 2,
      from: {
        departments: ["PHYS"],
        minNumber: 400,
        maxNumber: 499,
        exclude: ["PHYS401", "PHYS402", "PHYS404", "PHYS405", "PHYS407", "PHYS410", "PHYS413"],
      },
    },
  ],
};

export const physMajorMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "Physics", major: "phys", track: "Physics", defaultTrack: true, sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/physics/physics-major/", department: "https://www.umdphysics.umd.edu/academics/undergraduate/ugrad-requirements.html" } };
