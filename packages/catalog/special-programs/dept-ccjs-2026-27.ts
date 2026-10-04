// Departmental Honors: Criminology & Criminal Justice.
// Source: https://ccjs.umd.edu/undergraduate/undergraduate-honors-program (fetched 2026-09-27). Hand-transcribed. UNVERIFIED.

import type { Program } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://ccjs.umd.edu/undergraduate/undergraduate-honors-program";

export const deptCcjs: Program = {
  id: "dept-honors-ccjs",
  name: "Departmental Honors: Criminology & Criminal Justice",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  minGrade: "B",
  reviewNotes: [
    `[check] "The Honors Program is a four-semester (12 required credit hours) sequence... CCJS388H, the first course in the sequence... is offered only in the fall semester." Drafted as a single required course.`,
    `[check] "CCJS389H Independent Research... can be completed during the spring semester of the junior year or anytime in the senior year." Drafted as a single required course; the timing isn't checked.`,
    `[check] "In the fall semester of the senior year, students will enroll in CCJS489H... In the spring semester of the senior year, students will continue CCJS489H." Drafted as one requirement needing 6 credits of CCJS489H (3 each semester), matching the program's 12-credit total (3+3+3+3).`,
    `[check] Grade: "CCJS Honors students must earn a B or higher in all CCJS Honors courses." Encoded as a program-wide minimum grade of B.`,
    `[manual] GPA: "CCJS Honors students will be reviewed at the end of every semester to ensure they continue to meet the GPA requirements of a 3.25 cumulative GPA and 3.40 CCJS major GPA." Not a citation requirement.`,
    `[manual] "Only three credits of CCJS489H will fulfill the 400-level CCJS Course of Choice requirement." The overlap with the CCJS major's own Course of Choice requirement isn't tracked here.`,
    `[manual] "In the spring semester of the senior year, students will... complete and orally defend their honors thesis." The thesis document and oral defense aren't checked.`,
    `[manual] Admission: "The Honors Program application cycle" and the "Admission Requirements & How to Apply" page (not itself fetched) aren't checked; "Failure to meet the above listed requirements will result in dismissal from the CCJS Honors Program" is a standing rule, not a course requirement.`,
  ],
  requirements: [
    { kind: "course", id: "ccjs388h", name: "CCJS388H", options: ["CCJS388H"] },
    { kind: "course", id: "ccjs389h", name: "CCJS389H: Independent Research", options: ["CCJS389H"] },
    { kind: "choose", id: "ccjs489h", name: "CCJS489H: Honors Thesis (fall and spring, senior year)", credits: 6, from: { courses: ["CCJS489H"] } },
  ],
};
