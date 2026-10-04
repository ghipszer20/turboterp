// Pre-Speech-Language Pathology (SLP). Source: ASHA 2020 SLP Certification Standards, Standard IV-A
// (SOURCES.md, docs/project/new-tracks-research.md section 1). Encoded by hand. UNVERIFIED until the
// owner signs off.

import type { Track } from "../src/types.ts";
import { GRE_MILESTONE, cat, oneOf, sets } from "./common.ts";

const ASHA = "https://www.asha.org/certification/2020-slp-certification-standards/";

export const preSlp: Track = {
  id: "pre-slp",
  name: "Pre-Speech-Language Pathology",
  schools: "SLP master's programs",
  usesScienceGpa: true,
  entry: { kind: "after-degree" },
  categories: [
    cat(
      sets("biology", "Biological sciences", [
        ["BSCI170", "BSCI171"],
        ["BSCI170", "BSCI180"],
        ["BSCI160", "BSCI161"],
        ["BSCI160", "BSCI180"],
      ]),
      "Biological sciences (human or animal sciences, e.g. biology, human anatomy and physiology, neuroanatomy and neurophysiology)",
    ),
    cat(
      oneOf("chemistry-or-physics", "Chemistry or physics", ["CHEM131", "PHYS121", "PHYS131"]),
      "Chemistry or physics",
    ),
    cat(
      oneOf("social-behavioral", "Social or behavioral sciences", ["PSYC100", "SOCY100"]),
      "Social/behavioral sciences (analysis and investigation of human and animal behavior)",
    ),
    cat(
      oneOf("statistics", "Statistics", ["STAT100", "STAT400"]),
      "Statistics (research methodology can't be used to fulfill this requirement)",
    ),
  ],
  milestones: [
    {
      id: "graduate-degree",
      kind: "application",
      name: "Post-baccalaureate degree",
      detail: "ASHA certification (Standard I) requires a master's, doctoral or other recognized post-baccalaureate degree; the graduate program needs at least 36 semester credit hours at the graduate level.",
    },
    { ...GRE_MILESTONE, detail: "ASHA doesn't require an admission test; programs set their own GRE and GPA requirements, so check each target program.", optional: true },
    {
      id: "primary-application",
      kind: "application",
      name: "Application (CSDCAS)",
      detail: "Many programs apply through CSDCAS (the Communication Sciences and Disorders Centralized Application Service); this is set by each program, so check each one.",
    },
  ],
  suggestedCourses: [
    {
      area: "Communication sciences background (not required by ASHA; expected by most programs)",
      courses: ["HESP202", "HESP305", "HESP306", "HESP307", "HESP313", "HESP400", "LING200"],
    },
  ],
  disclaimer: "Confirm with your academic advisor and each target school.",
  sources: [ASHA],
  verified: false,
  reviewNotes: [
    "ASHA's Standard IV-A names four prerequisite areas (biological sciences; chemistry or physics; social/behavioral sciences; statistics) and states no credit minimums, so each is encoded as one course (or one lecture and lab pair for biology).",
    "Chemistry or physics: encoded as one course each (CHEM131, PHYS121 or PHYS131). ASHA states no credit count; the research doc lists CHEM131 (+132), PHYS121/122 and PHYS131/132.",
    "Statistics = STAT100 or STAT400 (the research doc's UMD mapping). ASHA says research methodology can't count, so the broader shared statistics list (which includes PSYC200 and BIOM301) is deliberately not used.",
    "Social/behavioral sciences = PSYC100 or SOCY100. ASHA asks for coursework in \"analysis and investigation of human and animal behavior\"; the UMD course choice is TurboTerp's reading.",
    "The HESP/LING communication-sciences courses are shown as suggested only: the research doc says ASHA doesn't require them but most programs expect them. HESP305 (Anatomy and Physiology of the Speech Mechanism) and HESP306 (Anatomy and Physiology of Speech & Hearing) are both current catalog courses (checked 2026-09-29).",
    "No minimum grade is encoded: the research doc states none for ASHA, and programs set their own.",
    "The GRE is marked optional: ASHA states no test, and programs set GRE and GPA requirements.",
    "The UMD course codes come from the research doc (checked against the catalog 2026-09-29); the disclaimer names the student's advisor rather than HPAO because no HPAO page covers this track.",
  ],
};
