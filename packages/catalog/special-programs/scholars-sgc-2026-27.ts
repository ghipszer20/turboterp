// College Park Scholars: Science and Global Change (Fall 2026 curriculum PDF). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, SCHOLARS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsSGC2026_0.pdf";

/** "Supporting Course A: Earth, Atmospheric, Environmental, and Planetary Sciences" (lecture ids; labs left out). */
const LIST_A = [
  "GEOL100", "GEOL102", "GEOL104", "GEOL120", "AOSC123", "GEOL123", "GEOL200", "GEOL204", "GEOL212", "AOSC200",
  "AGNR301", "PUAF301", "ARCH272", "AREC200", "ENSP101", "ENSP102", "ENST140", "ENST200", "ENST214", "GEOG201",
  "ASTR220", "ASTR230",
];

/** "Supporting Course C: Broader Context" (course ids as listed). */
const LIST_C = [
  "ANSC227", "ANSC277", "ANTH210", "ANTH222", "ANTH240", "ANTH241", "ANTH265", "ANTH266", "AREC240", "AREC241",
  "AREC365", "BSCI151", "INST126", "INST326", "INST327", "ECON181", "ECON185", "ENEE131", "ENEE200", "ENES200",
  "ENGL255", "ENMA150", "ENMA289A", "ENSP250", "PLSC250", "ENST233", "ENST282", "FMSC110", "GEOG140", "GEOG330",
  "GEOL288", "GEOL388", "GVPT273", "GVPT306", "HIST141", "HIST204", "HIST205", "HIST206", "PHIL209B", "PHIL250",
  "PLSC101", "PLSC115", "PLSC125", "PLSC289I", "TLPL285", "URSP250",
];

export const scholarsSgc: Program = {
  id: "scholars-sgc",
  name: "College Park Scholars: Science and Global Change",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    ...SCHOLARS_CITATION_NOTES,
    `[check] Courses: "CPSG 100: Colloquium I; CPSG 101: Colloquium II; CPSG 200: Colloquium III; CPSG 230: Internship or CPSG 240: Service Learning or CPSG 250: Research or CPSP 359G: Advanced Research (DSSP) or CPSP 359S: Discovery Research (DSSP)".`,
    `[check] CDP: "The CDP Course requirement can be earned by taking one of the following: Any 3-credit class with DVCC or DVUP credit; Any combination of 1- or 2-credit courses with DVCC or DVUP credit, which total up to at least 3 credits; FMSC190S …; GVPT 170 …; GVPT 202 …". Encoded as 3 credits of DVCC/DVUP courses or those three courses. "The CDP requirement can be earned by one of the Supporting Courses if that course has DVCC or DVUP credit", so it is an overlay (it doesn't use the course up).`,
    `[check] Supporting courses: "Four courses (totaling 12 credits)" and "Each student must complete one course from each of the following three lists (Note: each category also includes the categories before them)". Encoded as A: one from list A; B: one from list A or any DSNS/DSNL course ("a second course from List A or … Any 3-4 credit class with DSNS or DSNL GenEd credit"); C: one from list C or list A, or any CMSC course numbered 106 or higher ("Any one (1) CMSC course numbered 106 or higher OR INST 126 …, INST 326 …, or INST 327"). The fourth course is the CDP course; the 12-credit total isn't checked.`,
    `[check] C also "includes" category B (any DSNS/DSNL course), which is not encoded: the engine can't combine a Gen Ed filter with a department range in one filter.`,
    `[check] "ANSC 277 Eating with Eyes Wide Open" on list C; the same title is ANSC227 on the ETE and STS lists. Both ids are accepted.`,
    `[check] Lab pairings ("GEOL 100/110", "GEOL 120/110", "AOSC 200/201", "GEOG 201/211") list the lecture only; the labs aren't separate supporting courses.`,
    `[check] "AGNR/PUAF 301" and "ENEE 200 or ENES 200" and "ENSP/PLSC 250" are cross-listings; "AOSC/GEOL 123" too. Both ids are listed; the engine counts a course once per requirement.`,
    `[manual] "Students may petition an alternative course" and "Prior Learning Credit … SGC will honor this as having completed that Supporting Course."`,
  ],
  requirements: [
    { kind: "course", id: "cpsg100", name: "Colloquium I", options: ["CPSG100"] },
    { kind: "course", id: "cpsg101", name: "Colloquium II", options: ["CPSG101"] },
    { kind: "course", id: "cpsg200", name: "Colloquium III", options: ["CPSG200"] },
    { kind: "course", id: "practicum", name: "Practicum", options: ["CPSG230", "CPSG240", "CPSG250", "CPSP359G", "CPSP359S"] },
    {
      kind: "choose",
      id: "cdp",
      name: "Citizenship and Diverse Perspectives course (DVCC or DVUP)",
      credits: 3,
      from: { courses: ["FMSC190S", "GVPT170", "GVPT202"], genEd: ["DVCC", "DVUP"] },
      overlay: true,
    },
    { kind: "choose", id: "supporting-a", name: "Supporting Course A: Earth, Atmospheric, Environmental and Planetary Sciences", count: 1, from: { courses: LIST_A } },
    { kind: "choose", id: "supporting-b", name: "Supporting Course B: Gen Ed Natural Sciences", count: 1, from: { courses: LIST_A, genEd: ["DSNS", "DSNL"] } },
    {
      kind: "choose",
      id: "supporting-c",
      name: "Supporting Course C: Broader Context",
      count: 1,
      from: { courses: [...LIST_C, ...LIST_A], departments: ["CMSC"], minNumber: 106 },
    },
  ],
};

export const scholarsSgcMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsSGC2026_0.pdf" } };
