// Chinese Studies Minor, 2026–27 UMD Academic Catalog (School of Languages, Literatures, and Cultures).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/chinese/chinese-studies-minor/
// and https://sllc.umd.edu/chinese (both fetched 2026-09-28). The department page is a program homepage
// with no requirements, so the encoding follows the catalog. No official sample plan (built from the
// requirements; see docs/project/owner-review.md). Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const chinStudiesMinor: Program = {
  id: "chin-minor-studies",
  name: "Chinese Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Chinese Studies Minor; SLLC Chinese program, https://sllc.umd.edu/chinese (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page not checked: https://sllc.umd.edu/chinese carries no requirements (it mentions 'two Chinese minors' -- this one and the Chinese Language Minor). Encoded from the catalog.",
    "17 credits: CHIN206 + CHIN207 (4 credits each) and all three foundation topic courses (CHIN307, CHIN315, CHIN441; 17 - 8 = 9 credits).",
    "Not encoded (advisor approval): CHIN207 may be replaced by one 3-credit upper-level CHIN course plus 1 credit of CHIN386/CHIN499; other China-topic courses may replace the foundation courses when those are not offered. Marked advisorMayApprove (chin207, foundation-topics): other courses may count with advisor approval; only the listed courses count.",
    "'9 of the 17 credits at 300/400 level' is encoded as an overlay over CHIN 300-499 (the three foundation courses already meet it).",
    "Manual: no more than 6 of the 17 credits at another institution. The catalog states no cap on overlap with the major, so none is set. Program GPA 2.0 encoded as minGpa.",
  ],
  requirements: [
    { kind: "course", id: "chin206", name: "Intermediate Chinese I", options: ["CHIN206"] },
    { kind: "course", id: "chin207", name: "Intermediate Chinese II", options: ["CHIN207"], advisorMayApprove: true },
    {
      kind: "choose",
      id: "foundation-topics",
      advisorMayApprove: true,
      name: "Foundation topics courses (CHIN307, CHIN315, CHIN441)",
      count: 3,
      from: { courses: ["CHIN307", "CHIN315", "CHIN441"] },
    },
    {
      kind: "choose",
      id: "upper-level",
      name: "9 credits at the 300 or 400 level",
      overlay: true,
      credits: 9,
      from: { departments: ["CHIN"], minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const chinStudiesMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Chinese Studies",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/chinese/chinese-studies-minor/",
    department: "https://sllc.umd.edu/chinese",
  },
};
