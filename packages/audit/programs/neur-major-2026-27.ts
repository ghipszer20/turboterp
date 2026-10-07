// Neuroscience Major (CMNS), 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/biology/neuroscience-major/;
// Neuroscience at UMD, "NEUROSCIENCE Undergraduate Major" requirements sheet (updated 5/5/26),
// https://neur.umd.edu/sites/neur.umd.edu/files/NEUR%20Major%20Requirements%20Sheet%205_5_26-%20BSCI180+New%20BC%20options.pdf
// (fetched 2026-09-27), and its "Neuroscience Track Options" page 2 (same document).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

// Molecular, Cellular, and Physiological Track (0425M).
const NEUR_TRACK_MCP = [
  "ANSC327", "BCHM461", "BCHM463", "BSCI222", "HLSC322", "BSCI331", "BSCI332", "BSCI338", "BSCI339",
  "BSCI343", "BSCI356", "BSCI357", "BSCI381", "BSCI403", "BSCI410", "BSCI415", "BSCI430", "BSCI431",
  "BSCI439", "BSCI446", "BSCI450", "BSCI451", "BSCI452", "BSCI453", "BSCI456", "KNES370", "KNES462",
];
// Behavioral & Cognitive Track (0425B).
const NEUR_TRACK_BC = [
  "BSCI338", "BSCI355", "BSCI360", "BSCI401", "BSCI407", "EDHD310", "KNES385", "KNES445", "MATH243",
  "PHIL202", "PHIL366", "PSYC300", "PSYC302", "PSYC307", "PSYC310", "PSYC330", "PSYC341", "PSYC353",
  "PSYC355", "PSYC403", "PSYC404", "PSYC406", "PSYC407", "PSYC411", "PSYC414", "PSYC417", "PSYC431", "PSYC442", "PSYC489",
];
// Either track (research credit, both tracks' pages list these).
const NEUR_RESEARCH = ["NEUR379", "NEUR479"];
export const NEUR_TRACK_ALL = [...new Set([...NEUR_TRACK_MCP, ...NEUR_TRACK_BC, ...NEUR_RESEARCH])];

