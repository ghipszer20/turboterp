// Biocomputational Engineering Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/bioengineering/biocomputational-engineering-major/;
// Biocomputational Engineering admissions page, https://biocomp.umd.edu/admissions (fetched 2026-09-28);
// and the A. James Clark School of Engineering's official Fall 2026 graduation plan,
// https://eng.umd.edu/sites/clark.umd.edu/files/resource_documents/biocomp_fall_2026_gradplan.pdf (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const biocompMajor: Program = {
  id: "biocomp-major",
  name: "Biocomputational Engineering Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Biocomputational Engineering Major; " +
    "Biocomputational Engineering admissions page, https://biocomp.umd.edu/admissions (fetched 2026-09-28); " +
    "official Fall 2026 graduation plan, " +
    "https://eng.umd.edu/sites/clark.umd.edu/files/resource_documents/biocomp_fall_2026_gradplan.pdf (fetched 2026-09-28)",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Program structure: the catalog splits requirements into 'Prior Study' (60 credits, admission prerequisites) and 'Required Courses' (60 credits, the ENBC curriculum after transitioning to the Shady Grove campus), summing to the program's 120 credits. Both are encoded as this Program's requirements (the prerequisite courses are still real courses this degree needs), except ENGL101 (Academic Writing) and the Prior Study's generic 25 gen-ed credits, which are left to the Gen Ed layer -- the official graduation plan's own two-column layout places ENGL101 and the generic 'General Ed Requirement' slots under its 'GENERAL EDUCATION REQUIREMENTS' column, separate from its 'Major Requirements @ USG' column, and every gen-ed slot is already covered by gen-ed-2026-27.ts.",
    "Department-vs-catalog difference (department page wins): the catalog's Prior Study table lists only CHEM135 (3cr) + CHEM136 (1cr) for the chemistry prerequisite. The department admissions page's transfer-equivalency table instead states 'General Chemistry for Engineers/Lab or General Chemistry and Energetics (CHEM135/136 or CHEM271/272)', adding CHEM271+CHEM272 as an accepted alternate sequence. The official graduation plan's own 'Basic Sciences' block adds a third reading: 'CHEM 135 - Chem Engr or CHEM 131+134 - Gen Chem+Princ' (with CHEM136 -- Chemistry Lab for Engr -- listed as its own row). Encoded as a `sets` choice among all three combinations: [CHEM135, CHEM136], [CHEM131, CHEM134, CHEM136], [CHEM271, CHEM272]. The CHEM131+CHEM134 option is sourced only from the graduation plan, not corroborated by the catalog or the department page.",
    "MATLAB programming course: catalog and department page both say 'BIOE241 or equivalent'; the official graduation plan places BIOE241 itself. 'Or equivalent' is a transfer-credit-equivalency allowance (the department's own transfer table maps it to different community-college courses per institution), not an enumerable UMD alternative, so it's encoded as BIOE241 only.",
    "Biology prerequisite: catalog offers BSCI170 (Principles of Molecular & Cellular Biology) or BIOE120 (Biology for Engineers); encoded as a `course` alternative. The official graduation plan uses BIOE120.",
    "Prerequisite minimum grade: the department admissions page states 'Successful completion (C- or better) of all prerequisite courses listed in the table below' -- 'the table below' is the Prior Study/prerequisite table specifically, so `minGrade: \"C-\"` is set per-requirement on those prerequisite courses only, not Program-wide (no source states a minimum grade for the ENBC/major curriculum itself).",
    "Professional Writing Requirement: the catalog's Required Courses table lists it generically ('Professional Writing Requirement | 3') as one of the 16 line items summing to the major's own 60 credits (verified: the 16 named ENBC courses sum to 45, + this 3-credit item, + the 12-credit electives, = 60 exactly). The catalog names no course. The official graduation plan and the department's own admissions page both name ENGL393 for this ('Professional Writing (PW) @USG'), and no other source ever names a different course, so it's encoded as ENGL393. The catalog's generic wording may in principle allow a different professional-writing course; no source lists one.",
    "Technical Electives: the catalog requires four technical electives (12 credits) 'selected from an approved list of engineering and biology courses; the list will be updated regularly by the program director', and directly below that text gives a 'Possible technical electives' table naming ten specific ENBC courses (403, 411, 413, 423, 435, 442, 443, 444, 445, 455). Unlike Aerospace's open-ended 'any 400-level ENAE course' wording, biocomp's own text calls this an approved list rather than an illustrative example, so it's encoded as `choose` 4 from exactly those ten course ids, not an ENBC-department number-range filter.",
    "Not encoded (owner-review.md): the elective sub-rule 'at least two ... from engineering, mathematics, or programming, ... at most two ... from biology courses' -- no source categorizes the ten listed electives into these two groups (several titles mix both, e.g. ENBC442 'Computational Molecular Dynamics', ENBC443 'Multiscale Simulation Methods'), and several of the ten titles are given in parentheses, suggesting not-yet-finalized course titles.",
    "Not encoded (owner-review.md): 'the program will arrange for opportunities for electives outside the program, including USG programs offered by other universities' -- no enumerable list of eligible outside courses exists in any source.",
    "Not encoded (owner-review.md): the official graduation plan's printed term-by-term grid shows only two 'Elective' slots (Year 4 Spring, 6 credits) even though the same document's own overview page lists four Technical Elective slots (12 credits) and the grid's own term totals sum to 113 credits -- 7 short of the plan's stated 'minimum of 120 credits'. The sample plan fixture fills all four elective slots (see sample-plans/biocomp-major.json notes) rather than reproducing the grid's apparent 2-slot shortfall verbatim.",
    "Not encoded (engine gap): the department admissions page's 2.5 minimum GPA and 60-credit/associate's-degree gate for admission to the major -- these are pre-major admission conditions, not post-admission degree requirements, and the audit has no admission-gate concept.",
    "Program GPA 2.0 encoded as minGpa.",
    "Not encoded (engine gap, matches aero precedent): the 2.00 cumulative UMD GPA; residency rules (final 30 credits at UMD, 15 of the final 30 at the 300-400 level, 12 upper-level major credits at UMD); and the 120-credit total-credit minimum. The audit checks individual requirements and per-course minGrade only.",
    "Informational only, not encoded: the department admissions page's transfer-equivalency table shows PHYS260/261 as one combined 3-credit row, while the catalog and graduation plan both separate them (PHYS260 3cr + PHYS261 1cr, 4cr total); the catalog/graduation-plan figures are used since they're the ones that matter for a current UMD student's own requirements.",
  ],
  requirements: [
    {
      kind: "sets",
      id: "chem-sequence",
      name: "General Chemistry for Engineers (with Laboratory)",
      options: [["CHEM135", "CHEM136"], ["CHEM131", "CHEM134", "CHEM136"], ["CHEM271", "CHEM272"]],
      minGrade: "C-",
    },
    { kind: "course", id: "phys161", name: "General Physics: Mechanics and Particle Dynamics", options: ["PHYS161"], minGrade: "C-" },
    { kind: "course", id: "phys260", name: "General Physics: Electricity, Magnetism and Thermodynamics", options: ["PHYS260"], minGrade: "C-" },
    { kind: "course", id: "phys261", name: "General Physics: Mechanics, Vibrations, Waves, Heat (Laboratory)", options: ["PHYS261"], minGrade: "C-" },
    { kind: "course", id: "math140", name: "Calculus I", options: ["MATH140"], minGrade: "C-" },
    { kind: "course", id: "math141", name: "Calculus II", options: ["MATH141"], minGrade: "C-" },
    { kind: "course", id: "math241", name: "Calculus III", options: ["MATH241"], minGrade: "C-" },
    { kind: "course", id: "enes100", name: "Introduction to Engineering Design", options: ["ENES100"], minGrade: "C-" },
    { kind: "course", id: "biology-intro", name: "Principles of Molecular & Cellular Biology or Biology for Engineers", options: ["BSCI170", "BIOE120"], minGrade: "C-" },
    { kind: "course", id: "matlab-course", name: "MATLAB Programming Course (BIOE241 or equivalent)", options: ["BIOE241"], minGrade: "C-" },
    { kind: "course", id: "enbc301", name: "Introduction to Biocomputational Engineering", options: ["ENBC301"] },
    { kind: "course", id: "enbc311", name: "Python for Data Analysis", options: ["ENBC311"] },
    { kind: "course", id: "enbc312", name: "Object Oriented Programming in C++", options: ["ENBC312"] },
    { kind: "course", id: "enbc321", name: "Machine Learning for Data Analysis", options: ["ENBC321"] },
    { kind: "course", id: "enbc322", name: "Algorithms", options: ["ENBC322"] },
    { kind: "course", id: "enbc331", name: "Applied Linear Systems and Differential Equations", options: ["ENBC331"] },
    { kind: "course", id: "enbc332", name: "Statistics, Data Analysis, and Data Visualization", options: ["ENBC332"] },
    { kind: "course", id: "enbc341", name: "Biomolecular Engineering Thermodynamics", options: ["ENBC341"] },
    { kind: "course", id: "enbc342", name: "Computational Fluid Dynamics and Mass Transfer", options: ["ENBC342"] },
    { kind: "course", id: "enbc351", name: "Quantitative Molecular and Cellular Biology", options: ["ENBC351"] },
    { kind: "course", id: "enbc352", name: "Molecular Techniques Laboratory", options: ["ENBC352"] },
    { kind: "course", id: "enbc353", name: "Synthetic Biology", options: ["ENBC353"] },
    { kind: "course", id: "enbc425", name: "Imaging and Image Processing", options: ["ENBC425"] },
    { kind: "course", id: "enbc431", name: "Finite Element Analysis", options: ["ENBC431"] },
    { kind: "course", id: "enbc441", name: "Computational Systems Biology", options: ["ENBC441"] },
    { kind: "course", id: "enbc491", name: "Senior Capstone Design in Biocomputational Engineering", options: ["ENBC491"] },
    { kind: "course", id: "professional-writing", name: "Professional Writing Requirement", options: ["ENGL393"] },
    {
      kind: "choose",
      id: "technical-electives",
      name: "Technical Electives (four courses; at least two engineering/math/programming, at most two biology)",
      count: 4,
      from: { courses: ["ENBC403", "ENBC411", "ENBC413", "ENBC423", "ENBC435", "ENBC442", "ENBC443", "ENBC444", "ENBC445", "ENBC455"] },
    },
  ],
};

export const biocompMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ENGR",
  short: "Biocomputational Eng.",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/bioengineering/biocomputational-engineering-major/",
    department: "https://biocomp.umd.edu/admissions",
  },
};
