// Departmental Honors: Hearing & Speech Sciences.
// Source: https://hesp.umd.edu/undergraduate/honors-hearing-and-speech-sciences-undergraduate-students
// (fetched 2026-09-27). Hand-transcribed. UNVERIFIED.

import type { Program } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://hesp.umd.edu/undergraduate/honors-hearing-and-speech-sciences-undergraduate-students";

export const deptHesp: Program = {
  id: "dept-honors-hesp",
  name: "Departmental Honors: Hearing & Speech Sciences",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "HESP Honors involves 12 credits: 3 credits (1 credit taken in each of 3 separate semesters) of HESP Honors seminar class (468H)." Drafted as one requirement needing 3 credits of HESP468H, not three separate 1-credit enrollments.`,
    `[check] "9 credits of research registration that culminates in a thesis (HESP 499H, HESP 469A, and HESP 469B)," of which "the honors thesis is taken for six credits, which must be spread over at least two semesters of registration (HESP 469A and B)." Drafted as HESP499H needing 3 credits (9 minus the 6-credit thesis) plus HESP469A and HESP469B each required once; the 6 credits' split across A and B isn't separately checked.`,
    `[check] Statistics prerequisite: "an approved course in statistics (PSYC 200, EDMS 451 or BIOM 301 or equivalent) with a grade of B or better," required before "the data collection and writing of thesis." Drafted as any one of PSYC200, EDMS451, BIOM301; the B-or-better grade on this one course isn't checked (the audit's minGrade is program-wide, not per-course).`,
    `[manual] Eligibility: "A cumulative GPA of 3.5 or higher and a GPA of 3.5 or higher in HESP courses... Declaration of HESP major by the time of application... Completion of HESP 202 with a grade of A." Not a citation requirement.`,
    `[manual] Standing: "Maintain a 3.5 GPA both overall and in the HESP major"; a student may be asked to withdraw if "evaluations of performance in Honors seminars are below B level." GPA and per-course grade standing aren't checked.`,
    `[manual] "The written document as well as an oral defense will be evaluated by the Thesis Committee," which "must consist of no fewer than two faculty members," and the thesis needs "the approval of the University's Institutional Review Board." The thesis document, defense and approvals aren't checked.`,
    `[manual] Application: "an online application" plus a PDF of transcript, personal statement and securing a faculty mentor. Not a course requirement.`,
  ],
  requirements: [
    { kind: "choose", id: "hesp468h", name: "HESP468H: Professional Development in Research and Academia", credits: 3, from: { courses: ["HESP468H"] } },
    { kind: "choose", id: "hesp499h", name: "HESP499H: Independent Study", credits: 3, from: { courses: ["HESP499H"] } },
    { kind: "course", id: "hesp469a", name: "HESP469A: Honors Thesis Proposal", options: ["HESP469A"] },
    { kind: "course", id: "hesp469b", name: "HESP469B: Honors Thesis Writing", options: ["HESP469B"] },
    { kind: "choose", id: "hespStats", name: "Approved statistics course", count: 1, from: { courses: ["PSYC200", "EDMS451", "BIOM301"] } },
  ],
};
