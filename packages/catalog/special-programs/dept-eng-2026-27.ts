// Departmental Honors: Engineering (Clark School Engineering Honors Program, EHP).
// Source: https://www.eng.umd.edu/current/honors-program (fetched 2026-09-26). Hand-transcribed. UNVERIFIED.
//
// The Clark School honors directory lists "Engineering" (this page, contact Dr. Wesley Lawson) separately from
// Aerospace Engineering and Bioengineering, which each publish their own, separate departmental honors program
// (see dept-aero-2026-27.ts, dept-bioe-2026-27.ts). Electrical and Computer Engineering has no honors page of
// its own and is a "none" entry pointing here (see registry.ts).

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://www.eng.umd.edu/current/honors-program";

/** "Be sure to enroll in the appropriate departmental course:" — the department-specific research course list. */
const RESEARCH_COURSES = ["BIOE489H", "ENAE499", "ENCE489", "CHBE468", "ENEE499", "ENFP489", "ENMA499", "ENME488", "ENME489"];

export const deptEng: Program = {
  id: "dept-honors-eng",
  name: "Departmental Honors: Engineering (Clark School)",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "Successful completion of both Engineering Honors Seminars (ENES 480 and ENES 481, 1 credit hour each)."`,
    `[check] Research Project Requirement: "Be sure to enroll in the appropriate departmental course: BIOE489H..., ENAE 499..., ENCE 489..., CHBE 468..., ENEE 499..., ENFP 489..., ENME 488..., ENME 489..." Drafted as one course from this list, credits unspecified by the page.`,
    `[manual] "An honors research project—which often can be used as a technical elective—a written report, and an oral presentation to a faculty panel of the EHP." The report and presentation aren't checked; the research course stands in for the project itself.`,
    `[manual] Admission: "Upper fourth of engineering juniors and seniors... Junior standing or 60 applicable credits." Not a citation requirement.`,
    `[manual] "Maintenance of a high enough GPA to remain in the upper fourth of the class." Not checked.`,
  ],
  requirements: [
    { kind: "course", id: "enes480", name: "ENES480: Engineering Honors Seminar (fall)", options: ["ENES480"] },
    { kind: "course", id: "enes481", name: "ENES481: Engineering Honors Seminar (spring)", options: ["ENES481"] },
    { kind: "choose", id: "research-course", name: "Departmental research course", count: 1, from: { courses: RESEARCH_COURSES } },
  ],
};

export const deptEngMeta: ProgramMeta = { kind: "special", college: "ENGR", sources: { department: "https://www.eng.umd.edu/current/honors-program" } };
