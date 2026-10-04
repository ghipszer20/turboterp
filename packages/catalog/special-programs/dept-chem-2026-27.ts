// Departmental Honors: Chemistry and Biochemistry.
// Source: https://www.chem.umd.edu/undergraduateprogram/current-students/chemistry-biochemistry-honors-program
// (fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://www.chem.umd.edu/undergraduateprogram/current-students/chemistry-biochemistry-honors-program";

export const deptChem: Program = {
  id: "dept-honors-chem",
  name: "Departmental Honors: Chemistry and Biochemistry",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] Qualifications: "Students who have performed at least two semesters of chemical or biochemical research for a minimum of 3 credits total within the department as CHEM 399." Drafted as a 3-credit CHEM399 requirement.`,
    `[check] "Honors candidates must register for CHEM 398 in their final semester at the University."`,
    `[manual] Qualifications: "Chemistry and Biochemistry majors with GPA > 3.0." Not a citation requirement.`,
    `[manual] "Students in the Honors Program write an Honors Thesis... presents a formal public seminar... followed immediately by an oral examination before the committee." The thesis, seminar and exam aren't course requirements.`,
  ],
  requirements: [
    { kind: "choose", id: "chem399", name: "CHEM399: Research (3 credits)", credits: 3, from: { courses: ["CHEM399"] } },
    { kind: "course", id: "chem398", name: "CHEM398: Honors thesis (final semester)", options: ["CHEM398"] },
  ],
};

export const deptChemMeta: ProgramMeta = { kind: "special", college: "CMNS", sources: { department: "https://www.chem.umd.edu/undergraduateprogram/current-students/chemistry-biochemistry-honors-program" } };
