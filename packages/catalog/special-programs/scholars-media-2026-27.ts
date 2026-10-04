// College Park Scholars: Media, Self and Society (Fall 2026 curriculum PDF). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, SCHOLARS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsMedia2026.pdf";

const SUPPORTING = [
  "ANTH260", "SOCY100", "SOCY105", "PHIL140", "PSYC100", "CPSP220", "ECON200", "ECON201", "ENGL240", "ENGL241",
  "ENGL243", "ENGL244", "FMSC190S", "GVPT105", "GVPT170", "HESP120", "HIST200", "HIST201", "LING200",
];

export const scholarsMedia: Program = {
  id: "scholars-media",
  name: "College Park Scholars: Media, Self and Society",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    ...SCHOLARS_CITATION_NOTES,
    `[check] Courses: "CPMS 100: Colloquium I 1 cr; CPMS 225: Analyzing Media Practice Through Theory (SCIS, DSHS) 3 cr; CPMS 101: Colloquium II 1 cr; CPMS 200: Colloquium III; CPMS 230: Internship; or CPMS 240: Service-Learning; or CPSP 359S: Discovery Research (DSSP)".`,
    `[check] Supporting courses: "Two courses (total: 6–8 credits)" from the Supporting Course Options. "SOCY 100 or 105", "ECON 200 or 201", "ENGL 240 or 241 or 243 or 244", "GVPT 105 or 170" and "HIST 200 or 201" are alternatives: at most one of each group counts. "CMSC 122 (DSSP) or higher" is encoded as any CMSC course numbered 122 or above. The credit total isn't checked.`,
    `[manual] "Students may petition an alternative course … Students should consider petitioning any I-Series course" and "May be fulfilled through AP, transfer, or examination credit".`,
  ],
  requirements: [
    { kind: "course", id: "cpms100", name: "Colloquium I", options: ["CPMS100"] },
    { kind: "course", id: "cpms225", name: "Analyzing Media Practice Through Theory", options: ["CPMS225"] },
    { kind: "course", id: "cpms101", name: "Colloquium II", options: ["CPMS101"] },
    { kind: "course", id: "cpms200", name: "Colloquium III", options: ["CPMS200"] },
    { kind: "course", id: "practicum", name: "Practicum (internship, service-learning or research)", options: ["CPMS230", "CPMS240", "CPSP359S"] },
    {
      kind: "choose",
      id: "supporting-courses",
      name: "Supporting courses (two)",
      count: 2,
      from: { courses: SUPPORTING, departments: ["CMSC"], minNumber: 122 },
      alternatives: [
        ["SOCY100", "SOCY105"],
        ["ECON200", "ECON201"],
        ["ENGL240", "ENGL241", "ENGL243", "ENGL244"],
        ["GVPT105", "GVPT170"],
        ["HIST200", "HIST201"],
      ],
    },
  ],
};

export const scholarsMediaMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsMedia2026.pdf" } };
