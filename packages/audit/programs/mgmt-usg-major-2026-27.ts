// Management Major at Shady Grove, 2026-27 UMD Academic Catalog (fetched 2026-09-28).
// Source: program-sources/management.md. Requirements match the College Park major's, so this
// re-uses mgmtMajor's requirements. Encoded by hand. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { mgmtMajor } from "./mgmt-major-2026-27.ts";

const CATALOG = "https://academiccatalog.umd.edu/undergraduate/colleges-schools/universities-shady-grove/business/management/";

export const mgmtUsgMajor: Program = {
  ...mgmtMajor,
  id: "mgmt-usg-major",
  name: "Management Major at Shady Grove",
  source: `UMD Academic Catalog 2026-27, Management Major at Shady Grove, ${CATALOG}; department pages https://www.rhsmith.umd.edu/programs/undergraduate/shady-grove; https://www.rhsmith.umd.edu/programs/undergraduate/academics/academic-majors (fetched 2026-09-28)`,
  reviewNotes: [
    "Same requirements as the College Park Management major (mgmt-major); this program mirrors it for students at Shady Grove.",
    "Shady Grove is a two-year transfer (2+2) cohort; the lower-level business core stays in the requirements and is expected to be satisfied by transfer credit.",
    ...(mgmtMajor.reviewNotes ?? []),
  ],
};

export const mgmtUsgMajorMeta: ProgramMeta = {
  kind: "major",
  college: "USG",
  short: "Management (Shady Grove)",
  sources: { catalog: CATALOG, department: "https://www.rhsmith.umd.edu/programs/undergraduate/shady-grove" },
};
