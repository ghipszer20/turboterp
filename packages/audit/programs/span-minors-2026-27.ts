// Spanish minors (Heritage Language and Latina/o Culture; Language, Culture, and Professional
// Contexts; Literature, Linguistics, and Culture), 2026-27 UMD Academic Catalog, School of
// Languages, Literatures, and Cultures. Sources:
// academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/spanish-language-literatures-culture/
// {spanish-heritage-language-latino-culture-minor, spanish-language-culture-professional-minor,
// spanish-literature-linguistics-culture-minor}/ and https://sllc.umd.edu/spanish (fetched
// 2026-09-28; the department page is the SLLC Spanish homepage with no minor requirements).
// Imports (unchanged) shared course lists from span-shared-2026-27.ts.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { SPAN_LCP_COURSES, spanLcmElectives } from "./span-shared-2026-27.ts";

const CATALOG_BASE =
  "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/spanish-language-literatures-culture/";
const DEPT = "https://sllc.umd.edu/spanish";

const source = (slug: string) =>
  `UMD Academic Catalog 2026-27, Spanish minor (${CATALOG_BASE}${slug}/); SLLC Spanish page (${DEPT}), fetched 2026-09-28`;

const commonNotes: string[] = [
  "Department page not checked: sllc.umd.edu/spanish is the program homepage (navigation only), so this minor is encoded from the catalog.",
  "The three Spanish minors share prerequisites SPAN103/SPAN203/SPAN204 'or equivalent'; they are not part of the 18 credits and are not encoded.",
  "Not encoded (manual): 'All courses must be in Spanish'; substitutions for heritage learners who place out of SPAN206 (SPAN306 + SPAN307) or native speakers (Spanish Undergraduate Advisor); the ban on taking SPAN301 and SPAN303 in the same term without advisor permission; 'two courses (up to six credits) from study abroad may apply'; minor GPA.",
  "The catalog gives no cap on overlap with a major or other minor, so no maxSharedWith is set.",
];

/** The professional-contexts list as the Language/Culture/Professional minor prints it (no SPAN372). */
const lcpWithoutLaw = [...SPAN_LCP_COURSES.filter((c) => c !== "SPAN372"), "SPAN422", "SPAN480"];

