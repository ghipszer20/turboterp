// Art History Minor, 2026–27 UMD Academic Catalog (Department of Art History and Archaeology).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art-history-archaeology/
// art-history-minor/ and the department site https://arthistory.umd.edu/ (fetched 2026-09-28; the
// fetched department page is only a homepage with no requirements).
// The Archaeology Minor is cross-listed with Classics and is encoded once, as clas-minor-archaeology.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const arthMinor: Program = {
  id: "arth-minor",
  name: "Art History Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Art History Minor " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art-history-archaeology/art-history-minor/); " +
    "Department of Art History and Archaeology, https://arthistory.umd.edu/ (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page not checked: the fetched arthistory.umd.edu page is only a homepage with no requirements, so this is encoded from the catalog alone.",
    "Three ARTH courses at 2xx (one may be a Big Question course) and three at 3xx or 4xx = 18 credits. The catalog's footnote lists example 2xx courses ('include, but are not limited to' ARTH200, 201, 221, 230, 250, 255, 275, 290), so every ARTH 2xx course is accepted.",
    "Not encoded (manual): at most 6 credits may be transferred in from other institutions or programs (study abroad needs prior approval of the Director of Undergraduate Studies). The source states no overlap cap with the major, so no maxSharedWith is set. Program GPA 2.0 encoded as minGpa.",
    "Cross-listing: the Archaeology Minor appears under both Art History and Archaeology and Classical Languages and Literatures; it is encoded once as clas-minor-archaeology, not here.",
  ],
  requirements: [
    {
      kind: "choose",
      id: "arth-2xx",
      name: "Three ARTH courses at the 2xx level (one may be a Big Question course)",
      count: 3,
      from: { departments: ["ARTH"], minNumber: 200, maxNumber: 299 },
    },
    {
      kind: "choose",
      id: "arth-3xx-4xx",
      name: "Three ARTH courses at the 3xx or 4xx level",
      count: 3,
      from: { departments: ["ARTH"], minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const arthMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Art History",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/art-history-archaeology/art-history-minor/",
    department: "https://arthistory.umd.edu/",
  },
};
