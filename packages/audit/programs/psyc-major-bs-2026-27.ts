// Psychology Major, Bachelor of Science Track, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/psychology/psychology-major/;
// Department of Psychology, "Degree Requirements (BS and BA)", https://psyc.umd.edu/undergraduate/degree-requirements-bs-and-ba;
// Department of Psychology, "PSYC Courses & PSYC Syllabi", https://psyc.umd.edu/undergraduate/psyc-courses-psyc-syllabi (fetched 2026-09-28);
// Feller Center (BSOS), "Psychology Major Checklist" (Internet Archive copy, effective Spring 2022,
// last updated 4/23/24) (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree, follow
// the department page. No disagreement specific to the B.S. option was found beyond the shared
// math-gateway MATH136 note (see psyc-major-ba-2026-27.ts).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const psycMajorBs: Program = {
  id: "psyc-major-bs",
  name: "Psychology Major (Bachelor of Science)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Psychology Major; " +
    "Department of Psychology, Degree Requirements (BS and BA), https://psyc.umd.edu/undergraduate/degree-requirements-bs-and-ba; " +
    "Department of Psychology, PSYC Courses & PSYC Syllabi, https://psyc.umd.edu/undergraduate/psyc-courses-psyc-syllabi (fetched 2026-09-28); " +
    "Feller Center, Psychology Major Checklist (Internet Archive, effective Spring 2022, updated 4/23/24) (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "All of the B.A. requirements below also apply to the B.S. (both sources: 'Students who wish to pursue the Bachelor of Science degree (B.S.) must complete all of the BA requirements ...'); see psyc-major-ba-2026-27.ts's reviewNotes for the PSYC100/B- override, the MATH136 exclusion, the per-theme overlay encoding (psyc-theme-1/2/3, from the department's PSYC Courses & PSYC Syllabi page), the psyc-total-credits overlay, the 400-level-lab approximation, and the admission-gate/engine-gap notes -- all identical here and not repeated.",
    "NOT encoded: the B.S.'s Additional Math and Science Requirement (5 courses/16 credits total in math and science, including the shared MATH120-or-140 and BSCI170 gateway courses, plus 3 more courses/10 credits of which at least 3 total are 'advanced' and at least 1 has a lab, with a 2.0 average across the 17-credit supporting sequence). Both sources point to a department-hosted approved list (psyc.umd.edu/undergraduate/degree-requirements) that wasn't part of the fetched source; the newly-fetched 'PSYC Courses & PSYC Syllabi' page (checked for this update) also has no such list -- it only enumerates PSYC courses by theme, not the approved math/science courses. The checklist's own B.S. section lists only placeholder rows ('BS Advanced Course 1/2/3'), naming no actual course. Per the builder brief, this isn't guessed from an unlisted department (could be MATH, BSCI, CHEM, PHYS, STAT or others) -- flagged in docs/project/owner-review.md instead. The B.S. Program below therefore encodes the identical checkable requirements as the B.A. track; the un-encoded math/science bucket is the only real difference between the two degrees.",
    "'PSYC courses counting towards the B.S. requirements will NOT count towards the thematic or 400-level requirements' and 'BS PSYC courses cannot count toward the 35 credits/11 course requirement' (both sources) can't be enforced either, since the B.S.-specific course pool itself isn't encoded (see above) -- there's nothing to wall off.",
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
          "PSYC202", "PSYC206", "PSYC304", "PSYC302", "PSYC307", "PSYC310", "PSYC341",
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

export const psycMajorBsMeta: ProgramMeta = {
  kind: "major",
  college: "BSOS",
  short: "Psychology (B.S.)",
  major: "psyc",
  track: "B.S.",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/psychology/psychology-major/",
    department: "https://psyc.umd.edu/undergraduate/degree-requirements-bs-and-ba",
  },
};
