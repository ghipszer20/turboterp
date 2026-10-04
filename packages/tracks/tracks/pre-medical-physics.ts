// Pre-Medical Physics (CAMPEP graduate programs). Source: CAMPEP graduate standards, as reported
// in docs/project/new-tracks-research.md section 12. UNVERIFIED until the owner signs off.

import type { Track } from "../src/types.ts";
import { cat, sets } from "./common.ts";

const CAMPEP = "https://campep.org/GraduateStandards.pdf";

export const preMedicalPhysics: Track = {
  id: "pre-medical-physics",
  name: "Pre-Medical Physics",
  schools: "CAMPEP-accredited medical physics programs",
  entry: { kind: "after-degree" },
  usesScienceGpa: true,
  categories: [
    cat(
      sets("intro-physics", "Introductory physics sequence", [["PHYS161", "PHYS260", "PHYS261", "PHYS270", "PHYS271"], ["PHYS171", "PHYS272", "PHYS273"]]),
      "A strong foundation in basic physics: a physics degree, or another degree with physics education equivalent to a minor in physics (CAMPEP)",
    ),
    cat(
      { kind: "choose", id: "upper-physics", name: "Three upper-level physics courses", count: 3, from: { courses: ["PHYS401", "PHYS404", "PHYS411", "PHYS420"] } },
      "At least three upper level undergraduate physics courses or equivalent required for a physics major (CAMPEP)",
    ),
  ],
  milestones: [
    {
      id: "program-requirements",
      kind: "application",
      name: "Check each program's GPA, GRE and application steps",
      detail: "CAMPEP sets no credit minimums or GPA: each graduate program sets its own GPA and GRE requirements. Remedial coursework is allowed if your physics background falls short.",
    },
  ],
  disclaimer: "Confirm with CAMPEP-accredited programs and each target school.",
  sources: [CAMPEP],
  verified: false,
  reviewNotes: [
    "CAMPEP gives no credit minimums, GPA or GRE; the standard is qualitative (a physics degree, or physics equivalent to a minor with at least three upper-level physics courses). The doc's verdict is a single category; it is split into an intro sequence and three upper-level courses so each half shows separately.",
    "Intro sequence: UMD's three-semester calculus-based physics, either PHYS161, PHYS260 + PHYS261 lab, PHYS270 + PHYS271 lab, or the physics majors' PHYS171, PHYS272, PHYS273 (catalog, checked 2026-09-29; the research doc's \"PHYS171 / PHYS172\" was wrong: PHYS172 is a 1-credit \"Succeeding in Physics\" course). Upper level: PHYS401, PHYS404, PHYS411, PHYS420.",
    "The doc also lists math (MATH140, MATH141, MATH241, MATH246) as UMD courses but CAMPEP names no math requirement, so none is encoded.",
    "Remedial coursework is allowed by CAMPEP, so an unmet category is a gap to close, not a bar.",
  ],
};
