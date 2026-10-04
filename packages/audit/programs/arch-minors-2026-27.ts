// Artificial Intelligence in Architecture Minor and Construction Project Management Minor,
// 2026–27 UMD Academic Catalog (School of Architecture, Planning and Preservation).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/architecture-planning-preservation/
// artificial-intelligence-in-architecture-Minor/ and .../construction-project-management-minor/;
// Project Management Center for Excellence, https://pm.umd.edu/program/cpm-minor (all fetched 2026-09-28).
// No official published sample plans (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const archAiMinor: Program = {
  id: "arch-ai-minor",
  name: "Artificial Intelligence in Architecture Minor",
  catalogYear: "2026-27",
  source: "UMD Academic Catalog 2026–27, Artificial Intelligence in Architecture Minor (fetched 2026-09-28)",
  verified: false,
  reviewNotes: [
    "No department page was fetched; encoded from the catalog. Department page not checked.",
    "The catalog lists five courses (15 credits) with no 'or' and no elective choice: ARCH230, PHIL211, ARCH470, and two ARCH418 sections (ARCH418J AI and Architecture, ARCH418D AI and Sustainability). Encoded as all required.",
    "ARCH418 is a selected-topics number: the audit sees one course code, so the two required sections are checked as ONE ARCH418 course. That the student took both the J and D sections is a manual check.",
    "Catalog states no minimum grade, GPA or sharing cap; none is set.",
  ],
  requirements: [
    { kind: "course", id: "arch230", name: "AI and the Built Environment", options: ["ARCH230"] },
    { kind: "course", id: "phil211", name: "AI & Ethics", options: ["PHIL211"] },
    { kind: "course", id: "arch418", name: "Selected Topics in Architectural Technology (ARCH418J and ARCH418D; sections checked manually)", options: ["ARCH418"] },
    { kind: "course", id: "arch470", name: "Computer Applications in Architecture", options: ["ARCH470"] },
  ],
};

export const archAiMinorMeta: ProgramMeta = { kind: "minor", college: "ARCH", short: "AI in Architecture Minor", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/architecture-planning-preservation/artificial-intelligence-in-architecture-Minor/" } };

export const archConstructionProjectManagementMinor: Program = {
  id: "arch-construction-project-management-minor",
  name: "Construction Project Management Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Construction Project Management Minor (School of Architecture, Planning and Preservation; " +
    "identical table under Civil and Environmental Engineering); Project Management Center for Excellence, " +
    "https://pm.umd.edu/program/cpm-minor (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Cross-listed: the ARCH and ENGR (Civil and Environmental Engineering) catalog pages carry the same requirement table (verified by diff: only the title suffix and URL differ). Encoded once under college ARCH.",
    "Department-vs-catalog difference: the department page's elective list is ARCH430, ARCH462, ARCH467, ENCE421, ENCE422 and omits ENCE420 (Selection and Utilization of Construction Equipment), which the catalog lists. Kept ENCE420 (owner ruling in rulings.md: accept both lists).",
    "Both sources agree on the core: ENCE325, ENCE423, ENCE424, and ENCE426 or ARCH472.",
    "Program GPA 2.0 encoded as minGpa. Not encoded: a construction-industry internship (both sources; the department page says summer after junior year); eligibility from the department page (Clark School of Engineering or School of Architecture, Planning & Preservation students with at least 60 credits and a 3.0 GPA or higher).",
    "Neither source states a sharing cap, so none is set. The separate Project Management Minor (project-management-minor) is a different minor.",
  ],
  requirements: [
    { kind: "course", id: "ence325", name: "Introduction to Construction Project Management", options: ["ENCE325"] },
    { kind: "course", id: "ence423", name: "Project Planning, Estimating & Scheduling", options: ["ENCE423"] },
    { kind: "course", id: "ence424", name: "Communication for Project Managers", options: ["ENCE424"] },
    { kind: "course", id: "bim", name: "Construction Documentation and BIM (ENCE426) or BIM Communication and Collaboration (ARCH472)", options: ["ENCE426", "ARCH472"] },
    { kind: "course", id: "elective", name: "Elective", options: ["ENCE420", "ENCE421", "ENCE422", "ARCH430", "ARCH462", "ARCH467"] },
  ],
};

