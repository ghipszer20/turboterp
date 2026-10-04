// Italian Studies Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/italian-studies/italian-studies-major/;
// College of Arts and Humanities official four-year academic plan for Italian Studies (Google Drive
// PDF, converted to text, fetched 2026-09-28). The ARHU world-language-placement page was also fetched
// as context (generic ARHU-wide placement-exam procedure, no Italian-specific requirement content).
// Owner ruling (docs/project/rulings.md, 2026-09-26): where the department page (the college's own
// four-year plan counts as one) and the Academic Catalog disagree, the department page wins.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

// Courses already required by name; excluded from the ITAL4xx elective pool below so a required
// course can't also satisfy an elective slot instead of its own. ITAL478 (the colloquium) is
// excluded there too -- it has its own bucket, see below.
const REQUIRED_ITAL_COURSES = [
  "ITAL204",
  "ITAL207",
  "ITAL252",
  "ITAL261",
  "ITAL301",
  "ITAL311",
  "ITAL401",
  "ITAL361",
  "ITAL362",
];

export const italMajor: Program = {
  id: "ital-major",
  name: "Italian Studies Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Italian Studies Major; " +
    "College of Arts and Humanities official four-year academic plan for Italian Studies, " +
    "fetched 2026-09-28 (https://drive.google.com/uc?export=download&id=1DTZOYr6ZR0khHL4nxetKE9C1NGiK6_uu#Italian-Studies)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page vs. catalog: no disagreement found. The college's four-year plan's 'Major " +
      "Requirements' legend lists the same 8 named courses (ITAL204, ITAL207, ITAL252 or ITAL261, " +
      "ITAL301, ITAL311, ITAL361, ITAL362, ITAL401) plus three 'ITAL 4xx/478x' slots as the catalog's " +
      "36-credit list. That legend text appears twice in the PDF-to-text conversion (once as a partial " +
      "7-item list missing ITAL401 and the 4xx/478 slots, once as the full matching list); this looks " +
      "like column-interleaving garbling (see next note), not a second, different requirement set.",
    "The four-year plan PDF's term-grid text conversion is garbled (a benchmark sidebar and the " +
      "Fall/Spring columns appear interleaved on each line), but the ITAL course numbers and their " +
      "relative order are legible: the pre-major sequence (ITAL103/121/122/203) first, then ITAL204 -> " +
      "ITAL207 -> ITAL252/261 -> ITAL301 -> ITAL311 -> ITAL361 -> ITAL362 -> ITAL401 -> three ITAL " +
      "4xx/478x slots near the end. `packages/programs/sample-plans/ital-major.json` is `official: " +
      "true`, but its exact year/semester placement is reconstructed from that ordering, not read " +
      "verbatim. Please verify against the original PDF if exact term placement matters.",
    "Prerequisite, not part of the major's 36 credits: 'Successful completion of Italian language " +
      "through intermediate level (ITAL203 or equivalent)'. The four-year plan's pre-major sequence " +
      "(ITAL103 or 121, ITAL122 or 203) is the same prerequisite track and is likewise not encoded, " +
      "matching the pattern used for French's FREN103/203 prerequisite.",
    "'Select three courses at the ITAL4xx level each with associated ITAL478 course' (12 credits, " +
      "footnoted: 'For each course at the 4xx level, Italian majors must register for a 1-credit " +
      "colloquium (ITAL478)') is encoded as two buckets: 9 credits of ITAL4xx electives, and 3 credits " +
      "of ITAL478 (a 1-credit colloquium taken three times, once per 4xx course). The engine has no " +
      "concept of one requirement being 'paired with' another, so it cannot check that a specific " +
      "ITAL478 section accompanies a specific 4xx course -- only that three of each are completed.",
    "The World Language Placement page (arhu.umd.edu/academics/world-language-placement, fetched as " +
      "context) has no Italian-specific placement rule to encode.",
    "Not encoded (engine gaps): residency rules (30 credits at " +
      "UMD, 15 of the final 30 at the 300-400 level, 12 upper-level major credits at UMD), and the " +
      "120-credit graduation minimum.",
  ],
  requirements: [
    { kind: "course", id: "ital204", name: "Advanced Intermediate Italian", options: ["ITAL204"] },
    { kind: "course", id: "ital207", name: "Speaking and Writing in Italian", options: ["ITAL207"] },
    {
      kind: "course",
      id: "ital252-or-261",
      name: "Stories of Italy, or Cuisine, Culture, and Society in Italy Yesterday and Today",
      options: ["ITAL252", "ITAL261"],
    },
    { kind: "course", id: "ital301", name: "Italian Composition", options: ["ITAL301"] },
    { kind: "course", id: "ital311", name: "Advanced Oral Expression: Current Events", options: ["ITAL311"] },
    {
      kind: "course",
      id: "ital361",
      name: "Survey of Italian Society and Culture: From Fascism to the Seventies",
      options: ["ITAL361"],
    },
    {
      kind: "course",
      id: "ital362",
      name: "Survey of Italian Society and Culture: From the 1980s to the Present Day",
      options: ["ITAL362"],
    },
    { kind: "course", id: "ital401", name: "Advanced Composition and Style", options: ["ITAL401"] },
    {
      kind: "choose",
      id: "ital-4xx",
      name: "Select three courses at the ITAL4xx level",
      credits: 9,
      from: { departments: ["ITAL"], minNumber: 400, maxNumber: 499, exclude: [...REQUIRED_ITAL_COURSES, "ITAL478"] },
    },
    {
      kind: "choose",
      id: "ital478-colloquia",
      name: "ITAL478 colloquium (one 1-credit section for each ITAL4xx course above)",
      credits: 3,
      from: { courses: ["ITAL478"] },
    },
  ],
};

export const italMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Italian Studies",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/italian-studies/italian-studies-major/",
    department: "https://drive.google.com/uc?export=download&id=1DTZOYr6ZR0khHL4nxetKE9C1NGiK6_uu#Italian-Studies",
  },
};
