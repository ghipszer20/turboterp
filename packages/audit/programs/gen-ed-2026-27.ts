// UMD General Education and university-wide degree rules, 2026–27 catalog.
// Source: academiccatalog.umd.edu/undergraduate/general-education-requirements/
// UNVERIFIED until the owner signs off.
//
// Rules and quotes: program-sources/gen-ed.md (Summary Chart and Distributive Studies page).
// Double-counting: Diversity courses may double-count with Distributive Studies; one course
// may meet only one Distributive Studies category; Big Question courses must be among the
// eight Distributive Studies courses; a course designated both FSMA and FSAR satisfies both;
// at most 6 of the 8 Distributive Studies courses may be AP or IB credit, and AP (read as AP
// or IB) credit can't satisfy Big Question. Gen Ed courses may also count toward majors
// (separate programs share freely).

import type { Program } from "../src/audit.ts";

const one = (id: string, name: string, codes: string[]) =>
  ({ kind: "choose", id, name, count: 1, from: { genEd: codes } }) as const;

export const genEd: Program = {
  id: "gen-ed",
  name: "General Education",
  layer: "gen-ed",
  catalogYear: "2026-27",
  source: "UMD Academic Catalog 2026–27, General Education Requirements",
  verified: false,
  reviewNotes: [
    "Fundamental Studies must be attempted by 30 credits and completed by 60; the timing rule isn't checked yet.",
    "CMNS majors: FSMA and FSAR are satisfied by the first major's math requirement (CS tracking sheet). Not modeled; the audit uses course Gen Ed tags.",
    "DSSP: one of the two must be outside the student's major requirements. Not enforced yet (needs cross-program check).",
    "Pass/fail courses don't count toward Gen Ed; the audit doesn't know grading basis yet.",
    "Exemptions (FSAW/FSMA by exam, AP credit) come in through transfer/AP credit import.",
  ],
  // AP/IB limits (program-sources/gen-ed.md, "AP / IB limits"): 6 of the 8 DS courses; none for Big Question.
  examLimits: [
    { requirements: ["dshs", "dshu", "dsnl", "natsci", "dssp"], courses: 6 },
    { requirements: ["scis"], courses: 0 },
  ],
  requirements: [
    // Fundamental Studies
    { ...one("fsaw", "Academic Writing", ["FSAW"]), minGrade: "C-" },
    one("fspw", "Professional Writing", ["FSPW"]),
    one("fsoc", "Oral Communication", ["FSOC"]),
    one("fsma", "Mathematics", ["FSMA"]),
    // Overlay: a course designated both FSMA and FSAR satisfies both (program-sources/gen-ed.md, Summary Chart).
    { ...one("fsar", "Analytic Reasoning", ["FSAR"]), overlay: true },
    // Distributive Studies (one course may meet only one category)
    { kind: "choose", id: "dshs", name: "History and Social Sciences (2)", count: 2, from: { genEd: ["DSHS"] } },
    { kind: "choose", id: "dshu", name: "Humanities (2)", count: 2, from: { genEd: ["DSHU"] } },
    one("dsnl", "Natural Sciences with lab", ["DSNL"]),
    one("natsci", "Natural Sciences (or a second lab science)", ["DSNS", "DSNL"]),
    { kind: "choose", id: "dssp", name: "Scholarship in Practice (2)", count: 2, from: { genEd: ["DSSP"] } },
    // Big Question: two courses that must also fill a Distributive Studies category (program-sources/gen-ed.md,
    // "Big Question (SCIS) is within the 8 DS courses"), so an overlay counted only while within one.
    { kind: "choose", id: "scis", name: "Big Question courses (2)", count: 2, overlay: true, within: ["dshs", "dshu", "dsnl", "natsci", "dssp"], from: { genEd: ["SCIS"] } },
    // UMD: "2 Understanding Plural Societies courses or 1 Understanding Plural Societies course AND 1
    // Cultural Competence course are required. Diversity courses may also fulfill a Distributive
    // Studies category." (overlay: may double-count with Distributive Studies)
    {
      kind: "sets", id: "diversity", name: "Diversity: 2 Understanding Plural Societies, or 1 and 1 Cultural Competence", overlay: true,
      options: [[{ count: 2, from: { genEd: ["DVUP"] } }], [{ count: 1, from: { genEd: ["DVUP"] } }, { count: 1, from: { genEd: ["DVCC"] } }]],
    },
  ],
};

export const university: Program = {
  id: "university",
  name: "University requirements",
  layer: "university",
  catalogYear: "2026-27",
  source: "UMD Academic Catalog 2026–27",
  verified: false,
  reviewNotes: [
    "Only the 120-credit minimum is modeled. Residency (credits taken at UMD) and any upper-level credit minimum still need to be confirmed and added.",
  ],
  requirements: [{ kind: "choose", id: "credits", name: "120 credits", credits: 120, overlay: true, from: { anyCourse: true } }],
};
