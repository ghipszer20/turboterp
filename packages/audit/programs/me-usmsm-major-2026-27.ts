// Mechanical Engineering Major at Southern Maryland, 2026-27 UMD Academic Catalog (fetched 2026-09-28).
// Source: program-sources/mechanical-engineering-usmsm.md. Requirements match the College Park major's, so this
// re-uses meMajor's requirements. Encoded by hand. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { meMajor } from "./me-major-2026-27.ts";

const CATALOG = "https://academiccatalog.umd.edu/undergraduate/colleges-schools/college-of-southern-maryland/mechanical-engineering-usmsm/";

export const meUsmsmMajor: Program = {
  ...meMajor,
  id: "me-usmsm-major",
  name: "Mechanical Engineering Major at Southern Maryland",
  source: `UMD Academic Catalog 2026-27, Mechanical Engineering Major at Southern Maryland, ${CATALOG}; department pages https://usmsm.umd.edu/; https://me.umd.edu/academics/southern-maryland (fetched 2026-09-28)`,
  reviewNotes: [
    "Same requirements as the College Park Mechanical Engineering major (me-major); this program mirrors it for students at Southern Maryland.",
    "The department page gives no requirements (it points to eng.umd.edu/advising/transfer); the catalog table is identical to College Park's.",
    "This program is run by the A. James Clark School of Engineering, so its college is ENGR (the catalog URL slug is college-of-southern-maryland and there is no USMSM college key). Flagged in docs/project/owner-review.md.",
    ...(meMajor.reviewNotes ?? []),
  ],
};

export const meUsmsmMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ENGR",
  short: "Mechanical Engineering (Southern Maryland)",
  sources: { catalog: CATALOG, department: "https://usmsm.umd.edu/" },
};
