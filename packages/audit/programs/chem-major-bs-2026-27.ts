// Chemistry Major, Bachelor of Science (B.S.), 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/chemistry-biochemistry/chemistry-major/;
// Department of Chemistry and Biochemistry, Chemistry BS (19050) checksheet, effective Fall 2026,
// https://chem.umd.edu/sites/default/files/chemistrybs-checksheet-f26.pdf (updated 5/19/26, fetched 2026-09-27),
// cross-checked against https://chem.umd.edu/sites/default/files/chembiochbachelorprograms-f26.pdf
// (sample-plan comparison chart, same effective term, fetched 2026-09-27).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const chemMajorBs: Program = {
  id: "chem-major-bs",
  name: "Chemistry Major (B.S.)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Chemistry Major; " +
    "Department of Chemistry and Biochemistry, Chemistry BS (19050) checksheet, effective Fall 2026, " +
    "https://chem.umd.edu/sites/default/files/chemistrybs-checksheet-f26.pdf (fetched 2026-09-27)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department-vs-catalog difference (owner ruling: follow the department page; same pattern already ruled on for Biochemistry): the catalog's required-courses table lists only UNIV100 as the freshman seminar; the department's checksheet allows UNIV100, UNIV101, GEMS100, HONR100, HLSC100, HEIP100 or ARHU105 for any incoming freshman starting as a CHEM/BCHM major. Widened to the department's list.",
    "Department-vs-catalog difference: the catalog's supporting-physics row lists only PHYS161/260/261; the checksheet's 'Supporting Courses -- Choose one Physics Sequence' also allows PHYS141/142. Encoded as a `sets` choice of the two sequences (same pattern as the Biochemistry major).",
    "Department-vs-catalog-adjacent gap (not really a disagreement -- the catalog's course-by-course table is awkward to parse for the transfer path, so the checksheet's own text is used instead): the checksheet's 'Alternate sequence for internal and external transfers' lets CHEM131/132/231/232/241/242/271/277 substitute for the standard CHEM146/177/237/247/276/277 lower-level sequence. Encoded as a second `sets` alternative; the audit can't check transfer status, so both sequences are open to every student, slightly wider than the source's transfer-only wording.",
    "Not encoded (footnote detail, engine gap): the checksheet's footnotes on CHEM177 vs CHEM132 and CHEM277 vs CHEM272 substitutions with a resulting 'extra UL CHEM elective' requirement -- credit-driven cross-substitution the engine can't express. Both lower-level sequences above already require CHEM277 (not CHEM272), matching the checksheet's baseline table exactly, so this only affects students who deviate from either printed sequence; manual check.",
    "Upper Level CHEM/BCHM Courses (18 cr) are fully required for the B.S. (unlike Biochemistry, where CHEM401 is an optional ACS add-on): CHEM395, CHEM401, CHEM425, CHEM481, CHEM483, CHEM482 and CHEM484 are all flat requirements per the checksheet.",
    "'Take at least 6 credits' upper-level CHEM/BCHM elective pool includes BCHM461 or BCHM463 (Biochemistry I or Biochemistry of Physiology) alongside CHEM399/403/433/434/441/460/498 and BCHM462/465; 'Other CHEM course(s) contingent on approval from the Undergraduate Director' (CHEM4XX/CHEM6XX) is not encoded (approval-gated, unbounded).",
    "Not encoded (engine gap, both sources agree): the 2.0 cumulative (university) GPA requirement. Program GPA 2.0 encoded as minGpa.",
    "Not encoded (engine gap): residency rules -- at least 30 credits at UMD, 15 of the final 30 credits at the 300-400 level, and 12 upper-level major credits at UMD. The audit engine has no residency/where-taken concept. Manual check.",
  ],
  requirements: [
    {
      kind: "course",
      id: "freshman-seminar",
      name: "Freshman seminar",
      options: ["UNIV100", "UNIV101", "GEMS100", "HONR100", "HLSC100", "HEIP100", "ARHU105"],
    },
    { kind: "course", id: "bsci170", name: "Principles of Molecular & Cellular Biology", options: ["BSCI170"] },
    { kind: "course", id: "biology-lab", name: "Biology Laboratory", options: ["BSCI171", "BSCI180"] },
    { kind: "course", id: "math140", name: "Calculus I", options: ["MATH140"] },
    { kind: "course", id: "math141", name: "Calculus II", options: ["MATH141"] },
    { kind: "course", id: "math241", name: "Calculus III", options: ["MATH241"] },
    {
      kind: "sets",
      id: "lower-chem",
      name: "Lower-level chemistry sequence",
      options: [
        ["CHEM146", "CHEM177", "CHEM237", "CHEM247", "CHEM276", "CHEM277"],
        ["CHEM131", "CHEM132", "CHEM231", "CHEM232", "CHEM241", "CHEM242", "CHEM271", "CHEM277"],
      ],
    },
    {
      kind: "sets",
      id: "physics",
      name: "Physics sequence",
      options: [
        ["PHYS141", "PHYS142"],
        ["PHYS161", "PHYS260", "PHYS261"],
      ],
    },
    { kind: "course", id: "chem395", name: "Professional Issues in Chemistry and Biochemistry", options: ["CHEM395"] },
    { kind: "course", id: "chem401", name: "Inorganic Chemistry", options: ["CHEM401"] },
    { kind: "course", id: "chem425", name: "Instrumental Methods of Analysis", options: ["CHEM425"] },
    { kind: "course", id: "physical-chem-1", name: "Physical Chemistry I", options: ["CHEM481"] },
    { kind: "course", id: "physical-chem-lab-1", name: "Physical Chemistry Laboratory I", options: ["CHEM483"] },
    { kind: "course", id: "physical-chem-2", name: "Physical Chemistry II", options: ["CHEM482"] },
    { kind: "course", id: "physical-chem-lab-2", name: "Physical Chemistry Laboratory II", options: ["CHEM484"] },
    {
      kind: "choose",
      id: "upper-level-elective",
      name: "Upper-level CHEM/BCHM elective (6 credits)",
      credits: 6,
      from: { courses: ["CHEM399", "CHEM403", "CHEM433", "CHEM434", "CHEM441", "CHEM460", "CHEM498", "BCHM461", "BCHM463", "BCHM462", "BCHM465"] },
    },
  ],
};

export const chemMajorBsMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "Chemistry (B.S.)", major: "chem", track: "B.S.", defaultTrack: true, sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/chemistry-biochemistry/chemistry-major/", department: "https://chem.umd.edu/sites/default/files/chemistrybs-checksheet-f26.pdf" } };
