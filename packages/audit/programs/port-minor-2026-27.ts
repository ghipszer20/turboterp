// Portuguese and Brazilian Studies Minor, 2026–27 UMD Academic Catalog (School of Languages, Literatures, and Cultures).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/
// portuguese-brazilian-studies-minor/ and https://sllc.umd.edu/fields/portuguese (both fetched 2026-09-28).
// The department page is only the program homepage (no requirements), so the catalog is the sole
// source for the rules. No official published sample plan. Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const PORT_LIST = [
  "PORT205", "PORT224", "PORT228", "PORT320", "PORT408", "PORT409", "PORT478", "PORT222", "PORT229",
  "PORT234", "PORT235", "PORT269", "PORT332", "PORT369", "PORT386", "PORT388", "PORT399", "PORT405",
  "PORT480", "PORT207", "PORT223", "PORT230",
];

export const portMinor: Program = {
  id: "port-minor",
  name: "Portuguese and Brazilian Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Portuguese and Brazilian Studies Minor; " +
    "Department page https://sllc.umd.edu/fields/portuguese (fetched 2026-09-28; homepage only, no requirements)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page not checked: the fetched sllc.umd.edu/fields/portuguese page is only the program homepage with no minor requirements; encoded from the catalog alone.",
    "Prerequisites PORT103 and PORT203 (or equivalent via advisor) aren't part of the 15 credits, so they aren't Requirements.",
    "Catalog table is garbled (PORT223 and PORT224 appear without titles; the list is split into two groups with no stated difference). All 22 listed courses are treated as one pool of 15 credits.",
    "'At least 9 credits in upper-level (3xx or 4xx) courses' is an overlay over the upper-level courses in the list (PORT320, 332, 369, 386, 388, 399, 405, 408, 409, 478, 480).",
    "'At least 6 credits taught in Portuguese, above PORT203' isn't encoded (no language-of-instruction concept; PORT228 and PORT478 are conducted in English, others unstated); manual check.",
    "Not encoded (manual): at most 6 credits from other institutions and 9 from a UMD Study Abroad program. No sharing cap is stated; none is set.",
  ],
  requirements: [
    {
      kind: "choose",
      id: "courses",
      name: "15 credits from the Portuguese and Brazilian studies list",
      credits: 15,
      from: { courses: PORT_LIST },
    },
    {
      kind: "choose",
      id: "upper-level",
      name: "At least 9 credits in upper-level (3xx or 4xx) courses",
      overlay: true,
      credits: 9,
      from: { courses: PORT_LIST.filter((c) => Number(c.slice(4)) >= 300) },
    },
  ],
};

export const portMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Portuguese & Brazilian Studies",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/portuguese-brazilian-studies-minor/",
    department: "https://sllc.umd.edu/fields/portuguese",
  },
};
