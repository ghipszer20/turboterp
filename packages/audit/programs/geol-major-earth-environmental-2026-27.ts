// Geology Major, Earth and Environmental Sciences Track, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/geological-environmental-planetary-sciences/geology-major/;
// Department of Geological, Environmental, and Planetary Sciences, "B.S. Degree in Geology
// (Earth and Environmental Sciences Track)", https://www.geol.umd.edu/undergraduate/majoreaestrack2308.php
// (effective Fall 2023, fetched 2026-09-27; the department's own program-overview page lists this
// as the current page for the track).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const geolMajorEarthEnvironmental: Program = {
  id: "geol-major-earth-environmental",
  name: "Geology Major (Earth and Environmental Sciences Track)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Geology Major; " +
    "Department of Geological, Environmental, and Planetary Sciences, B.S. Degree in Geology (Earth and Environmental Sciences Track), " +
    "https://www.geol.umd.edu/undergraduate/majoreaestrack2308.php (fetched 2026-09-27)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Posted advisor-approved substitution (owner, 2026-10-07: posted alternatives are encoded): '... or appropriate substitution with the approval of the department.' The substitute isn't a fixed course list, so earth-sciences-elective carry advisorMayApprove (the Advisor tells the student another course may count with approval).",
    "The department page's 'Supporting Courses' names one slot only as 'One atmospheric/astronomy/teaching course -- 3 cr' without listing options; the catalog's own extraction of this track names the three options explicitly (AOSC123, AOSC200, or ASTR120). Used the catalog's explicit list here since the department page is silent on the specific codes, not because the two disagree.",
    "'Earth Sciences Core Disciplines: choose one from each of five groups' -- encoded as five separate choose-one requirements (Analytic Methods, Environmental Geosciences, Geophysics, Earth Materials, Geobiology). GEOL437 appears in both the Environmental Geosciences and Geobiology lists; the department page notes it 'cannot double-count' across them, which the engine already guarantees for non-overlay requirements (a course counts toward at most one requirement), so no extra encoding is needed.",
    "'Earth Sciences Electives: two additional 300-400 level GEOL courses' is encoded as a `choose` pool over the GEOL department at the 300-400 level, excluding every course already used by a flat or choose-one requirement above.",
    "'Experiential Learning (3-6 credits): GEOL386, GEOL490, or GEOL499' encoded as a `choose` credits:3 pool; the department page's note that GEOL490 also satisfies one Earth Sciences elective isn't separately enforced (would need an overlay, and the page doesn't say it's required to be treated that way -- just that it can be).",
    "Not encoded (engine gap, both sources agree): 'a grade of C- or better in required geology courses, and a C- average or better in supporting courses' -- the average-GPA-in-supporting-courses half isn't a per-course minGrade the engine can express. Manual check.",
  ],
  requirements: [
    { kind: "course", id: "geol-intro", name: "Physical or Environmental Geology", options: ["GEOL100", "GEOL120"] },
    { kind: "course", id: "geol110", name: "Introductory Geology Laboratory", options: ["GEOL110"] },
    { kind: "choose", id: "historical-context", name: "Historical context course", count: 1, from: { courses: ["GEOL123", "GEOL124", "GEOL200", "GEOL204", "GEOL212"] } },
    { kind: "course", id: "geol102", name: "Historical Geology", options: ["GEOL102"] },
    { kind: "course", id: "geol322", name: "Mineralogy", options: ["GEOL322"] },
    { kind: "course", id: "geol340", name: "Geomorphology", options: ["GEOL340"] },
    { kind: "course", id: "geol341", name: "Structural Geology", options: ["GEOL341"] },
    { kind: "course", id: "geol342", name: "Stratigraphy and Sedimentation", options: ["GEOL342"] },
    { kind: "choose", id: "experiential-learning", name: "Experiential learning", credits: 3, from: { courses: ["GEOL386", "GEOL490", "GEOL499"] } },
    { kind: "choose", id: "core-analytic", name: "Analytic Methods core discipline", count: 1, from: { courses: ["GEOG373", "GEOL351", "GEOL413", "GEOL447"] } },
    { kind: "choose", id: "core-environmental", name: "Environmental Geosciences core discipline", count: 1, from: { courses: ["GEOL375", "GEOL423", "GEOL437", "GEOL451", "GEOL452", "GEOL453"] } },
    { kind: "choose", id: "core-geophysics", name: "Geophysics core discipline", count: 1, from: { courses: ["GEOL446", "GEOL455", "GEOL456", "GEOL457", "GEOL460"] } },
    { kind: "choose", id: "core-earth-materials", name: "Earth Materials core discipline", count: 1, from: { courses: ["GEOL443", "GEOL444", "GEOL445"] } },
    { kind: "choose", id: "core-geobiology", name: "Geobiology core discipline", count: 1, from: { courses: ["GEOL331", "GEOL391", "GEOL431", "GEOL435", "GEOL436", "GEOL437"] } },
    {
      kind: "choose",
      id: "earth-sciences-elective", advisorMayApprove: true,
      name: "Earth Sciences electives (2 courses, 300-400 level)",
      credits: 6,
      from: {
        departments: ["GEOL"],
        minNumber: 300,
        maxNumber: 499,
        exclude: [
          "GEOL322", "GEOL340", "GEOL341", "GEOL342", "GEOL386", "GEOL490", "GEOL499",
          "GEOG373", "GEOL351", "GEOL413", "GEOL447", "GEOL375", "GEOL423", "GEOL437", "GEOL451", "GEOL452", "GEOL453",
          "GEOL446", "GEOL455", "GEOL456", "GEOL457", "GEOL460", "GEOL443", "GEOL444", "GEOL445",
          "GEOL331", "GEOL391", "GEOL431", "GEOL435", "GEOL436",
        ],
      },
    },
    { kind: "course", id: "atmos-astro", name: "Atmospheric/astronomy course", options: ["AOSC123", "AOSC200", "ASTR120"] },
    { kind: "sets", id: "chemistry", name: "Chemistry sequence", options: [["CHEM131", "CHEM132"], ["CHEM135", "CHEM136"]] },
    { kind: "course", id: "math140", name: "Calculus I", options: ["MATH140"] },
    { kind: "course", id: "math141", name: "Calculus II", options: ["MATH141"] },
    { kind: "sets", id: "physics", name: "Physics sequence", options: [["PHYS161", "PHYS261"], ["PHYS171", "PHYS261"]] },
  ],
};

export const geolMajorEarthEnvironmentalMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "Geology (Earth & Env. Sciences)", major: "geol", track: "Earth and Environmental Sciences", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/geological-environmental-planetary-sciences/geology-major/", department: "https://www.geol.umd.edu/undergraduate/majoreaestrack2308.php" } };
