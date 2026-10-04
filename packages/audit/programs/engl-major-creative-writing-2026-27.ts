// English Language and Literature Major, Creative Writing Track, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/english-language-literature/english-major/;
// the College of Arts and Humanities' official English Four Year Academic Plan (department source),
// https://drive.google.com/uc?export=download&id=1hCmIPjZi3fZy96AM4mF4S1grGFEbZ46A#English (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page/plan and the catalog disagree,
// follow the department source. No disagreement found -- see reviewNotes.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { englElement1, englHistoricalStudies, englElectives, englCommonReviewNotes } from "./engl-shared-2026-27.ts";

export const englMajorCreativeWriting: Program = {
  id: "engl-major-creative-writing",
  name: "English Language and Literature Major (Creative Writing)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, English Language and Literature Major (Creative Writing Track) " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/english-language-literature/english-major/); " +
    "College of Arts and Humanities, official English Four Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1hCmIPjZi3fZy96AM4mF4S1grGFEbZ46A#English (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Element 3 (Creative Writing Track, 12 credits / 4 courses): the catalog names three distinct " +
      "course types (a 2xx-level Creative Writing Workshop; a 3xx-level Creative Writing Workshop; a " +
      "Creative Form and Theory course) plus one open creative-writing-workshop course, but gives no " +
      "course-to-type list anywhere in the fetched source -- there is no way to tell, from the numbers " +
      "alone, which ENGL courses ARE workshops/Creative Form and Theory versus any other ENGL course. " +
      "Approximated as a generic 4-course choose over ENGL 200-499 (the catalog's own track-wide " +
      "restriction: 'courses must be taken at the 2xx-, 3xx-, and/or 4xx-levels'); the specific " +
      "2xx-workshop / 3xx-workshop / Creative Form and Theory shape is NOT separately verified. " +
      "Flagged in docs/project/owner-review.md.",
    "Not encoded: the track's grade/portfolio gate for enrolling in a 3xx-level workshop (A or A- in a " +
      "2xx-level workshop, or an accepted portfolio), the allowed substitution of one outside-department " +
      "workshop for the 3xx-level requirement, the ban on taking a 4xx-level ENGL workshop without a " +
      "3xx-level one first, and the 'Creative Form and Theory counts once only' restriction -- none of " +
      "these have a matching concept in the engine (registration gates, course substitution-with-" +
      "approval, and sequencing aren't modeled).",
    ...englCommonReviewNotes,
  ],
  requirements: [
    englElement1,
    englHistoricalStudies,
    {
      kind: "choose",
      id: "track-creative-writing",
      name: "Element 3: Creative Writing Track (a 2xx-level workshop, a 3xx-level workshop, a Creative " +
        "Form and Theory course, plus one open creative-writing-workshop course)",
      count: 4,
      credits: 12,
      from: { departments: ["ENGL"], minNumber: 200, maxNumber: 499, exclude: ["ENGL301"] },
    },
    englElectives,
  ],
};

export const englMajorCreativeWritingMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "English (Creative Writing)",
  major: "engl",
  track: "Creative Writing",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/english-language-literature/english-major/",
    department: "https://drive.google.com/uc?export=download&id=1hCmIPjZi3fZy96AM4mF4S1grGFEbZ46A#English",
  },
};
