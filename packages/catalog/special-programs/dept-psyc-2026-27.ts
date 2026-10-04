// Departmental Honors: Psychology.
// Source: https://psyc.umd.edu/undergraduate/psyc-honors-program (fetched 2026-09-26). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://psyc.umd.edu/undergraduate/psyc-honors-program";

export const deptPsyc: Program = {
  id: "dept-honors-psyc",
  name: "Departmental Honors: Psychology",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "PSYC468H (Field Experience and Special Assignments in Honors, up to 6 credits; recommended spring of junior year)." Drafted with a 3-credit minimum (the table lists "PSYC Honors Coursework: 13-17 credits" across four named courses; PSYC468H is the only one given a range rather than a fixed figure).`,
    `[check] "PSYC469H (Honors Thesis Proposal Preparation, 3 credits; recommended fall of senior year)."`,
    `[check] "PSYC498H (Advanced Psychology Honors Seminar II, 1 credit; recommended spring of senior year)." Also named earlier as "two PSYC honors seminars including PSYC498H"; only PSYC498H has a published id.`,
    `[check] "PSYC499H (Honors Thesis Research, 3 credits; recommended spring of senior year)."`,
    `[manual] "An additional advanced PSYC course: Another PSYC Honors Seminar, 400-level PSYC lab, or any 600-level PSYC course." No fixed course id; not drafted.`,
    `[manual] Eligibility: "Completed three courses (9 credits) in psychology, including PSYC 200... An overall and psychology GPA of at least 3.50." Not a citation requirement.`,
    `[manual] "Present thesis poster at the Department of Psychology Undergraduate Research Day... Join Psi Chi International Honors Society for Psychology for at least senior year." Not course requirements.`,
    `[manual] "The thesis consists of... After the advisor determines that the thesis is ready for review, the final thesis must be presented to the Honors Thesis Committee" for an oral defense. The thesis document and defense aren't checked.`,
  ],
  requirements: [
    { kind: "choose", id: "psyc468h", name: "PSYC468H: Field Experience and Special Assignments in Honors", credits: 3, from: { courses: ["PSYC468H"] } },
    { kind: "course", id: "psyc469h", name: "PSYC469H: Honors Thesis Proposal Preparation", options: ["PSYC469H"] },
    { kind: "course", id: "psyc498h", name: "PSYC498H: Advanced Psychology Honors Seminar II", options: ["PSYC498H"] },
    { kind: "course", id: "psyc499h", name: "PSYC499H: Honors Thesis Research", options: ["PSYC499H"] },
  ],
};

export const deptPsycMeta: ProgramMeta = { kind: "special", college: "BSOS", sources: { department: "https://psyc.umd.edu/undergraduate/psyc-honors-program" } };
