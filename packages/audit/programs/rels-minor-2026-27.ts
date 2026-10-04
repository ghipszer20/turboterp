// Religious Studies Minor, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/jewish-studies/religious-studies-minor/
// (fetched 2026-09-28); religious-studies.umd.edu (fetch failed: department page not checked).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

// Catalog's list of "other regularly-offered courses that may be counted", all levels.
const LISTED = [
  "ARTH200", "ARTH201", "ARTH290", "CLAS170", "CLAS330", "CLAS470", "ENGL262", "ENGL302", "ENGL310",
  "HIST111", "HIST120", "HIST284", "HIST287", "HIST306", "HIST330", "HIST331", "HIST332", "HIST333",
  "JWST141", "JWST171", "JWST225", "JWST274", "JWST324", "JWST331", "JWST430", "JWST492", "PHIL236",
];
const LISTED_UPPER = LISTED.filter((c) => Number(c.slice(4)) >= 300);

export const relsMinor: Program = {
  id: "rels-minor",
  name: "Religious Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Religious Studies Minor " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/jewish-studies/religious-studies-minor/), fetched 2026-09-28",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Department page not checked: religious-studies.umd.edu failed to fetch; encoded from the catalog alone.",
    "18 credits: RELS271, then five more courses of which at least three are 3xx/4xx. The catalog says the five 'can be in any of a variety of subjects, chosen in consultation with an advisor' and 'other courses may be taken with the permission of the minor advisor'; the qualifying list is held by the advisor. Encoded as every RELS course (100-499) plus the catalog's list of regularly-offered courses. Students with advisor-approved courses outside that range will need a manual check; the additional requirement is marked advisorMayApprove.",
    "Breadth requirement (diverse traditions beyond one geographic area, diverse time periods, multiple approaches, one focused-depth course) is not encodable; manual check.",
    "Not encoded: 2.0 minor GPA; at least 6 credits of 3xx/4xx at UMD and at most 6 credits at another institution (residency/transfer caps).",
    "'No more than six credits may also be applied to a major' -> maxSharedWith: [{ credits: 6 }].",
    "The catalog page lives under Jewish Studies but is the RELS program's minor; encoded once as rels-minor.",
  ],
  requirements: [
    { kind: "course", id: "rels271", name: "What is Religion?", options: ["RELS271"] },
    {
      kind: "choose",
      id: "additional",
      advisorMayApprove: true,
      name: "Five more courses (1xx-4xx) in religion",
      count: 5,
      from: { departments: ["RELS"], minNumber: 100, maxNumber: 499, courses: LISTED, exclude: ["RELS271"] },
    },
    {
      kind: "choose",
      id: "upper-level",
      name: "At least three of them at the 3xx or 4xx level (9 credits)",
      overlay: true,
      count: 3,
      from: { departments: ["RELS"], minNumber: 300, maxNumber: 499, courses: LISTED_UPPER },
    },
  ],
};

export const relsMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Religious Studies",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/jewish-studies/religious-studies-minor/",
    department: "https://religious-studies.umd.edu/",
  },
};
