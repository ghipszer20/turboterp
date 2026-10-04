// Departmental Honors: Neuroscience.
// Source: https://neur.umd.edu/opportunities/honors-requirements (fetched 2026-09-27). Hand-transcribed. UNVERIFIED.

import type { Program } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://neur.umd.edu/opportunities/honors-requirements";

export const deptNeur: Program = {
  id: "dept-honors-neur",
  name: "Departmental Honors: Neuroscience",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "Register for a total of at least 9 honors research credits (NEUR379H/479H) with their mentor and conduct proposed honors thesis research"; "non-nonors research credits (NEUR379/479) do not count toward the 9 required honors credits." Drafted as 9 credits from NEUR379H and/or NEUR479H only; the plain (non-H) NEUR379/479 are excluded.`,
    `[check] "Register for honors seminar (NEUR398H) each semester, and fulfill each semester's requirements," across "these 4 sequential semesters." Drafted as completing NEUR398H once; registering for it in each of the 4 semesters isn't checked.`,
    `[manual] Eligibility/standing: "Must have (and maintain) an overall GPA of at least 3.25 to be accepted (and remain) in the program." High Honors additionally needs "GPA of at least 3.75" and a thesis "of exceptionally high quality as determined by the thesis committee." Not a citation requirement.`,
    `[manual] "Must be able to complete these 4 sequential semesters in the order listed below" (thesis introduction, proposal, research, defense). Sequencing and timing aren't checked.`,
    `[manual] "Establish a thesis committee of 3 faculty," "Submit a research progress report at the end of each semester," "Be actively involved in leadership or volunteerism within the NEUR program," "Present at NEUR research day," "Assist with program open house and recruitment or tutoring." None are course requirements.`,
    `[manual] "Complete honors thesis with thesis defense presentation." The thesis document and defense aren't checked.`,
  ],
  requirements: [
    { kind: "choose", id: "neurResearch", name: "NEUR379H/NEUR479H: Honors Research", credits: 9, from: { courses: ["NEUR379H", "NEUR479H"] } },
    { kind: "course", id: "neur398h", name: "NEUR398H: Honors Seminar", options: ["NEUR398H"] },
  ],
};
