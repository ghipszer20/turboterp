// Departmental Honors: English.
// Source: https://www.english.umd.edu/academics/undergraduate/honors (fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://www.english.umd.edu/academics/undergraduate/honors";

export const deptEngl: Program = {
  id: "dept-honors-engl",
  name: "Departmental Honors: English",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "5 of the courses in the major are designated honors courses. The 5 courses amount to 12 credits: Spring of junior year: enroll in ENGL370 (1 credit); Fall of senior year: enroll in ENGL373 (2 credits); Spring of senior year: enroll in Honors Independent Study with a faculty advisor (3 credits); Anytime during the program: take an Honors Seminar ENGL428 (3 credits); Anytime during the program: take a second Honors Seminar ENGL428 (3 credits)."`,
    `[check] "Senior Honors Project... ENGL495: Students complete an independent study with their faculty advisor wherein they complete their project." Drafted the "Honors Independent Study" course above as ENGL495, the id named in the Senior Honors Project section.`,
    `[manual] "Every semester, at least one seminar (ENGL428) is offered. The seminars are limited to 20 students." Enrollment limits aren't checked.`,
    `[manual] Eligibility: "no minimum GPA, but most applicants have established a strong track record... including ENGL301, the gateway course for the major." Not a citation requirement.`,
    `[manual] "A thesis is at least 20 pages and a creative work is at least 30 pages... defend the project in a colloquium with three or four readers." The thesis document and defense aren't checked.`,
  ],
  requirements: [
    { kind: "course", id: "engl370", name: "Honors coursework I", options: ["ENGL370"] },
    { kind: "course", id: "engl373", name: "Honors coursework II", options: ["ENGL373"] },
    { kind: "course", id: "engl495", name: "Honors Independent Study", options: ["ENGL495"] },
    { kind: "choose", id: "engl428", name: "Honors Seminar (ENGL428), taken twice", count: 2, from: { courses: ["ENGL428"] } },
  ],
};

export const deptEnglMeta: ProgramMeta = { kind: "special", college: "ARHU", sources: { department: "https://www.english.umd.edu/academics/undergraduate/honors" } };
