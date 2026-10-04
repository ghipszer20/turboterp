// Geographical Sciences Major, Computational Earth and Ocean Sciences (CEOS) Specialization,
// 2026–27 UMD Academic Catalog.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/geographical-sciences/geographical-sciences-major/
// (fetched 2026-09-28). The Feller Center's "GEOG CEOS Major Checklist" (department checklist)
// failed to convert from PDF in the fetched source file, so the catalog's own "Computational Earth
// Observation Science Specialization" requirements table is the only available source for this track.
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree, follow
// the department page; no department checklist was available to compare against for this track.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const geogMajorCeos: Program = {
  id: "geog-major-ceos",
  name: "Geographical Sciences Major (Computational Earth and Ocean Sciences)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Geographical Sciences Major, Computational Earth Observation Science " +
    "Specialization, https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/geographical-sciences/geographical-sciences-major/ " +
    "(fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "No department checklist was available for this track: the Feller Center's 'GEOG CEOS Major Checklist' PDF failed to convert in the fetched source file ('Not converted (fetch failed: Invalid Root reference.)'). All requirements below come from the catalog's own Computational Earth Observation Science Specialization table; flagged in docs/project/owner-review.md so the owner can source the checklist separately.",
    "Upper-level physical geography course and upper-level human geography course are each fully enumerated by the catalog (physical: GEOG301, GEOG340, GEOG415, GEOG418, GEOG441, GEOG442; human: GEOG330, GEOG332, GEOG333, GEOG335, GEOG413, GEOG431, GEOG432) and encoded as `course` requirements with those literal option lists. GEOG335 and GEOG413 have no titles in the fetched catalog text (likely dropped in table conversion) but are used as-is since the source names them explicitly.",
    "'Select three credits of upper-level geography electives' names no specific list, so it's encoded as a `choose` requirement (count 1) filtered to department GEOG, level 300-400, excluding the track's other named required courses -- per the no-named-list ruling.",
    "'Nine credits from the following list' (GEOG371, GEOG417, GEOG461, GEOG471, GEOG472) is fully enumerated and encoded as `choose` count 3 from those five literal options.",
    "Supporting course MATH120 is encoded from the catalog alone (no department checklist to broaden it, unlike the General and Geospatial Data Science tracks' checklists, which list MATH120/140/136). Flagged in docs/project/owner-review.md in case the missing CEOS checklist would have broadened this the same way.",
    "Not encoded (approved elective with no enumerable list; flagged in docs/project/owner-review.md): the remaining 4 Supporting Courses (12 credits), 'approved by GEOG advisor' with no course list in the fetched source.",
    "Not encoded (engine gap): Program GPA 2.0 encoded as minGpa (major + supporting sequence together). residency rules; and the 120-credit graduation minimum. The audit checks individual requirements, not GPA, residency or overall credit totals.",
  ],
  requirements: [
    { kind: "course", id: "geog201", name: "Geography of Environmental Systems", options: ["GEOG201"] },
    { kind: "course", id: "geog211", name: "Geography of Environmental Systems Laboratory", options: ["GEOG211"] },
    { kind: "course", id: "geog202", name: "Introduction to Human Geography", options: ["GEOG202"] },
    { kind: "course", id: "geog212", name: "Career Planning for Geographical Sciences, GIS, and ENSP Majors", options: ["GEOG212"] },
    {
      kind: "course",
      id: "physical-choice",
      name: "Upper-Level Physical Geography Course",
      options: ["GEOG301", "GEOG340", "GEOG415", "GEOG418", "GEOG441", "GEOG442"],
    },
    {
      kind: "course",
      id: "human-choice",
      name: "Upper-Level Human Geography Course",
      options: ["GEOG330", "GEOG332", "GEOG333", "GEOG335", "GEOG413", "GEOG431", "GEOG432"],
    },
    {
      kind: "choose",
      id: "geog-elective",
      name: "Upper-Level Geography Elective (3 credits)",
      count: 1,
      from: { departments: ["GEOG"], minNumber: 300, maxNumber: 499, exclude: ["GEOG201", "GEOG211", "GEOG202", "GEOG212", "GEOG306", "GEOG272", "GEOG276"] },
    },
    { kind: "course", id: "geog306", name: "Introduction to Quantitative Methods for the Geographical Environmental Sciences", options: ["GEOG306"] },
    { kind: "course", id: "geog272", name: "Introduction to Earth Observation Science", options: ["GEOG272"] },
    { kind: "course", id: "geog276", name: "Principles of Python Programming and Geocomputing", options: ["GEOG276"] },
    {
      kind: "choose",
      id: "ceos-technical",
      name: "CEOS Technical Courses (9 credits from GEOG371, GEOG417, GEOG461, GEOG471, GEOG472)",
      count: 3,
      from: { courses: ["GEOG371", "GEOG417", "GEOG461", "GEOG471", "GEOG472"] },
    },
    { kind: "course", id: "math120", name: "Elementary Calculus I", options: ["MATH120"] },
  ],
};

export const geogMajorCeosMeta: ProgramMeta = {
  kind: "major",
  college: "BSOS",
  short: "Geographical Sciences (CEOS)",
  major: "geog",
  track: "Computational Earth and Ocean Sciences",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/geographical-sciences/geographical-sciences-major/",
  },
};
