// Shared pieces of the three Secondary Education - Social Studies options (History, Geography, Government
// and Politics), 2026-27 UMD Academic Catalog. Not a program file (no `Meta` export). Source:
// program-sources/social-studies-education-major.md (catalog, MCERT, Terrapin Teachers and COE pages, fetched
// 2026-09-28). Teacher-prep pieces come from educ-shared-2026-27.ts (not edited).

import type { Requirement } from "../src/audit.ts";
import {
  educAdolescentDevelopment,
  educContentAreaLiteracy,
  educDigitalLearningTools,
  educDiverseLearners,
  educFieldExperience,
  educFoundations,
  educInternship,
  educProfessionalSeminar,
} from "./educ-shared-2026-27.ts";

const c = (id: string, name: string, course: string): Requirement => ({
  kind: "course",
  id,
  name: `${name} (${course})`,
  options: [course],
});

/** Pre-professional and professional education courses (identical in all three options). */
export const socEducation: Requirement[] = [
  educFoundations,
  educDigitalLearningTools,
  c("educ-ss-tlpl481", "Embracing Diversity in the Classroom Community", "TLPL481"),
  educDiverseLearners,
  educAdolescentDevelopment,
  educContentAreaLiteracy,
  c("educ-ss-tlpl470", "Knowledge, Reasoning, and Learning in Secondary Social Studies", "TLPL470"),
  c("educ-ss-tlpl471", "Curriculum, Teaching, and Assessment in Secondary Social Studies", "TLPL471"),
  educFieldExperience(1),
  educProfessionalSeminar(1),
  educInternship(1),
];

/** American history survey: HIST200 or HIST201. */
export const socHistSurvey: Requirement = {
  kind: "course",
  id: "educ-ss-hist-survey",
  name: "Interpreting American History (HIST200 or HIST201)",
  options: ["HIST200", "HIST201"],
};

export const socHist208: Requirement = c("educ-ss-hist208", "Historical Research and Methods Seminar", "HIST208");

/** The two regional HIST electives; the source names no course list, so any HIST course is accepted. */
export const socHistRegional: Requirement[] = [
  {
    kind: "choose",
    id: "educ-ss-hist-nonwest",
    name: "HIST elective: Latin America, Middle East, East Asia or Africa (3 credits; region not enforced)",
    count: 1,
    from: { departments: ["HIST"], minNumber: 100, maxNumber: 499 },
  },
  {
    kind: "choose",
    id: "educ-ss-hist-europe",
    name: "HIST elective: Britain and Western Europe, or Eastern Europe and Russia (3 credits; region not enforced)",
    count: 1,
    from: { departments: ["HIST"], minNumber: 100, maxNumber: 499 },
  },
];

/** "Select one of" ECON111/175/181/200/201 or a lower-level ECON I-series course (ECON1xx). */
export const socEcon: Requirement = {
  kind: "choose",
  id: "educ-ss-econ",
  name: "Economics: ECON111, 175, 181, 200, 201 or a lower-level ECON I-series course (ECON1xx)",
  count: 1,
  // A filter's `courses` and `departments` are a union; ECON200/201 are named because the range stops at 199.
  from: { courses: ["ECON111", "ECON175", "ECON181", "ECON200", "ECON201"], departments: ["ECON"], minNumber: 100, maxNumber: 199 },
};

export const socSociology: Requirement = {
  kind: "course",
  id: "educ-ss-socy",
  name: "Introduction to Sociology or Understanding Contemporary Social Problems (SOCY100 or SOCY105)",
  options: ["SOCY100", "SOCY105"],
};

export const socGeog202: Requirement = c("educ-ss-geog202", "Introduction to Human Geography", "GEOG202");

export const socSharedReviewNotes: string[] = [
  "Department pages checked: the MCERT page describes the graduate M.Ed. certification program (its Social Studies specialization is a graduate track), terrapinteachers.umd.edu covers STEM teaching only and the College's four-year-plans page only links out. None adds or contradicts a requirement, so the catalog is encoded alone; no disagreement to record.",
  "The catalog offers three options (History, Geography, Government and Politics); each is encoded as one track of the `educ-social-studies` major, with History as the default track.",
  "TLPL488 (2 credits) is encoded as the course code TLPL488; the required section (TLPL488B) is not distinguishable. TLPL471 and TLPL479B must be taken concurrently; concurrency is not encoded. TLPL470 is fall of junior year and TLPL471/TLPL479B fall of senior year (timing not enforced).",
  "The catalog's 'Total Credits' line and its '29 credit hours in ... the social sciences' statement are not checked. The rows actually listed add up to fewer credits than the stated 29 (the balance is unlisted in the source; likely Gen Ed or free electives), so nothing further is encoded.",
  "No official 4-year plan is published for Secondary Social Studies Education in the fetched sources (the catalog and COE pages only link out). The sample plans are CONSTRUCTED from the catalog tables; flagged in docs/project/owner-review.md.",
];
