// Physics Minor, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/physics/physics-minor/
// (fetched 2026-09-27, catalog-generated PDF); Department of Physics,
// https://www.umdphysics.umd.edu/academics/undergraduate/ugrad-requirements.html (fetched
// 2026-09-27) and the linked Declaration of Minor in Physics form,
// https://umdphysics.umd.edu/images/pdfs/ugrad/Declaration_of_Minor_in_Physics_Revised_S18.pdf
// (fetched 2026-09-27). Owner ruling (docs/project/rulings.md): where the department page and the
// catalog disagree, follow the department page; see the reviewNotes below for why the catalog is
// used instead here. No official published sample plan (built from the requirements below; see
// docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const physicsMinor: Program = {
  id: "physics-minor",
  name: "Physics Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Physics Minor (catalog-generated PDF, dated 2026-08-21, fetched 2026-09-27)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ credits: 7 }],
  reviewNotes: [
    "Department-vs-catalog conflict the owner should confirm (deviating from the default 'department wins' here): the department's own Declaration of Minor form is labeled 'Revised S18' (Spring 2018) and lists a narrower, older required-course set -- a lab (PHYS174/261/271), then 'PHYS272 or PHYS260', then 'PHYS273 or PHYS270', then 3 electives from PHYS371/373/401/402/404/410/411 -- with no PHYS265 (Introduction to Scientific Programming) requirement at all, and it uses PHYS270, a code the current catalog no longer lists. The department's undergraduate-requirements page separates its course lists by matriculation cohort ('Fall 2025 onwards' vs 'BEFORE Fall 2025'), which raises the possibility that the S18 form describes the pre-Fall-2025 cohort rather than being simply stale -- but the page's own 'Fall 2025 onwards' section doesn't restate a distinct minor course list (it only points back to the same Declaration form), so this couldn't be confirmed either way. The current 2026-27 catalog requires the lab, PHYS265 (or an approved programming substitute), PHYS272, and PHYS273 outright, plus 3 electives from a longer, more current list (through PHYS467/474) -- the right list for a 2026-27-catalog-year Program regardless of which cohort the department form targets. This Program follows the catalog; flagged in docs/project/owner-review.md for the owner to check with the department which list currently-declaring students should actually use.",
    "PHYS265 substitutes named by the catalog (AOSC247, CMSC106, CMSC131, ENAE202) are included as options on that requirement.",
    "'PHYS260 (with a B- or higher) substitutes for PHYS272' -- the B- floor can't be set for just one option among a requirement's options (Program.minGrade / Requirement.minGrade apply to the whole requirement); PHYS260 is accepted at the Program's own C- floor instead, and the extra grade condition is a manual check.",
    "'PHYS371 or PHYS420' is one row on the catalog's table (an either/or alternative between two differently-titled courses, not a cross-list), encoded as an alternatives pair so taking both counts once toward the 3 electives.",
    "'Other upper-level Physics courses can be substituted only with Associate Chair and Minor Advisor approval' isn't encoded as a course list (open-ended, approval-gated); the electives requirement is marked advisorMayApprove.",
    "'No more than 7 credits in this minor can count toward major requirements' -> maxSharedWith: [{ credits: 7 }].",
    "'Physics majors and students majoring in Astronomy are not eligible to complete the Physics Minor': Enforced via notOpenTo.",
    "Prerequisites (MATH140, MATH141, MATH241, MATH243 or (MATH240 and MATH246), PHYS171) are background expected before the minor's own courses, not minor requirements themselves; not encoded.",
  ],
  requirements: [
    { kind: "course", id: "lab", name: "Introductory physics laboratory", options: ["PHYS174", "PHYS261", "PHYS271"] },
    { kind: "course", id: "programming", name: "Scientific programming", options: ["PHYS265", "AOSC247", "CMSC106", "CMSC131", "ENAE202"] },
    { kind: "course", id: "electricityMagnetism", name: "Introductory electricity and magnetism", options: ["PHYS272", "PHYS260"] },
    { kind: "course", id: "waves", name: "Intermediate oscillations and waves", options: ["PHYS273"] },
    {
      kind: "choose",
      id: "electives",
      advisorMayApprove: true,
      name: "Upper-level electives",
      count: 3,
      from: {
        courses: [
          "PHYS313", "PHYS371", "PHYS420", "PHYS401", "PHYS402", "PHYS404",
          "PHYS410", "PHYS413", "PHYS431", "PHYS441", "PHYS457", "PHYS467", "PHYS474",
        ],
      },
      alternatives: [["PHYS371", "PHYS420"]],
    },
  ],
};

export const physicsMinorMeta: ProgramMeta = { kind: "minor", notOpenTo: { programs: ["phys", "astr"], reason: "Not open to Physics or Astronomy majors." }, college: "CMNS", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/physics/physics-minor/", department: "https://www.umdphysics.umd.edu/academics/undergraduate/ugrad-requirements.html" } };
