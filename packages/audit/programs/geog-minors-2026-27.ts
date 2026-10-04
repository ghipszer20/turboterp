// Geographic Information Science Minor and Remote Sensing of Environmental Change Minor,
// 2026–27 UMD Academic Catalog (Department of Geographical Sciences).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/geographical-sciences/
// geographic-information-science-minor/ and remote-sensing-environmental-change-minor/ (fetched 2026-09-28).
// The department page (https://geog.umd.edu/, fetched 2026-09-28) is only a homepage with no
// requirements, so it was not checked against the catalog. No official published sample plans
// (constructed from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const SOURCE_GEOG_MINORS =
  "UMD Academic Catalog 2026–27, Geographical Sciences minors (Geographic Information Science; " +
  "Remote Sensing of Environmental Change); department page https://geog.umd.edu/ not checked " +
  "(homepage only) (fetched 2026-09-28)";

export const geogMinorGis: Program = {
  id: "geog-minor-gis",
  name: "Geographic Information Science Minor",
  catalogYear: "2026-27",
  source: SOURCE_GEOG_MINORS,
  minGrade: "C",
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Department page not checked: https://geog.umd.edu/ fetched as a homepage with no requirements; encoded from the catalog alone.",
    "'Two courses from the following' lists GEOG416, GEOG473, GEOG475, GEOG476, GEOG498 (GEOG498I Algorithms for Geospatial Computing named) and 'Other similar course'. The five named courses are encoded (GEOG498 accepted as a whole, not only the 498I section); 'Other similar course' is an advisor-approved substitution, not encoded; the gis-electives requirement is marked advisorMayApprove.",
    "The statistics slot lists GEOG306 or ten courses from other departments (BIOM301, BMGT230, CCJS200, ECON321, GVPT422, INST314, JOUR405, PSYC200, QMMS251, SOCY201); all are accepted. This conflicts with the catalog's 'All credits for the minor must be taken in the Department of Geographical Sciences' and 'Must complete 15 credits in geography'; neither is enforced (residency-style rules), noted for the owner.",
    "'At least nine credits must be at the 300 or 400 level' is not encoded separately: GEOG373 plus the two chosen courses already give nine such credits unless an advisor-approved 'other similar course' is used.",
    "'No more than six credits are to be included in the minor and student's major, supporting courses, and college requirements' -> maxSharedWith: [{ credits: 6 }] (Gen Ed and college layers never count, so the college-requirements part is not enforced).",
    "Minimum grade 'C' (catalog) differs from the Remote Sensing minor's 'C-'; each is encoded as published.",
  ],
  requirements: [
    { kind: "course", id: "earth-observation", name: "Introduction to Earth Observation Science", options: ["GEOG272"] },
    { kind: "course", id: "gis", name: "Geographic Information Systems", options: ["GEOG373"] },
    {
      kind: "choose",
      id: "gis-electives",
      advisorMayApprove: true,
      name: "Two GIS courses",
      count: 2,
      from: { courses: ["GEOG416", "GEOG473", "GEOG475", "GEOG476", "GEOG498"] },
    },
    {
      kind: "course",
      id: "statistics",
      name: "Quantitative methods or statistics",
      options: ["GEOG306", "BIOM301", "BMGT230", "CCJS200", "ECON321", "GVPT422", "INST314", "JOUR405", "PSYC200", "QMMS251", "SOCY201"],
    },
  ],
};

export const geogMinorRemoteSensing: Program = {
  id: "geog-minor-remote-sensing",
  name: "Remote Sensing of Environmental Change Minor",
  catalogYear: "2026-27",
  source: SOURCE_GEOG_MINORS,
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Department page not checked: https://geog.umd.edu/ fetched as a homepage with no requirements; encoded from the catalog alone.",
    "'No more than six credits are to be included in the minor and student's major, supporting courses, and college requirements' -> maxSharedWith: [{ credits: 6 }] (Gen Ed and college layers never count, so the college-requirements part is not enforced).",
    "'All credits for the minor must be taken in the Department of Geographical Sciences at the University of Maryland, College Park' is a residency rule, not encoded.",
    "Minimum grade 'C-' (catalog) differs from the GIS minor's 'C'; each is encoded as published. GEOG272 also counts in the GIS minor; neither source restricts holding both.",
  ],
  requirements: [
    { kind: "course", id: "foundation", name: "Foundation course", options: ["GEOG156", "GEOG170", "GEOG172", "GEOG201"] },
    { kind: "course", id: "core", name: "Introduction to Earth Observation Science", options: ["GEOG272"] },
    {
      kind: "choose",
      id: "advanced-technical",
      name: "Three advanced technical courses",
      count: 3,
      from: { courses: ["GEOG371", "GEOG417", "GEOG418", "GEOG440", "GEOG461", "GEOG471", "GEOG472"] },
    },
  ],
};

export const geogMinorGisMeta: ProgramMeta = { kind: "minor", college: "BSOS", short: "Geographic Information Science", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/geographical-sciences/geographic-information-science-minor/", department: "https://geog.umd.edu/" } };

export const geogMinorRemoteSensingMeta: ProgramMeta = { kind: "minor", college: "BSOS", short: "Remote Sensing", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/geographical-sciences/remote-sensing-environmental-change-minor/", department: "https://geog.umd.edu/" } };
