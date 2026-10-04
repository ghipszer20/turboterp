// Classics minors, 2026–27 UMD Academic Catalog (Department of Classics): Greek Language and
// Culture Minor, Latin Language and Literature Minor, Classical Mythology Minor and the
// Archaeology Minor (catalog page under classical-languages-literature/).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/classical-languages-literature/
// {greek-language-culture-minor, latin-language-literature-minor, classical-mythology-minor, archaeology-minor}/
// (fetched 2026-09-28); Department of Classics, https://classics.umd.edu/ (fetched 2026-09-28;
// the Archaeology minor also has https://classics.umd.edu/academicprograms/archaeology).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page. No official published sample plans (built from the requirements
// below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const CAT = "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/classical-languages-literature/";
const DEPT_HOME = "https://classics.umd.edu/";
const DEPT_ARCH = "https://classics.umd.edu/academicprograms/archaeology";

const SOURCE_HOME =
  "UMD Academic Catalog 2026–27, Classics minors; Department of Classics, https://classics.umd.edu/ (fetched 2026-09-28)";

// ---------------------------------------------------------------- Greek Language and Culture

export const clasMinorGreek: Program = {
  id: "clas-minor-greek",
  name: "Greek Language and Culture Minor",
  catalogYear: "2026-27",
  source: SOURCE_HOME,
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Department page (classics.umd.edu) is only a homepage with no requirements; encoded from the catalog. Department page not checked for requirements.",
    "'9 to 15 credits in ancient OR modern Greek language courses (not a combination)': encoded as 9 credits from any GREK course numbered 100-499 (ancient and modern Greek both carry the GREK prefix, so the engine can't tell them apart). The 'all ancient or all modern' rule is not enforced -- manual check. The 15-credit cap on language is not enforced either (more language credits simply count as extra).",
    "'At least one language course at the 300 or 400 level' is an overlay: one GREK course numbered 300-499 (so a 300+ language course counts toward both).",
    "Open slot 'greek-culture' (openSlot requirement): 3 credits (the catalog says 3 to 6, so the minimum is used; extra culture credits are manual) of courses taught in English on ancient and/or modern Greek history, literature and culture. No list is published, so the student confirms it with their advisor.",
    "Total of at least 15 credits (9-15 language + 3-6 culture) and 'at least 9 credits of the total at 300/400 level' are not encoded: the culture courses are unnamed, so neither total can be checked. Manual check.",
    "'A maximum of 6 credits may count toward both the minor and the student's major' -> maxSharedWith: [{ credits: 6 }] (the catalog says 'the student's major', not a named major, so it is not limited to Classics major ids). 'A maximum of six credits earned at other institutions' is a transfer cap, not encoded. Program GPA 2.0 encoded as minGpa; per-course C- minimum is (minGrade).",
  ],
  requirements: [
    {
      kind: "choose",
      id: "greek-language",
      name: "Greek language courses (ancient OR modern, 9 credits minimum)",
      credits: 9,
      from: { departments: ["GREK"], minNumber: 100, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "greek-upper-language",
      name: "At least one Greek language course at the 300 or 400 level",
      overlay: true,
      count: 1,
      from: { departments: ["GREK"], minNumber: 300, maxNumber: 499 },
    },
    {
      kind: "openSlot",
      id: "greek-culture",
      name: "Greek history, literature or culture course (in English)",
      credits: 3,
      note: "Courses taught in English on ancient and/or modern Greek history, literature and culture; no list is published.",
    },
  ],
};

export const clasMinorGreekMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Greek Language & Culture",
  sources: { catalog: CAT + "greek-language-culture-minor/", department: DEPT_HOME },
};

// ---------------------------------------------------------------- Latin Language and Literature

