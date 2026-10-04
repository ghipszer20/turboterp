// Undergraduate Studies minors, 2026–27 UMD Academic Catalog: Asian American Studies Minor.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/undergraduate-studies/asian-american-studies-minor/
// and Asian American Studies Program, https://aast.umd.edu/ (both fetched 2026-09-28).
// The Global Studies Minor is NOT encoded here: see docs/project/owner-review.md (no requirements in its sources).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const aastMinor: Program = {
  id: "ugst-minor-asian-american-studies",
  name: "Asian American Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Asian American Studies Minor " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/undergraduate-studies/asian-american-studies-minor/); " +
    "Asian American Studies Program, https://aast.umd.edu/ (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Department page (aast.umd.edu) is a program homepage that only says 'the 15-credit Asian American Studies minor'; it lists no requirements, so the department page adds nothing and the catalog is used (department page not checked for requirements). No department-vs-catalog difference.",
    "Structure: 15 credits = one foundational course (AAST200 or AAST201), three elective courses (two must be AAST, one a Comparative Marginalizations or Global/Transnational/International (CM/GTI) course), and one upper-division course (AAST499 or one additional 400-level AAST course).",
    "Open slot 'cm-gti-elective' (openSlot requirement): 3 credits, one elective in Comparative Marginalizations or Global/Transnational/International (CM/GTI); the approved CM/GTI list is a separate page not in the sources (the AAST Director may also approve a course off the list).",
    "The two AAST electives accept any AAST course (the catalog's named list, AAST222/233/262/298/351/355/363/378/388/394/420/421/424/440/443/498 plus AAST200/201 if not used as the foundational course, is treated as examples of 'AAST or other approved courses'); other approved non-AAST courses may count with approval and are a manual check.",
    "Level rules: the source needs 3 courses at 300/400-level, but the CM/GTI elective may be a non-AAST course and the engine only matches by department, so the overlay checks 2 AAST courses at 300-499 (the upper-division course plus at least one elective, which the rules force); the third 300+ course is a manual check. 'No more than 6 credits (2 courses) at the 100 or 200-level' is a maximum the engine cannot express; manual check.",
    "Sharing: 'a maximum of 6 credits (2 courses) may satisfy both a major and the minor' encoded as maxSharedWith credits 6 (applies to every other program). 'Courses completed for one minor may not be used for another minor' is stricter (0) between minors and is a manual check.",
    "AAST499 restriction (permission of instructor or enrolled in the AAST minor) is not checked.",
  ],
  requirements: [
    { kind: "course", id: "foundation", name: "Foundational course: AAST200 or AAST201", options: ["AAST200", "AAST201"] },
    {
      kind: "choose",
      id: "aast-electives",
      name: "Two AAST elective courses",
      count: 2,
      from: { departments: ["AAST"] },
    },
    {
      kind: "choose",
      id: "upper-division",
      name: "AAST499 or one additional 400-level AAST course",
      count: 1,
      from: { departments: ["AAST"], minNumber: 400, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "upper-level-minimum",
      name: "At least two AAST courses at the 300- or 400-level (the third 300+ course may be the CM/GTI elective; see reviewNotes)",
      overlay: true,
      count: 2,
      from: { departments: ["AAST"], minNumber: 300, maxNumber: 499 },
    },
    {
      kind: "openSlot",
      id: "cm-gti-elective",
      name: "Comparative Marginalizations or Global/Transnational/International elective",
      credits: 3,
      note: "One course from the approved CM/GTI list (the AAST Director may approve a course off the list); confirm with your advisor.",
    },
  ],
};

export const aastMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "UGST",
  short: "Asian American Studies",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/undergraduate-studies/asian-american-studies-minor/",
    department: "https://aast.umd.edu/",
  },
};
