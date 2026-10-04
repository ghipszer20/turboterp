// Communication Major, Public Relations Track, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/communication/communication-major/;
// the College's official Public Relations Four Year Academic Plan (department source),
// https://drive.google.com/uc?export=download&id=1p7VsEESCucKzHn92KjkI1CwjMIVUpyz3 (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page/plan and the catalog disagree,
// follow the department source. On the OCR re-check no disagreement was found -- see reviewNotes.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  commCollegeRequirements,
  commResearchMethods,
  commLeadershipSocialChange,
  commDiversityInclusion,
} from "./comm-shared-2026-27.ts";

export const commMajorPublicRelations: Program = {
  id: "comm-major-public-relations",
  name: "Communication Major (Public Relations)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Communication Major (Public Relations Track); " +
    "College of Arts and Humanities, official Public Relations Four Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1p7VsEESCucKzHn92KjkI1CwjMIVUpyz3 (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "The Public Relations plan PDF's OCR text is also illegible (shredded table; no course-by-term grid recoverable, only checklist fragments that match the catalog), so the sample plan stays CONSTRUCTED from the catalog's requirement structure (official: false). No department-vs-catalog disagreement could be found; flagged in docs/project/owner-review.md.",
    "Communication Theory & Principles: COMM201 is fixed; the student then picks one of COMM301, COMM302, COMM303.",
    "Applied: unlike the other four tracks (each a choose-one from a short list), Public Relations' own table names two specific required courses instead -- COMM331 and COMM386 -- with no 'select' language; encoded as two `course` requirements.",
    "COMM386 (Experiential Learning) is listed here as '3-6' credits (variable); encoded as a single `course` requirement (the engine has no variable-credit course type) -- matches the catalog's own 'Total Credits: 36-39' range for this track (36 assuming COMM386 = 3 credits).",
    "Specialization Electives (COMM351, COMM353, COMM483, COMM476) has no 'select N of the following' language, unlike every other track's specialization-electives block -- read literally as four required courses (12 credits), not a choose.",
    "The Communication & Society Leadership & Social Change list (COMM420, COMM421, COMM436, COMM455) includes numbers the source table gives no course title for -- kept literally since they're named in the source (never invented). See comm-shared-2026-27.ts.",
    "Not encoded (engine gap, matches other ARHU majors' precedent): the major's 46-credit and specialization's 36-39-credit totals (and COMM386's 3-6 variable credit range); residency rules and the 120-credit graduation minimum; GPA minimums.",
  ],
  requirements: [
    ...commCollegeRequirements,
    { kind: "course", id: "theory-comm201", name: "Communication Theory & Principles: Introduction to Public Relations (COMM201)", options: ["COMM201"] },
    {
      kind: "choose",
      id: "theory-principles-choice",
      name: "Communication Theory & Principles: one of the following",
      count: 1,
      from: { courses: ["COMM301", "COMM302", "COMM303"] },
    },
    ...commResearchMethods,
    commLeadershipSocialChange,
    commDiversityInclusion,
    { kind: "course", id: "applied-comm331", name: "Applied: News Writing and Reporting for Public Relations (COMM331)", options: ["COMM331"] },
    { kind: "course", id: "applied-comm386", name: "Applied: Experiential Learning (COMM386)", options: ["COMM386"] },
    { kind: "course", id: "pr-comm351", name: "Specialization Elective: Public Relations Techniques (COMM351)", options: ["COMM351"] },
    { kind: "course", id: "pr-comm353", name: "Specialization Elective: New Media Writing for Public Relations (COMM353)", options: ["COMM353"] },
    { kind: "course", id: "pr-comm483", name: "Specialization Elective: Senior Seminar in Public Relations (COMM483)", options: ["COMM483"] },
    { kind: "course", id: "pr-comm476", name: "Specialization Elective: Language, Communication, and Action (COMM476)", options: ["COMM476"] },
  ],
};

export const commMajorPublicRelationsMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Communication (Public Relations)",
  major: "comm",
  track: "Public Relations",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/communication/communication-major/",
    department: "https://drive.google.com/uc?export=download&id=1p7VsEESCucKzHn92KjkI1CwjMIVUpyz3",
  },
};
