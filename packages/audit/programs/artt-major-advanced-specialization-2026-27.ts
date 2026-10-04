// Art Major, Advanced Specialization track (Track 2), 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art/art-major/;
// Department of Art's own official four-year plan for this track (department source, converted
// from PDF), https://drive.google.com/uc?export=download&id=1KOTZOsCIo1SGWpzG31tUPuXOK9ZphGaY
// (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page/plan and the catalog disagree,
// follow the department source; no disagreement was found for this track.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const REQUIRED_ELSEWHERE = ["ARTT100", "ARTT110", "ARTT150", "ARTT200", "ARTT210", "ARTT255", "ARTT320", "ARTT330", "ARTT331", "ARTT333", "ARTT341", "ARTT343", "ARTT370", "ARTT481"];

export const arttMajorAdvancedSpecialization: Program = {
  id: "artt-major-advanced-specialization",
  name: "Art Major (Studio Art with Advanced Specialization)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Art Major (Track 2: B.A. in Studio Art with Advanced Specialization); " +
    "Department of Art, official Advanced Specialization Four Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1KOTZOsCIo1SGWpzG31tUPuXOK9ZphGaY " +
    "(fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "This track (48 credits in Track 1 plus 12 in an Advanced Specialization) restricted to students admitted by competitive portfolio review after completing at least two 3xx-level courses and one 400-level ARTT course (or enrollment in one); students may re-apply once. Not encoded -- an admission gate, not a course requirement. See docs/project/owner-review.md.",
    "Same Printmaking-area and 'Art Theory = ARTT' treatment as the Studio Art track (see its reviewNotes): the bare 'ARTT340' line is a PDF artifact and left out; 'Art Theory' electives are encoded as ARTH-or-ARTT.",
    "The five Advanced Specialization areas (Digital Media, Painting, Printmaking, Sculpture, Intermedia) are mutually exclusive 9-credit studio combinations (beyond the shared ARTT481 seminar), encoded as a `sets` requirement, one set per area. Footnotes allow substituting up to 3 credits of ARTT498 for the area's repeatable studio course in each area (the Painting/Printmaking/Sculpture footnotes literally say '...substituted for ARTT479', a copy-paste artifact from the Digital Media footnote; normalized here to mean each area's own primary repeatable course, per the department's evident intent) -- ARTT498 is added as an alternative in every area's repeatable-course filter.",
    "Intermedia's own course list is unenumerated ('ARTT4xx Advanced Studios (combination of inter-related courses)', 9 credits) -- encoded as a department+level `choose`-style filter (ARTT 400-499, excluding ARTT481) inside its set, per the no-named-list convention; flagged in docs/project/owner-review.md.",
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
      kind: "distribution",
      id: "intermediate",
      name: "Intermediate Courses: three courses from at least two of Painting/Sculpture/Printmaking/Digital Media",
      count: 3,
      minAreas: 2,
      maxPerArea: 3,
      areas: [
        { name: "Painting", courses: ["ARTT320"] },
        { name: "Sculpture", courses: ["ARTT330", "ARTT331", "ARTT333"] },
        { name: "Printmaking", courses: ["ARTT341", "ARTT343"] },
        { name: "Digital Media", courses: ["ARTT370"] },
      ],
    },
    {
      kind: "choose",
      id: "adv-3xx",
      name: "Advanced Courses: one 3xx-level ARTT elective",
      count: 1,
      from: { departments: ["ARTT"], minNumber: 300, maxNumber: 399, exclude: REQUIRED_ELSEWHERE },
    },
    {
      kind: "choose",
      id: "adv-4xx-1",
      name: "Advanced Courses: one 4xx-level ARTT elective",
      count: 1,
      from: { departments: ["ARTT"], minNumber: 400, maxNumber: 499, exclude: REQUIRED_ELSEWHERE },
    },
    {
      kind: "choose",
      id: "adv-4xx-2",
      name: "Advanced Courses: one 4xx-level ARTT (Studio or Art Theory) elective",
      count: 1,
      from: { departments: ["ARTT"], minNumber: 400, maxNumber: 499, exclude: REQUIRED_ELSEWHERE },
    },
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
      id: "support-theory-electives",
      name: "Supporting Area: two 3xx-/4xx-level ARTH or Art Theory electives",
      count: 2,
      from: { departments: ["ARTH", "ARTT"], minNumber: 300, maxNumber: 499, exclude: REQUIRED_ELSEWHERE },
    },
    { kind: "course", id: "artt481", name: "Advanced Specialization Seminar", options: ["ARTT481"] },
    {
      kind: "sets",
      id: "specialization",
      name: "Advanced Specialization (9 credits of studio work in one media area)",
      count: 1,
      options: [
        // Digital Media
        [
          { count: 2, from: { courses: ["ARTT479", "ARTT498"] } },
          { count: 1, from: { courses: ["ARTT479", "ARTT353", "ARTT449", "ARTT341", "ARTT343", "ARTT448"] } },
        ],
        // Painting
        [{ count: 3, from: { courses: ["ARTT428", "ARTT498"] } }],
        // Printmaking
        [
          { count: 1, from: { courses: ["ARTT341", "ARTT343", "ARTT448"] } },
          { count: 2, from: { courses: ["ARTT448", "ARTT498"] } },
        ],
        // Sculpture
        [
          { count: 1, from: { courses: ["ARTT330", "ARTT331", "ARTT333", "ARTT418", "ARTT438"] } },
          { count: 2, from: { courses: ["ARTT438", "ARTT498"] } },
        ],
        // Intermedia
        [{ count: 3, from: { departments: ["ARTT"], minNumber: 400, maxNumber: 499, exclude: ["ARTT481"] } }],
      ],
    },
  ],
};

export const arttMajorAdvancedSpecializationMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Studio Art (Advanced Specialization)",
  major: "artt",
  track: "Advanced Specialization",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art/art-major/",
    department: "https://drive.google.com/uc?export=download&id=1KOTZOsCIo1SGWpzG31tUPuXOK9ZphGaY",
  },
};