export const archConstructionProjectManagementMinorMeta: ProgramMeta = { kind: "minor", college: "ARCH", short: "Construction Project Mgmt. Minor", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/architecture-planning-preservation/construction-project-management-minor/", department: "https://pm.umd.edu/program/cpm-minor" } };

// History and Theory of Architecture Minor, Real Estate Development Minor and Creative Placemaking Minor
// (cross-listed ARCH + ARHU), 2026–27 UMD Academic Catalog (School of Architecture, Planning and Preservation).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/architecture-planning-preservation/
// history-theory-architecture-minor/, real-estate-development-minor/ and creative-placemaking-minor/;
// arch.umd.edu minors pages (all fetched 2026-09-28); Creative Placemaking also go.umd.edu/crpm.
// No official published sample plans (built from the requirements; see docs/project/owner-review.md).

export const archHistoryTheoryMinor: Program = {
  id: "arch-history-theory-minor",
  name: "History and Theory of Architecture Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, History and Theory of Architecture Minor; School of Architecture, Planning and Preservation, " +
    "https://arch.umd.edu/programs/undergraduate-programs/minors/history-and-theory-architecture (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Union of catalog and department lists (owner ruling). Topical courses: catalog ARCH420, 422, 423, 428, 433, 434, 435 plus department ARCH427, 429, 478 (478B Architecture in Italy). Seminars: catalog ARCH427, 428, 481, 482, 483 plus department ARCH478 (478J Adaptation) and ARCH428 (428C, 428F, 428L, 428N, 428W).",
    "Selected-topics numbers (ARCH428, ARCH478) count as one course code each: the audit cannot count two sections of ARCH428 (e.g. one topical and one seminar). ARCH428 and ARCH427 are on both lists; which slot they fill is the student's choice. Which 428/478 sections are eligible is a manual check ('consult program for eligible courses'). ARCH478 is accepted whole though only 478B and 478J are named.",
    "The 15 credits are 3 topical + 2 seminar courses; ARCH225 and ARCH226 are listed by the catalog as prerequisite courses (not in the 15 credits) and are also department eligibility conditions. Encoded as required courses.",
    "No grade floor stated by either source; C- used to match sibling ARCH minors (owner ruling).",
    "Not encoded: capstone paper with faculty supervision in one course (both sources); UMD GPA of 3.0 or higher, 60 credits and application with major-advisor approval and a thematic track (department page). Eligibility by major (Architecture and Art History and Archaeology; other majors by petition/case-by-case) is a manual note.",
    "Neither source states a sharing cap; none is set.",
  ],
  requirements: [
    { kind: "course", id: "arch225", name: "History of World Architecture I", options: ["ARCH225"] },
    { kind: "course", id: "arch226", name: "History of World Architecture II", options: ["ARCH226"] },
    {
      kind: "choose",
      id: "topical",
      name: "Three topical history of architecture courses (9 credits)",
      count: 3,
      from: { courses: ["ARCH420", "ARCH422", "ARCH423", "ARCH427", "ARCH428", "ARCH429", "ARCH433", "ARCH434", "ARCH435", "ARCH478"] },
    },
    {
      kind: "choose",
      id: "seminar",
      name: "Two architectural history/theory seminar courses (6 credits)",
      count: 2,
      from: { courses: ["ARCH427", "ARCH428", "ARCH478", "ARCH481", "ARCH482", "ARCH483"] },
    },
  ],
};