export const neurMajor: Program = {
  id: "neur-major",
  name: "Neuroscience Major (CMNS)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Neuroscience Major (CMNS); " +
    "Neuroscience at UMD, NEUROSCIENCE Undergraduate Major requirements sheet (updated 5/5/26), " +
    "https://neur.umd.edu/sites/neur.umd.edu/files/NEUR%20Major%20Requirements%20Sheet%205_5_26-%20BSCI180+New%20BC%20options.pdf (fetched 2026-09-27)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Posted advisor-approved substitution (owner, 2026-10-07: posted alternatives are encoded): 'BSCI399(H, L) or PSYC489(H) may be substituted with permission' (for NEUR379/NEUR479 research credits). The substitute isn't a fixed course list, so track carry advisorMayApprove (the Advisor tells the student another course may count with approval).",
    "Department-vs-catalog difference (owner ruling: follow the department page): a first WebFetch pass at the catalog page rendered the Chemistry supporting row as an OR of CHEM241&242, CHEM271&272 or MATH243. The department's own requirements sheet (a tabular, unambiguous PDF) and its current Pre-Med sample graduation plan (updated 9/30/25) both list CHEM241&242 (a Benchmark 2 gateway requirement) and CHEM271&272 (a NEUR Supporting requirement) as two SEPARATE required course pairs, with MATH243 appearing only as a Behavioral & Cognitive track elective option, never as a chemistry alternative. The department's clearer tabular sheet is used; both pairs are required flat requirements here.",
    "CMNS100 ('or similar seminar') is listed on the department sheet as 'expected of all first semester freshmen', distinct from the hard C-or-better Benchmark rows around it, and the catalog extraction didn't surface it as a requirement at all -- not encoded as a program requirement (advising expectation, not a graduation requirement per either source's own wording).",
    "Physics is a `course` choice per course-slot, not a `sets` pair, since each slot independently allows the old or new physics-sequence codes per the department's own footnote ('Prior Learning Credit for PHYS141/142 or 161, 260/262 may be substituted'): PHYS131/141/161, then PHYS132/142/260.",
    "Math sequence encoded as `sets`, per the department sheet's own footnote: 'One of three MATH sequences may be taken: MATH135&136, MATH140&135, MATH140&141' (the middle pairing is the same two courses as MATH135&140, just listed in a different order).",
    "'NEUR Track Requirements (15 credits): at least 9 credits from the student's declared track, at least one 300-400 level lab course' is encoded as a single `choose` credits:15 pool over the UNION of both tracks' course lists plus the two NEUR379/479 research-credit options. The audit has no 'declared track' concept, so the '9 credits from ONE track' split and the lab-course requirement are NOT enforced -- a plan could satisfy the 15 credits by mixing both tracks, which the real program doesn't allow. Manual check (engine gap).",
    "Footnote exclusions (both track lists, not encoded -- can't cross-reference other requirements from within a course-pool filter): 'Students may not use both ANSC327 and BSCI222/HLSC322 toward filling Neuroscience track requirements'; BSCI222/HLSC322 also can't count as the required 300-400 level lab course. Manual check.",
    "Not encoded (engine gap, both sources agree): the Limited Enrollment Program's 2.7-GPA transfer/beyond-first-semester admission criteria, and the graduation requirements' 30-credit UMD residency, 15-of-final-30-at-300-400-level, 12-upper-level-major-credits-at-UMD and 2.0 cumulative GPA rules. The audit only checks per-course minGrade. Manual check.",
  ],
  requirements: [
    { kind: "sets", id: "math-sequence", name: "Math sequence", options: [["MATH135", "MATH136"], ["MATH135", "MATH140"], ["MATH140", "MATH141"]] },
    { kind: "course", id: "bsci160", name: "Principles of Ecology and Evolution", options: ["BSCI160"] },
    { kind: "course", id: "bsci170", name: "Principles of Molecular & Cellular Biology", options: ["BSCI170"] },
    { kind: "sets", id: "biology-lab", name: "Biology laboratory", options: [["BSCI180"], ["BSCI161", "BSCI171"]] },
    { kind: "course", id: "chem131", name: "Chemistry I: Fundamentals of General Chemistry", options: ["CHEM131"] },
    { kind: "course", id: "chem132", name: "General Chemistry I Laboratory", options: ["CHEM132"] },
    { kind: "course", id: "chem231", name: "Organic Chemistry I", options: ["CHEM231"] },
    { kind: "course", id: "chem232", name: "Organic Chemistry I Laboratory", options: ["CHEM232"] },
    { kind: "course", id: "neur200", name: "Introduction to Neuroscience", options: ["NEUR200"] },
    { kind: "course", id: "psyc100", name: "Introduction to Psychology", options: ["PSYC100"] },
    { kind: "course", id: "chem241", name: "Organic Chemistry II", options: ["CHEM241"] },
    { kind: "course", id: "chem242", name: "Organic Chemistry II Laboratory", options: ["CHEM242"] },
    { kind: "course", id: "chem271", name: "General Chemistry and Energetics", options: ["CHEM271"] },
    { kind: "course", id: "chem272", name: "General Bioanalytical Chemistry Laboratory", options: ["CHEM272"] },
    { kind: "course", id: "phys-1", name: "Physics I", options: ["PHYS131", "PHYS141", "PHYS161"] },
    { kind: "course", id: "phys-2", name: "Physics II", options: ["PHYS132", "PHYS142", "PHYS260"] },
    { kind: "course", id: "neur305", name: "Neural Systems and Circuits", options: ["NEUR305"] },
    { kind: "course", id: "neur306", name: "Cellular and Molecular Neuroscience", options: ["NEUR306"] },
    { kind: "course", id: "neur405", name: "Neuroscience Laboratory", options: ["NEUR405"] },
    {
      kind: "choose",
      id: "statistics",
      name: "Statistics course",
      count: 1,
      from: { courses: ["BIOM301", "EPIB315", "PSYC200", "STAT400", "STAT464", "DATA400"] },
    },
    {
      kind: "choose",
      id: "track", advisorMayApprove: true,
      name: "NEUR Track courses (15 credits)",
      credits: 15,
      from: { courses: NEUR_TRACK_ALL },
    },
  ],
};

export const neurMajorMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "Neuroscience", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/biology/neuroscience-major/", department: "https://neur.umd.edu/sites/neur.umd.edu/files/NEUR%20Major%20Requirements%20Sheet%205_5_26-%20BSCI180+New%20BC%20options.pdf" } };
