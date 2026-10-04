// College Park Scholars: Arts, citation curriculum for students entering Fall 2026.
// Source: "Arts Curriculum, Fall 2026" PDF (scholars.umd.edu, uploaded 2026-05),
// linked from https://scholars.umd.edu/about/curriculum/citation-requirements.
// Hand-transcribed (the source is a PDF, not a catalog table). UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, SCHOLARS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsArts2026.pdf";

/** "all courses with the following prefixes are approved as supporting courses" */
const APPROVED_PREFIXES = ["ARTH", "ARCH", "ARTT", "CMLT", "DANC", "ENGL", "CINE", "LARC", "MUET", "MUSC", "MUSP", "THET"];

const SUPPORTING = [
  "AAAS202", "AAAS234", "AAST351", "AAST355", "AAST440", "AASP211", "AMST204", "AMST203", "AMST320",
  "ARHU275", "ARHU158", "BMGT289B", "BMGT289E", "ENES100", "FREN242", "HISP200", "JOUR175", "JOUR370",
  "JOUR452", "PHYS102", "PHYS103", "PHYS106", "PHYS107", "URSP372", "URSP250", "WGSS275", "WMST275",
  "WGSS250",
  // Scholars-taught courses
  "CPSP210", "CPSP300", "CPSP110", "WEID138", "EDDI110", "ENES138",
];

export const scholarsArts: Program = {
  id: "scholars-arts",
  name: "College Park Scholars: Arts",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    ...SCHOLARS_CITATION_NOTES,
    `[check] Colloquia: the curriculum table lists "CPSA 100: Colloquium I", "CPSA 101: Colloquium II", "CPSA 200: Colloquium III", "C PSA 201: Colloquium IV", 1 credit each; each is a required course.`,
    `[check] Practicum: "CPSA 240: Service Learning; or CPSA 250: Research (DSSP); or CPSA 260: Peer Teaching (DSSP)", 2 credits; one of the three.`,
    `[check] Supporting courses: "Three courses (7-9 credits)", from the "Arts Supporting Course List" or any course with a prefix in "ARTH, ARCH, ARTT, CMLT, DANC, ENGL, CINE, LARC, MUET, MUSC, MUSP, THET". Encoded as 3 courses from that list or those prefixes; the 7–9 credit total is not checked. Note the program page (scholars.umd.edu/programs/arts) says "up to 6 credits of supporting courses", which differs from the PDF's 7–9.`,
    `[manual] "Supporting courses must span at least 2 disciplines (i.e. they cannot all have the same disciplinary prefix)." Not enforced.`,
    `[manual] "At least one supporting course must fulfill the Cultural Competency (DVCC) or Understanding Plural Societies (DVUP) General Education requirements." Not enforced: a Gen Ed filter can't be intersected with this list in the engine, and a plain DVCC/DVUP filter would be met by courses outside the program.`,
    `[check] "ARHU158 (various) Explorations in Arts and Humanities" is encoded as ARHU158; lettered topics (ARHU158A…) won't match until listed.`,
    `[check] "WGSS275 World Literature by Women (also WMST275, CMLT275…)": WGSS275 and WMST275 listed; CMLT is an approved prefix. "PHYS102 Physics of Music (DSNL if taken with PHYS103)": both listed separately; PHYS103 is 1 credit.`,
    `[check] "CPSP110 Bridging Divides thru Intergroup Dialogue Across Disciplines (DVCC) or alternate dialogue course (WEID138, EDDI110, ENES138, etc.)": the three named alternates are listed; "etc." is left to the student.`,
    `[manual] "All courses for Arts Leadership Minor" are approved supporting courses (tdps.umd.edu); not encoded, since the list lives on another page.`,
    `[manual] "Students may petition an alternative course to the Arts program director." / "May be fulfilled through AP, transfer, or examination credit".`,
  ],
  requirements: [
    { kind: "course", id: "cpsa100", name: "Colloquium I", options: ["CPSA100"] },
    { kind: "course", id: "cpsa101", name: "Colloquium II", options: ["CPSA101"] },
    { kind: "course", id: "cpsa200", name: "Colloquium III", options: ["CPSA200"] },
    { kind: "course", id: "cpsa201", name: "Colloquium IV", options: ["CPSA201"] },
    { kind: "course", id: "practicum", name: "Practicum (service learning, research or peer teaching)", options: ["CPSA240", "CPSA250", "CPSA260"] },
    {
      kind: "choose",
      id: "supporting-courses",
      name: "Supporting courses (three)",
      count: 3,
      from: { courses: SUPPORTING, departments: APPROVED_PREFIXES },
    },
  ],
};

export const scholarsArtsMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://scholars.umd.edu/sites/default/files/2026-05/CurriculumRequirementsArts2026.pdf" } };
