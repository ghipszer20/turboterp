// Departmental Honors: Geology.
// Source: https://www.geol.umd.edu/undergraduate/ugdhonors.php ("Honors in Geology"; fetched 2026-09-26).
// Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://www.geol.umd.edu/undergraduate/ugdhonors.php";

export const deptGeol: Program = {
  id: "dept-honors-geol",
  name: "Departmental Honors: Geology",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "GEOL 497H Recent Advances in Geology (3 credit hours - taken in senior year)".`,
    `[check] "The research and thesis requirement will be met by completion of GEOL 393 and GEOL 394 with grades meeting the criteria outlined above (6 credit hours)." Drafted as 3 credits each.`,
    `[manual] "6 credit hours from the following: up to two 3 credit hour graduate-level courses approved by the Departmental Honors Committee, up to two Honors Option projects in three or four credit hour upper-level courses..., no more than one University Honors Program seminar (3 credit hours)." No fixed course ids (all three routes are committee-approved case by case); not drafted.`,
    `[manual] "Graduation with Honors normally requires... grades of B- and A- or better in GEOL 393 and GEOL 394 (i.e., grades for one semester must be at least an A-, and the second semester grade cannot fall below a B-)... maintenance of a 3.0 overall GPA." Per-course grade thresholds and GPA aren't checked (the audit's minGrade is per-program, not per-course).`,
    `[manual] "Admission to the Program will be by invitation of the Honors Committee, normally at the end of the sophomore year." Not a citation requirement.`,
  ],
  requirements: [
    { kind: "course", id: "geol497h", name: "GEOL497H: Recent Advances in Geology", options: ["GEOL497H"] },
    { kind: "course", id: "geol393", name: "GEOL393: Honors research", options: ["GEOL393"] },
    { kind: "course", id: "geol394", name: "GEOL394: Honors thesis", options: ["GEOL394"] },
  ],
};

export const deptGeolMeta: ProgramMeta = { kind: "special", college: "CMNS", sources: { department: "https://www.geol.umd.edu/undergraduate/ugdhonors.php" } };
