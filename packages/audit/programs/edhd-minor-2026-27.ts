// Human Development Minor, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/education/human-development-quantitative-methodology/human-development-minor/
// (fetched 2026-09-28); Department of Human Development and Quantitative Methodology, https://education.umd.edu/HDQM
// (fetched 2026-09-28; a program homepage with no requirements).
// Encoded by hand from program-sources/human-development-minor.md. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const edhdMinor: Program = {
  id: "edhd-minor",
  name: "Human Development Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Human Development Minor; Department of Human Development and " +
    "Quantitative Methodology, https://education.umd.edu/HDQM (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Department page not checked: education.umd.edu/HDQM is a homepage with no requirements (it only gives hdminor@umd.edu), so this is encoded from the catalog.",
    "No grade floor is stated by the catalog; C- applied per the owner ruling for minors whose siblings state one.",
    "The catalog gives no cap on overlap with the major; no maxSharedWith set.",
    "'Select courses from at least two areas, 9-18 credits' is encoded as a distribution rule (3 courses from at least two areas). The 9-18 credit range and the 15-24 credit total are not checked beyond the 9-credit minimum; non-3-credit courses are not credit-weighted.",
    "EDHD306 footnote: only Family Health majors may substitute FMSC302, and only Psychology or Neuroscience majors PSYC300. The engine has no declared-major gate, so FMSC302 and PSYC300 are accepted for everyone; the major restriction is manual. Flagged.",
    "The catalog lists areas 1 Cognitive, 2 Social, 3 Research (QMMS251) and 4 Lifespan, but the table says 'at least two of Cognitive, Social, Lifespan'. QMMS251 and the footnote's directed-study courses (EDHD228, EDHD319, EDHD386, EDHD489, EDHD498: 'course selections might include three credits of') are encoded together as one extra area 'Research and directed study', so they count as a course and as an area. Please confirm. Directed study is with a faculty advisor.",
  ],
  requirements: [
    { kind: "course", id: "edhd306", name: "EDHD306 Research Methods in Human Development", options: ["EDHD306", "FMSC302", "PSYC300"] },
    { kind: "course", id: "edhd200", name: "EDHD200 Paradigms and Perspectives in Human Development", options: ["EDHD200"] },
    {
      kind: "distribution",
      id: "areas",
      name: "Courses (at least 9 credits) from at least two areas",
      count: 3,
      minAreas: 2,
      maxPerArea: 6,
      areas: [
        {
          name: "Cognitive",
          courses: ["EDHD201", "EDHD231", "EDHD241", "EDHD310", "EDHD405", "EDHD420", "EDHD425", "EDHD426", "EDHD436", "EDHD460"],
        },
        { name: "Social", courses: ["EDHD221", "EDHD402", "EDHD421"] },
        {
          name: "Lifespan",
          courses: ["EDHD230", "EDHD320", "EDHD400", "EDHD411", "EDHD412", "EDHD413", "EDHD414", "EDHD440"],
        },
        { name: "Research and directed study", courses: ["QMMS251", "EDHD228", "EDHD319", "EDHD386", "EDHD489", "EDHD498"] },
      ],
    },
  ],
};

export const edhdMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "EDUC",
  short: "Human Development Minor",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/human-development-quantitative-methodology/human-development-minor/",
    department: "https://education.umd.edu/HDQM",
  },
};
