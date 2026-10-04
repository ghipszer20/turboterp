// Japanese Minor, 2026–27 UMD Academic Catalog (School of Languages, Literatures, and Cultures).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/japanese/japanese-minor/
// and https://sllc.umd.edu/fields/japanese/minor (both fetched 2026-09-28). Owner ruling: the department
// page wins where it disagrees with the catalog. No official sample plan (built from the requirements;
// see docs/project/owner-review.md). Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const LANGUAGE = ["JAPN202", "JAPN301", "JAPN302", "JAPN311", "JAPN401", "JAPN402", "JAPN407", "JAPN499"];
const LINGUISTICS = ["JAPN421", "JAPN422", "JAPN428", "JAPN438"];
const LITERATURE = ["JAPN221", "JAPN314", "JAPN315", "JAPN316", "JAPN325", "JAPN424", "JAPN425", "JAPN498"];

export const japnMinor: Program = {
  id: "japn-minor",
  name: "Japanese Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Japanese Minor; SLLC Japanese minor page, https://sllc.umd.edu/fields/japanese/minor (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department-vs-catalog differences: the department page gives only category totals (language acquisition 6, linguistics 3, literature/cultural studies 3; 15 credits) and no course lists, so the catalog's lists are used. It adds an 18-credit prerequisite sequence (JAPN101, JAPN102, JAPN201, 6 credits each) that the catalog does not list among the minor requirements; not encoded as minor requirements, since they are prerequisites. It says 'no more than 6 credits transferred from study abroad'; the catalog says 'no more than 6 credits at an institution other than UMCP'. Both are manual.",
    "The language slot takes 6 credits from the catalog's language list (JAPN202, JAPN301, JAPN302 are 6 credits each). The fourth course is one further course from any of the three lists (the catalog says '3 credit'; the engine cannot filter by credits).",
    "'At least nine of the fifteen credits at 3xx/4xx' is an overlay over JAPN 300-499.",
    "Manual: prior-experience placement test (FLPT) and advisor consult; program GPA 2.0 encoded as minGpa. Neither source states a cap on overlap with the major, so none is set.",
  ],
  requirements: [
    { kind: "choose", id: "language", name: "6 credits of Japanese language courses", credits: 6, from: { courses: LANGUAGE } },
    { kind: "choose", id: "linguistics", name: "One Japanese linguistics course", count: 1, from: { courses: LINGUISTICS } },
    { kind: "choose", id: "literature", name: "One Japanese literature/cultural studies course", count: 1, from: { courses: LITERATURE } },
    {
      kind: "choose",
      id: "additional",
      name: "One additional course from the lists above",
      count: 1,
      from: { courses: [...LANGUAGE, ...LINGUISTICS, ...LITERATURE] },
    },
    {
      kind: "choose",
      id: "upper-level",
      name: "9 credits at the 300 or 400 level",
      overlay: true,
      credits: 9,
      from: { departments: ["JAPN"], minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const japnMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Japanese",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/japanese/japanese-minor/",
    department: "https://sllc.umd.edu/fields/japanese/minor",
  },
};
