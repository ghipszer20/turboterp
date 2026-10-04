// Public Health Science Major at Shady Grove, 2026-27 UMD Academic Catalog (fetched 2026-09-28).
// Source: program-sources/public-health-science.md. Its "Catalog requirements" table matches the
// College Park major except that SPHL100 is replaced by PHSC300 Foundations of Public Health.
// Encoded by hand. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { phscMajor } from "./phsc-major-2026-27.ts";

const CATALOG =
  "https://academiccatalog.umd.edu/undergraduate/colleges-schools/universities-shady-grove/public-health-science/";

export const phscUsgMajor: Program = {
  ...phscMajor,
  id: "phsc-usg-major",
  name: "Public Health Science Major at Shady Grove",
  source: `UMD Academic Catalog 2026-27, Public Health Science Major at Shady Grove, ${CATALOG} (fetched 2026-09-28); department page not checked`,
  reviewNotes: [
    "Shady Grove version: the catalog table is the College Park Public Health Science table except that Foundations of Public Health is PHSC300 here instead of SPHL100; all other requirements are re-used from phsc-major (its review notes below apply here too).",
    "The catalog heading for this program reads 'Public Health Science Major at Shady Grove (Discontinued)'; the requirements are still encoded as listed. Confirm with the owner whether to offer it.",
    "Department page not checked: the sph.umd.edu Shady Grove page returned HTTP 403 at fetch. The four-year-plans page has no Shady Grove plan or benchmarks (only College Park), so the sample plan is CONSTRUCTED from phsc-major with PHSC300 in place of SPHL100.",
    ...(phscMajor.reviewNotes ?? []),
  ],
  requirements: phscMajor.requirements.map((r) =>
    r.id === "sphl-sphl100"
      ? {
          kind: "course",
          id: "phsc-usg-phsc300",
          name: "Foundations of Public Health (PHSC300)",
          options: ["PHSC300"],
        }
      : r,
  ),
};

export const phscUsgMajorMeta: ProgramMeta = {
  kind: "major",
  college: "USG",
  short: "Public Health Science (Shady Grove)",
  sources: {
    catalog: CATALOG,
    department: "https://sph.umd.edu/undergraduate-degrees/bs-public-health-science-shady-grove",
  },
};
