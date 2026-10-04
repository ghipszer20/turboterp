// Pre-Chiropractic. Source: Council on Chiropractic Education (CCE) accreditation standards, as
// reported by a search-result summary in docs/project/new-tracks-research.md section 3 (S). The
// standards PDF itself was not read. UNVERIFIED until the owner signs off.

import type { Track } from "../src/types.ts";
import { creditsFrom } from "./common.ts";

const CCE = "https://www.cce-usa.org/";

export const preChiropractic: Track = {
  id: "pre-chiropractic",
  name: "Pre-Chiropractic",
  schools: "chiropractic programs",
  entry: { kind: "after-degree" },
  usesScienceGpa: true,
  categories: [
    creditsFrom(
      "life-physical-science",
      "Life and physical science (24 credits)",
      24,
      [
        "BSCI160", "BSCI161", "BSCI170", "BSCI171", "BSCI201", "BSCI202", "BSCI223",
        "CHEM131", "CHEM132", "CHEM231", "CHEM232",
        "PHYS121", "PHYS122", "PHYS131", "PHYS132",
      ],
      "A minimum of 24 semester hours in life and physical science courses, with at least half of these courses having a substantive laboratory component (CCE)",
    ),
  ],
  milestones: [
    {
      id: "ninety-credits",
      kind: "advising",
      name: "90 semester hours completed",
      detail: "CCE standards require at least 90 semester hours of undergraduate study before you enter a chiropractic program; many students finish a bachelor's degree first.",
    },
    {
      id: "school-gpa",
      kind: "application",
      name: "Check each program's GPA and application steps",
      detail: "Programs set their own minimum GPA (reports differ, roughly 2.75 to 3.0). Check each target program. The NBCE board exams come after the DC degree, not before admission.",
    },
  ],
  disclaimer: "Confirm with CCE-accredited programs and each target school.",
  sources: [CCE],
  verified: false,
  reviewNotes: [
    "(S) All CCE figures (90 semester hours; 24 semester hours of life and physical science, at least half of the courses with a lab) come from a search-result summary, not a page read in full. The CCE standards PDF URL 404'd; re-verify the current Accreditation Standards at https://www.cce-usa.org/ (see /guidance.html and /publications.html) before setting verified: true.",
    "GPA figures conflict (3.0 with a 2.7-2.75 alternative admission track; older wording 2.75), so no GPA number is encoded and no minimum grade is set.",
    "Course list is the research doc's: life science BSCI160/161 or BSCI170/171, BSCI201/202 or BSCI223; physical science CHEM131/132, CHEM231/232, PHYS121/122, PHYS131/132.",
    "\"At least half of these courses having a substantive laboratory component\" is not checked by the audit: it is one 24-credit pool. The student confirms lab content themselves.",
    "The 90-hour figure is a milestone, not audited. Entry is modeled as after-degree, though CCE only requires 90 hours.",
  ],
};
