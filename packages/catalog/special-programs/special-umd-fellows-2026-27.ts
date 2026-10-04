// UMD Fellows Program (Maryland, Federal and Global Fellows).
// Source: UMD Academic Catalog 2026-27, Office of Undergraduate Studies, "UMD Fellows Program"
// (the program site fellowsprogram.umd.edu renders its content with JavaScript only).
// Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://academiccatalog.umd.edu/undergraduate/colleges-schools/undergraduate-studies/";

/** Seminar cross-listings as the catalog prints them, FGSM id first. */
const SEMINARS: [string, string][] = [
  ["FGSM310", "HNUH318T"],
  ["FGSM315", "HNUH319T"],
  ["FGSM320", "HNUH328T"],
  ["FGSM325", "HNUH329T"],
  ["FGSM330", "HNUH338T"],
  ["FGSM340", "HNUH348T"],
  ["FGSM350", "HNUH358T"],
  ["FGSM355", "HNUH359T"],
  ["FGSM360", "HNUH368T"],
  ["FGSM365", "HNUH369T"],
  ["FGSM370", "HNUH378T"],
  ["FGSM390", "HNUH398T"],
  ["ENGL381", "HONR368A"],
];

export const umdFellows: Program = {
  id: "special-umd-fellows",
  name: "UMD Fellows Program",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] Seminar: "The UMD Fellows Program Seminar: FGSM310/HNUH318T, FGSM315/HNUH319T, FGSM320/HNUH328T, FGSM325/HNUH329T, FGSM330/HNUH338T, FGSM340/HUH348T, FGSM350/HNUH358T, FGSM355/HNUH359T, FGSM360/HNUH368T, FGSM365/HNUH369T, FGSM370/HNUH378T, FGSM390/HNUH398T, ENGL381/HONR368A. Students in the program choose from several seminar courses". "HUH348T" is read as HNUH348T (typo in the catalog). Each pair is a cross-listing: only one id counts.`,
    `[check] Internship: "FGSM398/HNUH398P (3-9 credits, spring semester) … (Important note: Students may substitute another departmental internship course, offered in the student's major or elsewhere at the University, for FGSM398 in the UMD Fellows Program.)" FGSM398 and HNUH398P are encoded; a departmental substitute is manual.`,
    `[manual] Supporting coursework: "two additional UMD courses, approved by the program, are required of students participating in the program … (6 credits). With permission, courses completed prior to beginning the program may be used". No approved list is published, so this is a Manual Item.`,
    `[manual] "Supplemental Activities: Throughout the year, students attend workshops and roundtable discussions and participate in off-campus activities".`,
    `[manual] Admission: "Students in the program must have completed 30 credits by the end of the semester in which they apply and have a cumulative grade point average of 3.0 or higher." "Students who successfully complete all program requirements will earn a program notation on their transcript."`,
  ],
  requirements: [
    { kind: "choose", id: "seminar", name: "UMD Fellows seminar", count: 1, from: { courses: SEMINARS.flat() }, alternatives: SEMINARS.map((pair) => [...pair]) },
    { kind: "course", id: "internship", name: "UMD Fellows internship", options: ["FGSM398", "HNUH398P"] },
  ],
};

export const umdFellowsMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/undergraduate-studies/" } };
