// Robert H. Smith School of Business minors, 2026–27 UMD Academic Catalog: Business Analytics,
// Entrepreneurial Leadership and General Business.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/business/business-analytics-minor/,
// entrepreneurial-leadership-minor/ and general-business-minor/ (fetched 2026-09-28); Smith School
// academic minors page, https://rhsmith.umd.edu/programs/undergraduate/academics/academic-minors
// (fetched 2026-09-28; one page covers all three). Owner ruling (docs/project/rulings.md): where the
// department page and the catalog disagree, follow the department page. No published sample plans
// (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const CATALOG = "https://academiccatalog.umd.edu/undergraduate/colleges-schools/business";
const DEPT = "https://rhsmith.umd.edu/programs/undergraduate/academics/academic-minors";

const SHARED_NOTES = [
  "Department page: 'a maximum of six credits (or two courses) to satisfy the requirements of any major ... with any minor' -> maxSharedWith: [{ credits: 6 }]. 'Courses completed in one minor may not be used to satisfy the requirements of another minor' is not encoded (the sharing cap can't name 'every other minor'); manual check.",
  "Manual (not encoded): the C- floor is applied per requirement (minGrade C-, department page: 'a grade of C- or better is required in all minor courses'); at least 9 upper-level credits, at least 6 upper-division credits taken at UMD College Park, at most 6 transfer credits, and regular grading only (no pass/fail or audit) are residency and grading rules.",
  "Admission to the minor is competitive and application-based (GPA, essays, reference); not encoded.",
];

const src = (name: string) =>
  `UMD Academic Catalog 2026–27, ${name}; Robert H. Smith School of Business, ${DEPT} (fetched 2026-09-28)`;

const BA_LIST_A = [
  "BMGT302", "BMGT332", "BMGT385", "BMGT400", "BMGT401", "BMGT404",
  "CMSC132", "INST326", "CMSC320",
];

export const bmgtMinorBusinessAnalytics: Program = {
  id: "bmgt-minor-business-analytics",
  name: "Business Analytics Minor",
  catalogYear: "2026-27",
  source: src("Business Analytics Minor"),
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    ...SHARED_NOTES,
    "Department page requires C- in all minor courses; the catalog says nothing. The department page's 3.0 GPA to apply, 45 credits earned and four semesters remaining are admission rules, not encoded. The department page says 'three required courses and two approved electives' and gives no course lists beyond the prerequisites, so the catalog lists are used.",
    "Prerequisites (BMGT110, BMGT230 with B-, MATH120 or MATH140) are encoded as requirements: the department page says they must be complete to graduate with the minor (BMGT110 may follow application). 'Or equivalent' for BMGT230 and MATH120: only the listed courses are accepted; other courses may count with advisor approval. Marked advisorMayApprove (bmgt230, calculus): other courses may count with advisor approval; only the listed courses count.",
    "Catalog footnote substitutes are accepted: CMSC424 or INST327 for BMGT402; ECON422 or ECON424 for BMGT430 (Economics majors only); CMSC132 or INST326 for BMGT302; CMSC320 for BMGT404 (Computer Science majors only). The major restrictions (also CMSC422 CS-only, ECON414 Economics-only, ENCE402 Civil and Environmental Engineering-only, ENEE436 ECE-only, INST414 Information Science-only) are eligibility gates, not enforced (no declared-major check); flagged.",
    "Electives: 6 credits, 'minimum 3-6 credits' from the first list and 'maximum 3 credits' from the second. Encoded as two courses from both lists plus an overlay requiring at least one from the first list (so at most one comes from the second). BMGT447 has no title in the source; kept as listed.",
  ],
  requirements: [
    { kind: "course", id: "bmgt110", name: "Introduction to the Business Value Chain", options: ["BMGT110"] },
    { kind: "course", id: "bmgt230", name: "Business Statistics (minimum B-)", options: ["BMGT230"], minGrade: "B-", advisorMayApprove: true },
    { kind: "course", id: "calculus", name: "Elementary Calculus I or Calculus I", options: ["MATH120", "MATH140"], advisorMayApprove: true },
    { kind: "course", id: "bmgt402", name: "AI Augmented Database Systems", options: ["BMGT402", "CMSC424", "INST327"] },
    { kind: "course", id: "bmgt430", name: "Data Modeling in Business", options: ["BMGT430", "ECON422", "ECON424"] },
    { kind: "course", id: "bmgt431", name: "Data Analytics and AI for Business", options: ["BMGT431"] },
    {
      kind: "choose",
      id: "electives",
      name: "Two electives (6 credits)",
      count: 2,
      from: {
        courses: [
          ...BA_LIST_A,
          "BMGT347", "BMGT394", "BMGT447", "BMGT484", "CMSC422", "ECON414", "ENCE402",
          "ENEE436", "INST414", "STAT430",
        ],
      },
    },
    {
      kind: "choose",
      id: "electives-list-a",
      name: "At least one elective from the core elective list",
      overlay: true,
      count: 1,
      from: { courses: BA_LIST_A },
    },
  ],
};

