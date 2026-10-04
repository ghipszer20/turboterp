// Anti-Black Racism Minor, 2026–27 UMD Academic Catalog (African American and Africana Studies).
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/african-american-africana-studies/anti-black-racism-minor/
// (fetched 2026-09-28). No department page was provided (department page not checked). No official
// published sample plan (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const TRACK_COURSES = ["AMST310", "AAAS101", "TLPL202", "HLTH460", "PLCY288A"];

// Elective course list. Suffixed ids are the specific topic sections the catalog names in parentheses.
const ELECTIVES = [
  "AAAS100", "AAAS187", "AAAS202", "AAAS210", "AAAS211", "AAAS230", "AAAS298", "AAAS301", "AAAS310",
  "AAAS313", "AAAS320", "AAAS413", "AAAS443", "AAAS498",
  "AMST290", "AMST328E", "USLT320",
  "ANTH412", "ANTH433", "ARTH362", "CCJS370", "CMLT235", "CMLT277", "COMM360",
  "ENGL130", "ENGL234", "ENGL360", "ENGL368", "ENGL438B", "ENGL448C", "ENGL459B", "ENGL470", "ENGL471",
  "ENGL472", "ENGL479B",
  "FMSC381", "FMSC420", "HESI202", "HESI220", "HESI418D", "HIST254", "HLTH240", "HLTH460", "JOUR453",
  "KNES401", "LGBT448L", "MIEH330", "PLCY288B", "PLCY288L", "PLCY388Z", "PSYC354", "SOCY224", "SOCY424",
  "TLPL288R", "TLPL475", "TLPL476", "TLPL481", "URSP372", "USLT403",
  "WGSS370", "WGSS428J", "WGSS428L",
];

// Number in a course id, e.g. ENGL438B -> 438.
const num = (id: string): number => Number(/(\d{3})/.exec(id)![1]);
// Elective-list courses at 300+, plus the track courses of the two tracks without the 300+ footnote
// (Arts and Humanities: AMST310; Public Health: HLTH460), which are themselves 300+.
const UPPER_POOL = [...new Set([...ELECTIVES.filter((id) => num(id) >= 300), "AMST310", "HLTH460"])];

export const aaasMinorAntiBlackRacism: Program = {
  id: "aaas-minor-anti-black-racism",
  name: "Anti-Black Racism Minor",
  catalogYear: "2026-27",
  source: "UMD Academic Catalog 2026–27, Anti-Black Racism Minor (fetched 2026-09-28); department page not checked",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Department page not checked (none provided); encoded from the catalog alone.",
    "No grade minimum is stated; C- applied because sibling minors state C- (owner ruling). Not verified against a source.",
    "Tracks: the five tracks share one elective list, so a track is encoded as one course from the five track courses (AMST310, AAAS101, TLPL202, HLTH460, PLCY288A) plus 6 credits from the common elective list; the track name itself isn't recorded. The catalog says the track is chosen by the 2nd semester; not enforced.",
    "Suffix conditions: the catalog requires the specific suffixed section (e.g. PLCY288A for the Public Policy track course; ENGL448C, WGSS428J, WGSS428L, PLCY288B, PLCY288L, PLCY388Z, TLPL288R, AMST328E, ENGL438B, ENGL459B, ENGL479B, HESI418D, LGBT448L for electives). The suffixed ids are encoded as listed. AMST328E and USLT320 are alternatives (either counts).",
    "'At least one elective at 300-400 level so the minor has 9 credits at 300+' applies to the Behavioral and Social Sciences, Education and Public Policy tracks (footnote 1); the Arts and Humanities and Public Health tracks have no footnote because AMST310 and HLTH460 are themselves 300+. Encoded as an overlay needing 1 course at 300+ from the elective list plus AMST310 and HLTH460, so students in those two tracks are not wrongly failed.",
    "TLPL475 and TLPL476 are 2-credit courses; the 6-credit elective slot counts credits, so those may need a third course to reach 6.",
    "Not encoded: overall minor GPA, the faculty-mentored experiential-learning component of ABRM450. No sharing limit is stated, so overlap is unlimited.",
  ],
  requirements: [
    { kind: "course", id: "abrm330", name: "Introduction to Anti-Black Racism", options: ["ABRM330"] },
    { kind: "choose", id: "track-course", name: "Track course (one of the five tracks' courses)", count: 1, from: { courses: TRACK_COURSES } },
    { kind: "choose", id: "track-electives", name: "Track electives (6 credits)", credits: 6, from: { courses: ELECTIVES } },
    {
      kind: "choose",
      id: "upper-level",
      name: "At least one elective at 300-400 level (9 credits at 300+ in the minor)",
      overlay: true,
      count: 1,
      from: { courses: UPPER_POOL },
    },
    { kind: "course", id: "abrm450", name: "Applied Anti-Black Racism (capstone)", options: ["ABRM450"] },
  ],
};

export const aaasMinorAntiBlackRacismMeta: ProgramMeta = {
  kind: "minor",
  college: "BSOS",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/african-american-africana-studies/anti-black-racism-minor/",
  },
};
