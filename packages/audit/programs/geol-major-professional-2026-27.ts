// Geology Major, Professional Track, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/geological-environmental-planetary-sciences/geology-major/;
// Department of Geological, Environmental, and Planetary Sciences, "B.S. Degree in Geology
// (Professional Track)", https://www.geol.umd.edu/undergraduate/majorproftrack2308.php (effective
// Fall 2023, fetched 2026-09-27; this replaced an older page, ugdmajor.php, which the department's
// own program-overview page marks as pre-Fall-2023 and outdated -- not used here).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const geolMajorProfessional: Program = {
  id: "geol-major-professional",
  name: "Geology Major (Professional Track)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Geology Major; " +
    "Department of Geological, Environmental, and Planetary Sciences, B.S. Degree in Geology (Professional Track), " +
    "https://www.geol.umd.edu/undergraduate/majorproftrack2308.php (fetched 2026-09-27)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Posted advisor-approved substitution (owner, 2026-10-07: posted alternatives are encoded): '... or appropriate substitution with the approval of the department.' The substitute isn't a fixed course list, so geol-elective carry advisorMayApprove (the Advisor tells the student another course may count with approval).",
    "The catalog and the current department page (majorproftrack2308.php) agree closely on this track's course list and structure; no department-vs-catalog disagreement found worth flagging.",
    "'Geologic Core Disciplines: choose one course from each of [the department page says four, but prints five] groups' -- encoded as five separate choose-one requirements (Quantitative Reasoning, Surface Processes, Geophysics, Geochemistry, Geobiology); the department page's own group count in its summary sentence doesn't match the five groups it then lists, a source inconsistency rather than a department-vs-catalog one.",
    "The 'Geology Elective (3-4 credits, any 300-400 level GEOL course)' is encoded as a `choose` pool over the GEOL department at the 300-400 level, excluding every course already used by a flat or choose-one requirement above (so it can't be double-counted against itself).",
    "Not encoded (engine gap, both sources agree): 'a grade of C- or better in required geology courses, and an average of C- or better in the supporting courses' -- the average-GPA-in-supporting-courses half isn't a per-course minGrade the engine can express. Manual check.",
  ],
  requirements: [
    { kind: "course", id: "geol-intro", name: "Physical or Environmental Geology", options: ["GEOL100", "GEOL120"] },
    { kind: "course", id: "geol110", name: "Introductory Geology Laboratory", options: ["GEOL110"] },
    { kind: "course", id: "geol102", name: "Historical Geology", options: ["GEOL102"] },
    { kind: "course", id: "geol322", name: "Mineralogy", options: ["GEOL322"] },
    { kind: "course", id: "geol341", name: "Structural Geology", options: ["GEOL341"] },
    { kind: "course", id: "geol342", name: "Stratigraphy and Sedimentation", options: ["GEOL342"] },
    { kind: "course", id: "geol423", name: "Optical Mineralogy", options: ["GEOL423"] },
    { kind: "course", id: "geol443", name: "Petrology", options: ["GEOL443"] },
    { kind: "course", id: "geol393", name: "Geology Senior Thesis I: Proposal", options: ["GEOL393"] },
    { kind: "course", id: "geol394", name: "Geology Senior Thesis II: Research", options: ["GEOL394"] },
    { kind: "course", id: "geol490", name: "Field Camp", options: ["GEOL490"] },
    { kind: "choose", id: "core-quantitative", name: "Quantitative Reasoning core discipline", count: 1, from: { courses: ["GEOL351", "GEOL413", "GEOL447"] } },
    { kind: "choose", id: "core-surface", name: "Surface Processes core discipline", count: 1, from: { courses: ["GEOL340", "GEOL451"] } },
    { kind: "choose", id: "core-geophysics", name: "Geophysics core discipline", count: 1, from: { courses: ["GEOL446", "GEOL455", "GEOL457", "GEOL460"] } },
    { kind: "choose", id: "core-geochemistry", name: "Geochemistry core discipline", count: 1, from: { courses: ["GEOL444", "GEOL445", "GEOL463"] } },
    { kind: "choose", id: "core-geobiology", name: "Geobiology core discipline", count: 1, from: { courses: ["GEOL331", "GEOL435", "GEOL436", "GEOL437"] } },
    {
      kind: "choose",
      id: "geol-elective", advisorMayApprove: true,
      name: "Geology elective (300-400 level)",
      credits: 3,
      from: {
        departments: ["GEOL"],
        minNumber: 300,
        maxNumber: 499,
        exclude: [
          "GEOL322", "GEOL341", "GEOL342", "GEOL423", "GEOL443", "GEOL393", "GEOL394", "GEOL490",
          "GEOL351", "GEOL413", "GEOL447", "GEOL340", "GEOL451", "GEOL446", "GEOL455", "GEOL457", "GEOL460",
          "GEOL444", "GEOL445", "GEOL463", "GEOL331", "GEOL435", "GEOL436", "GEOL437",
        ],
      },
    },
    { kind: "sets", id: "chemistry", name: "Chemistry sequence", options: [["CHEM131", "CHEM132"], ["CHEM135", "CHEM136"]] },
    { kind: "course", id: "math140", name: "Calculus I", options: ["MATH140"] },
    { kind: "course", id: "math141", name: "Calculus II", options: ["MATH141"] },
    { kind: "sets", id: "physics", name: "Physics sequence", options: [["PHYS161", "PHYS261"], ["PHYS171", "PHYS261"]] },
  ],
};

export const geolMajorProfessionalMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "Geology (Professional)", major: "geol", track: "Professional", defaultTrack: true, sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/geological-environmental-planetary-sciences/geology-major/", department: "https://www.geol.umd.edu/undergraduate/majorproftrack2308.php" } };
