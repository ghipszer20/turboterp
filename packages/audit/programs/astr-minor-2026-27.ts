// Astronomy Minor, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/astronomy/astronomy-minor/
// (fetched 2026-09-27); Department of Astronomy,
// https://www.astro.umd.edu/education/undergraduate/astronomy-minor (fetched 2026-09-27). Owner
// ruling (docs/project/rulings.md): where the department page and the catalog disagree, follow the
// department page. No official published sample plan (built from the requirements below; see
// docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const astronomyMinor: Program = {
  id: "astr-minor",
  name: "Astronomy Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Astronomy Minor; Department of Astronomy, " +
    "https://www.astro.umd.edu/education/undergraduate/astronomy-minor (fetched 2026-09-27)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Department-vs-catalog difference (owner ruling in rulings.md: where the department page lists fewer options than the catalog, accept both lists): the catalog's upper-level list adds 'ASTR498: Special Problems in Astronomy' and 'a department-approved alternative course' to the seven named courses; the department page lists only the seven. ASTR498 is accepted. The open-ended 'department-approved alternative course' names no course, so it is a manual check.",
    "'No course with an earned grade below C- may count toward a minor' (department) matches the catalog's 'C- or better'; encoded as the Program's minGrade.",
    "Department-vs-catalog difference: the department page adds 'not open to astronomy, physics, or physical sciences majors'; the catalog is silent on eligibility. Enforced via notOpenTo (astronomy and physics majors, every track). The Physical Sciences major is not encoded yet; add its id here when it is.",
    "'Must schedule an appointment to register for the minor before completing the final 30 credits' (catalog) is an advising/timing rule, not encoded.",
    "Neither source states a sharing cap with another program; none is set.",
  ],
  requirements: [
    { kind: "course", id: "intro", name: "Introductory course", options: ["ASTR100", "ASTR101"] },
    { kind: "course", id: "intermediate", name: "Intermediate course", options: ["ASTR220", "ASTR230"] },
    {
      kind: "choose",
      id: "upperLevel",
      name: "Upper-level courses",
      count: 3,
      from: { courses: ["ASTR300", "ASTR305", "ASTR315", "ASTR330", "ASTR340", "ASTR350", "ASTR380", "ASTR498"] },
    },
  ],
};

export const astronomyMinorMeta: ProgramMeta = { kind: "minor", college: "CMNS", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/astronomy/astronomy-minor/", department: "https://www.astro.umd.edu/education/undergraduate/astronomy-minor" }, notOpenTo: { programs: ["astr", "phys"], reason: "Not open to astronomy, physics or physical sciences majors." } };
