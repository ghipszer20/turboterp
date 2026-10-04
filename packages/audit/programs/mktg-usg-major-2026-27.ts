// Marketing Major at Shady Grove, 2026-27 UMD Academic Catalog (fetched 2026-09-28).
// Source: program-sources/marketing.md. Requirements match the College Park major's, so this
// re-uses mktgMajor's requirements. Encoded by hand. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { mktgMajor } from "./mktg-major-2026-27.ts";

const CATALOG = "https://academiccatalog.umd.edu/undergraduate/colleges-schools/universities-shady-grove/business/marketing/";

export const mktgUsgMajor: Program = {
  ...mktgMajor,
  id: "mktg-usg-major",
  name: "Marketing Major at Shady Grove",
  source: `UMD Academic Catalog 2026-27, Marketing Major at Shady Grove, ${CATALOG}; department pages https://www.rhsmith.umd.edu/programs/undergraduate/shady-grove; https://www.rhsmith.umd.edu/programs/undergraduate/academics/academic-majors (fetched 2026-09-28)`,
  reviewNotes: [
    "Same requirements as the College Park Marketing major (mktg-major); this program mirrors it for students at Shady Grove.",
    "Shady Grove is a two-year transfer (2+2) cohort; the lower-level business core stays in the requirements and is expected to be satisfied by transfer credit.",
    ...(mktgMajor.reviewNotes ?? []),
  ],
};

export const mktgUsgMajorMeta: ProgramMeta = {
  kind: "major",
  college: "USG",
  short: "Marketing (Shady Grove)",
  sources: { catalog: CATALOG, department: "https://www.rhsmith.umd.edu/programs/undergraduate/shady-grove" },
};
