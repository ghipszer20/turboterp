// College Park Scholars: Business, Society and Entrepreneurship (Fall 2026 curriculum PDF).
// Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, SCHOLARS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsBSE2026_0.pdf";

export const scholarsBse: Program = {
  id: "scholars-bse",
  name: "College Park Scholars: Business, Society and Entrepreneurship",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    ...SCHOLARS_CITATION_NOTES,
    `[check] Courses by semester: "Semester 1 CPBE 100: Colloquium I, BMGT 161: Creative Problem Solving (DSSP, SCIS); Semester 2 BMGT461S: Entrepreneurship, CPBE101: Colloquium II; Semester 3 CPBE 225: Enterprise Communications (FSOC), CPBE200: Colloquium III; Semester 4 CPBE 230: Internship; or CPBE 240: Service-Learning; or CPBE 250: Research". The credit column is misaligned in the PDF text, so credits are not quoted.`,
    `[check] "BMGT461S" is a Scholars-designated id; plain BMGT461 is not accepted.`,
    `[check] Supporting course: "Select any DVCC or DVUP course that will enrich your understanding of BSE. One course (1-3 credits)". Encoded as one course carrying DVCC or DVUP; whether it "enriches" BSE is the program director's call. Such a course may also count toward Gen Ed (separate programs share courses).`,
    `[manual] The advising guide still says "Scholars in Business, Society and the Economy" (the program's former name).`,
  ],
  requirements: [
    { kind: "course", id: "cpbe100", name: "Colloquium I", options: ["CPBE100"] },
    { kind: "course", id: "bmgt161", name: "Creative Problem Solving", options: ["BMGT161"] },
    { kind: "course", id: "bmgt461s", name: "Entrepreneurship", options: ["BMGT461S"] },
    { kind: "course", id: "cpbe101", name: "Colloquium II", options: ["CPBE101"] },
    { kind: "course", id: "cpbe225", name: "Enterprise Communications", options: ["CPBE225"] },
    { kind: "course", id: "cpbe200", name: "Colloquium III", options: ["CPBE200"] },
    { kind: "course", id: "practicum", name: "Practicum (internship, service-learning or research)", options: ["CPBE230", "CPBE240", "CPBE250"] },
    { kind: "choose", id: "supporting-course", name: "Supporting course (DVCC or DVUP)", count: 1, from: { genEd: ["DVCC", "DVUP"] } },
  ],
};

export const scholarsBseMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsBSE2026_0.pdf" } };
