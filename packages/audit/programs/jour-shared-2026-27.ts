// Shared requirement building blocks for the Journalism Major (Philip Merrill College of Journalism)
// and its three optional specializations (Broadcast; Investigative Reporting; Sports), 2026-27 UMD
// Academic Catalog. Not a program file itself (no `*Meta` export); imported by jour-major-*-2026-27.ts.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/journalism/journalism-major/
//   (fetched 2026-09-28; program-sources/journalism-major.md). The source file holds only the catalog
// page: no department page, so "department page not checked".

import type { Requirement } from "../src/audit.ts";

const C_MINUS = "C-";

/** Requirements for every journalism major (the catalog's "Required courses for all journalism majors"). */
export const jourCore: Requirement[] = [
  {
    kind: "choose",
    id: "abstract-thinking",
    name: "Abstract thinking skills: one statistics course",
    count: 1,
    credits: 3,
    from: {
      courses: [
        "BIOM301", "BMGT230", "CCJS200", "ECON230", "ECON321", "GEOG306", "GVPT422", "INST314",
        "JOUR405", "PSYC200", "QMMS251", "SOCY201", "STAT400",
      ],
    },
  },
  {
    kind: "choose",
    id: "public-speaking",
    name: "Public speaking: one of COMM100, COMM107, COMM200, COMM230",
    count: 1,
    credits: 3,
    from: { courses: ["COMM100", "COMM107", "COMM200", "COMM230"] },
  },
  { kind: "course", id: "history", name: "HIST200 or HIST201 (Interpreting American History)", options: ["HIST200", "HIST201"] },
  {
    kind: "choose",
    id: "behavioral-social",
    name: "Behavioral or social science: one of ANTH260, PSYC100, PSYC221, SOCY100, SOCY105",
    count: 1,
    credits: 3,
    from: { courses: ["ANTH260", "PSYC100", "PSYC221", "SOCY100", "SOCY105"] },
  },
  { kind: "course", id: "economics", name: "ECON200 or ECON201", options: ["ECON200", "ECON201"] },
  { kind: "course", id: "gvpt170", name: "American Government (GVPT170)", options: ["GVPT170"] },
  {
    kind: "concentration",
    id: "supporting-area",
    name: "Supporting area: four upper-level courses (12 credits) in one field, not Communication",
    credits: 12,
    minNumber: 300,
    maxNumber: 499,
    excludeDepartments: ["COMM"],
  },
  { kind: "course", id: "jour152", name: "Introduction to Storytelling with Code (JOUR152)", options: ["JOUR152"], minGrade: C_MINUS },
  { kind: "course", id: "jour200", name: "Journalism History, Roles and Structures (JOUR200)", options: ["JOUR200"], minGrade: C_MINUS },
  { kind: "course", id: "jour201", name: "News Writing and Reporting I (JOUR201)", options: ["JOUR201"], minGrade: C_MINUS },
  { kind: "course", id: "jour320", name: "News Writing and Reporting II: Multiplatform (JOUR320)", options: ["JOUR320"], minGrade: C_MINUS },
  { kind: "course", id: "jour352", name: "Interactive Design and Development (JOUR352)", options: ["JOUR352"], minGrade: C_MINUS },
  { kind: "course", id: "jour396", name: "Supervised Internship (JOUR396, 2 credits)", options: ["JOUR396"] },
  { kind: "course", id: "jour402", name: "Journalism Law and Ethics (JOUR402)", options: ["JOUR402"], minGrade: C_MINUS },
  {
    kind: "choose",
    id: "journalism-society",
    name: "Journalism and Society course: one JOUR course numbered 410-469",
    count: 1,
    credits: 3,
    from: { departments: ["JOUR"], minNumber: 410, maxNumber: 469 },
  },
  {
    kind: "choose",
    id: "media-research",
    name: "Media Research course: one JOUR course numbered 470-479",
    count: 1,
    credits: 3,
    from: { departments: ["JOUR"], minNumber: 470, maxNumber: 479 },
  },
  {
    kind: "choose",
    id: "menu-visual",
    name: "Menu 1, Visual: JOUR347 or JOUR370",
    count: 1,
    credits: 3,
    minGrade: C_MINUS,
    from: { courses: ["JOUR347", "JOUR370"] },
  },
  {
    kind: "choose",
    id: "menu-exploration",
    name: "Menu 2, Exploration: one of JOUR202, JOUR347, JOUR360, JOUR370, JOUR371",
    count: 1,
    credits: 3,
    minGrade: C_MINUS,
    from: { courses: ["JOUR202", "JOUR347", "JOUR360", "JOUR370", "JOUR371"] },
  },
  {
    kind: "choose",
    id: "upper-skills",
    name: "Upper-level JOUR skills courses in the 321-389 range (6 credits of the 9-15 upper-level elective credits)",
    credits: 6,
    from: { departments: ["JOUR"], minNumber: 321, maxNumber: 389 },
  },
  {
    kind: "choose",
    id: "upper-jour",
    name: "Upper-level JOUR course (remaining 3 credits of the 9-15 upper-level elective credits)",
    count: 1,
    credits: 3,
    from: { departments: ["JOUR"], minNumber: 300, maxNumber: 499 },
  },  {
    kind: "openSlot",
    id: "capstone-experience",
    name: "Journalism Capstone Experience",
    credits: 3,
    note: "3-9 credits; the catalog names no capstone courses, so confirm an approved capstone with your advisor (it must earn a C- or higher).",
  },
  {
    kind: "openSlot",
    id: "language-math-stats",
    name: "Language and/or Math/Statistics/Computer Science",
    credits: 6,
    note: "Up to two language courses (one intermediate, at most one introductory) and/or up to two Math/Stat/CS courses (MATH 107 or higher, or an approved 3+ credit programming course); confirm with your advisor.",
  },
  {
    kind: "openSlot",
    id: "supporting-area-upper",
    name: "Supporting Area: four more upper-level courses",
    credits: 12,
    note: "Four additional upper-level (300+) courses, not Communication; the catalog names no list, so confirm with your advisor.",
  },
];

