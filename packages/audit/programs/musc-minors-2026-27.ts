// Music and Culture Minor and Music Performance Minor, 2026-27 UMD Academic Catalog (School of
// Music, ARHU).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/music/
// music-culture-minor/ and music-performance-minor/; department pages
// https://music.umd.edu/academic-programs/music-culture-minor and .../music-performance-minor, plus
// https://music.umd.edu/admissions/undergraduate (minor application/audition details); all fetched
// 2026-09-28 (see program-sources/music-culture-minor.md and music-performance-minor.md).
// Owner ruling: where the department page and the catalog disagree, follow the department page;
// where the department page lists fewer options, accept both lists. No published sample plans
// (constructed; see docs/project/owner-review.md). Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const CAT = "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/music/";

export const muscMinorCulture: Program = {
  id: "musc-minor-culture",
  name: "Music and Culture Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Music and Culture Minor; School of Music, " +
    "https://music.umd.edu/academic-programs/music-culture-minor (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Department-vs-catalog: the department page gives only a summary ('five academic music courses; four semesters of Asian and Caribbean ensemble participation'), no course lists or credits. Consistent with the catalog (2 + 3 = five courses, 4 ensemble semesters); the catalog's course lists are used.",
    "'Any two 2xx-level courses in Musicology and Ethnomusicology including' MUSC204/210/215/220/289I, and footnote 'In consultation with the Coordinator of Ethnomusicology, other courses may be substituted': encoded as the five listed courses; other courses may count with advisor approval (the requirement is marked advisorMayApprove).",
    "'Three 400-level courses, including at least two of the MUSC438 area studies courses': encoded as 3 courses from any MUSC 400-499 (the catalog names MUSC435, MUSC438D/E/K/M/S/X and MUSC448F as examples but not a closed list), plus an overlay requiring 2 of the MUSC438 area studies courses. The MUSC438 letters listed are the catalog's 'recent offerings'; other MUSC438 topics (offered semester to semester) may count with advisor approval (area-studies-438 is marked advisorMayApprove).",
    "'Four semesters of World Music Ensembles' (4 credits): encoded as 4 credits from MUSC129G/K/L/Q. Not encoded: ensembles must come from at least two different culture areas; 'other performance courses (including dance) may be substituted case by case' and newly approved World Music Ensembles are added over time (advisor approval; world-ensembles is marked advisorMayApprove).",
    "Not encoded: 'No course used to satisfy this minor may be used to satisfy another minor' (engine only caps sharing with named programs or all programs, and minors aren't named here). Catalog: a Music (BA/BM/BME) major may add this minor while the six-credit major overlap cap is followed (encoded as maxSharedWith: [{ credits: 6 }]).",
  ],
  requirements: [
    {
      kind: "choose",
      id: "musicology-2xx",
      advisorMayApprove: true,
      name: "Two 2xx-level Musicology and Ethnomusicology courses",
      count: 2,
      from: { courses: ["MUSC204", "MUSC210", "MUSC215", "MUSC220", "MUSC289I"] },
    },
    {
      kind: "choose",
      id: "level-400",
      name: "Three 400-level courses",
      count: 3,
      from: { departments: ["MUSC"], minNumber: 400, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "area-studies-438",
      advisorMayApprove: true,
      name: "At least two MUSC438 area studies courses (counted within the three 400-level courses)",
      count: 2,
      overlay: true,
      from: { courses: ["MUSC438", "MUSC438D", "MUSC438E", "MUSC438K", "MUSC438M", "MUSC438S", "MUSC438X"] },
    },
    {
      kind: "choose",
      id: "world-ensembles",
      advisorMayApprove: true,
      name: "Four semesters of World Music Ensembles",
      credits: 4,
      from: { courses: ["MUSC129", "MUSC129G", "MUSC129K", "MUSC129L", "MUSC129Q"] },
    },
  ],
};

export const muscMinorPerformance: Program = {
  id: "musc-minor-performance",
  name: "Music Performance Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Music Performance Minor; School of Music, " +
    "https://music.umd.edu/academic-programs/music-performance-minor and " +
    "https://music.umd.edu/admissions/undergraduate (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department-vs-catalog: the department page summary (four semesters of applied lessons, four of large ensemble, one music history, one music theory) and the admissions page (MUSP302/303/402/403 with approved large ensembles, MUSC140, one 3-credit musicology elective) agree with the catalog; no difference found.",
    "Neither source states a cap on overlap with the major or other programs; none is set. The catalog's 'overall GPA of 2.0 in the minor' is encoded as minGpa.",
    "'Four semesters of ensemble' (4 credits): MUSC129, MUSC229, MUSC329. The admissions page requires them to be 'approved large ensembles' taken concurrently with the lessons; which ensembles are approved is not encoded (manual).",
    "'Any 1xx- or 2xx-level courses in Musicology and Ethnomusicology including' MUSC130/204/205/210/215/220/289I: encoded as the seven listed courses; other 1xx/2xx musicology courses may count with advisor approval (the requirement is marked advisorMayApprove).",
    "Not encoded (per owner ruling): the video audition (spring application cycle) and School of Music internal application required to enter the minor; the department also notes music minors are not eligible for music scholarships.",
  ],
  requirements: [
    {
      kind: "choose",
      id: "lessons",
      name: "Four semesters of minor-level applied lessons (MUSP302, MUSP303, MUSP402, MUSP403)",
      count: 4,
      from: { courses: ["MUSP302", "MUSP303", "MUSP402", "MUSP403"] },
    },
    {
      kind: "choose",
      id: "ensemble",
      name: "Four semesters of approved ensemble (MUSC129, MUSC229, MUSC329)",
      credits: 4,
      from: { courses: ["MUSC129", "MUSC229", "MUSC329"] },
    },
    { kind: "course", id: "fundamentals", name: "MUSC140 Music Fundamentals I", options: ["MUSC140"] },
    {
      kind: "choose",
      id: "musicology",
      advisorMayApprove: true,
      name: "One 1xx-2xx Musicology and Ethnomusicology course",
      count: 1,
      from: { courses: ["MUSC130", "MUSC204", "MUSC205", "MUSC210", "MUSC215", "MUSC220", "MUSC289I"] },
    },
  ],
};

export const muscMinorCultureMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  sources: { catalog: `${CAT}music-culture-minor/`, department: "https://music.umd.edu/academic-programs/music-culture-minor" },
};

export const muscMinorPerformanceMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  sources: { catalog: `${CAT}music-performance-minor/`, department: "https://music.umd.edu/academic-programs/music-performance-minor" },
};
