// College Park Scholars: Public Leadership (Fall 2026 curriculum PDF). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, SCHOLARS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsPL2026_0.pdf";

export const scholarsPl: Program = {
  id: "scholars-pl",
  name: "College Park Scholars: Public Leadership",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    ...SCHOLARS_CITATION_NOTES,
    `[check] Courses: "CPPL 100: Colloquium I (DVCC) 1 cr; PLCY 201S: Public Leaders and Active Citizens (SCIS, DSHS or DSSP) 3 cr; CPPL 101: Colloquium II 1 cr; CPPL 200: Colloquium III 1 cr". PLCY201S is a Scholars-designated id; plain PLCY201 is not accepted.`,
    `[check] "Semester 1, 2, 3, or 4 Oral Communication Course (FSOC) 3 cr": encoded as one FSOC course. It may also count toward Gen Ed (separate programs share courses).`,
    `[manual] Practicum (not drafted): "Scholars in Public Leadership must complete a 3-credit practicum in the sophomore year in one of the following ways: 1. An internship … you must be enrolled in CPSP339P (DSSP) or another UMD course that gives 3 credits for internships … 2. A research experience 3. An approved UMD course that focuses on experiential learning 4. A UMD study abroad course". The options aren't a course list, so the student confirms the practicum with the program.`,
  ],
  requirements: [
    { kind: "course", id: "cppl100", name: "Colloquium I", options: ["CPPL100"] },
    { kind: "course", id: "plcy201s", name: "Public Leaders and Active Citizens", options: ["PLCY201S"] },
    { kind: "course", id: "cppl101", name: "Colloquium II", options: ["CPPL101"] },
    { kind: "course", id: "cppl200", name: "Colloquium III", options: ["CPPL200"] },
    { kind: "choose", id: "oral-communication", name: "Oral Communication course (FSOC)", count: 1, from: { genEd: ["FSOC"] } },
  ],
};

export const scholarsPlMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsPL2026_0.pdf" } };
