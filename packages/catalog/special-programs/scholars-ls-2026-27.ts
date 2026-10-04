// College Park Scholars: Life Sciences (Fall 2026 curriculum PDF). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, SCHOLARS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsLS2026.pdf";

export const scholarsLs: Program = {
  id: "scholars-ls",
  name: "College Park Scholars: Life Sciences",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    ...SCHOLARS_CITATION_NOTES,
    `[check] Courses: "CPSF 100: Colloquium I 1 cr; BSCI 160: Ecology and Evolution (DSNL) 3 cr; CHEM 131 + 132S: General Chemistry + Lab (DSNL) 4 cr; CMNS 100: Becoming a Science Terp 1 cr; CPSF 101: Colloquium II 1 cr; BSCI 170: Molecular and Cellular Biology (DSNL) 3 cr; *BSCI 180S: Principles of Biology Laboratory (DSNL) 1 cr; CPSF 200: Colloquium III 1 cr; CPSF 230: Practicum: Internship 1 cr".`,
    `[check] Equivalents: "should take all of these courses or an approved equivalent (e.g., CHEM 135/136)". CHEM135 is accepted for CHEM131 and CHEM136 for the lab; plain CHEM132 and BSCI180 are accepted for the Scholars sections CHEM132S and BSCI180S. Owner to confirm.`,
    `[check] CMNS100: the advising guide says "If you are not able to take this section, register for any other CMNS 100 or UNIV 100 section", so UNIV100 is accepted.`,
    `[manual] "non-Life Sciences majors may choose to substitute a Life Sciences-related course for their DNSL lab courses … All exceptions MUST be approved by the director." Not encoded.`,
    `[manual] "Scholars who have placed out of these courses by taking AP exams have satisfied this requirement for the program." Comes in through AP credit import.`,
    `[manual] "All courses required for the citation must be taken with Regular grading (not Pass/Fail, Audit, etc.)." The audit doesn't know grading basis yet.`,
  ],
  requirements: [
    { kind: "course", id: "cpsf100", name: "Colloquium I", options: ["CPSF100"] },
    { kind: "course", id: "bsci160", name: "Ecology and Evolution", options: ["BSCI160"] },
    { kind: "course", id: "chem131", name: "General Chemistry", options: ["CHEM131", "CHEM135"] },
    { kind: "course", id: "chem132s", name: "General Chemistry Lab", options: ["CHEM132S", "CHEM132", "CHEM136"] },
    { kind: "course", id: "cmns100", name: "Becoming a Science Terp", options: ["CMNS100", "UNIV100"] },
    { kind: "course", id: "cpsf101", name: "Colloquium II", options: ["CPSF101"] },
    { kind: "course", id: "bsci170", name: "Molecular and Cellular Biology", options: ["BSCI170"] },
    { kind: "course", id: "bsci180s", name: "Principles of Biology Laboratory", options: ["BSCI180S", "BSCI180"] },
    { kind: "course", id: "cpsf200", name: "Colloquium III", options: ["CPSF200"] },
    { kind: "course", id: "cpsf230", name: "Practicum: Internship", options: ["CPSF230"] },
  ],
};

export const scholarsLsMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsLS2026.pdf" } };