export const spanMinorHeritageLanguageLatinoCulture: Program = {
  id: "span-minor-heritage-latino-culture",
  name: "Spanish: Heritage Language and Latina/o Culture Minor",
  catalogYear: "2026-27",
  source: source("spanish-heritage-language-latino-culture-minor"),
  verified: false,
  reviewNotes: [
    ...commonNotes,
    "The catalog table's last 'Select one' is garbled (it lists a 3xx/4xx Language, Culture, and Professional Contexts course, a 3xx/4xx Spanish or Latin American Literature, Culture, and Media course, and SPAN425 or SPAN426; the 18-credit total leaves room for one course). Encoded as one course from the whole SPAN 300-499 range, which contains every named option; broader than the named lists, flagged.",
    "The catalog says 'Cross-listed with USLT and Bilingual Courses'; no course numbers are given, so cross-listed USLT courses are not encoded.",
  ],
  requirements: [
    { kind: "course", id: "span206", name: "SPAN206 Spanish for Heritage Speakers I", options: ["SPAN206"] },
    { kind: "course", id: "span306", name: "SPAN306 Spanish for Heritage Speakers II", options: ["SPAN306"] },
    {
      kind: "course",
      id: "span303",
      name: "SPAN303 Approaches to Cultural Materials in the Hispanic World",
      options: ["SPAN303"],
    },
    {
      kind: "course",
      id: "span311-or-316",
      name: "SPAN311 Advanced Communication I, or SPAN316 Spanish Translation I",
      options: ["SPAN311", "SPAN316"],
    },
    {
      kind: "choose",
      id: "select-one",
      name: "One of SPAN307, SPAN325, SPAN331-333, SPAN361-363",
      count: 1,
      from: { courses: ["SPAN307", "SPAN325", "SPAN331", "SPAN332", "SPAN333", "SPAN361", "SPAN362", "SPAN363"] },
    },
    {
      kind: "choose",
      id: "advanced-elective",
      name: "One 3xx-4xx Spanish course: Language, Culture, and Professional Contexts; Literature, Culture, and Media; or SPAN425/426",
      count: 1,
      from: { departments: ["SPAN"], minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const spanMinorHeritageLanguageLatinoCultureMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Spanish Heritage Language and Latina/o Culture",
  sources: { catalog: `${CATALOG_BASE}spanish-heritage-language-latino-culture-minor/`, department: DEPT },
};

export const spanMinorLanguageCultureProfessional: Program = {
  id: "span-minor-language-culture-professional",
  name: "Spanish: Language, Culture, and Professional Contexts Minor",
  catalogYear: "2026-27",
  source: source("spanish-language-culture-professional-minor"),
  verified: false,
  reviewNotes: [
    ...commonNotes,
    "The 'Language, Culture, and Professional Contexts' list here omits SPAN372 (Spanish and the Law), which the Heritage minor and the Spanish major list, although the footnote names Law as an area. Encoded as the catalog lists it here (SPAN318, 370, 371, 373, 374, 375, 422, 480); flagged.",
  ],
  requirements: [
    { kind: "course", id: "span207", name: "SPAN207 Reading and Writing in Spanish", options: ["SPAN207"] },
    { kind: "course", id: "span301", name: "SPAN301 Advanced Grammar and Composition I", options: ["SPAN301"] },
    {
      kind: "course",
      id: "span303",
      name: "SPAN303 Approaches to Cultural Materials in the Hispanic World",
      options: ["SPAN303"],
    },
    {
      kind: "course",
      id: "span311-or-316",
      name: "SPAN311 Advanced Communication I, or SPAN316 Spanish Translation I",
      options: ["SPAN311", "SPAN316"],
    },
    {
      kind: "choose",
      id: "culture-literature",
      name: "One of SPAN331-333, SPAN361-363",
      count: 1,
      from: { courses: ["SPAN331", "SPAN332", "SPAN333", "SPAN361", "SPAN362", "SPAN363"] },
    },
    {
      kind: "choose",
      id: "professional-contexts",
      name: "One 3xx-4xx course in Language, Culture, and Professional Contexts",
      count: 1,
      from: { courses: lcpWithoutLaw },
    },
  ],
};

export const spanMinorLanguageCultureProfessionalMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Spanish Language, Culture, and Professional Contexts",
  sources: { catalog: `${CATALOG_BASE}spanish-language-culture-professional-minor/`, department: DEPT },
};

export const spanMinorLiteratureLinguisticsCulture: Program = {
  id: "span-minor-literature-linguistics-culture",
  name: "Spanish: Literature, Linguistics, and Culture Minor",
  catalogYear: "2026-27",
  source: source("spanish-literature-linguistics-culture-minor"),
  verified: false,
  reviewNotes: [
    ...commonNotes,
    "'One 4xx-level course in Spanish or Latin American Literature, Culture, and Media' names no course list; encoded as the whole SPAN 4xx range minus the professional-contexts courses SPAN422 and SPAN480 (the same pool the Spanish major uses), which also contains the alternative SPAN425/SPAN426. Flagged.",
  ],
  requirements: [
    { kind: "course", id: "span207", name: "SPAN207 Reading and Writing in Spanish", options: ["SPAN207"] },
    { kind: "course", id: "span301", name: "SPAN301 Advanced Grammar and Composition I", options: ["SPAN301"] },
    {
      kind: "course",
      id: "span303",
      name: "SPAN303 Approaches to Cultural Materials in the Hispanic World",
      options: ["SPAN303"],
    },
    {
      kind: "course",
      id: "span311-or-316",
      name: "SPAN311 Advanced Communication I, or SPAN316 Spanish Translation I",
      options: ["SPAN311", "SPAN316"],
    },
    {
      kind: "choose",
      id: "select-one",
      name: "One of SPAN325, SPAN331-333, SPAN361-363",
      count: 1,
      from: { courses: ["SPAN325", "SPAN331", "SPAN332", "SPAN333", "SPAN361", "SPAN362", "SPAN363"] },
    },
    spanLcmElectives(
      "advanced-elective",
      "One 4xx Spanish or Latin American Literature, Culture, and Media course, or SPAN425/SPAN426",
      1,
      3,
    ),
  ],
};

export const spanMinorLiteratureLinguisticsCultureMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Spanish Literature, Linguistics, and Culture",
  sources: { catalog: `${CATALOG_BASE}spanish-literature-linguistics-culture-minor/`, department: DEPT },
};
