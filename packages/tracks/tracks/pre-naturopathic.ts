// Pre-Naturopathic Medicine. Source: CNME (accreditor) and AANMC academic prerequisites, as
// reported by a search-result summary in docs/project/new-tracks-research.md section 9 (S).
// UNVERIFIED until the owner signs off.

import type { Track } from "../src/types.ts";
import { creditsFrom } from "./common.ts";

const CNME = "https://cnme.org/";
const AANMC = "https://aanmc.org/academic-prerequisites/";

export const preNaturopathic: Track = {
  id: "pre-naturopathic",
  name: "Pre-Naturopathic Medicine",
  schools: "naturopathic medicine programs",
  minGrade: "C",
  minGradeNote: "Reported (S): all prerequisite courses need a C or higher; check each target school.",
  entry: { kind: "after-degree" },
  usesScienceGpa: true,
  categories: [
    creditsFrom(
      "life-physical-science",
      "Life and physical science with labs (24 credits)",
      24,
      [
        "BSCI160", "BSCI161", "BSCI170", "BSCI171", "BSCI180", "BSCI201", "BSCI202", "BSCI223",
        "CHEM131", "CHEM132", "CHEM231", "CHEM232", "CHEM241", "CHEM242", "CHEM271", "CHEM272",
        "BCHM461", "BCHM463",
        "PHYS121", "PHYS122", "PHYS131", "PHYS132",
      ],
      "24 credit hours in life and physical sciences, lecture plus lab (AANMC / CNME)",
    ),
  ],
  milestones: [
    {
      id: "bachelors-degree",
      kind: "advising",
      name: "Baccalaureate degree",
      detail: "Naturopathic medicine programs expect a completed bachelor's degree. The NPLEX licensing exam comes after the ND degree.",
    },
    {
      id: "gpa",
      kind: "gpa",
      name: "GPA of 3.00",
      detail: "Reported: a 3.00 GPA, with an alternative admission track for 2.75 to 2.99. Check each target school.",
    },
  ],
  disclaimer: "Confirm with AANMC and each target school.",
  sources: [CNME, AANMC],
  verified: false,
  reviewNotes: [
    "(S) All figures (baccalaureate; 24 credit hours of life and physical sciences, lecture plus lab; C or higher in every course; GPA 3.00, alternative 2.75-2.99) come from a search-result summary. AANMC's page returned 403 and the CNME handbook PDF was unparseable. Verify against AANMC by hand before setting verified: true.",
    "The research doc lists BSCI170/171, BSCI180, CHEM131/132, CHEM231/232 and BCHM461, which total only 16 credits, less than the 24 required. The pool is widened with courses other tracks already use (BSCI160/161, BSCI201/202, BSCI223, CHEM241/242, CHEM271/272, BCHM463, PHYS121/122/131/132); this widening is TurboTerp's reading, not the source's.",
    "The 3.00 GPA is listed as a milestone, not audited. Lecture plus lab pairing is not checked.",
    "PSYC100 is listed in the research doc as \"verify whether required\"; it is not encoded.",
  ],
};
