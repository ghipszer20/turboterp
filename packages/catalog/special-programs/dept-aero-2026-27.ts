// Departmental Honors: Aerospace Engineering.
// Source: https://aero.umd.edu/undergraduate/ae-honors-program (fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://aero.umd.edu/undergraduate/ae-honors-program";

export const deptAero: Program = {
  id: "dept-honors-aero",
  name: "Departmental Honors: Aerospace Engineering",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "To earn the Honors Citation, students must successfully complete ENAE410H (formerly known as ENAE311H), ENAE423H, and 3 credits of ENAE398H. Students must also successfully complete ENAE283H unless they receive a special exception."`,
    `[manual] "Students also have the option to take ENAE457H in addition to their other ENAE honors courses." Optional, so not drafted as a requirement.`,
    `[manual] "students will be evaluated after completion of 30 credits... Typically, students will have at least a 3.87 GPA... the top 10-15% of the Aerospace Engineering sophomore-level class is invited to join." Admission criteria, not a citation requirement.`,
    `[manual] "students will write a scholarly paper and present their research findings... uploading a copy of your final ENAE honors research paper in DRUM." The paper and presentation aren't checked (ENAE398H, the research-project course, stands in for them).`,
  ],
  requirements: [
    { kind: "course", id: "enae283h", name: "ENAE283H: Foundations of Aerospace I", options: ["ENAE283H"] },
    { kind: "course", id: "enae410h", name: "ENAE410H: Compressible Aerodynamics", options: ["ENAE410H"] },
    { kind: "course", id: "enae423h", name: "ENAE423H: Vibration and Aeroelasticity", options: ["ENAE423H"] },
    { kind: "choose", id: "enae398h", name: "ENAE398H: Honors Research Project (3 credits)", credits: 3, from: { courses: ["ENAE398H"] } },
  ],
};

export const deptAeroMeta: ProgramMeta = { kind: "special", college: "ENGR", sources: { department: "https://aero.umd.edu/undergraduate/ae-honors-program" } };
