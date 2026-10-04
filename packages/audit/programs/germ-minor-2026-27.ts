// German Studies Minor, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/germanic-studies/german-studies-minor/;
// sllc.umd.edu/german (fetched 2026-09-28; the fetched page is a program homepage with no minor
// requirements, so the catalog is the only source of the rules).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const gersMinor: Program = {
  id: "gers-minor",
  name: "German Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, German Studies Minor " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/germanic-studies/german-studies-minor/); " +
    "SLLC German, https://sllc.umd.edu/german (fetched 2026-09-28, homepage only)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page not checked: the fetched sllc.umd.edu/german page is a program homepage with no minor requirements. Encoded from the catalog alone.",
    "Five courses beyond GERS203, taught in German (15 credits): encoded as five GERS courses numbered 204-499. The catalog names no course list, and 'taught in German' is not a field the audit can check, so English-taught GERS courses (e.g. GERS255, GERS339, GERS385) are not excluded; students must confirm by hand.",
    "Three of the five must be 3xx or 4xx: encoded as an overlay choose of three GERS 300-499 courses.",
    "'One language, one literature, and one culture' among those three has no course list in the minor's catalog entry (the German Studies major's Area I/II/III lists are a different program), so the audit can't assign courses to areas; the split is a manual check.",
    "Prerequisites GERS103 and GERS203 (or equivalents 'as determined through departmental advising') are not encoded as requirements: equivalence is an advising decision.",
    "Every course needs a C- or better (encoded as minGrade). Program GPA 2.0 (overall in the minor) encoded as minGpa.",
    "No sharing cap stated in the catalog; none is set.",
  ],
  requirements: [
    {
      kind: "choose",
      id: "gers-courses",
      name: "Five GERS courses beyond GERS203 (15 credits)",
      count: 5,
      from: { departments: ["GERS"], minNumber: 204, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "gers-3xx",
      name: "Three of the five at the 3xx or 4xx level",
      overlay: true,
      count: 3,
      from: { departments: ["GERS"], minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const gersMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "German Studies",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/germanic-studies/german-studies-minor/",
    department: "https://sllc.umd.edu/german",
  },
};
