// Real Estate and the Built Environment Major, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/architecture-planning-preservation/real-estate-built-environment-major/
// and arch.umd.edu degree-planning page (fetched 2026-09-28); see program-sources/real-estate-built-environment-major.md.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const rebeMajor: Program = {
  id: "rebe-major",
  name: "Real Estate and the Built Environment Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Real Estate and the Built Environment Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/architecture-planning-preservation/real-estate-built-environment-major/); " +
    "School of Architecture, Planning and Preservation degree-planning page " +
    "(https://arch.umd.edu/programs/architecture/resources/student-resources/advising/undergraduate-advising/degree-planning), fetched 2026-09-28",
  verified: false,
  reviewNotes: [
    "Department page not checked: the department source is only a menu of links to 4-year plan PDFs (no requirements text, no readable plan), so only the Academic Catalog is encoded and no department-vs-catalog difference could be found.",
    "Culmination credits are '3-4' per the catalog footnote (3 with RDEV270, 2 with BMGT210 for the finance cognate); encoded as one course from the list. The finance cognate's 2-3 credit range is not tied to it, so a BMGT210 student needing 4 culmination credits is a manual check.",
    "Elective list: 'Any Cognate Course not otherwise taken to meet the REBE Cognate Credit Requirements' is encoded by adding every cognate option (RDEV270, BMGT210, RDEV440, RDEV445, ARCH270, HISP200, HISP205, URSP250, URSP372) to the pool of three; requirements consume courses, so one already used as a cognate cannot count twice. AGNR/PLCY301 (cross-listed) is one alternatives group so it counts once.",
    "Not encoded (not courses): 'Summer Study Abroad courses as appropriate' and 'Other courses related to Real Estate and the Built Environment as may be approved by the program director' (permissive; a student using them must be checked manually). Footnote: elective seats and prerequisites are not assured (advice only).",
    "Not encoded (engine gaps): GPA, total-credit minimum, residency. No minGrade set: the catalog page states none.",
    "No readable official 4-year plan (the department page only links to PDFs), so the sample plan is CONSTRUCTED from the catalog table (official: false); flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    { kind: "course", id: "rdev250", name: "People, Planet, and Profit: Building Sustainable Places (RDEV250)", options: ["RDEV250"] },
    { kind: "course", id: "rdev350", name: "Real Estate Development: Introduction to Principles, Process, and Practice (RDEV350)", options: ["RDEV350"] },
    { kind: "course", id: "rdev410", name: "Legal Foundations of Real Estate (RDEV410)", options: ["RDEV410"] },
    { kind: "course", id: "rdev415", name: "Principles, Process and Politics of Planning for Real Estate Development (RDEV415)", options: ["RDEV415"] },
    { kind: "course", id: "rdev450", name: "Foundations of Real Estate Finance and Investment (RDEV450)", options: ["RDEV450"] },
    { kind: "course", id: "rebe-finance", name: "Cognate, finance: RDEV270 or BMGT210", options: ["RDEV270", "BMGT210"] },
    { kind: "course", id: "rebe-design", name: "Cognate, architecture/design: RDEV440, RDEV445 or ARCH270", options: ["RDEV440", "RDEV445", "ARCH270"] },
    { kind: "course", id: "rebe-preservation", name: "Cognate, historic preservation: HISP200 or HISP205", options: ["HISP200", "HISP205"] },
    { kind: "course", id: "rebe-planning", name: "Cognate, urban planning: URSP250 or URSP372", options: ["URSP250", "URSP372"] },
    {
      kind: "course",
      id: "rebe-culmination",
      name: "Culmination (3-4 credits): RDEV470, RDEV471, RDEV472, RDEV473 or RDEV478",
      options: ["RDEV470", "RDEV471", "RDEV472", "RDEV473", "RDEV478"],
    },
    {
      kind: "choose",
      id: "rebe-electives",
      name: "Electives: select three courses (9 credits)",
      count: 3,
      from: {
        courses: [
          "RDEV270", "BMGT210", "RDEV440", "RDEV445", "ARCH270", "HISP200", "HISP205", "URSP250", "URSP372",
          "AASP101", "AMST205", "AMST207", "AMST262", "ARCH170", "ARCH201", "ARCH225", "ARCH226", "ARCH420", "ARCH435",
          "BMGT313", "BMGT345", "BMGT350", "BMGT382", "BMGT445", "BMGT461", "COMM330", "COMM385", "COMM425",
          "ECON200", "ECON490", "ENCE325", "ENCE420", "ENCE421", "ENCE422", "ENSP330", "ENSP340", "GVPT260", "GVPT273",
          "HIST135", "LARC452", "LARC461", "MIEH330", "MIEH331", "PHSC430", "PLCY215", "PLCY312", "PLCY313",
          "AGNR301", "PLCY301",
        ],
      },
      alternatives: [["AGNR301", "PLCY301"]],
    },
  ],
};

export const rebeMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ARCH",
  short: "Real Estate & Built Environment",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/architecture-planning-preservation/real-estate-built-environment-major/",
    department:
      "https://arch.umd.edu/programs/architecture/resources/student-resources/advising/undergraduate-advising/degree-planning",
  },
};
