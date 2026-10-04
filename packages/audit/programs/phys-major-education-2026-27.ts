// Physics Major, Education Physics Specialization, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/physics/physics-major/;
// UMD Physics, "Degree Requirements and Policies" (effective Fall 2024),
// https://www.umdphysics.umd.edu/academics/undergraduate/ugrad-requirements.html (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const physMajorEducation: Program = {
  id: "phys-major-education",
  name: "Physics Major (Education Physics Specialization)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Physics Major; " +
    "UMD Physics, Degree Requirements and Policies (effective Fall 2024), " +
    "https://www.umdphysics.umd.edu/academics/undergraduate/ugrad-requirements.html (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "The 'Introductory Education Courses' rows are named slightly differently between sources -- catalog: 'TLPL101 Inquiry Approach to Teaching STEM (Step 1)' and 'TLPL102 Inquiry Teaching of STEM in Middle School'; department page: 'TLPL101 Inquiry Teaching of STEM in Elementary School' and 'TLPL102 Inquiry Teaching of STEM in Middle School'. Same course codes and credits, not a real disagreement; the department page's titles are used.",
    "Math methods is a `sets` choice per both sources: MATH243, or MATH240 + MATH246, same as the Physics specialization.",
    "'One of PHYS401, PHYS404, PHYS410, PHYS413' (3-4 credits) is encoded as a `choose` of 1 from those four courses, per both sources.",
    "The department page's footnote on PHYS375 ('may be replaced by an additional, non-seminar, 400-level approved Physics course of 3-4 credits not being used to satisfy another requirement') is not encoded (engine gap -- an open-ended, advisor-approved substitution, not a fixed course list); PHYS375 is required as named, and the phys375 requirement is marked advisorMayApprove. Not a disagreement with the catalog, which doesn't mention the substitution at all.",
    "The single 'PHYS4XY Advanced Physics Elective' slot is encoded as a `choose` pool of 1 course from any 400-level PHYS course not already required by name in this track (including the four courses in the 'one of' choice above, matching how the Physics specialization excludes its own named upper-level PHYS courses from its elective pool).",
    "Not encoded (flagged in docs/project/owner-review.md): the College of Education's Secondary Education Program admission requirement for students who also want a teaching certificate, and any GPA/residency rule beyond the university-wide C- minimum (already set as minGrade) -- neither source states a program-specific rule the engine could check.",
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
    { kind: "course", id: "tlpl101", name: "Inquiry Teaching of STEM in Elementary School", options: ["TLPL101"] },
    { kind: "course", id: "tlpl102", name: "Inquiry Teaching of STEM in Middle School", options: ["TLPL102"] },
    { kind: "course", id: "edhd426", name: "Cognitive and Motivational Literacy Content", options: ["EDHD426"] },
    { kind: "course", id: "tlpl401", name: "Student-Centered Curriculum and Instruction", options: ["TLPL401"] },
    { kind: "course", id: "tlpl414", name: "Knowing and Learning in Mathematics and Science", options: ["TLPL414"] },
    { kind: "course", id: "tlpl415", name: "Perspectives in Science", options: ["TLPL415"] },
    { kind: "course", id: "phys313", name: "Electricity and Magnetism I", options: ["PHYS313"] },
    { kind: "course", id: "phys371", name: "Modern Physics", options: ["PHYS371"] },
    { kind: "course", id: "phys375", advisorMayApprove: true, name: "Experimental Physics III: Waves, Optics and Modern Physics", options: ["PHYS375"] },
    {
      kind: "choose",
      id: "advanced-support",
      name: "One of PHYS401, PHYS404, PHYS410, PHYS413",
      count: 1,
      from: { courses: ["PHYS401", "PHYS404", "PHYS410", "PHYS413"] },
    },
    {
      kind: "choose",
      id: "advanced-elective",
      name: "Advanced Physics Elective",
      count: 1,
      from: {
        departments: ["PHYS"],
        minNumber: 400,
        maxNumber: 499,
        exclude: ["PHYS375", "PHYS401", "PHYS404", "PHYS410", "PHYS413"],
      },
    },
  ],
};

export const physMajorEducationMeta: ProgramMeta = {
  kind: "major",
  college: "CMNS",
  short: "Physics (Education)",
  major: "phys",
  track: "Education Physics",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/physics/physics-major/",
    department: "https://www.umdphysics.umd.edu/academics/undergraduate/ugrad-requirements.html",
  },
};
