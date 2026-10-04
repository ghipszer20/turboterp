// Advanced Cybersecurity Experience for Students (ACES) Minor, 2026–27 UMD Academic Catalog
// (Undergraduate Studies). The catalog has three pathways with different foundation and elective
// requirements; each is encoded as its own program.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/undergraduate-studies/
// advanced-cybersecurity-experience-students-minor/ and https://aces.umd.edu/ (both fetched
// 2026-09-28; the department page is a homepage with no requirements).
// No official published sample plans (built from the requirements; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";

const SOURCE_ACES =
  "UMD Academic Catalog 2026–27, Advanced Cybersecurity Experience for Students Minor; https://aces.umd.edu/ (fetched 2026-09-28)";

const SUBSTITUTES = [
  "BUDT758D", "CCJS318I", "CMSC412", "CMSC414", "CMSC417", "CMSC456", "ENEE447", "ENEE456",
  "ENEE457", "ENEE459B", "ENME442", "INST464", "INST467", "PLCY388C",
];

const colloquium: Requirement = { kind: "course", id: "hacs318", name: "Cybersecurity Professionals Colloquium Series", options: ["HACS318"] };
const experiential: Requirement = {
  kind: "course",
  id: "experiential",
  name: "Experiential Learning course",
  options: ["HACS479", "HACS498", "HACS497"],
};
const electives = (credits: number): Requirement => ({
  kind: "choose",
  id: "electives",
  name: "HACS408 seminars and/or substitution courses",
  credits,
  from: { courses: ["HACS408", ...SUBSTITUTES] },
});

const commonNotes = [
  "Department page not checked for requirements: https://aces.umd.edu/ is a homepage with no requirement list, so this is encoded from the catalog alone.",
  "The catalog has three pathways (CS/CE; ACES Living-Learning; students outside CS, CE and the LLP); encoded as three programs since foundation and elective credits differ. The student picks the pathway (the audit can't infer which applies).",
  "'Students may substitute one or two electives' from the listed courses: the cap of two substitutions is not enforced (no rule for a sub-cap within a choose); the elective credits are drawn from HACS408 plus the whole substitution list. Manual check. HACS408 is a seminar taken repeatedly under different topics; the audit counts the course code once.",
  "'A maximum of 2 courses may be used to satisfy the requirements of both a major and a minor' -> maxSharedWith: [{ courses: 2 }].",
  "Admission rules are not encoded: 30 university credits, 3.2 cumulative GPA, 3 semesters remaining at application, Honors College membership, and maintaining a 3.2 GPA.",
  "Experiential Learning is one 3-credit course chosen from HACS479, HACS498, HACS497 (the catalog lists them without 'or' under a single '3 credits' row).",
];

export const acesMinorCs: Program = {
  id: "hacs-minor-aces-cs",
  name: "Advanced Cybersecurity Experience for Students Minor (Computer Science/Engineering Pathway)",
  catalogYear: "2026-27",
  source: SOURCE_ACES,
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    ...commonNotes,
    "Pathway 1 is for students who have taken CMSC216; that eligibility gate is not encoded.",
  ],
  requirements: [
    { kind: "course", id: "hacs202", name: "Group Project in Cybersecurity", options: ["HACS202"] },
    colloquium,
    electives(9),
    experiential,
  ],
};

export const acesMinorLlp: Program = {
  id: "hacs-minor-aces-llp",
  name: "Advanced Cybersecurity Experience for Students Minor (ACES Living-Learning Pathway)",
  catalogYear: "2026-27",
  source: SOURCE_ACES,
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    ...commonNotes,
    "Pathway 2 is for students who have taken HACS100, HACS101 and HACS200; that prerequisite gate is not encoded (those courses are not part of the 16 minor credits).",
  ],
  requirements: [colloquium, electives(12), experiential],
};

export const acesMinorGeneral: Program = {
  id: "hacs-minor-aces-general",
  name: "Advanced Cybersecurity Experience for Students Minor (Non-CS/CE/LLP Pathway)",
  catalogYear: "2026-27",
  source: SOURCE_ACES,
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    ...commonNotes,
    "Pathway 3 (17 credits) is for students not in Computer Science, Computer Engineering or the ACES Living-Learning Program; that eligibility gate is not encoded.",
  ],
  requirements: [
    { kind: "course", id: "hacs201", name: "Introduction to UNIX", options: ["HACS201"] },
    { kind: "course", id: "hacs202", name: "Group Project in Cybersecurity", options: ["HACS202"] },
    colloquium,
    electives(9),
    experiential,
  ],
};

const ACES_CATALOG =
  "https://academiccatalog.umd.edu/undergraduate/colleges-schools/undergraduate-studies/advanced-cybersecurity-experience-students-minor/";

export const acesMinorCsMeta: ProgramMeta = { kind: "minor", college: "UGST", short: "ACES (CS/CE)", sources: { catalog: ACES_CATALOG, department: "https://aces.umd.edu/" } };

export const acesMinorLlpMeta: ProgramMeta = { kind: "minor", college: "UGST", short: "ACES (Living-Learning)", sources: { catalog: ACES_CATALOG, department: "https://aces.umd.edu/" } };

export const acesMinorGeneralMeta: ProgramMeta = { kind: "minor", college: "UGST", short: "ACES (Other Majors)", sources: { catalog: ACES_CATALOG, department: "https://aces.umd.edu/" } };
