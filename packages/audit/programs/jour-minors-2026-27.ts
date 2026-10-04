// Media, Technology and Democracy Minor, 2026–27 UMD Academic Catalog (Philip Merrill College of
// Journalism). Source: academiccatalog.umd.edu/undergraduate/colleges-schools/journalism/
// media-technology-democracy-minor/ (fetched 2026-09-28). Department page not checked.
// The Video Production and Documentary Filmmaking Minor's catalog page lists no requirements
// ("none found"); it is encoded below from the owner-pasted table (docs/project/rulings.md).
// No official published sample plan (built from the requirements below).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const jourMinorMediaTechnologyDemocracy: Program = {
  id: "jour-minor-media-technology-democracy",
  name: "Media, Technology and Democracy Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Media, Technology and Democracy Minor (Merrill College of Journalism), " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/journalism/media-technology-democracy-minor/ (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Department page not checked (encoded from the catalog only). The catalog states no sharing cap with other programs; none is set.",
    "'A grade of C- or better is required in all minor courses' -> minGrade: 'C-'.",
    "The catalog says the college may add more courses later to the elective lists; only the courses printed today are accepted.",
    "Special-topics rows accept only the named sections (JOUR458A/B/J/K/V, JOUR459I/P/Z), not other JOUR458/459 topics.",
    "Encoded as one lower-level elective (100-200 level table, which includes JOUR289I) plus three upper-level electives from their own table.",
  ],
  requirements: [
    { kind: "course", id: "jour200", name: "Journalism History, Roles and Structures", options: ["JOUR200"] },
    {
      kind: "choose",
      id: "lower-elective",
      name: "One lower-level elective",
      count: 1,
      from: {
        courses: ["JOUR150", "JOUR175", "JOUR281", "JOUR282", "JOUR283", "JOUR284", "JOUR289I"],
      },
    },
    {
      kind: "choose",
      id: "upper-electives",
      name: "Three upper-level electives",
      count: 3,
      from: {
        courses: [
          "JOUR447", "JOUR452", "JOUR453", "JOUR455", "JOUR456",
          "JOUR458A", "JOUR458B", "JOUR458J", "JOUR458K", "JOUR458V",
          "JOUR459I", "JOUR459P", "JOUR459Z",
        ],
      },
    },
  ],
};

export const jourMinorMediaTechnologyDemocracyMeta: ProgramMeta = { kind: "minor", college: "JOUR", short: "Media, Technology and Democracy", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/journalism/media-technology-democracy-minor/" } };

export const jourMinorVideoProduction: Program = {
  id: "jour-minor-video-production-documentary-filmmaking",
  name: "Video Production and Documentary Filmmaking Minor",
  catalogYear: "2026-27",
  source:
    "Owner-pasted requirements table (docs/project/rulings.md); the catalog page, " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/journalism/video-production-documentary-filmmaking-minor/ (fetched 2026-09-28), lists no requirements",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Encoded from the owner-pasted table, not the catalog (the catalog page has no requirements). Department page not checked.",
    "No grade floor stated: C- used because sibling Merrill minors state C- (rulings.md); minGrade: 'C-'.",
    "Elective row is 'two to five courses (6-15 credits)'. The audit requires the minimum (2 courses); the five-course upper limit is not enforced, extra courses simply count as extra.",
    "JOUR368T appears in both the one-of row and the elective list. Within one program each course counts once, so a JOUR368T used for the one-of row cannot also fill the elective row.",
    "No sharing cap stated; none set.",
  ],
  requirements: [
    { kind: "course", id: "jour347", name: "JOUR347", options: ["JOUR347"] },
    { kind: "choose", id: "jour281-or-402", name: "JOUR281 or JOUR402", count: 1, from: { courses: ["JOUR281", "JOUR402"] } },
    { kind: "choose", id: "jour368l-or-368t", name: "JOUR368L or JOUR368T", count: 1, from: { courses: ["JOUR368L", "JOUR368T"] } },
    {
      kind: "choose",
      id: "electives",
      name: "Two to five electives (6-15 credits)",
      count: 2,
      from: {
        courses: [
          "JOUR368E", "JOUR368O", "JOUR368I", "JOUR368J", "JOUR368U", "JOUR368T", "JOUR368X",
          "JOUR370", "JOUR383", "CINE310", "CINE415",
        ],
      },
    },
  ],
};

export const jourMinorVideoProductionMeta: ProgramMeta = { kind: "minor", college: "JOUR", short: "Video Production and Documentary Filmmaking", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/journalism/video-production-documentary-filmmaking-minor/" } };
