// Chemistry Major, Bachelor of Arts (B.A.), 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/chemistry-biochemistry/chemistry-major/;
// Department of Chemistry and Biochemistry, Chemistry BA (1905A) checksheet, effective Fall 2023
// (still current, updated 5/19/26), https://chem.umd.edu/sites/default/files/chemistryba-checksheet-f26.pdf
// (fetched 2026-09-27), cross-checked against https://chem.umd.edu/sites/default/files/chembiochbachelorprograms-f26.pdf
// (sample-plan comparison chart, fetched 2026-09-27).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const chemMajorBa: Program = {
  id: "chem-major-ba",
  name: "Chemistry Major (B.A.)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Chemistry Major; " +
    "Department of Chemistry and Biochemistry, Chemistry BA (1905A) checksheet, effective Fall 2023 (updated 5/19/26), " +
    "https://chem.umd.edu/sites/default/files/chemistryba-checksheet-f26.pdf (fetched 2026-09-27)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "The checksheet's own file is named with an '-f26' suffix like the B.S. one and was last updated 5/19/26, but its header still reads 'Effective Fall 2023' -- the B.A. curriculum apparently hasn't changed since; noted for the owner in case a newer, unpublished B.A. checksheet exists.",
    "Department-vs-catalog difference: the catalog's required-courses table lists only UNIV100 as the freshman seminar; the checksheet allows UNIV100, UNIV101, GEMS100, HONR100, HLSC100, HEIP100 or HHUM105 (note: HHUM105, not ARHU105 as on the B.S. checksheet -- each track's own list is used as printed).",
    "Lower-level chemistry sequence encoded from the checksheet's own printed table (CHEM146/177/237/247/276/272, or the transfer alternate CHEM131/132/231/232/241/242/271/277). Not encoded (footnote, engine gap): the checksheet's footnote (f) that all B.A. students must take EITHER CHEM177 or CHEM277, with an extra upper-level CHEM/BCHM credit required to make up for whichever of CHEM132/CHEM272 they took instead -- a credit-driven cross-substitution across two different requirement rows that the engine can't express. Manual check.",
    "Physical chemistry requirement is a three-way `sets` choice per the checksheet's 'Elements of Physical Chemistry I -or- Physical Chemistry 1+2' row: CHEM480 alone, or CHEM481+CHEM482, or CHEM481+BCHM485 (BCHM485 explicitly named by the checksheet as a CHEM482 substitute here, same substitution already seen on the Biochemistry major).",
    "Required Upper Level Laboratory (3-4 cr) is a four-way `sets` choice: BCHM477, CHEM425, BCHM464, or the CHEM483+CHEM484 pair together.",
    "The 100-200 level STEM elective (3-4 cr) and the upper-level CHEM/BCHM elective (3 cr) each encoded as `choose` pools from the checksheet's own named course lists; 'Other CHEM course(s) contingent on approval from the Undergraduate Director' (CHEM4XX) is not encoded (approval-gated, unbounded).",
    "Not encoded (engine gap, both sources agree): the 2.0 cumulative (university) GPA requirement. Program GPA 2.0 encoded as minGpa.",
    "Not encoded (engine gap): residency rules -- at least 30 credits at UMD, 15 of the final 30 credits at the 300-400 level, and 12 upper-level major credits at UMD. Manual check.",
  ],
  requirements: [
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
        ["CHEM146", "CHEM177", "CHEM237", "CHEM247", "CHEM276", "CHEM272"],
        ["CHEM131", "CHEM132", "CHEM231", "CHEM232", "CHEM241", "CHEM242", "CHEM271", "CHEM277"],
      ],
    },
    {
      kind: "sets",
      id: "math",
      name: "Mathematics sequence",
      options: [
        ["MATH140", "MATH141"],
        ["MATH135", "MATH136"],
      ],
    },
    {
      kind: "sets",
      id: "physics",
      name: "Physics sequence",
      options: [
        ["PHYS131", "PHYS132"],
        ["PHYS161", "PHYS260", "PHYS261"],
      ],
    },
    {
      kind: "choose",
      id: "lower-level-stem",
      name: "100-200 level STEM elective",
      credits: 3,
      from: {
        courses: [
          "ANSC101", "ASTR101", "ASTR120", "AOSC123", "AOSC200", "BSCI170", "BSCI160",
          "BIOE120", "GEOL123", "GEOL124", "GEOL212", "CMSC131", "MATH240", "MATH241", "MATH246", "ENES100", "ENES102",
        ],
      },
    },
    { kind: "course", id: "chem395", name: "Professional Issues in Chemistry and Biochemistry", options: ["CHEM395"] },
    { kind: "course", id: "chem401", name: "Inorganic Chemistry", options: ["CHEM401"] },
    { kind: "course", id: "biochemistry", name: "Biochemistry or Biochemistry of Physiology", options: ["BCHM461", "BCHM463"] },
    {
      kind: "sets",
      id: "physical-chem",
      name: "Elements of Physical Chemistry I, or Physical Chemistry I & II",
      options: [["CHEM480"], ["CHEM481", "CHEM482"], ["CHEM481", "BCHM485"]],
    },
    {
      kind: "sets",
      id: "upper-level-lab",
      name: "Required upper-level laboratory",
      options: [["BCHM477"], ["CHEM425"], ["BCHM464"], ["CHEM483", "CHEM484"]],
    },
    {
      kind: "choose",
      id: "upper-level-elective",
      name: "Upper-level CHEM/BCHM elective (3 credits)",
      credits: 3,
      from: { courses: ["CHEM399", "CHEM403", "CHEM433", "CHEM441", "CHEM460", "CHEM498", "BCHM462", "BCHM465"] },
    },
  ],
};

export const chemMajorBaMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "Chemistry (B.A.)", major: "chem", track: "B.A.", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/chemistry-biochemistry/chemistry-major/", department: "https://chem.umd.edu/sites/default/files/chemistryba-checksheet-f26.pdf" } };
