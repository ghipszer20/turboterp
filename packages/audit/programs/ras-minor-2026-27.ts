// Robotics and Autonomous Systems Minor (CMSC), 2026–27 UMD Academic Catalog. Administered by the
// Maryland Robotics Center (Institute for Systems Research, A. James Clark School of Engineering);
// also listed under the College of Engineering (ENGR) with an identical requirements table -- one
// interdisciplinary minor, encoded once here from its CMNS/CMSC catalog listing (same treatment as
// the Data Science Minor).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/computer-science/robotics-autonomous-systems-minor/
// (fetched 2026-09-27, catalog-generated PDF); Maryland Robotics Center,
// https://robotics.umd.edu/minor (fetched 2026-09-27; matches the catalog except for one
// additional supporting-math option, see reviewNotes). Owner ruling (docs/project/rulings.md):
// where the department page and the catalog disagree, follow the department page. No official
// published sample plan (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const rasMinor: Program = {
  id: "ras-minor",
  name: "Robotics and Autonomous Systems Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Robotics and Autonomous Systems Minor (CMSC); " +
    "Maryland Robotics Center, https://robotics.umd.edu/minor (fetched 2026-09-27)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Both sources agree on ENME480, ENAE450, ENEE467, CMSC477 required, and two electives from a shared list spanning ENME/ENEE/ENAE/CMSC courses.",
    "Department-vs-catalog difference (owner ruling: follow the department page): the catalog's supporting-math list is MATH240/340/341/461/ENEE290; the department page (robotics.umd.edu/minor) adds MATH243 (Intro to Linear Algebra and Differential Equations). MATH243 is included here.",
    "'ENME467 or ENES467' is one row on the catalog's table with an identical course title on both sides ('Engineering for Social Change') -- a genuine cross-listed pair, encoded as an alternatives pair. ENME476 has no title in the catalog's own PDF table (a blank cell); included as a bare course id since its code is otherwise listed as an elective option.",
    "The catalog names three electives by their umbrella special-topics code with the qualifying section in parentheses -- 'ENEE408 Capstone Design Project (ENEE408I Capstone Autonomous Robotics)', 'ENAE488 Topics in Aerospace Engineering (ENAE488O Introduction to Autonomous Multi-Robot Swarms)', 'CMSC498 Selected Topics in Computer Science (CMSC498E Robotics)' -- meaning only that specific section counts, not any section of the umbrella course. Encoded with the specific suffixed codes (ENEE408I, ENAE488O, CMSC498E), matching how the batch-1 Mathematics major encodes ENME489I and AOSC358L (specific sections of umbrella courses) rather than their bare parent codes.",
    "Prerequisites (MATH246 or ENES221, plus one of CMSC131/ENME202/ENAE202/ENEE150) are a declaration gate, not minor requirements themselves; not encoded (matches how the CS minor's gateway courses are kept separate from its core requirements) -- except that unlike the CS minor's gateway, these aren't restated as the minor's own Requirements here since the catalog cleanly separates 'Prerequisites' from 'Requirements' (no ambiguity to resolve).",
    "'Students may waive the supporting math course if they complete it for another minor or major' isn't encoded (the requirement itself still needs a qualifying course on the transcript; the waiver is an advising/paperwork exception).",
    "'Open only to students majoring in Aerospace Engineering, Electrical and Computer Engineering, Mechanical Engineering, or Computer Science' [manual]: an eligibility-by-major gate. Enforced via onlyOpenTo (Aerospace, Electrical Engineering, Computer Engineering, Mechanical Engineering and every Computer Science track).",
    "Department page's declaration gates (sophomore standing / 30 credits, 3.0 GPA, at least four semesters remaining before graduation) [manual]: admission conditions, not modeled. The department page separately states 'a minimum of 2.0 GPA and C- or better in all courses required for the minor' [manual]: the C- floor is the Program's minGrade; Program GPA 2.0 encoded as minGpa.",
    "'A maximum of 2 courses may be used to satisfy the requirements of both a major and a minor' -> maxSharedWith: [{ courses: 2 }].",
  ],
  requirements: [
    { kind: "course", id: "introRobotics", name: "Introduction to Robotics", options: ["ENME480"] },
    { kind: "course", id: "roboticsProgramming", name: "Robotics Programming", options: ["ENAE450"] },
    { kind: "course", id: "roboticsLab", name: "Robotics Project Laboratory", options: ["ENEE467"] },
    { kind: "course", id: "perception", name: "Robotics Perception and Planning", options: ["CMSC477"] },
    { kind: "course", id: "supportingMath", name: "Supporting math course", options: ["MATH240", "MATH243", "MATH340", "MATH341", "MATH461", "ENEE290"] },
    {
      kind: "choose",
      id: "electives",
      name: "Technical electives",
      count: 2,
      from: {
        courses: [
          "ENME400", "ENME410", "ENME413", "ENME435", "ENME441", "ENME461", "ENME467", "ENES467",
          "ENME444", "ENME476", "ENEE440", "ENEE460", "ENEE461", "ENEE425", "ENEE426", "ENEE408I",
          "ENAE380", "ENAE403", "ENAE432", "ENAE441", "ENAE488O",
          "CMSC421", "CMSC422", "CMSC426", "CMSC427", "CMSC451", "CMSC498E",
        ],
      },
      alternatives: [["ENME467", "ENES467"]],
    },
  ],
};

export const rasMinorMeta: ProgramMeta = { kind: "minor", college: "CMNS", short: "Robotics & Autonomous Systems", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/computer-science/robotics-autonomous-systems-minor/", department: "https://robotics.umd.edu/minor" }, onlyOpenTo: { programs: ["aero", "ee-major", "ee-usmsm-major", "compe", "me-major", "me-usmsm-major", "cmsc-major", "cmsc-major-cybersecurity", "cmsc-major-data-science", "cmsc-major-machine-learning", "cmsc-major-quantum-information"], reason: "Only open to Aerospace Engineering, Electrical and Computer Engineering, Mechanical Engineering or Computer Science majors." } };
