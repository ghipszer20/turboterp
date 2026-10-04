// Psychology Major, Bachelor of Arts Track, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/psychology/psychology-major/;
// Department of Psychology, "Degree Requirements (BS and BA)", https://psyc.umd.edu/undergraduate/degree-requirements-bs-and-ba;
// Department of Psychology, "PSYC Courses & PSYC Syllabi", https://psyc.umd.edu/undergraduate/psyc-courses-psyc-syllabi (fetched 2026-09-28);
// Feller Center (BSOS), "Psychology Major Checklist" (Internet Archive copy, effective Spring 2022,
// last updated 4/23/24) (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree, follow
// the department page. The only such disagreement found is noted below (MATH136, not encoded).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const psycMajorBa: Program = {
  id: "psyc-major-ba",
  name: "Psychology Major (Bachelor of Arts)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Psychology Major; " +
    "Department of Psychology, Degree Requirements (BS and BA), https://psyc.umd.edu/undergraduate/degree-requirements-bs-and-ba; " +
    "Department of Psychology, PSYC Courses & PSYC Syllabi, https://psyc.umd.edu/undergraduate/psyc-courses-psyc-syllabi (fetched 2026-09-28); " +
    "Feller Center, Psychology Major Checklist (Internet Archive, effective Spring 2022, updated 4/23/24) (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 1.7,
  verified: false,
  reviewNotes: [
    "PSYC100 (or PSYC221 if AP/IB credit was earned for PSYC100) needs a B- or higher, not the program's usual C-; both the catalog and the department page agree. Encoded as a requirement-level minGrade override.",
    "Math gateway: catalog names only MATH120 or MATH140. The department page adds MATH136 as a third option, but restricts it to 'declared PSYC/BSCI double majors' (or students who took it before declaring PSYC) -- a major-conditional eligibility rule the audit can't model (it would otherwise let any student satisfy the requirement with a course the source says most PSYC majors can't take). Not encoded; MATH136 is left out of the options list.",
    "Thematic Courses (2 courses from each of Mind/Brain/Behavior, Mental Health/Interventions, and Social/Developmental/Organizational -- 6 of the 11 major courses) ARE now encoded per theme: the department's 'PSYC Courses & PSYC Syllabi' page (https://psyc.umd.edu/undergraduate/psyc-courses-psyc-syllabi, fetched 2026-09-28) lists every PSYC course under one of the three theme headings, and degree-requirements-bs-and-ba confirms '2 courses from each theme'. Each theme is a separate overlay choose (psyc-theme-1/2/3, count: 2, checked not consumed) over that theme's listed courses, so a course also claimed by psyc-multicultural or the 400-level requirements still counts toward its theme (the checklist explicitly allows this: 'May overlap with Thematic Courses'). Note: the source lists PSYC489J twice under different titles -- once in Theme I ('Applied Introduction to Human Brain Mapping') and once in Theme III ('Advanced Statistics in Psychology'); encoded verbatim in both theme lists as the source states it, not corrected.",
    "The PSYC Multicultural Course (the department page names the specific list -- see psyc-multicultural below, one of which must be among the 6 thematic courses) and the two 400-level requirements remain separate, non-overlay requirements as before; psyc-total-credits below still captures the major's aggregate 35-credit/11-course total.",
    "psyc-total-credits (35 credits of any PSYC course, overlay) stands in for the catalog's 'at least 35 credits (11 courses) in Psychology' / the checklist's '11 PSYC courses totaling at least 35 credits'. It's an overlay so PSYC100/200/300, the multicultural course, the 400-level courses and the thematic courses all count toward it without being used up twice. The 11-course count itself isn't separately enforced (credits only). Per the checklist, PSYC309A/309C/389/478/479 don't count toward this total; the newly-fetched courses page independently lists a longer 'do not apply towards degree requirements' set (PSYC111, 123, 303, 309F/G/P, 389, 409, 468H, 469H, 478, 479, 499H) -- neither list is encoded as an exclusion on psyc-total-credits (the filter is department-only, per the no-named-list precedent elsewhere in this codebase), but the sample plan was checked against the courses page's list and no longer uses any course from it (it previously used PSYC303, since replaced).",
    "PSYC 400-Level Lab (psyc-400-lab) is encoded as '4 credits of 400-level PSYC' rather than a verified lab-course identity: the audit's course filter has no notion of which courses are labs, only department and course number. In principle two 3-credit 400-level courses could substitute for one true lab course; treat this as an approximation of the checklist's 'one 400-level Lab {Must have 85 credits}' row.",
    "Not encoded (admission/progress gate, matches other majors' precedent): the LEP gateway and Academic Review requirements (PSYC100 B-, BSCI170 C-, math C- within the student's first 45 credits; a 2.00 cumulative GPA for continuing students, 2.70 for later transfers/declarers applying to the major) and the 'no more than 3 PSYC courses per semester' cap (with named exceptions). These gate progress toward/within the major rather than what's needed to graduate with it.",
    "Not encoded (engine gap): the per-course C-/B- minimums above are encoded, and the requirement that all 35 PSYC credits average a C- is encoded as program GPA 1.7 (minGpa; C- = 1.7); the college's residency/upper-level rules (15 of the final 30 credits at the 300-400 level, 12 upper-level major credits at UMD, 30 credits at UMD); and the 120-credit graduation minimum.",
  ],
  requirements: [
    {
      kind: "course",
      id: "psyc100",
      name: "Introduction to Psychology (PSYC100, or PSYC221 with AP/IB credit for PSYC100)",
      options: ["PSYC100", "PSYC221"],
      minGrade: "B-",
    },
    {
      kind: "course",
      id: "math-gateway",
      name: "Math Gateway (MATH120 or MATH140)",
      options: ["MATH120", "MATH140"],
    },
    { kind: "course", id: "bsci170", name: "Principles of Biology I", options: ["BSCI170"] },
    { kind: "course", id: "psyc200", name: "Statistical Methods in Psychology", options: ["PSYC200"] },
    { kind: "course", id: "psyc300", name: "Research Methods in Psychology Laboratory", options: ["PSYC300"] },
    {
      kind: "choose",
      id: "psyc-theme-1",
      name: "Thematic Courses: Theme I, Mind, Brain & Behavior (2 courses, overlay)",
      count: 2,
      overlay: true,
      from: {
        courses: [
          "PSYC202", "PSYC206", "PSYC301", "PSYC302", "PSYC304", "PSYC307", "PSYC310", "PSYC341",
          "PSYC355", "PSYC401", "PSYC402", "PSYC403", "PSYC404", "PSYC406", "PSYC407", "PSYC411",
          "PSYC413", "PSYC414", "PSYC417", "PSYC431", "PSYC440", "PSYC442", "PSYC443", "PSYC455",
          "PSYC489G", "PSYC489J", "PSYC489N", "PSYC489X",
        ],
      },
    },
    {
      kind: "choose",
      id: "psyc-theme-2",
      name: "Thematic Courses: Theme II, Mental Health & Interventions (2 courses, overlay)",
      count: 2,
      overlay: true,
      from: {
        courses: [
          "PSYC210", "PSYC234", "PSYC262", "PSYC330", "PSYC332", "PSYC336", "PSYC344", "PSYC353",
          "PSYC381", "PSYC391", "PSYC425", "PSYC432", "PSYC433", "PSYC435", "PSYC436", "PSYC437",
          "PSYC457", "PSYC459A", "PSYC489A", "PSYC489E", "PSYC489M", "PSYC489Q", "PSYC489V", "PSYC489W",
        ],
      },
    },
    {
      kind: "choose",
      id: "psyc-theme-3",
      name: "Thematic Courses: Theme III, Social, Developmental & Organizational Studies (2 courses, overlay)",
      count: 2,
      overlay: true,
      from: {
        courses: [
          "PSYC221", "PSYC221H", "PSYC232", "PSYC237", "PSYC309D", "PSYC334", "PSYC354", "PSYC356",
          "PSYC357", "PSYC361", "PSYC362", "PSYC416", "PSYC420", "PSYC424", "PSYC426", "PSYC447",
          "PSYC450", "PSYC456", "PSYC460", "PSYC463", "PSYC464", "PSYC465", "PSYC489F", "PSYC489I",
          "PSYC489J", "PSYC489K", "PSYC489O", "PSYC489P", "PSYC489T", "PSYC489Y",
        ],
      },
    },
    {
      kind: "choose",
      id: "psyc-multicultural",
      name: "PSYC Multicultural Course",
      count: 1,
      from: { courses: ["PSYC232", "PSYC262", "PSYC336", "PSYC354", "PSYC391", "PSYC447", "PSYC489E", "PSYC489F"] },
    },
    {
      kind: "choose",
      id: "psyc-400-nonlab",
      name: "PSYC 400-Level Non-Lab Courses (2)",
      count: 2,
      from: { departments: ["PSYC"], minNumber: 400, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "psyc-400-lab",
      name: "PSYC 400-Level Lab Course",
      credits: 4,
      from: { departments: ["PSYC"], minNumber: 400, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "psyc-total-credits",
      name: "Total Psychology Credits (35, 11 courses)",
      credits: 35,
      from: { departments: ["PSYC"] },
      overlay: true,
    },
  ],
};

export const psycMajorBaMeta: ProgramMeta = {
  kind: "major",
  college: "BSOS",
  short: "Psychology (B.A.)",
  major: "psyc",
  track: "B.A.",
  defaultTrack: true,
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/psychology/psychology-major/",
    department: "https://psyc.umd.edu/undergraduate/degree-requirements-bs-and-ba",
  },
};
