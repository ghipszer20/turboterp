// Nuclear Engineering Minor, 2026–27 UMD Academic Catalog (Department of Mechanical Engineering).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/mechanical-engineering/nuclear-engineering-minor/
// and https://enme.umd.edu/undergraduate/degrees/minor-nuclear-engineering (both fetched 2026-09-28).
// Owner ruling: where the department page and the catalog disagree, follow the department page.
// No official published sample plan (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const nuclearEngineeringMinor: Program = {
  id: "nuclear-engineering-minor",
  name: "Nuclear Engineering Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Nuclear Engineering Minor; Department of Mechanical Engineering, " +
    "https://enme.umd.edu/undergraduate/degrees/minor-nuclear-engineering (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Catalog and department page agree on the four core courses (ENME430, ENME431, ENME432, ENRE447), 15 credits, C- in every course, and the cap of two of the five courses counting toward the major (-> maxSharedWith: [{ courses: 2 }]; 'with approval of the major department' is not enforced).",
    "Open slot 'nuclear-elective' (openSlot requirement): 3 credits of Nuclear Engineering Elective; no list is published (the minor advisor approves it), so the student confirms it with the advisor. The department page only suggests ENME488, ENME489_, ENME433, ENMA422 and ENEE474, so the slot takes no courses rather than being narrowed to those.",
    "Department-page-only rules, not encoded: to apply, students must have completed MATH246 (or equivalent) and PHYS270/271 (or equivalent) and hold a minimum 2.0 GPA; priority goes to Clark School students (the department page says the minor is open to any Clark School student).",
  ],
  requirements: [
    { kind: "course", id: "enme430", name: "Fundamentals of Nuclear Reactor Engineering", options: ["ENME430"] },
    { kind: "course", id: "enme431", name: "Nuclear Reactor Systems and Safety", options: ["ENME431"] },
    { kind: "course", id: "enme432", name: "Reactor and Radiation Measurements Laboratory", options: ["ENME432"] },
    { kind: "course", id: "enre447", name: "Fundamentals of Reliability Engineering", options: ["ENRE447"] },
    {
      kind: "openSlot",
      id: "nuclear-elective",
      name: "Nuclear Engineering elective",
      credits: 3,
      note: "The minor advisor approves this elective; no list is published. The department page only suggests ENME488, ENME489_, ENME433, ENMA422 and ENEE474.",
    },
  ],
};

export const nuclearEngineeringMinorMeta: ProgramMeta = { kind: "minor", college: "ENGR", short: "Nuclear Eng. Minor", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/mechanical-engineering/nuclear-engineering-minor/", department: "https://enme.umd.edu/undergraduate/degrees/minor-nuclear-engineering" } };
