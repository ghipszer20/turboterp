// Mechanical Engineering Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/mechanical-engineering/mechanical-engineering-major/;
// Department of Mechanical Engineering, Bachelor of Science page, https://enme.umd.edu/undergraduate/degrees/bachelor-science;
// Concentration Areas page, https://me.umd.edu/undergraduate/current-students/advising-support/concentration-areas;
// and the A. James Clark School of Engineering's official Fall 2026 graduation plan,
// https://eng.umd.edu/sites/clark.umd.edu/files/resource_documents/mechanical_fall_2026_gradplan.pdf (all fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const meMajor: Program = {
  id: "me-major",
  name: "Mechanical Engineering Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Mechanical Engineering Major; " +
    "Department of Mechanical Engineering, Bachelor of Science page, " +
    "https://enme.umd.edu/undergraduate/degrees/bachelor-science (fetched 2026-09-28); " +
    "Concentration Areas page, https://me.umd.edu/undergraduate/current-students/advising-support/concentration-areas (fetched 2026-09-28); " +
    "official Fall 2026 graduation plan, " +
    "https://eng.umd.edu/sites/clark.umd.edu/files/resource_documents/mechanical_fall_2026_gradplan.pdf (fetched 2026-09-28)",
  verified: false,
  reviewNotes: [
    "Chemistry: the department Bachelor of Science page's Basic Science Requirements list states 'CHEM 135 or CHEM 131 + 134 | General Chemistry for Engineers'; the catalog's own four-year table only ever shows CHEM135, and neither source lists a separate CHEM136 lab for this major (unlike chbe-major/mse-major). Not a real conflict, same treatment as mse-major: encoded as a `sets` requirement, options [['CHEM135'], ['CHEM131','CHEM134']].",
    "Technology and Consequences / Engineering Ethics: the catalog's four-year table lists 'ENES200 or ENEE 200' as its own row (Sophomore first semester, 3 credits), distinct from the generic Gen Ed rows in the same table; the official graduation plan also prints it in its Major Requirements column. Encoded as a `course` requirement with both options (same treatment as civil-major/aero-major/bioe-major/ee-major/mse-major).",
    "Professional Writing / ENGL393 -- NOT encoded, flagged for owner confirmation: the department Bachelor of Science page's 'Major Requirements - 56 Credits' list opens with 'ENGL 393 | Technical Writing', and the other 13 named ENME courses (202,272,331,332,350,351,361,371,382,392,400,462,472) plus 5 Technical Elective slots sum to exactly 56 credits only when ENGL393 is included (41 + 15 = 56), mirroring how biocomp-major's ENGL393 was confirmed by its own credit-sum check. However, the official Fall 2026 graduation plan's own two-column overview prints 'Professional Writing (PW) ENGL 39X' paired with the General Education column's other Fundamental Studies rows (ENGL101/AW, Oral Communication), not with any Major Requirements row -- the same placement civil-major/ee-major/bioe-major used to justify leaving Professional Writing to the Gen Ed layer. Left to Gen Ed here (majority precedent, covered by gen-ed-2026-27.ts); please confirm which source should win.",
    "Technical Electives (5 courses, 15 credits: 2 slots senior fall + 3 slots senior spring, per both the catalog four-year table and the official graduation plan): the graduation plan's own footnote splits these into 3 slots marked 'ENME 4XX - Tech Elective' and 2 slots marked 'ENME 4XX or TECH 4XX' (advisor-approved, any department), both footnoted 'See Mechanical Advisor for information about appropriate technical electives and approval.' The department Bachelor of Science page's own 'Technical Electives' list (ENME 442,454,489A,489C-489Z) and the Concentration Areas page's six area lists (adding ENME 406,408,410,416,421,423,424,426,427,430,431,432,436,440,444,445,461,464,465,467,470,473,476,481,483,484 and ENRE447) are all ENME 4XX courses except ENRE447 (named explicitly on the Concentration Areas 'Design and Reliability' list). Encoded as `choose` credits:15 from ENME department courses 400-499 (excluding this program's own required 400-level ENME courses: 400, 462, 472) plus ENRE447 by name. Not encoded (approved elective with no enumerable list, flagged in docs/project/owner-review.md): the 2 'ENME 4XX or TECH 4XX' slots' allowance for any other department's advisor-approved technical course beyond ENRE447 -- stricter than the source (can only produce false negatives, never false passes). The technical-electives requirement is marked advisorMayApprove.",
    "Concentration Areas (https://me.umd.edu/undergraduate/current-students/advising-support/concentration-areas) are NOT encoded as tracks or separate requirements: the page states 'You may choose to specialize in one specific area or combine multiple courses and experiences to create something unique!' -- explicitly optional and combinable, not a mandatory single-track choice, and every listed course is either already covered by the Technical Electives filter above or (ENRE447) added to it by name. No required-course changes per area.",
    "Owner ruling on CMSC131/141 and CMSC132/142 doesn't apply: neither course appears anywhere in this program's required-course list (ENME202 is the required programming/computing course).",
    "Not encoded (engine gap, flagged in docs/project/owner-review.md): the 2.0 cumulative UMD GPA requirement and Clark School residency rules (final 30 credits at UMD, 15 of the final 30 at the 300-400 level, 12 upper-level major credits at UMD) stated only in the graduation plan's boilerplate 'Requirements for Graduation' block. Total-credit minimum also not encoded: sources disagree (120 per the department page's stated minimum, 121-125 'average', 124 in the catalog's own four-year table sum, 120 per the graduation plan's own boilerplate); the audit checks individual requirements, not overall credit totals, regardless.",
  ],
  requirements: [
    { kind: "course", id: "enes100", name: "Introduction to Engineering Design", options: ["ENES100"] },
    { kind: "course", id: "enes102", name: "Mechanics I", options: ["ENES102"] },
    { kind: "course", id: "enes220", name: "Mechanics II", options: ["ENES220"] },
    { kind: "course", id: "enes221", name: "Dynamics", options: ["ENES221"] },
    { kind: "course", id: "enes232", name: "Thermodynamics", options: ["ENES232"] },
    {
      kind: "course",
      id: "enes-enee200",
      name: "Technology and Consequences / Engineering Ethics",
      options: ["ENES200", "ENEE200"],
    },
    { kind: "course", id: "math140", name: "Calculus I", options: ["MATH140"] },
    { kind: "course", id: "math141", name: "Calculus II", options: ["MATH141"] },
    { kind: "course", id: "math241", name: "Calculus III", options: ["MATH241"] },
    { kind: "course", id: "math246", name: "Differential Equations for Scientists and Engineers", options: ["MATH246"] },
    { kind: "course", id: "phys161", name: "General Physics: Mechanics and Particle Dynamics", options: ["PHYS161"] },
    { kind: "course", id: "phys260", name: "General Physics: Electricity, Magnetism and Thermodynamics", options: ["PHYS260"] },
    { kind: "course", id: "phys261", name: "General Physics: Electricity, Magnetism and Thermodynamics (Laboratory)", options: ["PHYS261"] },
    { kind: "course", id: "phys270", name: "General Physics: Modern Physics", options: ["PHYS270"] },
    { kind: "course", id: "phys271", name: "General Physics: Modern Physics (Laboratory)", options: ["PHYS271"] },
    {
      kind: "sets",
      id: "chem-lecture",
      name: "Chemistry (CHEM135, or CHEM131 and CHEM134)",
      options: [["CHEM135"], ["CHEM131", "CHEM134"]],
    },
    { kind: "course", id: "enme202", name: "Computing Fundamentals for Engineers", options: ["ENME202"] },
    { kind: "course", id: "enme272", name: "Introduction to Computer Aided Design", options: ["ENME272"] },
    { kind: "course", id: "enme331", name: "Fluid Mechanics", options: ["ENME331"] },
    { kind: "course", id: "enme332", name: "Transfer Processes", options: ["ENME332"] },
    { kind: "course", id: "enme350", name: "Electronics and Instrumentation I", options: ["ENME350"] },
    { kind: "course", id: "enme351", name: "Electronics and Instrumentation II", options: ["ENME351"] },
    { kind: "course", id: "enme361", name: "Vibration, Controls, and Optimization I", options: ["ENME361"] },
    { kind: "course", id: "enme371", name: "Product Engineering and Manufacturing", options: ["ENME371"] },
    { kind: "course", id: "enme382", name: "Introduction to Materials Engineering", options: ["ENME382"] },
    { kind: "course", id: "enme392", name: "Statistical Methods for Product and Process Development", options: ["ENME392"] },
    { kind: "course", id: "enme400", name: "Machine Design", options: ["ENME400"] },
    { kind: "course", id: "enme462", name: "Vibration, Controls, and Optimization II", options: ["ENME462"] },
    { kind: "course", id: "enme472", name: "Integrated Product and Process Development", options: ["ENME472"] },
    {
      kind: "choose",
      id: "technical-electives",
      advisorMayApprove: true,
      name: "Technical Electives (15 credits: ENME 400-level courses, or an approved non-ENME course)",
      credits: 15,
      from: {
        departments: ["ENME"],
        minNumber: 400,
        maxNumber: 499,
        exclude: ["ENME400", "ENME462", "ENME472"],
        courses: ["ENRE447"],
      },
    },
  ],
};

export const meMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ENGR",
  short: "Mech. Eng.",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/mechanical-engineering/mechanical-engineering-major/",
    department: "https://enme.umd.edu/undergraduate/degrees/bachelor-science",
  },
};
