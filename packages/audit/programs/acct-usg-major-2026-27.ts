// Accounting Major at Shady Grove, 2026-27 UMD Academic Catalog (fetched 2026-09-28).
// Source: program-sources/accounting.md. Requirements match the College Park major's, so this
// re-uses acctMajor's requirements. Encoded by hand. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { acctMajor } from "./acct-major-2026-27.ts";

const CATALOG = "https://academiccatalog.umd.edu/undergraduate/colleges-schools/universities-shady-grove/business/accounting/";

export const acctUsgMajor: Program = {
  ...acctMajor,
  id: "acct-usg-major",
  name: "Accounting Major at Shady Grove",
  source: `UMD Academic Catalog 2026-27, Accounting Major at Shady Grove, ${CATALOG}; department pages https://www.rhsmith.umd.edu/programs/undergraduate/shady-grove; https://www.rhsmith.umd.edu/programs/undergraduate/academics/academic-majors (fetched 2026-09-28)`,
  reviewNotes: [
    "Same requirements as the College Park Accounting major (acct-major); this program mirrors it for students at Shady Grove.",
    "The Shady Grove catalog page's Business and Accounting Advisory track says 'Select two of the following: | 9' and 'Total Credits | 12', and its 'or one of the following accounting courses not selected above' list drops BMGT313. The Smith department page (academic-majors section) says 'Two of the following courses' and keeps BMGT313 in that list, matching College Park. The department page wins, so the College Park encoding is used unchanged. Flagged in docs/project/owner-review.md.",
    "Shady Grove is a two-year transfer (2+2) cohort; the lower-level business core stays in the requirements and is expected to be satisfied by transfer credit.",
    ...(acctMajor.reviewNotes ?? []),
  ],
};

export const acctUsgMajorMeta: ProgramMeta = {
  kind: "major",
  college: "USG",
  short: "Accounting (Shady Grove)",
  sources: { catalog: CATALOG, department: "https://www.rhsmith.umd.edu/programs/undergraduate/shady-grove" },
};
