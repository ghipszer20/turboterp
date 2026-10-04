// Shared building blocks for the Applied Agriculture Certificate's nine concentration tracks
// (Institute of Applied Agriculture, college AGNR), 2026-27 UMD Academic Catalog. Not a program
// file itself (no `*Meta` export, so the registry generator ignores it); imported by
// inag-cert-<track>-2026-27.ts.
// Source: https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/applied-agriculture/
// (fetched 2026-09-28; hand-captured in program-sources/applied-agriculture.md). The IAA's home,
// admissions and Ag Forward pages state no course requirement, so only the catalog is encoded.
// UNVERIFIED until owner sign-off.

import type { ProgramMeta, Requirement } from "../src/audit.ts";

export const inagCatalogUrl =
  "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/applied-agriculture/";

export const inagSource =
  "UMD Academic Catalog 2026-27, Applied Agriculture Certificate, " + inagCatalogUrl +
  " (fetched 2026-09-28); no department page states requirements (see program-sources/applied-agriculture.md)";

/** One required course (or a short "or" list). */
export const inagCourse = (id: string, name: string, ...options: string[]): Requirement => ({
  kind: "course",
  id,
  name,
  options: options.length ? options : [id.toUpperCase()],
});

/** Fundamental Studies: ENGL101, INAG110 and a math course. */
export const inagFundamentalStudies: Requirement[] = [
  inagCourse("engl101", "Academic Writing (ENGL101)"),
  inagCourse("inag110", "Oral Communication (INAG110)"),
  {
    kind: "choose",
    id: "math",
    name: "MATH113, INAG104, or other math course",
    count: 1,
    from: { courses: ["MATH113", "INAG104"], departments: ["MATH", "STAT"] },
  },
];

/** Fundamental Agricultural Science where the catalog offers the full "or" list. */
export const inagScienceChoice: Requirement = {
  kind: "sets",
  id: "fundamental-science",
  name: "Fundamental Agricultural Science: INAG100, PLSC110/111, PLSC112/113, ANSC101 & ANSC103, NFSC100 or NFSC112",
  options: [["INAG100"], ["PLSC110", "PLSC111"], ["PLSC112", "PLSC113"], ["ANSC101", "ANSC103"], ["NFSC100"], ["NFSC112"]],
};

/** Environmental Stewardship: INAG100 only. */
export const inagScienceInag100: Requirement = inagCourse("inag100", "Introduction to Plant Science (INAG100)");

/** Landscape Management and Ornamental Horticulture: INAG100 or PLSC110/111. */
export const inagScienceInagOrHort: Requirement = {
  kind: "sets",
  id: "fundamental-science",
  name: "Fundamental Agricultural Science: INAG100 or PLSC110/111",
  options: [["INAG100"], ["PLSC110", "PLSC111"]],
};

/** Turf tracks: INAG100 and PLSC205 both required. */
export const inagScienceTurf: Requirement[] = [
  inagCourse("inag100", "Introduction to Plant Science (INAG100)"),
  inagCourse("plsc205", "Introduction to Turf Science and Management (PLSC205)"),
];

export const inagSoils: Requirement = inagCourse("inag105", "Soils and Fertilizers (INAG105)");
export const inagPesticide: Requirement = inagCourse("inag106", "Pesticide Use and Safety (INAG106)");
export const inagMechanics: Requirement = inagCourse("inag250", "Fundamentals of Agricultural Mechanics (INAG250)");
export const inagInternship: Requirement[] = [
  inagCourse("inag288", "Internship (INAG288)"),
  inagCourse("inag289", "Internship Experience & Professional Development (INAG289)"),
];

/** Business Management courses by id, named as the catalog names them. */
const businessNames: Record<string, string> = {
  INAG102: "Agricultural Entrepreneurship",
  INAG103: "Agricultural Marketing",
  INAG201: "Agricultural Human Resources Management",
  INAG203: "Agricultural Finance",
  INAG204: "Agricultural Business Management",
  INAG206: "Agricultural Business Law",
  INAG215: "Business Management Principles for Turf Facilities",
};

/** Required Business Management courses. */
export const inagBusiness = (...ids: string[]): Requirement[] =>
  ids.map((id) => inagCourse(id.toLowerCase(), `${businessNames[id]} (${id})`));

export const inagCommonReviewNotes: string[] = [
  "Source is the catalog alone: the Institute of Applied Agriculture's home, admissions and Ag Forward pages state no course requirement, and its own curriculum guides and two-year plans (go.umd.edu/program-plans) were not captured. Flagged in docs/project/owner-review.md.",
  "The catalog's 'concentration tracks' are encoded as separate Programs sharing major key 'inag' (kind stays 'certificate'), defaultTrack on Agricultural Business Management (first listed). Only the nine tracks the catalog lists are encoded.",
  "'MATH113 (or INAG104 or other math course)': encoded as one course from MATH113, INAG104 or any MATH or STAT course, never narrower; which other math courses the IAA accepts is not stated (flagged). The catalog calls INAG104 both 'Quantitative Applications in Agriculture' and 'Agricultural Mathematics'; same course id.",
  "'PLSC110/111', 'PLSC112/113' and 'ANSC101 & ANSC103' are lecture+lab pairs, encoded as one option each needing both courses.",
  "Not encoded (manual check): the 320-hour internship (INAG288 and INAG289 are encoded; the hours are not), the 60-credit total, any grade rule (the catalog states none), and every 'advisor-approved elective' line, which has no course list (any course may count, so leaving the credits unaudited is never narrower).",
];

export const inagTrackInfo = (track: string, isDefault = false): ProgramMeta => ({
  kind: "certificate",
  college: "AGNR",
  short: `Applied Agriculture: ${track}`,
  major: "inag",
  track,
  ...(isDefault ? { defaultTrack: true as const } : {}),
  sources: { catalog: inagCatalogUrl },
});
