// Philosophy Minor, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/philosophy/philosophy-minor/;
// philosophy.umd.edu (fetched 2026-09-28; the fetched page is the department homepage with no minor
// requirements, so the catalog is the only source of the rules).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const philMinor: Program = {
  id: "phil-minor",
  name: "Philosophy Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Philosophy Minor " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/philosophy/philosophy-minor/); " +
    "Department of Philosophy, https://philosophy.umd.edu/ (fetched 2026-09-28, homepage only)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Department page not checked: the fetched philosophy.umd.edu page is a homepage with no minor requirements. Encoded from the catalog alone.",
    "Six PHIL courses (18 credits): three at 3xx or above (not counting PHIL386 internships) plus one each in history of pre-twentieth-century philosophy, value theory, and metaphysics/epistemology (2xx or above). Encoded like phil-major: one consuming 6-course PHIL requirement at 200-499 plus an overlay for the three 3xx+ courses (PHIL386 excluded from the overlay only, as footnote 1 says).",
    "The three topic areas have no course list in the catalog (it points to the major page's lists), so the audit can't tell which course covers which area; the one-each-per-area split is a manual check. A course in any of the areas counts toward the six.",
    "Catalog: every course needs a C- or better, and for students who matriculated in September 2012 or later the average of all grades counted toward the minor must be 2.0 or greater. The per-course C- is encoded; the GPA average is not.",
    "No sharing cap stated in the catalog; none is set.",
  ],
  requirements: [
    {
      kind: "choose",
      id: "phil-courses",
      name: "Six PHIL courses at 2xx-level or above (18 credits)",
      count: 6,
      from: { departments: ["PHIL"], minNumber: 200, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "phil-3xx",
      name: "Three courses at 3xx-level or above in Philosophy (not counting PHIL386)",
      overlay: true,
      count: 3,
      from: { departments: ["PHIL"], minNumber: 300, maxNumber: 499, exclude: ["PHIL386"] },
    },
  ],
};

export const philMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Philosophy",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/philosophy/philosophy-minor/",
    department: "https://philosophy.umd.edu/",
  },
};
