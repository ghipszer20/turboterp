// Communication Major, Health and Science Communication Track, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/communication/communication-major/;
// the College's official Health and Science Communication Four Year Academic Plan (department source),
// https://drive.google.com/uc?export=download&id=1ETspCX6Xy8feCY6kQlAhVTYc_XhYKWmS (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page/plan and the catalog disagree,
// follow the department source. On the OCR re-check no disagreement was found -- see reviewNotes.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  commCollegeRequirements,
  commResearchMethods,
  commLeadershipSocialChange,
  commDiversityInclusion,
  commAppliedShared,
} from "./comm-shared-2026-27.ts";

export const commMajorHealthScienceCommunication: Program = {
  id: "comm-major-health-science-communication",
  name: "Communication Major (Health and Science Communication)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Communication Major (Health and Science Communication Track); " +
    "College of Arts and Humanities, official Health and Science Communication Four Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1ETspCX6Xy8feCY6kQlAhVTYc_XhYKWmS (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "The Health and Science Communication plan PDF was re-read from OCR text: its slot types are legible (COMM107/200/230, COMM130, COMM250, COMM302, COMM304, COMM305/306/307, COMM201/301/303, Diversity & Inclusion, Leadership & Social Change, Applied, four Specialization Electives) and match this encoding; no department-vs-catalog disagreement found. The sample plan is official but its Fall/Spring placement is a best-effort reading of column-interleaved OCR; flagged in docs/project/owner-review.md.",
    "Communication Theory & Principles: COMM302 is fixed; the student then picks one of COMM201, COMM301, COMM303.",
    "Specialization Electives ('Select four of the following': COMM390, COMM419, COMM422, COMM424, COMM426, COMM427, COMM435, COMM459) is encoded as a choose(count 4) over exactly that named list -- the source's own footnote ('the same course cannot be used to fulfill more than one requirement') matches the engine's default behavior (a course counts toward at most one requirement in a program) and needs no separate encoding.",
    "The Communication & Society Leadership & Social Change list (COMM420, COMM421, COMM436, COMM455) includes numbers the source table gives no course title for -- kept literally since they're named in the source (never invented). See comm-shared-2026-27.ts.",
    "Not encoded (engine gap, matches other ARHU majors' precedent): the major's 46-credit and specialization's 36-credit totals; residency rules and the 120-credit graduation minimum; GPA minimums.",
  ],
  requirements: [
    ...commCollegeRequirements,
    { kind: "course", id: "theory-comm302", name: "Communication Theory & Principles: Communication Science Theories (COMM302)", options: ["COMM302"] },
    {
      kind: "choose",
      id: "theory-principles-choice",
      name: "Communication Theory & Principles: one of the following",
      count: 1,
      from: { courses: ["COMM201", "COMM301", "COMM303"] },
    },
    ...commResearchMethods,
    commLeadershipSocialChange,
    commDiversityInclusion,
    ...commAppliedShared,
    {
      kind: "choose",
      id: "hsc-electives",
      name: "Health and Science Communication: four Specialization Electives",
      count: 4,
      from: { courses: ["COMM390", "COMM419", "COMM422", "COMM424", "COMM426", "COMM427", "COMM435", "COMM459"] },
    },
  ],
};

export const commMajorHealthScienceCommunicationMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Communication (Health and Science Communication)",
  major: "comm",
  track: "Health and Science Communication",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/communication/communication-major/",
    department: "https://drive.google.com/uc?export=download&id=1ETspCX6Xy8feCY6kQlAhVTYc_XhYKWmS",
  },
};