/** reviewNotes common to all four programs. */
export const jourCommonReviewNotes: string[] = [
  "Department page not checked: program-sources/journalism-major.md holds only the catalog page, so the " +
    "owner's 'department page wins' ruling could not be applied; encoded from the catalog alone.",
  "Open slot 'capstone-experience' (openSlot requirement): Journalism Capstone Experience, 3 credits (the catalog range is 3-9; " +
    "only the 3-credit minimum is encoded). The catalog names no capstone courses, so the student confirms with their advisor; " +
    "a capstone must also earn a C- or higher.",
  "Open slot 'language-math-stats' (openSlot requirement): 6 credits of Language and/or Math/Statistics/Computer Science. " +
    "Language subjects and the programming list are not named in the source, so the student confirms with their advisor.",
  "Open slot 'supporting-area-upper' (openSlot requirement): 12 credits, 'four additional upper-level courses' (300+, not " +
    "Communication), the second half of the Supporting Area. No list is named, so the student confirms with their advisor. The first " +
    "Supporting Area block (four upper-level courses, 12 credits in one field, not COMM) is encoded as a " +
    "12-credit one-department 300-499 concentration excluding COMM.",
  "The catalog's 'Upper-Level Courses of Choice' (9-15 credits; at least 9 upper-level JOUR, at least 6 in the " +
    "321-389 skills range) is encoded as its minimum: 6 credits from JOUR321-389 plus one further upper-level " +
    "(300-499) JOUR course (3 credits). Credits above the minimum are unrestricted electives.",
  "The 'C-' rule applies only to JOUR152, 200, 201, 202, 320, 347, 352, 360, 361, 370, 371, 402 and any " +
    "capstone, so minGrade 'C-' is set per requirement (not program-wide) on those rows. The rule that the " +
    "C- be earned before taking dependent courses is not encoded.",
  "Not encoded (standard manual checks): 122-credit minimum; 42-48 credits in JOUR numbered 100+; 74-80 " +
    "credits outside journalism with at least 65 in liberal-arts designated courses; 57 credits at " +
    "300-499; JOUR201 placement requirements (JOUR181 or the grammar exam, ENGL101, JOUR200 with C-).",
  "JOUR396 (2 credits) is encoded as a fixed core course. The Journalism and Society (410-469) and Media " +
    "Research (470-479) rows accept any JOUR course in the range, since the source names none.",
  "Specializations are optional and 'fit inside the curricular requirements', so each specialization " +
    "program layers overlay chooses (checked, not consumed) on the General requirements.",
];

export const jourSources = {
  catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/journalism/journalism-major/",
};
