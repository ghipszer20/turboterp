// Global Culture and Thought Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/global-culture-thought-major/;
// SLLC department page sllc.umd.edu/fields/global-culture-and-thought/major (department source);
// College of Arts and Humanities' official four-year plan (Google Drive PDF, converted to text,
// fetched 2026-09-28 via program-sources/global-culture-thought-major.md).
// Owner ruling (docs/project/rulings.md, 2026-09-26): where the department page (the college's own
// four-year plan counts as one) and the Academic Catalog disagree, the department page wins.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

// Catalog footnote 1: language study may be in any of these prefixes.
const LANGUAGE_PREFIXES = ["ARAB", "CHIN", "FREN", "GERS", "HEBR", "ITAL", "JAPN", "KORA", "PERS", "PORT", "RUSS", "SPAN"];

// Catalog footnote 3: Upper-Division Elective prefixes -- the same 12 languages plus CINE.
const ELECTIVE_PREFIXES = [...LANGUAGE_PREFIXES, "CINE"];

export const glbcMajor: Program = {
  id: "glbc-major",
  name: "Global Culture and Thought Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Global Culture and Thought Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/global-culture-thought-major/); " +
    "SLLC department page (https://sllc.umd.edu/fields/global-culture-and-thought/major); " +
    "College of Arts and Humanities official four-year plan, fetched 2026-09-28 " +
    "(https://drive.google.com/uc?export=download&id=1xtu7OAIvMXD0bcWacqte__1eZ0dsGsN1#Global-Culture-and-Thought)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "minGrade 'C-' follows the pattern of every other SLLC/ARHU language major already encoded here " +
      "(amst-major, arab-major, chin-major, fren-major); neither GLBC source states a minimum grade " +
      "explicitly.",
    "No numeric disagreement found between the catalog and the department page on the major's total " +
      "(39 credits) or its Core Courses (GLBC200, GLBC360) and Electives (5 courses in one SLLC " +
      "program, or 3 + 2 across two) sections. However, the department page's own 'Course " +
      "Requirements' section only describes the Core sequence and the Electives (6 + 15 = 21 " +
      "credits) -- it never spells out the Language Study (12 credits) or Experiential Learning (6 " +
      "credits) requirements as their own line items, even though its total states 39 credits and " +
      "its intro paragraph alludes to language study conceptually ('study one language in depth or " +
      "split ... between two'). This looks like an omission, not a contradiction (the department page " +
      "names no different numbers for these two requirements), so the catalog's Language Study and " +
      "Experiential Learning structure is used as-is. Flagged in docs/project/owner-review.md.",
    "Language Study ('12 credits at the 200-level or above in one language, OR 6 credits at the " +
      "200-level or above in each of two languages') is encoded as a single `choose` over all 12 " +
      "named language prefixes, 200-level or above, 12 credits. Engine gap: `choose` has no concept " +
      "of 'at most two departments' or 'at least 6 credits each if split', so a plan spreading these " +
      "12 credits across three or more languages would incorrectly pass. Flagged in " +
      "docs/project/owner-review.md.",
    "Upper-Division Electives ('15 credits at the 300-level or above in one SLLC program, OR 9 " +
      "credits in one SLLC program AND 6 credits in another') has the same 'one, or a maximum of two' " +
      "shape and the same engine gap as Language Study, over the 13 elective prefixes (the 12 " +
      "languages plus CINE, per catalog footnote 3). GLBC350 (Translation in a Global Context) is " +
      "included in this pool by course id: the catalog and department page both say it 'may " +
      "substitute any of the SLLC Upper-Division Elective courses.' GLBC350 is not a separate " +
      "requirement -- the catalog's own credit total (6 + 12 + 6 + 15 = 39) only works if GLBC350's " +
      "credits are already inside the 15-credit Electives total, not additional to it.",
    "Experiential Learning (6 credits) is NOT encoded: the catalog describes it only as 'approved " +
      "education abroad; domestic or international internships; and/or participation in on-campus " +
      "learning communities, including the Language Partner Program or the Language House " +
      "Living-Learning Program', and the department page doesn't mention it at all. Neither source " +
      "names a single course number for this requirement (per the no-guessing ruling, none is " +
      "invented). The catalog's related note that one-credit 'microcourses' may count toward " +
      "Experiential Learning or Upper-Division Electives is likewise not encoded for the same reason. " +
      "Flagged in docs/project/owner-review.md; the department's advising checklist referenced on its " +
      "page ('Review the global culture and thought major courses checklist') may have the missing " +
      "course-level detail but was not fetched.",
    "The catalog's own overlap rule ('the same course cannot be counted towards different " +
      "requirements of the program') doesn't need separate encoding: the engine already assigns each " +
      "course to at most one requirement per program by construction.",
    "Not encoded (engine gaps, matching every other ARHU major's precedent): residency rules; and the 120-credit graduation minimum. Program GPA 2.0 encoded as minGpa.",
  ],
  requirements: [
    { kind: "course", id: "glbc200", name: "Global Movements", options: ["GLBC200"] },
    { kind: "course", id: "glbc360", name: "Cultural Theory in a Global Age", options: ["GLBC360"] },
    {
      kind: "choose",
      id: "language-study",
      name: "Language Study: 12 credits at the 200-level or above in one language, or 6 credits at " +
        "the 200-level or above in each of two languages",
      credits: 12,
      from: { departments: LANGUAGE_PREFIXES, minNumber: 200 },
    },
    {
      kind: "choose",
      id: "upper-division-electives",
      name: "Upper-Division Electives: 15 credits at the 300-level or above in one SLLC program, or " +
        "9 credits in one SLLC program and 6 credits in another (GLBC350 may substitute for any of " +
        "these)",
      credits: 15,
      from: { courses: ["GLBC350"], departments: ELECTIVE_PREFIXES, minNumber: 300 },
    },
  ],
};

export const glbcMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Global Culture and Thought",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/global-culture-thought-major/",
    department: "https://sllc.umd.edu/fields/global-culture-and-thought/major",
  },
};
