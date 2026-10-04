// Global Poverty Minor, 2026-27 UMD Academic Catalog (Department of Agricultural and Resource Economics).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/
// agricultural-resource-economics/global-poverty-minor/ and https://arec.umd.edu/ (fetched 2026-09-28).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const SIGNATURE_POVERTY = ["AREC345", "AREC365"];

const SIGNATURE_GLOBAL = [
  "ANTH265", "GEOG330", "GVPT200", "GVPT280", "GVPT282", "GVPT289A", "GVPT289J", "GVPT289L",
  "GVPT306", "GVPT309", "GVPT354", "GVPT359", "ENES269", "ENES316", "ENES464", "ENES472",
  "ENES474", "BSST330", "BSST331", "BSST334", "BSST335", "BSST340", "BSST370", "BSST372",
];

const ELECTIVES = [
  "GEOG130", "GEOG330", "GEOG423", "AREC345", "AREC365", "AREC360", "ANTH265", "GVPT282",
  "ECON314", "ECON315", "ECON317", "ECON375", "ECON416", "ECON418", "ENST100", "FMSC110",
  "FMSC310", "FMSC381", "GVPT200", "GVPT289A", "GVPT289J", "GVPT306", "GVPT354",
  "HONR228N", "HONR228R", "NFSC425", "AREC260", "ANTH210", "ANTH310", "CCJS325", "CCJS370",
  "ECON175", "HLTH325", "FGSM380", "MIEH400",
];

// 300-400-level courses among every course the minor accepts (for the "9 credits at 300-400" rule).
const UPPER_LEVEL = [
  ...new Set([...SIGNATURE_POVERTY, ...SIGNATURE_GLOBAL, ...ELECTIVES]),
].filter((id) => Number(id.slice(4, 7)) >= 300);

export const arecGlobalPovertyMinor: Program = {
  id: "arec-global-poverty-minor",
  name: "Global Poverty Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Global Poverty Minor; Department of Agricultural and Resource Economics, " +
    "https://arec.umd.edu/ (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page not checked: the fetched arec.umd.edu page is the homepage only (it names the minor but publishes no requirements). Encoded from the catalog.",
    "Catalog lists several courses without titles or as bare suffix rows (GVPT289A, GVPT289J, GVPT289 with 'GVPT289L' as its example; ENES316/464/474; BSST330; NFSC425; MIEH400; GEOG423). Encoded exactly as listed; GVPT289L is accepted as the named example of the GVPT289 row. HONR228 rows are encoded as HONR228N and HONR228R (the named sections).",
    "Catalog: 'a course taken to satisfy either signature requirement cannot be used as an elective' -- the audit's default (one course counts toward one requirement). Courses on both lists (e.g. AREC345, GEOG330) can serve either slot, not both.",
    "'At least 9 credits must be at the 300-400 level' -> overlay choose of 9 credits from the 300+ courses the minor accepts.",
    "'Up to 3 elective credits can be from study abroad, internship or experiential learning related to poverty (optional, pending advisor approval)' is not encodable; such credit does not count on the audit. Manual check. Marked advisorMayApprove (electives): other courses may count with advisor approval; only the listed courses count.",
    "'No course may be used to satisfy the requirements of more than one minor' -- cannot be expressed without naming every other minor; not encoded (manual). The catalog states no cap on overlap with the major, so none is set.",
    "Program GPA 2.0 encoded as minGpa. Per-course C- is minGrade.",
    "Sample plan is constructed (no published plan for minors).",
  ],
  requirements: [
    {
      kind: "choose",
      id: "poverty-signature",
      name: "Global Poverty signature course",
      count: 1,
      from: { courses: SIGNATURE_POVERTY },
    },
    {
      kind: "choose",
      id: "global-signature",
      name: "Global Perspectives signature course",
      count: 1,
      from: { courses: SIGNATURE_GLOBAL },
    },
    { kind: "choose", id: "electives", name: "Three electives", count: 3, from: { courses: ELECTIVES }, advisorMayApprove: true },
    {
      kind: "choose",
      id: "upper-level",
      name: "At least 9 credits at the 300-400 level",
      overlay: true,
      credits: 9,
      from: { courses: UPPER_LEVEL },
    },
  ],
};

export const arecGlobalPovertyMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "AGNR",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/agricultural-resource-economics/global-poverty-minor/",
    department: "https://arec.umd.edu/",
  },
};
