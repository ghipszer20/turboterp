// History Minor, 2026–27 UMD Academic Catalog (Department of History).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/history/history-minor/
// and https://history.umd.edu/academics/undergraduate/history-minor (both fetched 2026-09-28).
// Owner ruling: where the department page and the catalog disagree, follow the department page.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const histMinor: Program = {
  id: "hist-minor",
  name: "History Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, History Minor; Department of History, https://history.umd.edu/academics/undergraduate/history-minor (fetched 2026-09-28)",
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Department-vs-catalog difference: the department page adds 'no more than 3 credits (1 course) may be at the 100-level'; the catalog is silent. Encoded per the department page (an overlay requiring 5 of the 6 courses at 200-level or above).",
    "Department-vs-catalog difference: the catalog lists the geographic fields (Africa and the African Diaspora, Asia, Europe, Latin America and the Caribbean, Middle East, Transregional, United States); the department page gives only examples ('Asia, Europe, Middle East, United States, etc.'). Neither source assigns fields or periods to courses, so 'at least 2 geographic fields' and 'at least one course each pre-1750 and post-1750' are manual.",
    "Not encoded (manual): the AP/IB/transfer cap (1 course); no History majors; courses used for one minor can't count toward another minor (maxSharedWith [{ courses: 2 }] caps sharing with any other program at 2 courses, but not the stricter minor-to-minor ban).",
    "'A maximum of 6 credits (2 courses) for both a major and a minor' -> maxSharedWith: [{ courses: 2 }]. Neither source states a minor GPA or minimum grade; none is set.",
  ],
  requirements: [
    {
      kind: "choose",
      id: "hist-courses",
      name: "Six History courses (18 credits)",
      count: 6,
      from: { departments: ["HIST"], minNumber: 100, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "hist-3xx",
      name: "Three courses at 3xx-level or above",
      overlay: true,
      count: 3,
      from: { departments: ["HIST"], minNumber: 300, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "hist-max-one-100",
      name: "At most one 100-level course (five courses at 200-level or above)",
      overlay: true,
      count: 5,
      from: { departments: ["HIST"], minNumber: 200, maxNumber: 499 },
    },
  ],
};

export const histMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "History",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/history/history-minor/",
    department: "https://history.umd.edu/academics/undergraduate/history-minor",
  },
};
