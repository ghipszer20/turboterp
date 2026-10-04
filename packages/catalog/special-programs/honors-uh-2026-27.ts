// Honors College: University Honors (UH).
// Sources: https://universityhonors.umd.edu/curriculum/ with the Thematic Clusters and
// Theory & Practice Tracks pages (fetched 2026-09-25). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR, HONORS_CITATION_NOTES } from "./common.ts";

export const SOURCE = "https://universityhonors.umd.edu/curriculum/";

/** UMD Fellows track: "UH Students should make sure to register for the HNUH section of their chosen UMD Fellows courses." */
const FELLOWS_TRACK = [
  "HNUH318T", "HNUH319T", "HNUH328T", "HNUH329T", "HNUH338T", "HNUH348T", "HNUH358T", "HNUH359T", "HNUH368T",
  "HNUH369T", "HNUH378T", "HNUH379T", "HNUH388T", "HNUH398T", "HNUH398P",
];

export const honorsUh: Program = {
  id: "honors-uh",
  name: "University Honors",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    ...HONORS_CITATION_NOTES,
    `[check] "Required Courses (3 credits): HNUH100: Gateway Seminar (1 credit), HNUH300: Vantage Point Seminar (2 credits)".`,
    `[check] "Elective Course Pairings (12 credits): You will complete two pairs of HNUH2xx courses of your choosing. You can either complete two Thematic Clusters, two Theory & Practice Tracks, or one Thematic Cluster and one Theory & Practice Track." Encoded as 12 credits of HNUH 200–299 courses or the HNUH sections of the UMD Fellows track (a Theory & Practice track: fall seminar HNUH3xxT plus the spring internship HNUH398P, 3–9 credits).`,
    `[manual] The pairing rule is not enforced: a Thematic Cluster is its "Required for the Cluster" course (e.g. HNUH218D) plus one "Choose One to Complete the Cluster" course (e.g. HNUH218L/M/N); a Theory & Practice track is its paired Theory and Practice courses (e.g. HNUH229I and HNUH229P). "These courses are only offered for two years at a time, with four new clusters beginning each academic year", so the pairs change yearly and are not listed here.`,
    `[manual] "Honors in Oxford" summer study abroad (a campus-partner Theory & Practice track) has no published course ids. Students counting the Fellows track in their junior year "must request an extension of the citation timeline".`,
    `[manual] HNUH300 is "Taken by all UH students in their fourth or fifth semester"; timing isn't checked.`,
  ],
  requirements: [
    { kind: "course", id: "hnuh100", name: "Gateway Seminar", options: ["HNUH100"] },
    { kind: "course", id: "hnuh300", name: "Vantage Point Seminar", options: ["HNUH300"] },
    {
      kind: "choose",
      id: "course-pairings",
      name: "Elective course pairings (two clusters or tracks, 12 credits)",
      credits: 12,
      from: { courses: FELLOWS_TRACK, departments: ["HNUH"], minNumber: 200, maxNumber: 299 },
    },
  ],
};

export const honorsUhMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://universityhonors.umd.edu/curriculum/" } };