export const clasMinorLatin: Program = {
  id: "clas-minor-latin",
  name: "Latin Language and Literature Minor",
  catalogYear: "2026-27",
  source: SOURCE_HOME,
  verified: false,
  reviewNotes: [
    "Department page (classics.umd.edu) is only a homepage with no requirements; encoded from the catalog. Department page not checked for requirements.",
    "Two routes, as a 'sets' requirement. No prior Latin: LATN101, LATN102, LATN201, two 3xx reading courses and one 4xx reading course (21 credits). Advanced standing: 'a total of five courses in Latin at the 2xx level and beyond'.",
    "The catalog names the 3xx choices by author (Plautus, Petronius, Ovid, or Horace and Catullus) and the 4xx one as 'a major Latin author' but gives no course numbers, so any LATN course at 300-399 and any at 400-499 is accepted (never narrower). Flagged.",
    "The advanced-standing route is open to anyone in the audit; the catalog gives no formal placement test, so 'entering with advanced standing' is not checked.",
    "Neither source states a minimum grade, a GPA, a sharing cap or a transfer cap for this minor; none is encoded.",
  ],
  requirements: [
    {
      kind: "sets",
      id: "latin",
      name: "Latin sequence (21 credits from LATN101, or five courses at the 2xx level and beyond)",
      options: [
        [
          "LATN101",
          "LATN102",
          "LATN201",
          { count: 2, from: { departments: ["LATN"], minNumber: 300, maxNumber: 399 } },
          { count: 1, from: { departments: ["LATN"], minNumber: 400, maxNumber: 499 } },
        ],
        [{ count: 5, from: { departments: ["LATN"], minNumber: 200, maxNumber: 499 } }],
      ],
    },
  ],
};

export const clasMinorLatinMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Latin Language & Literature",
  sources: { catalog: CAT + "latin-language-literature-minor/", department: DEPT_HOME },
};

// ---------------------------------------------------------------- Classical Mythology

export const clasMinorMythology: Program = {
  id: "clas-minor-mythology",
  name: "Classical Mythology Minor",
  catalogYear: "2026-27",
  source: SOURCE_HOME,
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page (classics.umd.edu) is only a homepage with no requirements; encoded from the catalog. Department page not checked for requirements.",
    "Catalog: CLAS170 and CLAS470 required, plus three of CLAS320, CLAS330, CLAS331, CLAS374, CLAS419 'two of which must be at the 3xx or 4xx level'. Every course in the list is 3xx or 4xx, so that condition is automatically met and needs no extra rule.",
    "Program GPA 2.0 encoded as minGpa; per-course C- minimum is (minGrade). Neither the catalog nor the department page states a sharing cap; none is set.",
  ],
  requirements: [
    { kind: "course", id: "clas170", name: "Ancient Myths and Modern Lives", options: ["CLAS170"] },
    { kind: "course", id: "clas470", name: "Approaches to Greek Mythology", options: ["CLAS470"] },
    {
      kind: "choose",
      id: "electives",
      name: "Three electives (two at 3xx or 4xx)",
      count: 3,
      from: { courses: ["CLAS320", "CLAS330", "CLAS331", "CLAS374", "CLAS419"] },
    },
  ],
};

export const clasMinorMythologyMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Classical Mythology",
  sources: { catalog: CAT + "classical-mythology-minor/", department: DEPT_HOME },
};

// ---------------------------------------------------------------- Archaeology

// Supporting/fieldwork course lists from the department page. Whole departments named in the
// prose ("in, e.g., ARCH, ANTH, ARTH, CLAS, HIST, JWST, LARC, RELS") are accepted; the extra
// courses from other departments are named individually.
const ARCH_DEPARTMENTS = ["ARCH", "ANTH", "ARTH", "CLAS", "HIST", "JWST", "LARC", "RELS"];
const ARCH_OTHER_DEPT_COURSES_ALL = [
  "GEOL342",
  "GEOG210",
  "GEOG211",
  "GEOG372",
  "GEOG373",
  "GEOG415",
  "GEOG472",
  "GEOG473",
  "GEOG475",
  "HISP200",
];
const ARCH_OTHER_DEPT_COURSES_UPPER = ARCH_OTHER_DEPT_COURSES_ALL.filter((c) => Number(c.slice(4)) >= 300);
const ARCH_FIELDWORK = ["ARTH369M", "ANTH496", "ARCH481", "ARCH483", "CLAS380", "JWST369T", "HIST369B"];

