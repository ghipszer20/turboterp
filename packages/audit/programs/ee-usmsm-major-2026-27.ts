// Electrical Engineering Major at Southern Maryland, 2026-27 UMD Academic Catalog (fetched 2026-09-28).
// Source: program-sources/electrical-engineering-usmsm.md. Requirements match the College Park major's, so this
// re-uses eeMajor's requirements. Encoded by hand. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { eeMajor } from "./ee-major-2026-27.ts";

const CATALOG = "https://academiccatalog.umd.edu/undergraduate/colleges-schools/college-of-southern-maryland/electrical-engineering-usmsm/";

export const eeUsmsmMajor: Program = {
  ...eeMajor,
  id: "ee-usmsm-major",
  name: "Electrical Engineering Major at Southern Maryland",
  source: `UMD Academic Catalog 2026-27, Electrical Engineering Major at Southern Maryland, ${CATALOG}; department pages https://usmsm.umd.edu/; https://ece.umd.edu/ee-so-md-program (fetched 2026-09-28)`,
  reviewNotes: [
    "Same requirements as the College Park Electrical Engineering major (ee-major); this program mirrors it for students at Southern Maryland.",
    "The ECE Southern Maryland page lists which junior and senior courses are offered on site; that is a scheduling list, not a narrower requirement, so the College Park requirements are unchanged.",
    "This program is run by the A. James Clark School of Engineering, so its college is ENGR (the catalog URL slug is college-of-southern-maryland and there is no USMSM college key). Flagged in docs/project/owner-review.md.",
    ...(eeMajor.reviewNotes ?? []),
  ],
};

export const eeUsmsmMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ENGR",
  short: "Electrical Engineering (Southern Maryland)",
  sources: { catalog: CATALOG, department: "https://usmsm.umd.edu/" },
};
