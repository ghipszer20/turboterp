// Criminology and Criminal Justice Major at Shady Grove, 2026-27 UMD Academic Catalog (fetched 2026-09-28).
// Source: program-sources/behavioral-social-sciences-criminology-criminal-justice-major.md. Its
// requirements table matches the College Park major's (wording differs only), so this re-uses
// ccjsMajor's requirements. Encoded by hand. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { ccjsMajor } from "./ccjs-major-2026-27.ts";

const CATALOG = "https://academiccatalog.umd.edu/undergraduate/colleges-schools/universities-shady-grove/behavioral-social-sciences/criminology-criminal-justice-major/";

export const ccjsUsgMajor: Program = {
  ...ccjsMajor,
  id: "ccjs-usg-major",
  name: "Criminology and Criminal Justice Major at Shady Grove",
  source: `UMD Academic Catalog 2026-27, Criminology and Criminal Justice Major at Shady Grove, ${CATALOG} (fetched 2026-09-28)`,
  reviewNotes: [
    "Same requirements as the College Park Criminology and Criminal Justice major (ccjs-major); the Shady Grove catalog table differs only in wording (it omits the Fall 2015 matriculation sentence and the 'College Requirements' heading). This program mirrors it for students at Shady Grove.",
    "Shady Grove is a two-year transfer (2+2) cohort; lower-level requirements stay in the audit and are expected to be satisfied by transfer credit.",
    ...(ccjsMajor.reviewNotes ?? []),
  ],
};

export const ccjsUsgMajorMeta: ProgramMeta = {
  kind: "major",
  college: "USG",
  short: "Criminology & Criminal Justice (Shady Grove)",
  sources: { catalog: CATALOG, department: "https://ccjs.umd.edu/undergraduate/ccjs-major-requirements" },
};
