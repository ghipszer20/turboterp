// Geographical Sciences Major, Geospatial Data Science Specialization, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/geographical-sciences/geographical-sciences-major/;
// Feller Center (College of Behavioral and Social Sciences) official "GEOG Geospatial Data Science
// Major Checklist" (department checklist), https://fellercenter.umd.edu (Internet Archive copy,
// fetched 2026-09-28), which includes the department's own four-year graduation-plan grid.
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page (the college checklist counts as a department source); each such
// difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const geogMajorGds: Program = {
  id: "geog-major-gds",
  name: "Geographical Sciences Major (Geospatial Data Science)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Geographical Sciences Major, Geospatial Data Science Specialization; " +
    "Feller Center, GEOG Geospatial Data Science Major Checklist (department checklist), " +
    "https://fellercenter.umd.edu/sites/fellercenter.umd.edu/files/Major%20Cards/GEOG%20Geospatial%20Data%20Science%20Major%20Checklist%20042924%20Writable.pdf " +
    "(Internet Archive copy, fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Benchmark 1 (Academic Writing, two Gen Ed courses, MATH120/140/136, GEOG201&211 or GEOG202, and an additional GEOG course of choice, all within two semesters of entering the major) is a progress-to-continue-in-the-major gate, not a separate graduation requirement: every GEOG/math course it names is already required below (the checklist's own 'Required Course 1' and 'Required Course 2' rows both list 'GEOG201&211 or GEOG202', meaning a student takes one for the benchmark and the other as Required Course 2, so both end up required). The timing rule is an admission-progress gate the audit doesn't model (matches the General GEOG track and the GVPT majors' benchmark precedent).",
    "GEOG Human Gateway Requirement and GEOG Physical Gateway Requirement are each a blank 'GEOG _________' line with no enumerated course list. Encoded as `choose` requirements (count 1) filtered to department GEOG, level 300-400, per the no-named-list ruling (same treatment as the General GEOG track's gateway requirements).",
    "'Additional GEOG Human or Physical (non-technical)' ('GEOG Additional Course 1 UL') narrows the catalog's own parallel line ('Select three credits of upper-level geography electives') to non-technical human-or-physical courses specifically -- a department-vs-catalog difference where the department (checklist) wins, per the owner ruling. The filter mechanism can't restrict to 'non-technical human-or-physical' specifically (no such list is given), so it's encoded the same way as the gateway requirements: `choose` count 1, department GEOG, level 300-400. Flagged in docs/project/owner-review.md for owner confirmation that picks are non-technical.",
    "GIS Technical Requirement: the checklist requires GEOG272, GEOG276, and GEOG373 by name (not a choice, unlike the General track's technique gateway), plus two 'GEOG 400 Level Technical Course' blanks with no list on the checklist itself. The catalog's parallel 'Six credits from the following list' (GEOG416, GEOG470, GEOG472, GEOG473, GEOG475, GEOG476, GEOG477) is not contradicted by the checklist (the checklist is simply less detailed, leaving the two slots blank) so it's used to fill those two slots: encoded as `choose` count 2 from that literal 7-course list. GEOG476 and GEOG477 have no titles in the fetched catalog text (likely dropped in table conversion) but are used as-is since the source names them explicitly.",
    "Department-vs-catalog difference: the checklist's supporting-sequence row lists 'MATH120/140/136' for the first supporting course, while the catalog's prose names only MATH120 ('MATH120 | Elementary Calculus I | 3'). Per the department-wins ruling, encoded as a `course` requirement with all three options (same treatment as the General track).",
    "Not encoded (approved elective with no enumerable list; flagged in docs/project/owner-review.md): the remaining 4 Supporting Courses (12 credits), which the checklist says to refer to 'http://www.geog.umd.edu/content/gis' for, with no course list in the fetched source.",
    "Not encoded (engine gap): Program GPA 2.0 encoded as minGpa (major + supporting sequence together). the checklist's residency rules (15 of the final 30 credits at the 300-400 level, 12 upper-level major credits at UMD, 30 credits at UMD, cumulative 2.0 UMD GPA); and the 120-credit graduation minimum.",
  ],
  requirements: [
    { kind: "course", id: "geog201", name: "Geography of Environmental Systems", options: ["GEOG201"] },
    { kind: "course", id: "geog211", name: "Geography of Environmental Systems Laboratory", options: ["GEOG211"] },
    { kind: "course", id: "geog202", name: "Introduction to Human Geography", options: ["GEOG202"] },
    { kind: "course", id: "geog212", name: "Career Planning for Geographical Sciences, GIS, and ENSP Majors", options: ["GEOG212"] },
    {
      kind: "choose",
      id: "physical-gateway",
      name: "Upper-Level Physical Geography Gateway Course",
      count: 1,
      from: { departments: ["GEOG"], minNumber: 300, maxNumber: 499, exclude: ["GEOG201", "GEOG211", "GEOG202", "GEOG212", "GEOG306", "GEOG272", "GEOG276", "GEOG373"] },
    },
    {
      kind: "choose",
      id: "human-gateway",
      name: "Upper-Level Human Geography Gateway Course",
      count: 1,
      from: { departments: ["GEOG"], minNumber: 300, maxNumber: 499, exclude: ["GEOG201", "GEOG211", "GEOG202", "GEOG212", "GEOG306", "GEOG272", "GEOG276", "GEOG373"] },
    },
    {
      kind: "choose",
      id: "additional-elective",
      name: "Additional GEOG Human or Physical Upper-Level Course",
      count: 1,
      from: { departments: ["GEOG"], minNumber: 300, maxNumber: 499, exclude: ["GEOG201", "GEOG211", "GEOG202", "GEOG212", "GEOG306", "GEOG272", "GEOG276", "GEOG373"] },
    },
    { kind: "course", id: "geog306", name: "Introduction to Quantitative Methods for the Geographical Environmental Sciences", options: ["GEOG306"] },
    { kind: "course", id: "geog272", name: "Introduction to Earth Observation Science", options: ["GEOG272"] },
    { kind: "course", id: "geog276", name: "Principles of Python Programming and Geocomputing", options: ["GEOG276"] },
    { kind: "course", id: "geog373", name: "Geographic Information Systems", options: ["GEOG373"] },
    {
      kind: "choose",
      id: "gds-400-technical",
      name: "GEOG 400-Level Technical Courses (6 credits from GEOG416, GEOG470, GEOG472, GEOG473, GEOG475, GEOG476, GEOG477)",
      count: 2,
      from: { courses: ["GEOG416", "GEOG470", "GEOG472", "GEOG473", "GEOG475", "GEOG476", "GEOG477"] },
    },
    {
      kind: "course",
      id: "math-supporting",
      name: "Math Supporting Course (MATH120, MATH140, or MATH136)",
      options: ["MATH120", "MATH140", "MATH136"],
    },
  ],
};

export const geogMajorGdsMeta: ProgramMeta = {
  kind: "major",
  college: "BSOS",
  short: "Geographical Sciences (GDS)",
  major: "geog",
  track: "Geospatial Data Science",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/geographical-sciences/geographical-sciences-major/",
    department: "https://fellercenter.umd.edu/sites/fellercenter.umd.edu/files/Major%20Cards/GEOG%20Geospatial%20Data%20Science%20Major%20Checklist%20042924%20Writable.pdf",
  },
};
