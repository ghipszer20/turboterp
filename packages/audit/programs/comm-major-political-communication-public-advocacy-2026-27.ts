// Communication Major, Political Communication and Public Advocacy Track, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/communication/communication-major/;
// the College's official Political Communication and Public Advocacy Four Year Academic Plan
// (department source), https://drive.google.com/uc?export=download&id=1O_OqBgmiMqMASjpXXrRxG6JaR1f7gZjN
// (fetched 2026-09-28).
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

export const commMajorPoliticalCommunicationPublicAdvocacy: Program = {
  id: "comm-major-political-communication-public-advocacy",
  name: "Communication Major (Political Communication and Public Advocacy)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Communication Major (Political Communication and Public Advocacy Track); " +
    "College of Arts and Humanities, official Political Communication and Public Advocacy Four Year Academic Plan (department source), " +
    "https://drive.google.com/uc?export=download&id=1O_OqBgmiMqMASjpXXrRxG6JaR1f7gZjN (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "The Political Communication and Public Advocacy plan PDF's OCR text is also illegible (shredded table; no course-by-term grid recoverable, only checklist fragments that match the catalog), so the sample plan stays CONSTRUCTED from the catalog's requirement structure (official: false). No department-vs-catalog disagreement could be found; flagged in docs/project/owner-review.md.",
    "Communication Theory & Principles: COMM301 is fixed; the student then picks one of COMM201, COMM302, COMM303.",
    "Specialization Electives ('Select four of the following': COMM330, COMM340, COMM341, COMM360, COMM428, COMM450, COMM452, COMM456, COMM458, COMM460, COMM461, COMM469) is encoded as a choose(count 4) over exactly that named list.",
    "The Communication & Society Leadership & Social Change list (COMM420, COMM421, COMM436, COMM455) includes numbers the source table gives no course title for -- kept literally since they're named in the source (never invented). See comm-shared-2026-27.ts.",
    "Not encoded (engine gap, matches other ARHU majors' precedent): the major's 46-credit and specialization's 36-credit totals; residency rules and the 120-credit graduation minimum; GPA minimums.",
  ],
  requirements: [
    ...commCollegeRequirements,
    { kind: "course", id: "theory-comm301", name: "Communication Theory & Principles: Rhetorical Theories (COMM301)", options: ["COMM301"] },
    {
      kind: "choose",
      id: "theory-principles-choice",
      name: "Communication Theory & Principles: one of the following",
      count: 1,
      from: { courses: ["COMM201", "COMM302", "COMM303"] },
    },
    ...commResearchMethods,
    commLeadershipSocialChange,
    commDiversityInclusion,
    ...commAppliedShared,
    {
      kind: "choose",
      id: "pcpa-electives",
      name: "Political Communication and Public Advocacy: four Specialization Electives",
      count: 4,
      from: { courses: ["COMM330", "COMM340", "COMM341", "COMM360", "COMM428", "COMM450", "COMM452", "COMM456", "COMM458", "COMM460", "COMM461", "COMM469"] },
    },
  ],
};

export const commMajorPoliticalCommunicationPublicAdvocacyMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "Communication (Political Communication and Public Advocacy)",
  major: "comm",
  track: "Political Communication and Public Advocacy",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/communication/communication-major/",
    department: "https://drive.google.com/uc?export=download&id=1O_OqBgmiMqMASjpXXrRxG6JaR1f7gZjN",
  },
};