export const clasMinorArchaeology: Program = {
  id: "clas-minor-archaeology",
  name: "Archaeology Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Archaeology Minor (Classical Languages and Literatures); Department of Classics, " +
    DEPT_ARCH +
    " (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Possibly cross-listed: program-sources/art-history-archaeology-archaeology-minor.md is an Art History and Archaeology page for an Archaeology minor. This encodes the Classics-department page once; the main session should confirm whether the two are the same minor.",
    "Department-vs-catalog differences (department page wins): (1) the prerequisite to the required 305 course also allows CLAS190 (catalog lists only ANTH240, CLAS180, ARTH200) and can be waived by instructor permission. The prerequisite is not a requirement of the minor (it sits outside the 15 credits, and a waiver exists), so it is not encoded; the prerequisite courses can still count as supporting courses. (2) The department page lists the 305 cross-listings as ANTH, CLAS, ARTH (the catalog also adds JWST319Y); encoded with all four. (3) The department page's supporting-course list is longer than the catalog's prose 'in, e.g., ARCH, ANTH, ...' and is explicitly 'not all-inclusive'.",
    "Supporting courses: accepted as ANY course in ARCH, ANTH, ARTH, CLAS, HIST, JWST, LARC or RELS (the departments the source names) plus the GEOL/GEOG/HISP courses on the department list -- broader than the approved list (which is 'not all-inclusive' and maintained by a faculty committee), by the never-narrower rule. Flagged: students need the approved list to be sure a course counts.",
    "Structure: 305 (3 credits) + fieldwork (3-6) + supporting (6-9) with a 15-credit minimum. Encoded as 305, 3 fieldwork credits, 6 supporting credits, and 3 further credits from either the fieldwork or supporting lists. The 6-credit fieldwork cap and 9-credit supporting cap are not enforced.",
    "'At least 9 credits overall at the 3xx or 4xx level' is an overlay over the 300-499 courses of the accepted departments (plus the 3xx+ GEOL/GEOG courses on the list).",
    "Study-abroad fieldwork programs need advance approval by a UMCP faculty member: manual. Fieldwork list: ARTH369M, ANTH496, ARCH481, ARCH483, CLAS380, JWST369T/HIST369B; other approved fieldwork ('many options at UMCP') is not named and so is not encoded.",
    "'A maximum of 6 credits may count toward both the minor and the student's major' -> maxSharedWith: [{ credits: 6 }] (not limited to Classics major ids, since the source says 'the student's major'). Transfer cap (6 credits at other institutions) are not encoded; program GPA 2.0 encoded as minGpa; per-course C- minimum is (minGrade).",
  ],
  requirements: [
    {
      kind: "course",
      id: "methods",
      name: "Archaeological Methods and Practice (ANTH305, CLAS305, ARTH305 or JWST319Y)",
      options: ["ANTH305", "CLAS305", "ARTH305", "JWST319Y"],
    },
    {
      kind: "choose",
      id: "fieldwork",
      name: "Approved fieldwork course (3 credits minimum, up to 6)",
      credits: 3,
      from: { courses: ARCH_FIELDWORK },
    },
    {
      kind: "choose",
      id: "supporting",
      name: "Supporting courses with a significant focus on archaeology (6 credits minimum, up to 9)",
      credits: 6,
      from: { courses: ARCH_OTHER_DEPT_COURSES_ALL, departments: ARCH_DEPARTMENTS, minNumber: 100, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "additional",
      name: "Three more credits of fieldwork or supporting courses (15-credit minimum)",
      credits: 3,
      from: {
        courses: [...ARCH_FIELDWORK, ...ARCH_OTHER_DEPT_COURSES_ALL],
        departments: ARCH_DEPARTMENTS,
        minNumber: 100,
        maxNumber: 499,
      },
    },
    {
      kind: "choose",
      id: "upper-level",
      name: "At least 9 credits at the 3xx or 4xx level",
      overlay: true,
      credits: 9,
      from: {
        courses: [...ARCH_OTHER_DEPT_COURSES_UPPER, ...ARCH_FIELDWORK],
        departments: ARCH_DEPARTMENTS,
        minNumber: 300,
        maxNumber: 499,
      },
    },
  ],
};

export const clasMinorArchaeologyMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Archaeology",
  sources: { catalog: CAT + "archaeology-minor/", department: DEPT_ARCH },
};
