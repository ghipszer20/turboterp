// UMD General Education and university-wide degree rules, 2026–27 catalog.
// Source: academiccatalog.umd.edu/undergraduate/general-education-requirements/
// UNVERIFIED until the owner signs off.
//
// Double-counting (catalog): Diversity courses may double-count with Distributive
// Studies; one course may not meet more than one Distributive Studies category;
// Big Question courses are two of the eight Distributive Studies courses.
// Gen Ed courses may also count toward majors (separate programs share freely).

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
    "Big Question (SCIS) is modeled as two SCIS-tagged courses anywhere; the catalog says they must be among the eight Distributive Studies courses.",
    "Pass/fail courses don't count toward Gen Ed; the audit doesn't know grading basis yet.",
    "Exemptions (FSAW/FSMA by exam, AP credit) come in through transfer/AP credit import.",
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
    // Big Question: two courses (overlay: they also count as Distributive Studies)
    { kind: "choose", id: "scis", name: "Big Question courses (2)", count: 2, overlay: true, from: { genEd: ["SCIS"] } },
    // Diversity: two DVUP, or one DVUP and one DVCC (overlay: may double-count with Distributive Studies)
    { kind: "choose", id: "diversity", name: "Diversity (2)", count: 2, overlay: true, from: { genEd: ["DVUP", "DVCC"] } },
    { kind: "choose", id: "dvup", name: "Understanding Plural Societies", count: 1, overlay: true, from: { genEd: ["DVUP"] } },
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
