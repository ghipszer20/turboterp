// Jewish Studies Minor, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/jewish-studies/jewish-studies-minor/
// and jewishstudies.umd.edu/academic-programs/undergraduate/js-minor (both fetched 2026-09-28).
// Owner ruling: where the department page and the catalog disagree, follow the department page.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const jwstMinor: Program = {
  id: "jwst-minor",
  name: "Jewish Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Jewish Studies Minor; Meyerhoff Center for Jewish Studies, " +
    "https://jewishstudies.umd.edu/academic-programs/undergraduate/js-minor (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Catalog and department page agree: 15 credits (5 courses): one Jewish history, one Jewish literature, one Jewish thought/religion/culture, and two more Jewish Studies courses; at least 9 credits at 3xx/4xx.",
    "Open slot 'jewish-history' (openSlot requirement): 3 credits of Jewish history; the Director of Jewish Studies holds the qualifying-course list, so the student confirms it with them or their advisor.",
    "Open slot 'jewish-literature' (openSlot requirement): 3 credits of Jewish literature; the Director of Jewish Studies holds the qualifying-course list, so the student confirms it with them or their advisor.",
    "Open slot 'jewish-thought' (openSlot requirement): 3 credits of Jewish thought, religion, or culture; the Director of Jewish Studies holds the qualifying-course list, so the student confirms it with them or their advisor.",
    "The two 'Jewish Studies' electives (6 credits) accept the whole JWST range plus HEBR and YIDD (100-499): the sources publish no list, only 'Jewish Studies courses' and Hebrew/Yiddish language study. Broader than a Director-maintained list, so flagged.",
    "The '9 credits at 3xx/4xx' minimum is an overlay over JWST/HEBR/YIDD 300-499, so it counts courses placed in the open slots too.",
    "Not encoded: 'only 3 credits of 1xx/2xx Hebrew or Yiddish may count' (no cap-by-level rule); petitions to include other languages; the 2.0 minor GPA; the Jewish Studies major is not eligible for the minor (enforced via notOpenTo); at least 6 credits of 3xx/4xx at UMD and at most 6 credits at another institution (residency/transfer caps).",
    "'No more than 6 credits may also be applied to a major' -> maxSharedWith: [{ credits: 6 }].",
    "Related: Israel Studies and Hebrew Studies minors sit on the same department page; Hebrew Studies is a separate batch and not encoded here.",
  ],
  requirements: [
    {
      kind: "choose",
      id: "electives",
      name: "Two Jewish Studies electives (JWST, or Hebrew/Yiddish language)",
      count: 2,
      from: { departments: ["JWST", "HEBR", "YIDD"], minNumber: 100, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "upper-level",
      name: "At least 9 credits at the 3xx or 4xx level",
      overlay: true,
      count: 3,
      from: { departments: ["JWST", "HEBR", "YIDD"], minNumber: 300, maxNumber: 499 },
    },
    {
      kind: "openSlot",
      id: "jewish-history",
      name: "Jewish history course",
      credits: 3,
      note: "The Director of Jewish Studies holds the qualifying-course list.",
    },
    {
      kind: "openSlot",
      id: "jewish-literature",
      name: "Jewish literature course",
      credits: 3,
      note: "The Director of Jewish Studies holds the qualifying-course list.",
    },
    {
      kind: "openSlot",
      id: "jewish-thought",
      name: "Jewish thought, religion, or culture course",
      credits: 3,
      note: "The Director of Jewish Studies holds the qualifying-course list.",
    },
  ],
};

export const jwstMinorMeta: ProgramMeta = {
  kind: "minor",
  notOpenTo: { programs: ["jwst-major"], reason: "Not open to Jewish Studies majors." }, college: "ARHU",
  short: "Jewish Studies",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/jewish-studies/jewish-studies-minor/",
    department: "https://jewishstudies.umd.edu/academic-programs/undergraduate/js-minor",
  },
};
