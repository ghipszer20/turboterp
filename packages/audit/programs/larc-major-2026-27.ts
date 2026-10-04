// Landscape Architecture Major (BLA), 2026-27 UMD Academic Catalog (fetched 2026-09-28).
// Source: program-sources/landscape-architecture-major.md. Catalog requirements; the department pages
// (larch.umd.edu and two faculty bios) have no requirements. Encoded by hand. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";

const c = (id: string, name: string, ...options: string[]): Requirement => ({ kind: "course", id, name, options });

export const larcMajor: Program = {
  id: "larc-major",
  name: "Landscape Architecture Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Landscape Architecture Major, https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/plant-sciences-landscape-architecture/landscape-architecture-major/ (fetched 2026-09-28); department page https://larch.umd.edu/ (fetched 2026-09-28) lists no requirements",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page (larch.umd.edu) is a homepage with no requirements; encoded from the catalog alone. Department page not checked for requirements.",
    "The catalog lists no concentrations or degree options, so this is a single program (no tracks).",
    "MATH113 'or higher level math course' is encoded as one course from all MATH courses numbered 113 or above (never narrower); which higher courses the department accepts is not stated.",
    "PLSC110 & PLSC111, and LARC265 & LARC266, are each a lecture-plus-lab pair in one catalog row; both courses of each pair are required, encoded as separate requirements.",
    "LARC389 'or Approved Study Abroad': the approved study-abroad course is not named, so only LARC389 is encoded; a student using study abroad needs a manual override.",
    "LARC Upper Level Restricted Electives (6 credits) is encoded as 2 courses from the six listed (LARC451, 452, 453, 454, 461, 470), assuming 3 credits each; credit values are not given in the catalog.",
    "Program GPA 2.0 encoded as minGpa. Not encoded (engine gap): the university-wide cumulative 2.0 GPA; 87-credit total. The C- rule is applied as the program minGrade to every requirement, including the supporting MATH and PLSC courses as the catalog states. The catalog's four-year-plan section only links the college's general roadmap page, so the sample plan is CONSTRUCTED (official: false).",
  ],
  requirements: [
    { kind: "choose", id: "math", name: "College Algebra and Trigonometry or a higher level math course (MATH113 or higher)", count: 1, from: { departments: ["MATH"], minNumber: 113 } },
    c("plsc110", "Introduction to Horticulture (PLSC110)", "PLSC110"),
    c("plsc111", "Introduction to Horticulture Laboratory (PLSC111)", "PLSC111"),
    c("plsc253", "Woody Plants for Mid-Atlantic Landscapes I (PLSC253)", "PLSC253"),
    c("plsc254", "Woody Plants for Mid-Atlantic Landscape II (PLSC254)", "PLSC254"),
    c("larc160", "Introduction to Landscape Architecture and Environmental Design (LARC160)", "LARC160"),
    c("larc263", "History of Landscape Architecture (LARC263)", "LARC263"),
    c("larc265", "Site Analysis and Ecological Principles (LARC265)", "LARC265"),
    c("larc266", "Site and Landscape Ecology Field Studies (LARC266)", "LARC266"),
    c("larc131", "Computer Visualization I (LARC131)", "LARC131"),
    c("larc230", "Design Fundamentals Studio (LARC230)", "LARC230"),
    c("larc231", "Site Planning and Design Studio (LARC231)", "LARC231"),
    c("larc330", "Urban Design Studio (LARC330)", "LARC330"),
    c("larc331", "Regional Design and GIS Studio (LARC331)", "LARC331"),
    c("larc430", "Community Design Studio (LARC430)", "LARC430"),
    c("larc471", "Capstone Praxis Studio (LARC471)", "LARC471"),
    c("larc411", "Construction Technology I: Principles of Site Engineering (LARC411)", "LARC411"),
    c("larc412", "Construction Technology II: Materials and Structures (LARC412)", "LARC412"),
    c("larc413", "Construction Technology III: Water Soil-Centric Practices (LARC413)", "LARC413"),
    c("larc220", "Landscape Visualization II (LARC220)", "LARC220"),
    c("larc221", "Digital Design Tools (LARC221)", "LARC221"),
    c("larc389", "Internship in Landscape Architecture (LARC389)", "LARC389"),
    c("larc420", "Professional Practice (LARC420)", "LARC420"),
    { kind: "choose", id: "larc-electives", name: "LARC Upper Level Restricted Electives (6 credits: two of LARC451, 452, 453, 454, 461, 470)", count: 2, from: { courses: ["LARC451", "LARC452", "LARC453", "LARC454", "LARC461", "LARC470"] } },
  ],
};

export const larcMajorMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Landscape Architecture",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/plant-sciences-landscape-architecture/landscape-architecture-major/",
    department: "https://larch.umd.edu/",
  },
};
