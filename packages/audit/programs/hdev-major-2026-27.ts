// Human Development Major (BA/BS), College of Education, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/.../human-development-quantitative-methodology/human-development-major/
// and the College of Education Major Four Year Plans page, fetched 2026-09-28; see
// program-sources/human-development-major.md. Not a teacher-preparation program, so the
// shared education component is not imported. Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const coreCourses = ["EDHD411", "EDHD412", "EDHD413", "EDHD440", "EDHD460"];
const edhdElectives = [
  "EDHD221", "EDHD230", "EDHD231", "EDHD241", "EDHD251", "EDHD310", "EDHD400", "EDHD405",
  "EDHD402", "EDHD414", "EDHD420", "EDHD421", "EDHD425", "EDHD488",
];
const listedElectives = [
  // Psychology
  "PSYC200", "PSYC221", "PSYC300", "PSYC330", "PSYC332", "PSYC334", "PSYC336", "PSYC341",
  "PSYC346", "PSYC353", "PSYC381", "PSYC391", "PSYC436",
  // Sociology
  "SOCY227", "SOCY230", "SOCY241", "SOCY325", "SOCY412", "SOCY424", "SOCY442", "SOCY467",
  // Family Science
  "FMSC290", "FMSC330", "FMSC332", "FMSC430", "FMSC431", "FMSC460",
];
const otherDepartments = [
  "AAAS", "AAST", "AMST", "ANTH", "BMGT", "CCJS", "ECON", "GVPT", "HESP", "HLTH", "LING",
  "RELS", "SLLC", "SPHL", "STAT", "WGSS",
];
const upperNamed = [...coreCourses, ...edhdElectives, ...listedElectives].filter(
  (c) => Number(c.replace(/^[A-Z]+/, "")) >= 400,
);

export const hdevMajor: Program = {
  id: "hdev-major",
  name: "Human Development Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Human Development Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/human-development-quantitative-methodology/human-development-major/); " +
    "College of Education Major Four Year Plans page (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Department page not checked: the source file has only the catalog requirements and the College of Education four-year-plans page, which is a general page with no Human Development requirements or plan text. Encoded from the catalog alone.",
    "The College of Education page says a C- or better is required in pre-professional and professional coursework; the catalog gives no grade rule for this major. minGrade C- is applied on that college-wide statement. Confirm it applies to Human Development.",
    "The four electives are one pool: the 14 listed EDHD electives, the five core courses (footnote: a core course not credited as core may be an elective), the listed Psychology, Sociology and Family Science electives, and every course in the 16 'Other Possible Electives' departments (AAAS, AAST, AMST, ANTH, BMGT, CCJS, ECON, GVPT, HESP, HLTH, LING, RELS, SLLC, SPHL, STAT, WGSS; the catalog's run-together 'HLTH - Health LING - Linguistics' is read as two departments). The catalog says those departments' electives are 'approved by program advisor', which is not encodable, so the whole department is accepted. Advisor approval is a manual gate.",
    "Not encoded (manual): the double-major substitutions (Family Health majors FMSC302 for EDHD306; Psychology majors PSYC300 for EDHD306 and PSYC200 for QMMS251); the optional EDHD489 or EDHD498 substitution for 3 elective credits at faculty invitation; 43 total credits.",
    "Internship: EDHD398 (6 credits, one or two semesters) or, per footnotes, six credits of 400-level electives instead, or EDHD398 for 3 credits plus a 400-level elective for 3. Encoded as a 6-credit pool of EDHD398 plus the 400-level named electives; 400-level courses in the other departments are not included in the pool (a course filter cannot combine named courses with a level-limited department range), so a student using one of those for the internship substitute shows a gap here. EDHD390 is required either way.",
    "The catalog four-year plan section only links out to the College of Education roadmaps, and the COE page lists 'Human Development' as a link with no plan text, so the sample plan is CONSTRUCTED, not official.",
  ],
  requirements: [
    { kind: "course", id: "edhd200", name: "Paradigms and Perspectives in Human Development (EDHD200)", options: ["EDHD200"] },
    { kind: "course", id: "edhd201", name: "Learning How to Learn (EDHD201)", options: ["EDHD201"] },
    { kind: "course", id: "edhd320", name: "Human Development Through the Life Span (EDHD320)", options: ["EDHD320"] },
    { kind: "course", id: "edhd306", name: "Research Methods in Human Development (EDHD306)", options: ["EDHD306"] },
    { kind: "course", id: "qmms251", name: "Introduction to Educational Statistics (QMMS251)", options: ["QMMS251"] },
    { kind: "choose", id: "hdev-core", name: "Core courses (select three of five)", count: 3, from: { courses: coreCourses } },
    {
      kind: "choose",
      id: "hdev-electives",
      name: "Elective courses (four)",
      count: 4,
      from: { courses: [...coreCourses, ...edhdElectives, ...listedElectives], departments: otherDepartments },
    },
    { kind: "course", id: "edhd390", name: "Career Paths and Internship Preparation in Human Development (EDHD390)", options: ["EDHD390"] },
    {
      kind: "choose",
      id: "hdev-internship",
      name: "Internship in Human Development (EDHD398, 6 credits) or 400-level electives in its place",
      credits: 6,
      from: { courses: ["EDHD398", ...upperNamed] },
    },
  ],
};

export const hdevMajorMeta: ProgramMeta = {
  kind: "major",
  college: "EDUC",
  short: "Human Development",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/human-development-quantitative-methodology/human-development-major/",
  },
};
