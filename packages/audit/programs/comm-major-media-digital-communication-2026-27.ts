// Communication Major, Media and Digital Communication Track, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/communication/communication-major/;
// the College's official Media and Digital Communication Four Year Academic Plan (department source),
// https://drive.google.com/uc?export=download&id=1gujq1AvfdD6crXvPwS8TVSB877MTQp54 (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page/plan and the catalog disagree,
// follow the department source. On the OCR re-check no disagreement was found -- see reviewNotes.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import {
  commCollegeRequirements,
  commResearchMethods,
  commLeadershipSocialChangeNoComm436,
  commDiversityInclusion,
  commAppliedShared,
} from "./comm-shared-2026-27.ts";

export const commMajorMediaDigitalCommunication: Program = {
  id: "comm-major-media-digital-communication",
  name: "Communication Major (Media and Digital Communication)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Communication Major (Media and Digital Communication Track); " +
    "College of Arts and Humanities, official Media and Digital Communication Four Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1gujq1AvfdD6crXvPwS8TVSB877MTQp54 (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "The Media and Digital Communication plan PDF's OCR text is also illegible (shredded table; no course-by-term grid recoverable, only checklist fragments that match the catalog), so the sample plan stays CONSTRUCTED from the catalog's requirement structure (official: false). No department-vs-catalog disagreement could be found; flagged in docs/project/owner-review.md.",
    "Communication Theory & Principles: COMM303 is fixed; the student then picks one of COMM201, COMM301, COMM302.",
    "This track's own Communication & Society Leadership & Social Change list is missing COMM436, present in the otherwise-identical list under the other four tracks (all five appear on the same catalog page). Encoded literally per this track's own table (commLeadershipSocialChangeNoComm436 in comm-shared-2026-27.ts) rather than assumed to be a typo -- flagged in docs/project/owner-review.md as a possible source inconsistency for the owner to confirm.",
    "Specialization Electives ('Select four of the following': COMM365, COMM370, COMM371, COMM372, COMM373, COMM374, COMM375, COMM376, COMM449, COMM468) is encoded as a choose(count 4) over exactly that named list.",
    "Not encoded (engine gap, matches other ARHU majors' precedent): the major's 46-credit and specialization's 36-credit totals; residency rules and the 120-credit graduation minimum; GPA minimums.",
  ],
  requirements: [
    ...commCollegeRequirements,
    { kind: "course", id: "theory-comm303", name: "Communication Theory & Principles: Media Theory (COMM303)", options: ["COMM303"] },
    {
      kind: "choose",
      id: "theory-principles-choice",
      name: "Communication Theory & Principles: one of the following",
      count: 1,
      from: { courses: ["COMM201", "COMM301", "COMM302"] },
    },
    ...commResearchMethods,
    commLeadershipSocialChangeNoComm436,
    commDiversityInclusion,
    ...commAppliedShared,
    {
      kind: "choose",
      id: "mdc-electives",
      name: "Media and Digital Communication: four Specialization Electives",
      count: 4,
      from: { courses: ["COMM365", "COMM370", "COMM371", "COMM372", "COMM373", "COMM374", "COMM375", "COMM376", "COMM449", "COMM468"] },
    },
  ],
};

export const commMajorMediaDigitalCommunicationMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Communication (Media and Digital Communication)",
  major: "comm",
  track: "Media and Digital Communication",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/communication/communication-major/",
    department: "https://drive.google.com/uc?export=download&id=1gujq1AvfdD6crXvPwS8TVSB877MTQp54",
  },
};
