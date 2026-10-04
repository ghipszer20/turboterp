// Aerospace Engineering Major, Astronautical Track, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/aerospace-engineering/aerospace-engineering-major/;
// Department of Aerospace Engineering, Bachelor of Science page, https://aero.umd.edu/undergraduate/degrees/bachelor-science
// (fetched 2026-09-28); and the A. James Clark School of Engineering's official Fall 2026 graduation plan,
// https://eng.umd.edu/sites/clark.umd.edu/files/resource_documents/aerospace_fall_2026_gradplan.pdf (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.
//
// Shared requirements (everything but the track-specific 4 courses and the ENAE elective exclude
// list) are duplicated from aero-major-aeronautical-2026-27.ts, same pattern as the Astronomy
// specialization files -- see reviewNotes there for the shared reasoning.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const aeroMajorAstronautical: Program = {
  id: "aero-major-astronautical",
  name: "Aerospace Engineering Major (Astronautical Track)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Aerospace Engineering Major; " +
    "Department of Aerospace Engineering, Bachelor of Science page, https://aero.umd.edu/undergraduate/degrees/bachelor-science " +
    "(fetched 2026-09-28); official Fall 2026 graduation plan, " +
    "https://eng.umd.edu/sites/clark.umd.edu/files/resource_documents/aerospace_fall_2026_gradplan.pdf (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department-vs-catalog-adjacent gap (not really a disagreement -- the department's Bachelor of Science landing page describes the curriculum only qualitatively, by year, with no course codes and rough semester groupings that don't cleanly map course-by-course): the catalog's course-by-course table (itself hard to parse -- an OCR-style export with footnote markers fused onto course codes, e.g. 'ENES1001', 'ENAE2222', 'MATH2433') and the official Fall 2026 graduation plan agree exactly with each other on every course code and its placement, so those two are used for the concrete requirements below.",
    "ENAE222 ('Aerospace Mechanics') may be satisfied by a combination of ENES102 and ENES220 instead (catalog footnote 2, confirmed by the graduation plan's '^' footnote). Encoded as a `sets` choice between the two.",
    "MATH243 ('Linear Algebra and Differential Equations') may be satisfied by a combination of MATH246 and (MATH240 or MATH461) instead (catalog footnote 3, confirmed by the graduation plan's '*' footnote). Encoded as a `sets` choice among the three combinations.",
    "Students must select a track (catalog: 'Students must select a track. All courses in either the Aeronautical or Astronautical track must be completed.'). Encoded as a separate track program, aero-major-aeronautical, sharing the major key 'aero'; the two 'ENAE Elective' slots exclude this track's own 4 required courses (404, 457, 493, 494) from counting twice, per the catalog footnote that ENAE398H or 'any 400 level ENAE course not required for the student's specific track' fills those slots.",
    "The two 'ENAE Elective' slots (catalog footnote 4) are encoded as `choose` count 2 from any ENAE course numbered 400-499 (excluding this track's own required 400-levels) plus ENAE398H by name, since the catalog's own list of 'recently offered' electives (ENAE398, ENAE415, ENAE425, ENAE471, ENAE488, ENAE499) is illustrative, not exhaustive ('The following courses have recently been offered as electives'), and any qualifying 400-level ENAE course is allowed by the requirement text itself.",
    "Not encoded (approved elective with no list, flagged in docs/project/owner-review.md): the 'Technical Elective' (catalog footnote 5: 'A 300/400 level course in Engineering, Mathematics, or Physical Sciences that has been approved for this purpose by the Undergraduate Program Director'). No enumerable course list exists in any source; the audit engine has no 'UPD-approved' concept.",
    "Program GPA 2.0 encoded as minGpa.",
    "Not encoded (engine gap, both sources agree): the 2.00 cumulative UMD GPA requirement and the minimum-grade requirements in key prerequisite courses referenced via the college-wide engineering page. The audit only checks per-course minGrade (C-).",
    "Not encoded (engine gap): residency rules -- final 30 credits at UMD, 15 of the final 30 credits at the 300-400 level, 12 of the final 30 credits as upper-level major coursework. The audit engine has no residency/where-taken concept. Manual check.",
    "Not encoded (engine gap): the 124-credit total-credit minimum. The audit checks individual requirements, not the program's overall credit total.",
  ],
  requirements: [
    { kind: "course", id: "enae100", name: "Aerospace Engineering Profession", options: ["ENAE100"] },
    { kind: "course", id: "enes100", name: "Introduction to Engineering Design", options: ["ENES100"] },
    { kind: "course", id: "math140", name: "Calculus I", options: ["MATH140"] },
    { kind: "course", id: "chem135", name: "Chemistry for Engineers", options: ["CHEM135"] },
    { kind: "course", id: "enae202", name: "Computing Fundamentals for Engineers", options: ["ENAE202"] },
    { kind: "course", id: "enes200", name: "Technology and Consequences", options: ["ENES200"] },
    { kind: "course", id: "math141", name: "Calculus II", options: ["MATH141"] },
    { kind: "course", id: "phys161", name: "General Physics I", options: ["PHYS161"] },
    { kind: "course", id: "enae203", name: "Introduction to Computer-Aided Design", options: ["ENAE203"] },
    {
      kind: "sets",
      id: "enae222",
      name: "Aerospace Mechanics",
      options: [["ENAE222"], ["ENES102", "ENES220"]],
    },
    { kind: "course", id: "enae283", name: "Introduction to Aerospace Systems", options: ["ENAE283"] },
    { kind: "course", id: "math241", name: "Calculus III", options: ["MATH241"] },
    { kind: "course", id: "phys260", name: "General Physics II", options: ["PHYS260"] },
    { kind: "course", id: "phys261", name: "General Physics II Laboratory", options: ["PHYS261"] },
    { kind: "course", id: "enae284", name: "Foundations of Aerospace Engineering II", options: ["ENAE284"] },
    { kind: "course", id: "enes232", name: "Thermodynamics", options: ["ENES232"] },
    {
      kind: "sets",
      id: "math243",
      name: "Linear Algebra and Differential Equations",
      options: [["MATH243"], ["MATH246", "MATH240"], ["MATH246", "MATH461"]],
    },
    { kind: "course", id: "phys270", name: "General Physics III", options: ["PHYS270"] },
    { kind: "course", id: "phys271", name: "General Physics III Laboratory", options: ["PHYS271"] },
    { kind: "course", id: "enae301", name: "Dynamics of Aerospace Systems", options: ["ENAE301"] },
    { kind: "course", id: "enae310", name: "Incompressible Aerodynamics", options: ["ENAE310"] },
    { kind: "course", id: "enae362", name: "Aerospace Instrumentation and Experimentation", options: ["ENAE362"] },
    { kind: "course", id: "enae380", name: "Flight Software Systems", options: ["ENAE380"] },
    { kind: "course", id: "enae325", name: "Aerospace Structures", options: ["ENAE325"] },
    { kind: "course", id: "enae364", name: "Aerospace Engineering Laboratory", options: ["ENAE364"] },
    { kind: "course", id: "enae410", name: "Compressible Aerodynamics", options: ["ENAE410"] },
    { kind: "course", id: "enae432", name: "Control of Aerospace Systems", options: ["ENAE432"] },
    { kind: "course", id: "enae423", name: "Vibration and Aeroelasticity", options: ["ENAE423"] },
    { kind: "course", id: "enae480", name: "Fundamentals of Aerospace Design", options: ["ENAE480"] },
    {
      kind: "choose",
      id: "enae-elective",
      name: "ENAE elective (two 400-level ENAE courses not required for this track, or ENAE398H)",
      count: 2,
      from: { courses: ["ENAE398H"], departments: ["ENAE"], minNumber: 400, maxNumber: 499, exclude: ["ENAE404", "ENAE457", "ENAE493", "ENAE494"] },
    },
    { kind: "course", id: "enae404", name: "Space Flight Dynamics", options: ["ENAE404"] },
    { kind: "course", id: "enae457", name: "Space Propulsion and Power", options: ["ENAE457"] },
    { kind: "course", id: "enae493", name: "Principles of Space Systems Design", options: ["ENAE493"] },
    { kind: "course", id: "enae494", name: "Space Systems Design", options: ["ENAE494"] },
  ],
};

export const aeroMajorAstronauticalMeta: ProgramMeta = {
  kind: "major",
  college: "ENGR",
  short: "Aerospace Eng. (Astronautical)",
  major: "aero",
  track: "Astronautical",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/aerospace-engineering/aerospace-engineering-major/",
    department: "https://aero.umd.edu/undergraduate/degrees/bachelor-science",
  },
};
