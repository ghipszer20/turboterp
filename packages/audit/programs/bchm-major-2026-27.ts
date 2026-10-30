// Biochemistry Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/chemistry-biochemistry/biochemistry-major/;
// Department of Chemistry and Biochemistry, Biochemistry BS (04140) checksheet effective Fall 2026,
// https://chem.umd.edu/sites/default/files/biochemistrybs-checksheet-f26.pdf (fetched 2026-09-27),
// cross-checked against https://chem.umd.edu/sites/default/files/chembiochbachelorprograms-f26.pdf
// (sample-plan comparison chart, same effective term). Owner ruling (docs/project/rulings.md):
// where the department page and the catalog disagree, follow the department page; each such
// difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const bchmMajor: Program = {
  id: "bchm-major",
  name: "Biochemistry Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Biochemistry Major; " +
    "Department of Chemistry and Biochemistry, Biochemistry BS (04140) checksheet, " +
    "https://chem.umd.edu/sites/default/files/biochemistrybs-checksheet-f26.pdf (fetched 2026-09-27)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Department-vs-catalog difference (owner ruling: follow the department page): the catalog's required-courses table lists only UNIV100 as the freshman seminar; the department's checksheet allows UNIV100, UNIV101, GEMS100, HONR100, HLSC100, HEIP100 or ARHU105 for any incoming freshman starting as a CHEM/BCHM major. Widened to the department's list.",
    "Department-vs-catalog difference (owner ruling: follow the department page): the catalog's supporting-physics row lists only PHYS161/260/261; the checksheet's 'Supporting Courses – Choose one Physics Sequence' also allows PHYS141/142. Encoded as a `sets` choice of the two sequences.",
    "Department-vs-catalog-adjacent gap the engine can't express as narrowly as the source states (not really a disagreement -- the catalog says nothing about a transfer path at all): the checksheet's 'Alternate sequence for internal and external transfers' lets CHEM131/132/231/232/241/242/271/277 substitute for the standard CHEM146/177/237/247/276/277 lower-level sequence. Encoded as a second `sets` alternative for the lower-level chemistry requirement; the audit has no way to check transfer status, so both sequences are open to every student, slightly wider than the source's transfer-only wording.",
    "Department-vs-catalog difference (owner ruling: follow the department page): the catalog lists BCHM485 (Physical Biochemistry) as a flat requirement; the checksheet's Upper Level CHEM/BCHM table shows 'Physical Biochemistry OR Physical Chemistry II: BCHM485 (Spring only) OR CHEM482'. CHEM482 added as an alternative.",
    "Department-vs-catalog difference (owner ruling: follow the department page): the catalog's 'Approved biological science courses (6 credits)' is a single flat line; the checksheet splits it into two specific 'take at least one' lists: a lower-level BSCI course (3-4 credits: BSCI207, BSCI222, BSCI223, BSCI283, or BSCI330 -- or BSCI331 and BSCI332 together) and an upper-level BSCI course (3-4 credits, one of 16 named BSCI3xx/4xx courses). Encoded as two separate requirements (6-8 credits total) instead of the catalog's flat 6.",
    "CHEM401 (Inorganic Chemistry), noted on the checksheet 'For Certification by the American Chemical Society (not required for Biochemistry major)', is not encoded -- it's an optional add-on, not a major requirement.",
    "Not encoded (engine gap, not a department-vs-catalog disagreement -- both sources state it): a 2.0 average GPA across major courses ('Major courses require a \"C-\" or better in each and a 2.0 average GPA'); the audit engine has no major-GPA concept, only per-course minGrade. Manual check.",
    "Not encoded (engine gap): residency rules from the checksheet's 'Additional requirements' -- at least 30 credits earned at UMD, 15 of the final 30 credits at the 300-400 level, and 12 upper-level major credits earned at UMD. The audit engine has no residency/where-taken concept. Manual check.",
    "The checksheet's footnote (e) on the comparison chart ('BCHM 463 can substitute for BCHM 461') is superscripted only on the Chemistry B.A. plan's use of BCHM461, not on the Biochemistry major's own BCHM461 requirement; not applied here.",
  ],
  requirements: [
    { kind: "course", id: "math140", name: "Calculus I", options: ["MATH140"] },
    { kind: "course", id: "math141", name: "Calculus II", options: ["MATH141"] },
    { kind: "course", id: "math241", name: "Calculus III", options: ["MATH241"] },
    {
      kind: "course",
      id: "freshman-seminar",
      name: "Freshman seminar",
      options: ["UNIV100", "UNIV101", "GEMS100", "HONR100", "HLSC100", "HEIP100", "HHUM105"],
    },
    {
      kind: "sets",
      id: "lower-chem",
      name: "Lower-level chemistry sequence",
      options: [
        ["CHEM146", "CHEM177", "CHEM237", "CHEM247", "CHEM276", "CHEM277"],
        ["CHEM131", "CHEM132", "CHEM231", "CHEM232", "CHEM241", "CHEM242", "CHEM271", "CHEM277"],
      ],
    },
    { kind: "course", id: "bsci170", name: "Principles of Molecular & Cellular Biology", options: ["BSCI170"] },
    { kind: "course", id: "biology-lab", name: "Biology Laboratory", options: ["BSCI171", "BSCI180"] },
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
    { kind: "course", id: "chem425", name: "Instrumental Methods of Analysis", options: ["CHEM425"] },
    { kind: "course", id: "physical-chem-1", name: "Physical Chemistry I", options: ["CHEM481"] },
    { kind: "course", id: "physical-chem-lab-1", name: "Physical Chemistry Laboratory I", options: ["CHEM483"] },
    // Department page (see review notes): CHEM482 (Physical Chemistry II) may substitute for BCHM485.
    { kind: "course", id: "physical-biochem", name: "Physical Biochemistry or Physical Chemistry II", options: ["BCHM485", "CHEM482"] },
    { kind: "course", id: "bchm461", name: "Biochemistry I", options: ["BCHM461"] },
    { kind: "course", id: "bchm462", name: "Biochemistry II", options: ["BCHM462"] },
    { kind: "course", id: "bchm465", name: "Biochemistry III", options: ["BCHM465"] },
    { kind: "course", id: "bchm464", name: "Biochemistry Laboratory", options: ["BCHM464"] },
    {
      kind: "sets",
      id: "bsci-lower-elective",
      name: "Lower-level BSCI elective",
      options: [["BSCI207"], ["BSCI222"], ["BSCI223"], ["BSCI283"], ["BSCI330"], ["BSCI331", "BSCI332"]],
    },
    {
      kind: "course",
      id: "bsci-upper-elective",
      name: "Upper-level BSCI elective",
      options: [
        "BSCI353", "BSCI410", "BSCI411", "BSCI420", "BSCI421", "BSCI422", "BSCI424", "BSCI430",
        "BSCI433", "BSCI434", "BSCI437", "BSCI442", "BSCI443", "BSCI447", "BSCI450", "BSCI471",
      ],
    },
  ],
};

export const bchmMajorMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "Biochemistry", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/chemistry-biochemistry/biochemistry-major/", department: "https://chem.umd.edu/sites/default/files/biochemistrybs-checksheet-f26.pdf" } };
