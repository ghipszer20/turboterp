// Art Major, Graphic Design track (Track 3), 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art/art-major/;
// Department of Art's own official four-year plan for this track (department source, converted
// from PDF), https://drive.google.com/uc?export=download&id=1nwR3mYqtz0nQqGjc37kDTFbNhe-0LLHe
// (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page/plan and the catalog disagree,
// follow the department source; no disagreement was found for this track.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const FOUNDATION = ["ARTT100", "ARTT110", "ARTT150", "ARTT200", "ARTT210", "ARTT255"];
const GD_REQUIRED = ["ARTT355", "ARTT356", "ARTT357", "ARTT454", "ARTT455", "ARTT458", "ARTT361"];

export const arttMajorGraphicDesign: Program = {
  id: "artt-major-graphic-design",
  name: "Art Major (Studio Art with Concentration in Graphic Design)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Art Major (Track 3: B.A. in Studio Art w/ Concentration in Graphic Design); " +
    "Department of Art, official Graphic Design Concentration Four Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1nwR3mYqtz0nQqGjc37kDTFbNhe-0LLHe " +
    "(fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Restricted to students admitted into the Graphic Design concentration by a competitive portfolio review (students must have completed or be enrolled in the Foundation courses to apply; ~20 students/year; may re-apply once). Not encoded -- an admission gate, not a course requirement. See docs/project/owner-review.md.",
    "Per footnote 1, one of Track 1's two 'ARTH or Art Theory 3xx-4xx elective' supporting-area slots is satisfied by ARTT361 (a required Graphic Design course, listed separately below), so this track's own supporting area is 9 credits (2 ARTH Diversity courses + 1 ARTH-or-Art-Theory elective), not Track 1's 12. 'Art Theory' has no separate subject code -- it is ARTT (see the Studio Art track's reviewNotes) -- so that one elective is encoded as ARTH-or-ARTT.",
    "'Select six credits: ARTT386 Experiential Learning or ARTT45x Graphic Design Electives' is filled from the catalog's own enumerated 'Graphic Design Elective Courses' list (ARTT386, ARTT456, ARTT457, ARTT459, ARTT488, ARTT499); 'Select six credits ARTT 3xx-4xx Art Electives' is a generic unenumerated ARTT department/level filter excluding the Foundation and Graphic Design Required courses.",
    "Engine gap: the Supporting Area's 'satisfies a GenEd Diversity Requirement' qualifier can't be jointly enforced with the ARTH department filter (CourseFilter's genEd match ignores department once set); encoded as a plain ARTH filter.",
    "Not encoded (engine gaps): the plan's residency rules (30 credits at UMD, 15 of the final 30 at the 300-400 level, 12 upper-level major credits at UMD), and the 120-credit graduation minimum. Program GPA 2.0 encoded as minGpa.",
  ],
  requirements: [
    { kind: "course", id: "artt100", name: "Two-Dimensional Design Fundamentals", options: ["ARTT100"] },
    { kind: "course", id: "artt110", name: "Elements of Drawing I", options: ["ARTT110"] },
    { kind: "course", id: "artt150", name: "Introduction to Art Theory", options: ["ARTT150"] },
    { kind: "course", id: "artt200", name: "Three-Dimensional Art Fundamentals", options: ["ARTT200"] },
    { kind: "course", id: "artt210", name: "Elements of Drawing II", options: ["ARTT210"] },
    { kind: "course", id: "artt255", name: "Introduction to Digital Art and Design Processes", options: ["ARTT255"] },
    {
      kind: "choose",
      id: "support-arth-diversity-1",
      name: "Supporting Area: 200-level or above ARTH satisfying a GenEd Diversity Requirement (1)",
      count: 1,
      from: { departments: ["ARTH"], minNumber: 200, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "support-arth-diversity-2",
      name: "Supporting Area: 200-level or above ARTH satisfying a GenEd Diversity Requirement (2)",
      count: 1,
      from: { departments: ["ARTH"], minNumber: 200, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "support-theory-elective",
      name: "Supporting Area: one 3xx-/4xx-level ARTH or Art Theory elective",
      count: 1,
      from: { departments: ["ARTH", "ARTT"], minNumber: 300, maxNumber: 499, exclude: [...FOUNDATION, ...GD_REQUIRED] },
    },
    {
      kind: "choose",
      id: "gd-elective-or-experiential",
      name: "Six credits of ARTT386 (Experiential Learning) or Graphic Design electives",
      count: 2,
      from: { courses: ["ARTT386", "ARTT456", "ARTT457", "ARTT459", "ARTT488", "ARTT499"] },
    },
    {
      kind: "choose",
      id: "artt-electives",
      name: "Six credits of 3xx-/4xx-level ARTT Art Electives",
      count: 2,
      from: { departments: ["ARTT"], minNumber: 300, maxNumber: 499, exclude: [...FOUNDATION, ...GD_REQUIRED, "ARTT386", "ARTT456", "ARTT457", "ARTT459", "ARTT488", "ARTT499"] },
    },
    { kind: "course", id: "artt355", name: "Intermediate Graphic Design Principles", options: ["ARTT355"] },
    { kind: "course", id: "artt356", name: "Graphic Design Processes", options: ["ARTT356"] },
    { kind: "course", id: "artt357", name: "Interactive Design", options: ["ARTT357"] },
    { kind: "course", id: "artt454", name: "Advanced Graphic Design Principles: Design in Society", options: ["ARTT454"] },
    { kind: "course", id: "artt455", name: "Three Dimensional Graphic Design", options: ["ARTT455"] },
    { kind: "course", id: "artt458", name: "Graphic Design Portfolio", options: ["ARTT458"] },
    { kind: "course", id: "artt361", name: "Design Literacy: Decoding Our Visual Culture", options: ["ARTT361"] },
  ],
};

export const arttMajorGraphicDesignMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Studio Art (Graphic Design)",
  major: "artt",
  track: "Graphic Design",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art/art-major/",
    department: "https://drive.google.com/uc?export=download&id=1nwR3mYqtz0nQqGjc37kDTFbNhe-0LLHe",
  },
};
