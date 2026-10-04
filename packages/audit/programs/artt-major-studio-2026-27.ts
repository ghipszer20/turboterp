// Art Major, Studio Art track (Track 1), 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art/art-major/;
// Department of Art's own official four-year plan for this track (department source, converted
// from PDF), https://drive.google.com/uc?export=download&id=1AKJNiU7YmO-IrnINLLeJ0dM-tcs6ygQL
// (fetched 2026-09-28). Department page (art.umd.edu) is nav/context only, no requirements text.
// Owner ruling (docs/project/rulings.md): where the department page/plan and the catalog disagree,
// follow the department source; no disagreement was found for this track.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

/** Foundation and Intermediate courses, excluded from the generic elective filters below so an
 * elective slot can't be double-satisfied by a course that's separately required. */
const REQUIRED_ELSEWHERE = ["ARTT100", "ARTT110", "ARTT150", "ARTT200", "ARTT210", "ARTT255", "ARTT320", "ARTT330", "ARTT331", "ARTT333", "ARTT341", "ARTT343", "ARTT370"];

export const arttMajorStudio: Program = {
  id: "artt-major-studio",
  name: "Art Major (Studio Art)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Art Major (Track 1: B.A. in Studio Art); " +
    "Department of Art, official Studio Art Four Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1AKJNiU7YmO-IrnINLLeJ0dM-tcs6ygQL " +
    "(fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "All majors enter in Track 1 (this program); Track 2 (Advanced Specialization) and Track 3 (Graphic Design) require a competitive portfolio review to enter. The admission gate itself (portfolio review, ~20 students/year, reapplication limits, prerequisite coursework to apply) is not encoded -- it's an admission decision, not a course requirement. See docs/project/owner-review.md.",
    "The catalog's Printmaking area lists a bare 'ARTT340' line (no title) above ARTT341/ARTT343; ARTT340 is not on the Academic Catalog's approved ARTT course list and the four-year plan's own summary of this area ('ARTT 320, 33x, 34x, or 370') never singles it out, so it's treated as a PDF-conversion artifact and left out of the Intermediate distribution's Printmaking area (only ARTT341 and ARTT343 are listed).",
    "'Art Theory' has no separate subject code in the catalog or department plan (ARTT150 'Introduction to Art Theory' is itself an ARTT course); every 'ARTH or Art Theory' elective below is encoded as ARTH or ARTT (300-499), since Art Theory courses are ARTT courses.",
    "Engine gap: the 'ARTH... that satisfies a GenEd Diversity Requirement' qualifier can't be jointly enforced with the ARTH department filter -- CourseFilter's genEd match (used elsewhere for the standalone Gen Ed Diversity requirement) ignores department entirely once set. Encoded as a plain ARTH (200-499) filter; the Diversity qualifier itself is left to the standalone Gen Ed layer.",
    "Not encoded (engine gaps, one note per the batch instructions): the plan's residency rules (30 credits at UMD, 15 of the final 30 at the 300-400 level, 12 upper-level major credits at UMD), and the 120-credit graduation minimum. Program GPA 2.0 encoded as minGpa.",
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
  ],
};

export const arttMajorStudioMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Studio Art",
  major: "artt",
  track: "Studio Art",
  defaultTrack: true,
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art/art-major/",
    department: "https://drive.google.com/uc?export=download&id=1AKJNiU7YmO-IrnINLLeJ0dM-tcs6ygQL",
  },
};
