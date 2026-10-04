// Secondary Education Minor, TESOL and Dual Language Education Minor, and Education Policy,
// Equity, and Justice Minor, 2026–27 UMD Academic Catalog (Department of Teaching and Learning,
// Policy and Leadership).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/
// secondary-education-minor/, tesol-education-minor/, education-policy-equity-justice-minor/
// (also listed under public-policy/ with an identical table) (fetched 2026-09-28); College of
// Education, https://education.umd.edu/academics/programs/undergraduate/education-policy-equity-and-justice-minor
// (fetched 2026-09-28; EPEJ only). Owner ruling (docs/project/rulings.md): where the department
// page and the catalog disagree, follow the department page.
// No official published sample plans (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const SOURCE_TLPL_CATALOG_ONLY =
  "UMD Academic Catalog 2026–27, Teaching, Learning, Policy and Leadership minors (fetched 2026-09-28); department page not checked";

export const tlplMinorSecondaryEducation: Program = {
  id: "tlpl-minor-secondary-education",
  name: "Secondary Education Minor",
  catalogYear: "2026-27",
  source: SOURCE_TLPL_CATALOG_ONLY,
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Catalog only; department page not checked. Five slots: adolescent development, TLPL481, one foundation option, one elective, one introductory methods course; 15 credits. The certificate is out of scope and not encoded.",
    "Terrapin Teacher substitutions are accepted for everyone: TLPL414 for EDHD413, and MATH274 alongside TLPL415 as a foundation option (the catalog limits both to Terrapin Teacher students; program membership is not checked). TLPL401 is likewise listed among the methods options.",
    "Foundation option TLPL101 & TLPL102 must be taken together (a set of two courses).",
    "The elective list ends with 'Other courses may be approved. Consult with your advisor', which has no named range; the elective requirement is marked advisorMayApprove. AAST222 has no title in the catalog.",
    "Cumulative GPA of 2.75 for enrollment in the methods courses, and 'no more than six credits (two courses) at an institution other than UMD College Park', are not encoded (GPA and transfer rules). Catalog states no sharing cap; none is set.",
  ],
  requirements: [
    { kind: "course", id: "adolescent-development", name: "Adolescent Development (EDHD413, or TLPL414 for Terrapin Teacher)", options: ["EDHD413", "TLPL414"] },
    { kind: "course", id: "diversity", name: "Embracing Diversity in the Classroom Community", options: ["TLPL481"] },
    {
      kind: "sets",
      id: "foundation",
      name: "Foundation course (choose one)",
      options: [["TLPL101", "TLPL102"], ["TLPL286"], ["TLPL250"], ["TLPL360"], ["TLPL415"], ["MATH274"]],
    },
    {
      kind: "choose",
      id: "elective",
      advisorMayApprove: true,
      name: "Elective (cultural/identity studies or special interest area; choose one)",
      count: 1,
      from: {
        courses: [
          "AASP100", "AASP202", "AAST201", "AAST222", "HIST106", "WGSS200", "LGBT200", "LGBT264", "LACS234", "ANTH264",
          "TLPL206", "TLPL287", "TLPL443", "TLPL453", "TLPL457", "EDHD426",
        ],
      },
    },
    {
      kind: "choose",
      id: "methods",
      name: "Secondary education introductory methods (choose one)",
      count: 1,
      from: { courses: ["TLPL401", "TLPL433", "TLPL451", "TLPL445", "TLPL413", "TLPL420", "TLPL470"] },
    },
  ],
};

export const tlplMinorTesol: Program = {
  id: "tlpl-minor-tesol",
  name: "Teaching English for Speakers of Other Languages (TESOL) and Dual Language Education Minor",
  catalogYear: "2026-27",
  source: SOURCE_TLPL_CATALOG_ONLY,
  verified: false,
  reviewNotes: [
    "Catalog only; department page not checked. Three core courses (TLPL440, TLPL442, TLPL443) plus one of two 6-credit tracks; 15 credits.",
    "Dual Language Education track = TLPL445 plus 'Course Chosen with Advisor in Language of Specialization', which has no named list or range. Only TLPL445 is encoded for that track (a student who took only TLPL445 would pass; the advisor-chosen second course is a manual check).",
    "The catalog states no minimum grade, sharing cap, GPA or residency rule; none is encoded.",
  ],
  requirements: [
    { kind: "course", id: "tlpl440", name: "Foundations of Educating Multilingual Learners", options: ["TLPL440"] },
    { kind: "course", id: "tlpl442", name: "Foundations of Literacy and Biliteracy Development", options: ["TLPL442"] },
    { kind: "course", id: "tlpl443", name: "Cross-Cultural Communication and Multilingual Learners", options: ["TLPL443"] },
    {
      kind: "sets",
      id: "track",
      name: "TESOL Education track (TLPL441 and TLPL444) or Dual Language Education track (TLPL445 and an advisor-chosen language course)",
      options: [["TLPL441", "TLPL444"], ["TLPL445"]],
    },
  ],
};