export const archHistoryTheoryMinorMeta: ProgramMeta = { kind: "minor", college: "ARCH", short: "History & Theory of Architecture Minor", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/architecture-planning-preservation/history-theory-architecture-minor/", department: "https://arch.umd.edu/programs/undergraduate-programs/minors/history-and-theory-architecture" } };

export const archRealEstateDevelopmentMinor: Program = {
  id: "arch-real-estate-development-minor",
  name: "Real Estate Development Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Real Estate Development Minor; School of Architecture, Planning and Preservation, " +
    "https://arch.umd.edu/programs/undergraduate-programs/minors/real-estate-development-minor (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Catalog and department page agree on the four core courses; the department page adds no requirement differences.",
    "Open slot 'permitted-elective' (openSlot requirement): 3 credits of one elective from the 'permitted electives' list; the list is on a separate arch.umd.edu page that was not among the sources, and the department page names only subject areas (architecture, sustainability, business, economics, political science), so the student confirms with their advisor.",
    "ARCH271/RDEV250 is one cross-listed course; either code counts. RDEV270 'can also be met' by BMGT220 or an equivalent accounting course that qualifies for transfer credit (catalog footnote): BMGT220 is accepted, transfer equivalents are a manual check. Marked advisorMayApprove (tax-accounting): other courses may count with advisor approval; only the listed courses count.",
    "Minor grade: all required courses C- or better (catalog), applied as minGrade. Program GPA 2.0 encoded as minGpa. Not encoded: application (department page): ARCH271/RDEV250 completed with C- or better before 60 credits, apply two years before intended graduation, email rdevminor@umd.edu.",
    "Neither source states a sharing cap; none is set.",
  ],
  requirements: [
    { kind: "course", id: "people-planet-profit", name: "People, Planet, and Profit: Building Sustainable Places (ARCH271/RDEV250)", options: ["ARCH271", "RDEV250"] },
    { kind: "course", id: "tax-accounting", name: "Tax and Accounting for Real Estate Development 1 (RDEV270 or BMGT220)", options: ["RDEV270", "BMGT220"], advisorMayApprove: true },
    { kind: "course", id: "rdev350", name: "Real Estate Development: Introduction to Principles, Process, and Practice", options: ["RDEV350"] },
    { kind: "course", id: "rdev450", name: "Foundations of Real Estate Finance and Investment", options: ["RDEV450"] },
    {
      kind: "openSlot",
      id: "permitted-elective",
      name: "Permitted elective",
      credits: 3,
      note: "One elective from the permitted electives list on a separate arch.umd.edu page; subject areas named are architecture, sustainability, business, economics and political science.",
    },
  ],
};

export const archRealEstateDevelopmentMinorMeta: ProgramMeta = { kind: "minor", college: "ARCH", short: "Real Estate Development Minor", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/architecture-planning-preservation/real-estate-development-minor/", department: "https://arch.umd.edu/programs/undergraduate-programs/minors/real-estate-development-minor" } };

export const archCreativePlacemakingMinor: Program = {
  id: "arch-creative-placemaking-minor",
  name: "Creative Placemaking Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Creative Placemaking Minor (School of Architecture, Planning and Preservation; identical table under Arts and Humanities); " +
    "https://arch.umd.edu/programs/undergraduate-programs/minors/creative-placemaking-minor and https://go.umd.edu/crpm (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Cross-listed: the ARCH and ARHU catalog pages carry the same requirement table (verified by diff: only the title suffix and URL differ). Encoded once under college ARCH.",
    "Department-vs-catalog differences: the architecture studio is ARCH409 in the catalog and ARCH408c (6 credits) on the department page; both accepted. Department page offers the art path as ARTT426 + ARTT427 OR two elective courses from different departments; the catalog offers ARTT426 + ARTT427 or ARHU439 (ARHU439C Studio in Creative Placemaking, repeatable to 6 credits). All three catalog paths encoded; ARHU439 is one course code, so the two required sections are a manual check.",
    "Open slot 'electives' (openSlot requirement): 6 credits of electives (catalog: 'at least 6 credits from the following list'); the list is at art.umd.edu/.../creative-placemaking-minor-electives and was not among the sources. Catalog: no more than 3 elective credits from the same department without director approval (department page: electives from different departments); special topics and independent studies need director permission; those caps are not encoded.",
    "No grade floor stated by the catalog or department page; C- used to match sibling ARCH minors (owner ruling). Department page: student in good standing (2.0) who completed at least one required minor course with 3.0 or higher; open to sophomores, juniors or seniors; application with statement of purpose and portfolio. Not encoded.",
    "Neither source states a sharing cap; none is set.",
  ],
  requirements: [
    { kind: "course", id: "arch350", name: "Intro to Creative Placemaking: Practices & Principles", options: ["ARCH350"] },
    {
      kind: "sets",
      id: "concentration",
      name: "Concentration studio (6 credits): architecture (ARCH408/ARCH409), visual arts (ARTT426 and ARTT427) or ARHU439",
      options: [["ARCH409"], ["ARCH408"], ["ARTT426", "ARTT427"], ["ARHU439"]],
    },
    {
      kind: "openSlot",
      id: "electives",
      name: "Creative Placemaking electives",
      credits: 6,
      note: "At least 6 credits from the list at art.umd.edu (creative-placemaking-minor-electives); no more than 3 from one department without director approval; special topics and independent studies need director permission.",
    },
  ],
};

export const archCreativePlacemakingMinorMeta: ProgramMeta = { kind: "minor", college: "ARCH", short: "Creative Placemaking Minor", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/architecture-planning-preservation/creative-placemaking-minor/", department: "https://arch.umd.edu/programs/undergraduate-programs/minors/creative-placemaking-minor" } };
