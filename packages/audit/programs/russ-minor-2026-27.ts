// Russian Studies Minor, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/russian-language-literature/russian-studies-minor/;
// russian.umd.edu (fetched 2026-09-28; the fetched page is a program homepage with no minor
// requirements, so the catalog is the only source of the rules).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const russianTaught = [
  "RUSS201", "RUSS202", "RUSS211", "RUSS301", "RUSS302", "RUSS303", "RUSS321", "RUSS322", "RUSS381", "RUSS382",
  "RUSS401", "RUSS402", "RUSS403", "RUSS404", "RUSS405", "RUSS406", "RUSS409", "RUSS411", "RUSS412", "RUSS433",
];
const englishTaught = ["RUSS221", "RUSS222", "RUSS281", "RUSS282", "RUSS298", "RUSS328", "RUSS398", "RUSS439"];
const listed = [...russianTaught, ...englishTaught];
const upper = listed.filter((c) => Number(c.slice(4)) >= 300);

export const russMinor: Program = {
  id: "russ-minor",
  name: "Russian Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Russian Studies Minor " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/russian-language-literature/russian-studies-minor/); " +
    "Russian program, https://russian.umd.edu/ (fetched 2026-09-28, homepage only)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page not checked: the fetched russian.umd.edu page is a program homepage with no minor requirements. Encoded from the catalog alone.",
    "Five courses (15 credits) from the catalog's list of courses taught in Russian and courses in English. RUSS201 and RUSS202 are 5 credits each; the catalog says a student who counts them still completes five courses, so the rule is encoded as five courses, not 15 credits.",
    "Minimum six credits in courses taught in Russian: overlay over the catalog's 'Courses taught in Russian' list. Minimum nine credits at 3xx/4xx: overlay over the listed courses numbered 300 and above.",
    "Prerequisite RUSS102 (or equivalent as determined by the department) is not encoded as a requirement.",
    "Manual, not encoded: study-abroad courses may be applied; transfer credit needs department approval (usually at most six credits); other departmental offerings may be substituted with advisor approval (russ-courses is marked advisorMayApprove); overall 2.0 GPA in the minor is encoded as minGpa. Every course needs a C- or better (encoded as minGrade).",
    "No sharing cap stated in the catalog; none is set.",
  ],
  requirements: [
    {
      kind: "choose",
      id: "russ-courses",
      advisorMayApprove: true,
      name: "Five Russian courses from the approved list (15 credits)",
      count: 5,
      from: { courses: listed },
    },
    {
      kind: "choose",
      id: "russ-in-russian",
      name: "At least six credits in courses taught in Russian",
      overlay: true,
      credits: 6,
      from: { courses: russianTaught },
    },
    {
      kind: "choose",
      id: "russ-3xx",
      name: "At least nine credits at the 3xx or 4xx level",
      overlay: true,
      credits: 9,
      from: { courses: upper },
    },
  ],
};

export const russMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Russian Studies",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/russian-language-literature/russian-studies-minor/",
    department: "https://russian.umd.edu/",
  },
};
