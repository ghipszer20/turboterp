// Materials Science and Engineering Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/materials-science-engineering/materials-science-engineering-major/;
// Department of Materials Science and Engineering, Bachelor of Science page, https://mse.umd.edu/undergraduate/degrees/bachelor-science;
// and the A. James Clark School of Engineering's official Fall 2026 graduation plan,
// https://eng.umd.edu/sites/clark.umd.edu/files/resource_documents/materials_fall_2026_gradplan.pdf (all fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const mseMajor: Program = {
  id: "mse-major",
  name: "Materials Science and Engineering Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Materials Science and Engineering Major; " +
    "Department of Materials Science and Engineering, Bachelor of Science page, " +
    "https://mse.umd.edu/undergraduate/degrees/bachelor-science (fetched 2026-09-28); " +
    "official Fall 2026 graduation plan, " +
    "https://eng.umd.edu/sites/clark.umd.edu/files/resource_documents/materials_fall_2026_gradplan.pdf (fetched 2026-09-28)",
  verified: false,
  reviewNotes: [
    "Chemistry sequence: the department Bachelor of Science page's graduation plan block states 'CHEM 135-Chem Engr or 131 & 134 -Fund & Prin' as alternatives for the lecture course; the catalog's own four-year sample table only ever shows CHEM135. Not a real department-vs-catalog conflict (the catalog table simply doesn't mention the alternate sequence); encoded as a `sets` requirement, options [['CHEM135'], ['CHEM131','CHEM134']]. CHEM136 (Chemistry Laboratory for Engineers) is encoded as a separate, always-required course: both sources list it as its own line rather than folded into either lecture option, and the catalog's four-year table and the graduation plan's term grid both use the CHEM135+CHEM136 pairing exclusively (the CHEM131/134 alternate is never actually scheduled in either plan). Please confirm whether CHEM136 is still required alongside the CHEM131/134 alternate, since that path's own lab component (CHEM134) may make a second lab redundant.",
    "Technology and Consequences / Engineering Ethics: the catalog's four-year table lists 'ENES200 or ENEE200' as its own row (Sophomore first semester, 3 credits), distinct from the generic Gen Ed rows in the same table (matching the treatment in civil-major/aero-major/bioe-major/ee-major/compe-major, all of which keep this course as a program requirement even though it also satisfies a Humanities/Big-Question Gen Ed slot). Encoded as a `course` requirement with both options, since (unlike those other majors) this catalog explicitly offers either course interchangeably.",
    "Specialization Electives (5 courses, 15 credits): the department page states students select an 'area of specialization' -- Materials Science, Soft Materials and Biomaterials, Materials for Applications, or Materials for Energy -- and take five upper-level (junior/senior) classes in it, 'of which at least four must be ENMA classes'; the fifth may be 'other upper level engineering classes' with advisor approval. The four specialization lists themselves are entirely ENMA 4XX courses (plus two cross-listed examples, PHYS499M/ENMA489X and CHBE473/ENMA499C, which the department page itself says carry ENMA-numbered sections). Encoded as `choose` credits:15 from ENMA 400-499, excluding this program's own required 400-level ENMA courses (441, 457, 460, 461, 465, 470, 471, 487, 490) so a required course can't double as its own specialization elective. Not encoded (approved elective with no list, flagged in docs/project/owner-review.md): the allowance for the fifth specialization elective to be a non-ENMA 'other upper level engineering class' with advisor approval -- no enumerable list of eligible non-ENMA courses is given, so this program requires all five to be ENMA (stricter than the source, which can only ever produce false negatives, never false passes). The specialization-electives requirement is marked advisorMayApprove.",
    "Not encoded (approved elective with no list, flagged in docs/project/owner-review.md): the catalog's two 'Technical Elective (at or above 300 level)' slots (6 credits total) and the graduation plan's matching 'TECH 4XX - Tech. Elective**' slots, footnoted 'Students should design a course program under the guidance of their advisor.' No department or course-number list beyond the bare 300+/400+ level threshold is given (unlike chbe-major's dedicated Technical Electives page), so there is no way to encode this without an open-ended 'any course' filter.",
    "Not encoded (approved elective with no list, flagged in docs/project/owner-review.md): the catalog's 'upper-class science elective' (one of the two 'ENMA312 (Or Upper Level Science Elective)' term slots -- ENMA312 itself is a specific required course listed once in the department's Major Requirements list, so the other slot is this separate, unenumerated science elective).",
    "Not encoded (engine gap, flagged in docs/project/owner-review.md): the 2.0 cumulative UMD GPA and 'C-' or better on all major coursework (including required non-engineering courses) requirement stated in the catalog's 'Other Requirements for the Major'. The audit only checks per-course minGrade where a source states one for a specific requirement; no source here ties a minimum grade to an individual required course.",
    "Not encoded (engine gap): residency rules and the total-credit minimum (123-124 per the catalog's sample program, 'a minimum of 122 credits' per the department page, and the graduation plan's own boilerplate '120 credits' / Clark School residency block -- final 30 credits at UMD, 15 of the final 30 at the 300-400 level, 12 upper-level major credits at UMD). The audit checks individual requirements, not residency or overall credit totals; none of the conflicting total-credit figures are encoded regardless.",
    "Owner ruling on CMSC131/141 and CMSC132/142 doesn't apply: neither course appears anywhere in this program's required-course list.",
  ],
  requirements: [
    { kind: "course", id: "enes100", name: "Introduction to Engineering Design", options: ["ENES100"] },
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
    { kind: "course", id: "chem136", name: "Chemistry Laboratory for Engineers", options: ["CHEM136"] },
    {
      kind: "sets",
      id: "chem-upper",
      name: "Organic Chemistry (CHEM231 and CHEM232, or CHEM481)",
      options: [["CHEM231", "CHEM232"], ["CHEM481"]],
    },
    {
      kind: "course",
      id: "enes-enee200",
      name: "Technology and Consequences / Engineering Ethics",
      options: ["ENES200", "ENEE200"],
    },
    { kind: "course", id: "enma165", name: "Introduction to Programming for Materials Science and Engineering", options: ["ENMA165"] },
    { kind: "course", id: "enma180", name: "Materials Science and Engineering: The Field and the Future", options: ["ENMA180"] },
    { kind: "course", id: "enma300", name: "Introduction to Materials Engineering", options: ["ENMA300"] },
    { kind: "course", id: "enma301", name: "Materials Emerging Technologies", options: ["ENMA301"] },
    { kind: "course", id: "enma312", name: "Experimental Methods in Materials Science and Engineering", options: ["ENMA312"] },
    { kind: "course", id: "enma441", name: "Characterization of Materials", options: ["ENMA441"] },
    { kind: "course", id: "enma457", name: "Mechanical Properties of Materials", options: ["ENMA457"] },
    { kind: "course", id: "enma460", name: "Physics of Materials", options: ["ENMA460"] },
    { kind: "course", id: "enma461", name: "Thermodynamics of Materials", options: ["ENMA461"] },
    { kind: "course", id: "enma465", name: "Microprocessing of Materials", options: ["ENMA465"] },
    { kind: "course", id: "enma470", name: "Materials Selection for Engineering Design", options: ["ENMA470"] },
    { kind: "course", id: "enma471", name: "Kinetics", options: ["ENMA471"] },
    { kind: "course", id: "enma487", name: "Capstone Preparation", options: ["ENMA487"] },
    { kind: "course", id: "enma490", name: "Materials Design", options: ["ENMA490"] },
    {
      kind: "choose",
      id: "specialization-electives",
      advisorMayApprove: true,
      name: "Specialization Electives (15 credits of ENMA 400-level courses in one area of specialization)",
      credits: 15,
      from: {
        departments: ["ENMA"],
        minNumber: 400,
        maxNumber: 499,
        exclude: ["ENMA441", "ENMA457", "ENMA460", "ENMA461", "ENMA465", "ENMA470", "ENMA471", "ENMA487", "ENMA490"],
      },
    },
  ],
};

export const mseMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ENGR",
  short: "Materials Sci. & Eng.",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/materials-science-engineering/materials-science-engineering-major/",
    department: "https://mse.umd.edu/undergraduate/degrees/bachelor-science",
  },
};
