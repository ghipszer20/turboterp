// Shared requirements for the Architecture Major's two degree options (BS, BA), 2026-27 UMD Academic Catalog.
// Not a program file (no `Meta` export); imported by arch-major-bs-2026-27.ts and arch-major-ba-2026-27.ts.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/architecture-planning-preservation/architecture-major/
// and arch.umd.edu .../undergraduate-advising/degree-planning (fetched 2026-09-28); see program-sources/architecture-major.md.

import type { Requirement } from "../src/audit.ts";

/** "All students must complete the following courses" (35 credits), identical for BS and BA. */
export const archCore: Requirement[] = [
  { kind: "course", id: "arch-calculus", name: "Elementary Calculus I or Calculus I (MATH120 or MATH140)", options: ["MATH120", "MATH140"] },
  { kind: "course", id: "phys121", name: "Fundamentals of Physics I (PHYS121)", options: ["PHYS121"] },
  { kind: "course", id: "arch171", name: "Design Thinking and Making in Architecture (ARCH171)", options: ["ARCH171"] },
  { kind: "course", id: "arch225", name: "History of World Architecture I (ARCH225)", options: ["ARCH225"] },
  { kind: "course", id: "arch200", name: "Design Media and Representation I (ARCH200)", options: ["ARCH200"] },
  { kind: "course", id: "arch226", name: "History of World Architecture II (ARCH226)", options: ["ARCH226"] },
  { kind: "course", id: "arch300", name: "Design Media and Representation II (ARCH300)", options: ["ARCH300"] },
  { kind: "course", id: "arch201", name: "Elements and Principles of Architecture (ARCH201, 1 credit)", options: ["ARCH201"] },
  { kind: "course", id: "arch462", name: "Methods & Materials of Building Construction (ARCH462)", options: ["ARCH462"] },
  { kind: "course", id: "arch400", name: "Architecture Design Studio I (ARCH400, 6 credits)", options: ["ARCH400"] },
  { kind: "course", id: "arch463", name: "Sustainable Systems in Architecture (ARCH463)", options: ["ARCH463"] },
];

export const archCommonReviewNotes: string[] = [
  "Department page not checked: the department source (arch.umd.edu degree-planning page) is only a menu of links to the 4-year plan PDFs, with no requirements text and no readable plan, so only the Academic Catalog is encoded and no department-vs-catalog difference could be found.",
  "The catalog lists 'MATH120 or MATH140' as one row: encoded as one course requirement with two options.",
  "Not encoded (engine gaps): GPA, total-credit minimum, residency, and admission/gateway gates. No minGrade is set because the catalog page states none.",
  "Credits: the catalog gives ARCH201 as 1 credit, ARCH400-403 as 6 credits each and ARCH474 as 1 credit; the audit takes credits from the student's own course records, so the sample plans carry these credit overrides.",
  "No readable official 4-year plan (the department page only links to PDFs the source fetch could not read), so the sample plan is CONSTRUCTED from the catalog tables, not lifted from a published plan; flagged in docs/project/owner-review.md.",
];
