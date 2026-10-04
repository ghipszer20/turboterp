// English Language and Literature Major, Literary and Cultural Studies Track, 2026-27 UMD
// Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/english-language-literature/english-major/;
// the College of Arts and Humanities' official English Four Year Academic Plan (department source),
// https://drive.google.com/uc?export=download&id=1hCmIPjZi3fZy96AM4mF4S1grGFEbZ46A#English (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page/plan and the catalog disagree,
// follow the department source. No disagreement found -- see reviewNotes.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { englElement1, englHistoricalStudies, englElectives, englCommonReviewNotes } from "./engl-shared-2026-27.ts";

export const englMajorLiteraryCulturalStudies: Program = {
  id: "engl-major-literary-cultural-studies",
  name: "English Language and Literature Major (Literary and Cultural Studies)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, English Language and Literature Major (Literary and Cultural Studies Track) " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/english-language-literature/english-major/); " +
    "College of Arts and Humanities, official English Four Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1hCmIPjZi3fZy96AM4mF4S1grGFEbZ46A#English (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Element 3 (Literary and Cultural Studies Track, 12 credits / 4 courses): the catalog says 'take " +
      "one course on each of the following topics, leaving the remaining credits open for any literature " +
      "course' -- Form, Genres, and Poetics; National, Transnational, and/or Global Literatures -- but " +
      "gives no course-to-topic list. Approximated as a generic 4-course choose over ENGL 200-499 " +
      "(the catalog's own track-wide restriction: 'courses must be taken at the 2xx-, 3xx-, and/or " +
      "4xx-levels'); the two named-topic slots are NOT separately verified. Flagged in " +
      "docs/project/owner-review.md.",
    ...englCommonReviewNotes,
  ],
  requirements: [
    englElement1,
    englHistoricalStudies,
    {
      kind: "choose",
      id: "track-literary-cultural-studies",
      name: "Element 3: Literary and Cultural Studies Track (one course each in Form/Genres/Poetics and " +
        "National/Transnational/Global Literatures, plus two open literature courses)",
      count: 4,
      credits: 12,
      from: { departments: ["ENGL"], minNumber: 200, maxNumber: 499, exclude: ["ENGL301"] },
    },
    englElectives,
  ],
};

export const englMajorLiteraryCulturalStudiesMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "English (Literary and Cultural Studies)",
  major: "engl",
  track: "Literary and Cultural Studies",
  defaultTrack: true,
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/english-language-literature/english-major/",
    department: "https://drive.google.com/uc?export=download&id=1hCmIPjZi3fZy96AM4mF4S1grGFEbZ46A#English",
  },
};