export const bmgtMinorBusinessAnalyticsMeta: ProgramMeta = {
  kind: "minor",
  college: "BMGT",
  short: "Business Analytics Minor",
  sources: { catalog: `${CATALOG}/business-analytics-minor/`, department: DEPT },
};

export const bmgtMinorEntrepreneurialLeadership: Program = {
  id: "bmgt-minor-entrepreneurial-leadership",
  name: "Entrepreneurial Leadership Minor",
  catalogYear: "2026-27",
  source: src("Entrepreneurial Leadership Minor"),
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    ...SHARED_NOTES,
    "Department-vs-catalog difference: the department page says both 'three required courses, and two elective majors [sic] from a prescribed list' and, further down, 'five required courses from a prescribed list'. The catalog's structure (BMGT461M, BMGT365, BMGT366 plus 6 credits of electives) is consistent with the first and is encoded; both add to 15 credits.",
    "BMGT461: the catalog says to take the 'M' version (BMGT461M); both BMGT461 and BMGT461M are accepted. The catalog notes BMGT365 and BMGT366 have prerequisites (see Testudo), not encoded.",
    "Electives: two courses from the catalog list. BMGT352 is listed as 'or BMGT352 ... Smith majors only' beside BMGT382; accepted (eligibility not enforced, flagged). BMGT468 is limited to sections R, T and Z; the engine can't restrict by section, so the section codes BMGT468R, BMGT468T and BMGT468Z are the accepted codes.",
    "Department page: 12 credits at UMD College Park, GPA 2.0 and at least 2 remaining semesters are admission rules, not encoded.",
  ],
  requirements: [
    { kind: "course", id: "bmgt461", name: "Entrepreneurship (BMGT461M)", options: ["BMGT461M", "BMGT461"] },
    { kind: "course", id: "bmgt365", name: "Entrepreneurial Finance and Private Equity", options: ["BMGT365"] },
    { kind: "course", id: "bmgt366", name: "Growth Strategies for Emerging Companies", options: ["BMGT366"] },
    {
      kind: "choose",
      id: "electives",
      name: "Two electives (6 credits)",
      count: 2,
      from: {
        courses: [
          "BMGT289B", "BMGT289A", "BMGT289E", "BMGT362", "BMGT369", "BMGT382", "BMGT352",
          "BMGT467", "BMGT468R", "BMGT468T", "BMGT468Z",
        ],
      },
    },
  ],
};

export const bmgtMinorEntrepreneurialLeadershipMeta: ProgramMeta = {
  kind: "minor",
  college: "BMGT",
  short: "Entrepreneurial Leadership Minor",
  sources: { catalog: `${CATALOG}/entrepreneurial-leadership-minor/`, department: DEPT },
};

export const bmgtMinorGeneralBusiness: Program = {
  id: "bmgt-minor-general-business",
  name: "General Business Minor",
  catalogYear: "2026-27",
  source: src("General Business Minor"),
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    ...SHARED_NOTES,
    "ELIGIBILITY: department page says 'the general business minor is not open to declared business majors'. Enforced via notOpenTo (every major the Smith School (BMGT) owns).",
    "Substitutes from the catalog: BMGT340 for BMIN345, BMGT350 for BMIN355, BMGT364 for BMIN395, BMGT372 for BMIN375, BMGT301 for BMIN305, and BMGT220 plus BMGT221 together for BMIN210. Department page's transfer table (BMGT210/345/355/395 foundation courses and their Smith alternatives) is a transfer-credit rule, not encoded. Department page: GPA 2.0 to declare, at least 12 UMD credits and two semesters remaining are admission rules; F-1/J-1 online-course limit is manual.",
    "Department page says the minor has 'four required courses and one approved elective' -- matches the catalog.",
  ],
  requirements: [
    { kind: "sets", id: "accounting", name: "Foundations of Accounting (BMIN210, or BMGT220 and BMGT221)", options: [["BMIN210"], ["BMGT220", "BMGT221"]] },
    { kind: "course", id: "finance", name: "Foundations of Financial Management", options: ["BMIN345", "BMGT340"] },
    { kind: "course", id: "marketing", name: "Foundations of Marketing", options: ["BMIN355", "BMGT350"] },
    { kind: "course", id: "management", name: "Principles of Management", options: ["BMIN395", "BMGT364"] },
    {
      kind: "choose",
      id: "elective",
      name: "One elective (Supply Chain Management or Information Systems)",
      count: 1,
      from: { courses: ["BMIN375", "BMGT372", "BMIN305", "BMGT301"] },
    },
  ],
};

export const bmgtMinorGeneralBusinessMeta: ProgramMeta = {
  kind: "minor",
  college: "BMGT",
  short: "General Business Minor",
  sources: { catalog: `${CATALOG}/general-business-minor/`, department: DEPT },
  notOpenTo: { colleges: ["BMGT"], reason: "Not open to declared business majors." },
};
