// Fermentation Science Major at Shady Grove, 2026-27 UMD Academic Catalog (fetched 2026-09-28).
// Source: program-sources/fermentation-science.md. Its "Catalog requirements" section matches
// the College Park major's word for word, so this re-uses fermMajor's requirements.
// Encoded by hand. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { fermMajor } from "./ferm-major-2026-27.ts";

const CATALOG =
  "https://academiccatalog.umd.edu/undergraduate/colleges-schools/universities-shady-grove/fermentation-science/";

export const fermUsgMajor: Program = {
  ...fermMajor,
  id: "ferm-usg-major",
  name: "Fermentation Science Major at Shady Grove",
  source: `UMD Academic Catalog 2026-27, Fermentation Science Major at Shady Grove, ${CATALOG} (fetched 2026-09-28); department page not checked`,
  reviewNotes: [
    "Shady Grove version: the catalog's requirement table is identical to the College Park Fermentation Science major's, so the requirements are re-used from ferm-major (its review notes below apply here too).",
    ...(fermMajor.reviewNotes ?? []),
  ],
};

export const fermUsgMajorMeta: ProgramMeta = {
  kind: "major",
  college: "USG",
  short: "Fermentation Science (Shady Grove)",
  sources: { catalog: CATALOG },
};
