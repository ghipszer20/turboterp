// College Park Scholars: Science, Technology and Society (Fall 2026 curriculum PDF). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, SCHOLARS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsSTS2026.pdf";

/** "Supporting Course Options" plus the first-semester advising guide's recommended list. */
const SUPPORTING = [
  "AASP211", "AAST394", "AMST324", "AGST130", "AMST205", "AMST210", "AMST260", "ANSC227", "ANTH210", "ANTH222",
  "ANTH242", "ANTH265", "ANTH266", "AOSC123", "AOSC200", "ARCH170", "ARCH271", "ARCH272", "AREC200", "AREC210",
  "AREC240", "AREC254", "AREC260", "ARHU230", "ENGL254", "HIST219N", "WGSS230", "ARTH262", "ASTR220", "ASTR230",
  "BMGT190H", "ENED290", "BMGT207", "BMGT289A", "BSCI135", "BSCI144", "BSCI150", "CCJS225", "CHSE205", "CINE280",
  "CPSP220", "DATA200", "ECON185", "EDHD201", "EDHD221", "EDSP220", "ENCE215", "ENES192", "ENES197", "ENES200",
  "ENEE200", "ENES250", "ENGL245", "CINE245", "ENGL255", "ENGL290", "ENGL293", "ENGL294", "ENGL295", "ENMA150",
  "ENMA201", "ENST233", "FMSC110", "FMSC190S", "FMSC260", "FMSC270", "FMSC286", "GEOG140", "GEOL200", "GVPT273",
  "HESP214", "HIST204", "HIST205", "HIST224", "HLTH234", "HLTH264", "INAG123", "INST104", "INST152", "INST154",
  "INST155", "INST201", "INST204", "JOUR175", "JOUR281", "JOUR282", "JOUR289I", "KNES226", "KNES285", "KNES286",
  "KNES287", "LARC151", "LARC263", "LING260", "MATH274", "MUSC210", "NFSC112", "NFSC220", "PHIL211", "PHIL220",
  "PHIL250", "PHYS105", "PHYS235", "PLCY288Q", "PSYC336", "WGSS336", "SOCY224", "SOCY241", "SOCY340", "URSP250",
  "WGSS115", "WGSS200", "WGSS205", "WGSS290", "WGSS291",
];

export const scholarsSts: Program = {
  id: "scholars-sts",
  name: "College Park Scholars: Science, Technology and Society",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    ...SCHOLARS_CITATION_NOTES,
    `[check] Courses: "CPSS 100: Colloquium I 2 cr; CPSS 101: Colloquium II or CPSP 110: Bridging Divides thru Intergroup Dialogue Across Disciplines (DVCC) or IDEA 311: Design Your Purpose 1 cr".`,
    `[check] Practicum (3 cr): "CPSS 220: Future of Communicating Science (DVCC) or CPSS 240: Robotics Service-Learning (SCIS, DSSP) or CPSS 340: Infrastructure and Society (DSSP) or CPSP 210: Art-Tech Studio … or CPSS 270: Chip Technologies in Taiwan … or CPSP 279T: Indigenous Communities and Technology in Ecuador".`,
    `[check] Capstone (3 cr): "CPSS 225: Capstone (SCIS, DSHS) or CPSS 220: Future of Communicating Science (DVCC)". CPSS220 appears in both the practicum and the capstone; one course fills one requirement, so a student using CPSS220 needs another course for the other.`,
    `[check] Supporting course (3 cr): one from the "Supporting Course Options" and the first-semester advising guide's list. Cross-listings ("AAST394/AMST324", "ARHU230/ENGL254/HIST219N/WGSS230", "BMGT190H/ENED290", "ENES200/ENEE200", "ENGL245/CINE245", "PSYC336/WGSS336") list every id. The advising guide lists "B SCI 150: Beyond Race"; other Scholars lists use BSCI151 for that title. BSCI150 is encoded as written.`,
    `[manual] "This list is not exhaustive. You can also propose courses not on this list to Dr. Tomblin … as long as they meet the definition of a supporting course."`,
  ],
  requirements: [
    { kind: "course", id: "cpss100", name: "Colloquium I", options: ["CPSS100"] },
    { kind: "course", id: "colloquium-ii", name: "Colloquium II or a dialogue/design course", options: ["CPSS101", "CPSP110", "IDEA311"] },
    { kind: "course", id: "practicum", name: "Practicum", options: ["CPSS220", "CPSS240", "CPSS340", "CPSP210", "CPSS270", "CPSP279T"] },
    { kind: "course", id: "capstone", name: "Capstone", options: ["CPSS225", "CPSS220"] },
    {
      kind: "choose",
      id: "supporting-course",
      name: "Supporting course",
      count: 1,
      from: { courses: SUPPORTING },
      alternatives: [
        ["AAST394", "AMST324"],
        ["ARHU230", "ENGL254", "HIST219N", "WGSS230"],
        ["BMGT190H", "ENED290"],
        ["ENES200", "ENEE200"],
        ["ENGL245", "CINE245"],
        ["PSYC336", "WGSS336"],
      ],
    },
  ],
};

export const scholarsStsMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsSTS2026.pdf" } };
