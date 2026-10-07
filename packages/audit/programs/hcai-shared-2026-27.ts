// Shared requirement building blocks for the Human-Centered Artificial Intelligence Major's seven
// specializations (Arts; Design and User Experience; Ethics; Language and Cognition; Logic,
// Epistemology, and Machine Learning; Law, Policy, and Governance; Society, Culture, and
// Technology), 2026-27 UMD Academic Catalog. Not a program file itself (no `*Meta` export, so the
// registry generator ignores it); imported by hcai-major-*-2026-27.ts, which share the 9 Core
// Courses and the Capstone (identical across all seven specializations per the catalog) and define
// their own specialization requirement(s).
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/philosophy/human-centered-artificial-intelligence-major/
// (fetched 2026-09-28); see program-sources/human-centered-artificial-intelligence-major.md. The
// major's official Four Year Academic Plan PDF (same fetch) came back as garbled binary/glyph text,
// not a readable plan -- there is no department-page plan text to reconcile against the catalog for
// this major. Flagged in docs/project/owner-review.md.

import type { Requirement } from "../src/audit.ts";

/** 6 Technical Core Courses (18 credits), all mandatory. */
export const hcaiTechnicalCore: Requirement[] = [
  { kind: "course", id: "hcai100", name: "AI and the Human Experience (HCAI100)", options: ["HCAI100"] },
  { kind: "course", id: "hcai120", name: "Programming for AI 1 (HCAI120)", options: ["HCAI120"] },
  { kind: "course", id: "hcai121", name: "Programming for AI 2 (HCAI121)", options: ["HCAI121"] },
  { kind: "course", id: "hcai200", name: "Formal Methods in AI (HCAI200)", options: ["HCAI200"] },
  { kind: "course", id: "hcai300", name: "Artificial Intelligence (HCAI300)", options: ["HCAI300"] },
  { kind: "course", id: "hcai301", name: "Machine Learning (HCAI301)", options: ["HCAI301"] },
];

/** 3 Ethical and Social Core Courses (9 credits), all mandatory. */
export const hcaiEthicalSocialCore: Requirement[] = [
  { kind: "course", id: "wgss115", name: "Gender, Race and Computing (WGSS115)", options: ["WGSS115"] },
  { kind: "course", id: "inst204", name: "Designing Fair Systems (INST204)", options: ["INST204"] },
  { kind: "course", id: "phil211", name: "AI & Ethics (PHIL211)", options: ["PHIL211"] },
];

/**
 * Capstone Seminar (3 credits), HCAI490. The catalog says "Students may replace this course with
 * an internship" but names no internship course/credit shape for that substitution; not encoded
 * (no course id to require). Flagged in docs/project/owner-review.md.
 */
export const hcaiCapstone: Requirement = {
  kind: "course",
  id: "hcai490", advisorMayApprove: true,
  name: "Human-Centered Artificial Intelligence Capstone (HCAI490)",
  options: ["HCAI490"],
};

/** reviewNotes common to all seven specializations (catalog-wide rules, engine gaps). Each track
 * file appends its own specialization-specific notes to this array. */
export const hcaiCommonReviewNotes: string[] = [
  "Posted advisor-approved substitution (owner, 2026-10-07: posted alternatives are encoded): 'Students may replace this course [the capstone seminar] with an internship.' No internship course is named, so hcai490 carries advisorMayApprove.",
  "The official Four Year Academic Plan PDF for this major (program-sources/human-centered-" +
    "artificial-intelligence-major.md, same source fetch as the catalog text) decoded to garbled " +
    "binary/glyph characters, not readable plan text -- there is no department-page plan to check " +
    "the catalog against, and no plan text to build a sample plan from. The sample plan below is " +
    "constructed from the catalog alone (`official: false`). Flagged in docs/project/owner-review.md.",
  "Capstone: 'Students may replace this course with an internship' (catalog) names no internship " +
    "course id or credit shape to substitute, so only the HCAI490 capstone itself is encoded; the " +
    "internship alternative is not modeled.",
  "PHIL438 (Topics in Value Theory) and PHPE308 (Special Topics in Philosophy, Politics, and " +
    "Economics) carry a catalog footnote ('with approved content') on at least one specialization's " +
    "list; the engine has no concept of section-level content approval, so both count as ordinary " +
    "electives wherever the catalog lists them.",
  "This is a new major with no track named as a default in the catalog; Arts (the first " +
    "specialization the catalog lists) is set as `defaultTrack` arbitrarily, for the registry's " +
    "undeclared-major ordering only -- it carries no requirement-shape implication.",
  "Not encoded (engine gaps, matches other ARHU majors' precedent): GPA-in-the-major requirements, " +
    "residency rules, and the university's total-credit graduation minimum. The audit engine checks " +
    "per-requirement course assignment and per-course minGrade, not GPA, residency, or credit totals.",
];
