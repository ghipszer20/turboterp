// College Park Scholars: Environment, Technology and Economy (Fall 2026 curriculum PDF).
// Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, SCHOLARS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsETE2026_0.pdf";

/** "Environment, Technology and Economy Fall 2026 Supporting Course List" */
const SUPPORTING = [
  "AAAS230", "AGNR301", "AMST250", "ANSC227", "ANSC252", "ANTH222", "ANTH242", "ANTH266", "ANTH298E", "ANTH322",
  "AOSC123", "AOSC200", "AOSC375", "ARCH170", "ARCH271", "ARCH272", "AREC200", "AREC210", "AREC240", "AREC241",
  "AREC254", "AREC306", "AREC345", "AREC365", "AREC280", "ARTH260", "ARTH265", "ARTH488G", "BIOE120", "BMGT207",
  "BMGT289A", "BMGT289B", "BMGT289E", "BMGT370", "BMGT372", "BSCI124", "BSCI126", "BSCI135", "BSCI145", "BSCI151",
  "BSCI160", "BSCI361", "BSCI363", "BSOS240", "BSOS388T", "CCJS325", "CHBE102", "CMLT270", "CPSP110", "CPSP210",
  "CPSP220", "CPSS220", "CPSS240", "CPSS340", "DATA200", "ECON181", "ECON185", "EDDI300", "EDHI488E", "ENCE215",
  "ENEE200", "ENES200", "ENGL133", "ENGL293", "ENGL378", "ENGL398V", "ENMA150", "ENMA201", "ENSP101", "ENSP102",
  "ENSP250", "ENSP330", "ENSP340", "ENST100", "ENST140", "ENST200", "ENST214", "ENST233", "ENST281", "FMSC190S",
  "GBHL200", "GEOG110", "GEOG130", "GEOG140", "GEOG170", "GEOG201", "GEOG202", "GEOG330", "GEOG332", "GEOG372",
  "GEOG373", "GEOL100", "GEOL104", "GEOL120", "GEOL123", "GEOL124", "GEOL200", "GEOL204", "GVPT200", "GVPT205S",
  "GVPT206", "GVPT221", "GVPT282", "GVPT306", "HESI217", "HISP200", "HIST131", "HIST205", "HIST206", "HIST289R",
  "HIST338L", "HIST338R", "HNUH218V", "IMMR200", "INAG100", "INAG102", "INAG103", "INAG110", "INAG123", "INST152",
  "JOUR175", "LARC151", "LARC160", "LARC162", "LARC263", "MIEH300", "MIEH331", "NFSC112", "PHIL261", "PHYS105",
  "PLCY215", "PLCY380", "PHYS235", "PLSC110", "PLSC112", "PLSC115", "PLSC120", "PLSC125", "PLSC203", "PLSC226",
  "PLSC303", "URSP250", "WEID139", "WGSS250", "WGSS330",
];

export const scholarsEte: Program = {
  id: "scholars-ete",
  name: "College Park Scholars: Environment, Technology and Economy",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    ...SCHOLARS_CITATION_NOTES,
    `[check] Courses: "CPET 100: Colloquium I; CPET 101: Colloquium II (DSSP, DVUP); CPET 200: Colloquium III; CPET 230: Internship; or CPET 240: Service-Learning; or CPET 250: Research". The PDF's semester and credit columns are misaligned; credits are not quoted.`,
    `[check] Supporting courses: "Select from list of approved courses (see below) Two courses (6 credits)". Encoded as two courses from the Fall 2026 list; the 6-credit total isn't checked. Lab pairings in the list ("AOSC200 … (*with AOSC201)", "BSCI124 (*if taken with BSCI125)") only affect Gen Ed, so the labs are not listed.`,
    `[manual] "A special exception will be granted for an AP Environmental Science score of 4 or higher" and IB credit "on a case by case basis". Not encoded until AP credit import exists.`,
    `[manual] "Students may petition an alternative course to the ETE program director."`,
  ],
  requirements: [
    { kind: "course", id: "cpet100", name: "Colloquium I", options: ["CPET100"] },
    { kind: "course", id: "cpet101", name: "Colloquium II", options: ["CPET101"] },
    { kind: "course", id: "cpet200", name: "Colloquium III", options: ["CPET200"] },
    { kind: "course", id: "practicum", name: "Practicum (internship, service-learning or research)", options: ["CPET230", "CPET240", "CPET250"] },
    { kind: "choose", id: "supporting-courses", name: "Supporting courses (two)", count: 2, from: { courses: SUPPORTING } },
  ],
};

export const scholarsEteMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsETE2026_0.pdf" } };
