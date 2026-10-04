// Entomology Minor, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/entomology/entomology-minor/
// (fetched 2026-09-27); Department of Entomology,
// https://entomology.umd.edu/academics/undergraduate/entomology-minor (fetched 2026-09-27). Owner
// ruling (docs/project/rulings.md): where the department page and the catalog disagree, follow the
// department page (they agree here). No official published sample plan (built from the
// requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const entomologyMinor: Program = {
  id: "entm-minor",
  name: "Entomology Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Entomology Minor; Department of Entomology, " +
    "https://entomology.umd.edu/academics/undergraduate/entomology-minor (fetched 2026-09-27)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Both sources agree exactly: BSCI337 required; one Advanced Entomology course from a 6-course list; 2-3 courses from two of four elective areas (Advanced Biology, Pollination Biology, Plant Sciences, Environmental Sciences).",
    "'Choose 2-3 from two of the four areas (for BSCI majors, at least one from area III or IV)' is a distribution: 2 courses, one from each of two different areas (owner ruling 2026-09-28, \"from N different areas\"). A third elective is optional and not required. The BSCI-major sub-condition (one from area III or IV) is not encoded; manual check.",
    "'No more than 2 courses (6 credits) may count toward both the minor and major' -> maxSharedWith: [{ courses: 2 }].",
    "No declaration gate beyond emailing the department (open enrollment); nothing to encode there.",
  ],
  requirements: [
    { kind: "course", id: "generalEntomology", name: "Biology of Insects", options: ["BSCI337"] },
    {
      kind: "choose",
      id: "advanced",
      name: "Advanced Entomology course",
      count: 1,
      from: { courses: ["BSCI467", "BSCI480", "BSCI481", "BSCI483", "BSCI494", "BSCI497"] },
    },
    {
      kind: "distribution",
      id: "areaElectives",
      name: "Electives from two of: Advanced Biology, Pollination Biology, Plant Sciences, Environmental Sciences",
      count: 2,
      minAreas: 2,
      maxPerArea: 1,
      areas: [
        { name: "Advanced Biology", courses: ["BSCI361", "BSCI363", "BSCI370", "BSCI392", "BSCI393", "BSCI410", "BSCI430"] },
        { name: "Pollination Biology", courses: ["BSCI121", "BSCI126"] },
        { name: "Plant Sciences", courses: ["PLSC205", "PLSC226", "PLSC253", "PLSC254", "PLSC405", "PLSC407", "PLSC420", "PLSC453"] },
        {
          name: "Environmental Sciences",
          courses: ["ENST233", "ENST333", "ENST334", "ENST360", "ENST403", "ENST410", "ENST436", "ENST441", "ENST445", "ENST450"],
        },
      ],
    },
  ],
};

export const entomologyMinorMeta: ProgramMeta = { kind: "minor", college: "CMNS", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/entomology/entomology-minor/", department: "https://entomology.umd.edu/academics/undergraduate/entomology-minor" } };