export const tlplMinorEducationPolicyEquityJustice: Program = {
  id: "tlpl-minor-education-policy-equity-justice",
  name: "Education Policy, Equity, and Justice Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Education Policy, Equity, and Justice Minor (listed under both Teaching, Learning, Policy and Leadership and Public Policy); " +
    "College of Education, https://education.umd.edu/academics/programs/undergraduate/education-policy-equity-and-justice-minor (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Cross-listed: the catalog lists this minor under both EDUC (TLPL) and PLCY with an identical requirement table and the same department page, so it is encoded once (college: EDUC).",
    "Department-vs-catalog difference (owner ruling: follow the department page): the catalog says the two electives must be at the 300 or 400 level; the department page says at least 9 of the 15 credits must be 300- or 400-level. Encoded per the department: a 9-credit 300+ overlay. Since PLCY354 and TLPL360 are already 300-level, that requires one 300+ elective, not two.",
    "Department page names the third core course PLCY388A ('354 in 2025/2026'); the catalog says PLCY354. Both codes are accepted.",
    "Electives: 'a wide variety of courses offered by the College of Education and School of Public Policy, or propose courses that align with your major' has no named list. Encoded as any 100+ course in the College of Education departments (CHSE, EDCP, EDHD, EDHI, EDMS, EDSP, EDUC, TLPL) or PLCY (whole range, flagged); proposed courses from other departments need advisor approval (the electives requirement is marked advisorMayApprove).",
    "Application (with major and GPA) is required to join; not encoded. Catalog states no sharing cap; none is set.",
  ],
  requirements: [
    { kind: "course", id: "tlpl254", name: "Surmounting School: Democracy, Inequality, and Schooling", options: ["TLPL254"] },
    { kind: "course", id: "tlpl360", name: "Foundations of Education", options: ["TLPL360"] },
    { kind: "course", id: "child-family-policy", name: "Child and Family Policy Impact (PLCY354, or PLCY388A)", options: ["PLCY354", "PLCY388A"] },
    {
      kind: "choose",
      id: "electives",
      advisorMayApprove: true,
      name: "Two electives (College of Education or School of Public Policy)",
      count: 2,
      from: {
        departments: ["CHSE", "EDCP", "EDHD", "EDHI", "EDMS", "EDSP", "EDUC", "TLPL", "PLCY"],
        minNumber: 100,
        maxNumber: 499,
        exclude: ["TLPL254", "TLPL360", "PLCY354", "PLCY388A"],
      },
    },
    {
      kind: "choose",
      id: "upper-division",
      name: "At least 9 credits at the 300 or 400 level",
      overlay: true,
      credits: 9,
      from: {
        departments: ["CHSE", "EDCP", "EDHD", "EDHI", "EDMS", "EDSP", "EDUC", "TLPL", "PLCY"],
        minNumber: 300,
        maxNumber: 499,
      },
    },
  ],
};

export const tlplMinorSecondaryEducationMeta: ProgramMeta = { kind: "minor", college: "EDUC", short: "Secondary Education", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/secondary-education-minor/" } };

export const tlplMinorTesolMeta: ProgramMeta = { kind: "minor", college: "EDUC", short: "TESOL and Dual Language", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/tesol-education-minor/" } };

export const tlplMinorEducationPolicyEquityJusticeMeta: ProgramMeta = { kind: "minor", college: "EDUC", short: "Education Policy, Equity, and Justice", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/education-policy-equity-justice-minor/", department: "https://education.umd.edu/academics/programs/undergraduate/education-policy-equity-and-justice-minor" } };
