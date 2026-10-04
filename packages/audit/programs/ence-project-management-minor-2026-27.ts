// Project Management Minor, 2026–27 UMD Academic Catalog (Department of Civil and Environmental Engineering).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/civil-environmental-engineering/project-management-minor/
// and https://pm.umd.edu/program/undergraduate-minor-in-project-management (both fetched 2026-09-28).
// Owner ruling: satisfied by either the catalog set or the department set.
// No official published sample plan (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const projectManagementMinor: Program = {
  id: "project-management-minor",
  name: "Project Management Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Project Management Minor; Project Management Center for Excellence, " +
    "https://pm.umd.edu/program/undergraduate-minor-in-project-management (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Department-vs-catalog difference. Catalog: ENCE312 or ENCE325 (Fundamentals), ENCE426 or ARCH472 (Integrated Teams), ENCE424, ENCE423, plus one elective of ENCE421/ENCE420/ARCH430/ARCH462/ARCH467. Department page: four core courses ENCE320, ENCE422, ENCE423, ENCE424, plus one elective of ENCE421 or ENCE426. Owner ruling (rulings.md): satisfied by EITHER the catalog set or the department set; encoded as a `sets` requirement with those two options.",
    "Both sources agree on 15 credits, C- or better in every course, ENCE423, ENCE424, and ENCE421 as an elective.",
    "Eligibility (department page), not encoded: open to students in the Clark School of Engineering or the School of Architecture, Planning & Preservation with at least 60 credits and a 3.0 GPA or higher.",
    "Neither source states a sharing cap, so none is set.",
  ],
  requirements: [
    {
      kind: "sets",
      id: "pm-either-set",
      name: "Catalog set or department set",
      options: [
        // Catalog
        [
          { count: 1, from: { courses: ["ENCE312", "ENCE325"] } },
          { count: 1, from: { courses: ["ENCE426", "ARCH472"] } },
          "ENCE424",
          "ENCE423",
          { count: 1, from: { courses: ["ENCE421", "ENCE420", "ARCH430", "ARCH462", "ARCH467"] } },
        ],
        // Department page
        ["ENCE320", "ENCE422", "ENCE423", "ENCE424", { count: 1, from: { courses: ["ENCE421", "ENCE426"] } }],
      ],
    },
  ],
};

export const projectManagementMinorMeta: ProgramMeta = { kind: "minor", college: "ENGR", short: "Project Mgmt. Minor", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/civil-environmental-engineering/project-management-minor/", department: "https://pm.umd.edu/program/undergraduate-minor-in-project-management" } };
