// Bioengineering Major, Bachelor of Science (B.S.), 2026-27 UMD Academic Catalog -- the four named
// Bioengineering Tracks. Each track defines its own Foundational / Elective / Breadth / Biological
// Science Elective lists, replacing the general lists used by the default track (bioe-major-2026-27.ts,
// "Bioengineering Studies (No Track)"). All core (non-elective) requirements are identical across
// tracks and to the default track's program, copied here (as aero-major-aeronautical-2026-27.ts and
// aero-major-astronautical-2026-27.ts each do) rather than imported.
// Source: Fischell Department of Bioengineering, Tracks page, https://bioe.umd.edu/undergraduate/tracks
// (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const CORE_REQUIREMENTS: Program["requirements"] = [
  { kind: "course", id: "bioe120", name: "Biology for Engineers", options: ["BIOE120"] },
  { kind: "course", id: "bioe121", name: "Biology for Engineers Laboratory", options: ["BIOE121"] },
  { kind: "course", id: "bioe221", name: "Introduction to the Bioengineering Major", options: ["BIOE221"] },
  { kind: "course", id: "bioe232", name: "Biological Thermodynamics", options: ["BIOE232"] },
  { kind: "course", id: "bioe241", name: "Biocomputation Methods", options: ["BIOE241"] },
  { kind: "course", id: "bioe246", name: "Differential Equations for Bioengineers", options: ["BIOE246"] },
  { kind: "course", id: "bioe331", name: "Biofluids", options: ["BIOE331"] },
  { kind: "course", id: "bioe340", name: "Modeling of Physiological Systems and Laboratory", options: ["BIOE340"] },
  { kind: "course", id: "bioe372", name: "Biostatistics", options: ["BIOE372"] },
  { kind: "course", id: "bioe457", name: "Biomedical Electronics and Instrumentation", options: ["BIOE457"] },
  { kind: "course", id: "bioe485", name: "Bioengineering Capstone Design I", options: ["BIOE485"] },
  { kind: "course", id: "bioe486", name: "Bioengineering Capstone Design II", options: ["BIOE486"] },
  { kind: "course", id: "math140", name: "Calculus I", options: ["MATH140"] },
  { kind: "course", id: "math141", name: "Calculus II", options: ["MATH141"] },
  { kind: "course", id: "math241", name: "Calculus III", options: ["MATH241"] },
  { kind: "course", id: "math243", name: "Introduction to Linear Algebra and Differential Equations", options: ["MATH243"] },
  { kind: "course", id: "phys161", name: "General Physics I", options: ["PHYS161"] },
  { kind: "course", id: "phys260", name: "General Physics II", options: ["PHYS260"] },
  { kind: "course", id: "phys261", name: "General Physics II Laboratory", options: ["PHYS261"] },
  { kind: "course", id: "chem136", name: "Chemistry Laboratory for Engineers", options: ["CHEM136"] },
  { kind: "course", id: "chem231", name: "Organic Chemistry I", options: ["CHEM231"] },
  { kind: "course", id: "chem232", name: "Organic Chemistry I Laboratory", options: ["CHEM232"] },
  { kind: "course", id: "enes100", name: "Introduction to Engineering Design", options: ["ENES100"] },
  { kind: "course", id: "enes102", name: "Mechanics I", options: ["ENES102"] },
  { kind: "course", id: "enes200", name: "Technology and Consequences", options: ["ENES200"] },
  { kind: "sets", id: "chem-lecture", name: "Chemistry lecture sequence", options: [["CHEM135"], ["CHEM131", "CHEM134"]] },
  { kind: "sets", id: "cell-biology", name: "Cell Biology & Physiology (with lab)", options: [["BSCI331", "BSCI332"], ["BSCI330"]] },
];

const REVIEW_NOTES_COMMON = [
  "Core (non-elective) requirements, review notes, and sources for the department-vs-catalog chemistry/cell-biology choices are identical to the default track; see bioe-major-2026-27.ts.",
  "'In no cases can one course be double-counted to fulfill multiple elective categories' (tracks page): the audit engine already consumes each completed course for at most one non-overlay requirement, so this is automatic; not separately encoded.",
  "'BIOE399 or 399H1' / 'BSCI338x1 or BSCI339x1' rows are either/or pairs (footnote 1: must be approved by the track leader / via the department's One-Time Approval form for BSCI338/339) -- encoded as `alternatives` pairs so taking both counts once. The approval-form requirement itself is an engine gap, not encoded.",
  "Electives page's 'C- or better' floor is applied to these tracks' elective requirements too (minGrade), same as the default track.",
];

// ---------------------------------------------------------------------------------------------
// Biotechnology & Therapeutics Engineering (Track Leader: Dr. Steven Jay)
// ---------------------------------------------------------------------------------------------

export const bioeMajorBiotech: Program = {
  id: "bioe-major-biotech",
  name: "Bioengineering Major (Biotechnology & Therapeutics Engineering Track)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Bioengineering Major; " +
    "Fischell Department of Bioengineering, Tracks page, https://bioe.umd.edu/undergraduate/tracks (fetched 2026-09-28)",
  verified: false,
  reviewNotes: [...REVIEW_NOTES_COMMON],
  requirements: [
    ...CORE_REQUIREMENTS,
    {
      kind: "choose",
      id: "bioe-foundational",
      name: "BIOE Foundationals (select two)",
      count: 2,
      minGrade: "C-",
      from: { courses: ["BIOE413", "BIOE461", "BIOE462"] },
    },
    {
      kind: "choose",
      id: "bioe-elective",
      name: "BIOE Electives (select four)",
      count: 4,
      minGrade: "C-",
      from: {
        courses: [
          "BIOE332", "BIOE386", "BIOE399", "BIOE399H", "BIOE411", "BIOE442", "BIOE447", "BIOE464", "BIOE474",
          "BIOE488A", "BIOE488B", "BIOE489A", "BIOE489D", "BIOE489G", "BIOE489K", "BIOE489M", "BIOE489Q", "BIOE489R", "BIOE489X",
        ],
      },
      alternatives: [["BIOE399", "BIOE399H"]],
    },
    {
      kind: "choose",
      id: "breadth-elective",
      name: "Breadth Elective (select one)",
      count: 1,
      minGrade: "C-",
      from: { courses: ["BSCI222", "HLSC322", "BSCI223", "CHEM241", "CHEM242", "CHEM271", "CHEM272"], departments: ["BIOE"], minNumber: 300, maxNumber: 499, exclude: ["BIOE413", "BIOE461", "BIOE462"] },
      alternatives: [["BSCI222", "HLSC322"], ["CHEM241", "CHEM242"], ["CHEM271", "CHEM272"]],
    },
    {
      kind: "choose",
      id: "bio-science-elective-1",
      name: "Biological Science Elective I (select two, at least one 300-level or above)",
      count: 1,
      minGrade: "C-",
      from: { courses: ["BSCI222", "HLSC322", "BSCI223", "BSCI338", "BSCI339", "BSCI353", "BSCI370", "BSCI374", "BSCI404", "BSCI410", "BSCI411", "BSCI412", "BSCI414", "BSCI416", "BSCI417", "BSCI421", "BSCI422", "BSCI424", "BSCI430", "BSCI433", "BSCI437", "BSCI443", "BSCI447", "BSCI471", "CHEM481", "CHEM482", "BCHM463"] },
      alternatives: [["BSCI222", "HLSC322"], ["BSCI338", "BSCI339"]],
    },
    {
      kind: "choose",
      id: "bio-science-elective-2",
      name: "Biological Science Elective II (300-level or above)",
      count: 1,
      minGrade: "C-",
      from: { courses: ["BSCI338", "BSCI339", "BSCI353", "BSCI370", "BSCI374", "BSCI404", "BSCI410", "BSCI411", "BSCI412", "BSCI414", "BSCI416", "BSCI417", "BSCI421", "BSCI422", "BSCI424", "BSCI430", "BSCI433", "BSCI437", "BSCI443", "BSCI447", "BSCI471", "CHEM481", "CHEM482", "BCHM463"] },
      alternatives: [["BSCI338", "BSCI339"]],
    },
  ],
};

export const bioeMajorBiotechMeta: ProgramMeta = {
  kind: "major",
  college: "ENGR",
  short: "Bioengineering (Biotechnology & Therapeutics)",
  major: "bioe",
  track: "Biotechnology & Therapeutics Engineering",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/bioengineering/bioengineering-major/",
    department: "https://bioe.umd.edu/undergraduate/tracks",
  },
};

// ---------------------------------------------------------------------------------------------
// Biomechanics & Biomaterials (Track Leader: Dr. Kimberly Stroka)
// ---------------------------------------------------------------------------------------------

export const bioeMajorBiomechanics: Program = {
  id: "bioe-major-biomechanics",
  name: "Bioengineering Major (Biomechanics & Biomaterials Track)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Bioengineering Major; " +
    "Fischell Department of Bioengineering, Tracks page, https://bioe.umd.edu/undergraduate/tracks (fetched 2026-09-28)",
  verified: false,
  reviewNotes: [
    "Posted substitution (owner, 2026-10-07): the electives page's footnote 'HLSC322 can stand in place of BSCI222 as a breadth or lower level biosci elective' -- every track's Breadth Elective and Biological Science Elective I list accepts HLSC322, paired with BSCI222 so only one counts (as in bioe-major).",
    ...REVIEW_NOTES_COMMON,
    "Unlike the Biotechnology and Pre-Health tracks, this track's page lists 'BIOE Foundationals: BIOE404 | BIOE453' with no '(Select Two)' wording -- both are required outright, encoded as two `course` requirements rather than a `choose`.",
  ],
  requirements: [
    ...CORE_REQUIREMENTS,
    { kind: "course", id: "bioe404", name: "Biomechanics", options: ["BIOE404"], minGrade: "C-" },
    { kind: "course", id: "bioe453", name: "Biomaterials", options: ["BIOE453"], minGrade: "C-" },
    {
      kind: "choose",
      id: "bioe-elective",
      name: "BIOE Electives (select four)",
      count: 4,
      minGrade: "C-",
      from: {
        courses: [
          "BIOE332", "BIOE386", "BIOE399", "BIOE399H", "BIOE411", "BIOE413", "BIOE414", "BIOE415", "BIOE416",
          "BIOE437", "BIOE442", "BIOE447", "BIOE489C", "BIOE489F", "BIOE489K", "BIOE489M", "BIOE489W",
        ],
      },
      alternatives: [["BIOE399", "BIOE399H"]],
    },
    {
      kind: "choose",
      id: "breadth-elective",
      name: "Breadth Elective (select one)",
      count: 1,
      minGrade: "C-",
      from: { courses: ["ENES221", "ENMA300", "ENME382", "ENMA442", "ENME470"], departments: ["BIOE"], minNumber: 300, maxNumber: 499, exclude: ["BIOE404", "BIOE453"] },
      alternatives: [["ENMA300", "ENME382"]],
    },
    {
      kind: "choose",
      id: "bio-science-elective-1",
      name: "Biological Science Elective I (select two, at least one 300-level or above)",
      count: 1,
      minGrade: "C-",
      from: { courses: ["BSCI222", "HLSC322", "BSCI223", "BSCI338", "BSCI339", "BSCI353", "BSCI370", "BSCI404", "BSCI410", "BCHM463", "KNES360", "KNES370"] },
      alternatives: [["BSCI222", "HLSC322"], ["BSCI338", "BSCI339"]],
    },
    {
      kind: "choose",
      id: "bio-science-elective-2",
      name: "Biological Science Elective II (300-level or above)",
      count: 1,
      minGrade: "C-",
      from: { courses: ["BSCI338", "BSCI339", "BSCI353", "BSCI370", "BSCI404", "BSCI410", "BCHM463", "KNES360", "KNES370"] },
      alternatives: [["BSCI338", "BSCI339"]],
    },
  ],
};

export const bioeMajorBiomechanicsMeta: ProgramMeta = {
  kind: "major",
  college: "ENGR",
  short: "Bioengineering (Biomechanics & Biomaterials)",
  major: "bioe",
  track: "Biomechanics & Biomaterials",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/bioengineering/bioengineering-major/",
    department: "https://bioe.umd.edu/undergraduate/tracks",
  },
};

// ---------------------------------------------------------------------------------------------
// Biomedical Instrumentation (Track Leader: Dr. Ian White)
// ---------------------------------------------------------------------------------------------

export const bioeMajorInstrumentation: Program = {
  id: "bioe-major-instrumentation",
  name: "Bioengineering Major (Biomedical Instrumentation Track)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Bioengineering Major; " +
    "Fischell Department of Bioengineering, Tracks page, https://bioe.umd.edu/undergraduate/tracks (fetched 2026-09-28)",
  verified: false,
  reviewNotes: [
    ...REVIEW_NOTES_COMMON,
    "As with Biomechanics & Biomaterials, this track's page lists 'BIOE Foundationals: BIOE420 | BIOE453' with no '(Select Two)' wording -- both required outright, encoded as two `course` requirements.",
  ],
  requirements: [
    ...CORE_REQUIREMENTS,
    { kind: "course", id: "bioe420", name: "Bioimaging", options: ["BIOE420"], minGrade: "C-" },
    { kind: "course", id: "bioe453", name: "Biomaterials", options: ["BIOE453"], minGrade: "C-" },
    {
      kind: "choose",
      id: "bioe-elective",
      name: "BIOE Electives (select four)",
      count: 4,
      minGrade: "C-",
      from: {
        courses: [
          "BIOE386", "BIOE399", "BIOE399H", "BIOE415", "BIOE431", "BIOE433", "BIOE437", "BIOE442", "BIOE447",
          "BIOE489A", "BIOE489C", "BIOE489F", "BIOE489J",
        ],
      },
      alternatives: [["BIOE399", "BIOE399H"]],
    },
    {
      kind: "choose",
      id: "breadth-elective",
      name: "Breadth Elective (select one)",
      count: 1,
      minGrade: "C-",
      from: { courses: ["ENRE447", "CMSC132", "ENES401", "ENES489P", "ENES499"], departments: ["BIOE"], minNumber: 300, maxNumber: 499, exclude: ["BIOE420", "BIOE453"] },
    },
    {
      kind: "choose",
      id: "bio-science-elective-1",
      name: "Biological Science Elective I (select two, at least one 300-level or above)",
      count: 1,
      minGrade: "C-",
      from: { courses: ["BSCI222", "HLSC322", "BSCI223", "BSCI338", "BSCI339", "BSCI353", "BSCI410", "BSCI433", "BSCI446", "BCHM463"] },
      alternatives: [["BSCI222", "HLSC322"], ["BSCI338", "BSCI339"]],
    },
    {
      kind: "choose",
      id: "bio-science-elective-2",
      name: "Biological Science Elective II (300-level or above)",
      count: 1,
      minGrade: "C-",
      from: { courses: ["BSCI338", "BSCI339", "BSCI353", "BSCI410", "BSCI433", "BSCI446", "BCHM463"] },
      alternatives: [["BSCI338", "BSCI339"]],
    },
  ],
};

export const bioeMajorInstrumentationMeta: ProgramMeta = {
  kind: "major",
  college: "ENGR",
  short: "Bioengineering (Biomedical Instrumentation)",
  major: "bioe",
  track: "Biomedical Instrumentation",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/bioengineering/bioengineering-major/",
    department: "https://bioe.umd.edu/undergraduate/tracks",
  },
};

// ---------------------------------------------------------------------------------------------
// Pre-Health Professions (no track leader; page presents this as a "Sample Program")
// ---------------------------------------------------------------------------------------------

export const bioeMajorPreHealth: Program = {
  id: "bioe-major-prehealth",
  name: "Bioengineering Major (Pre-Health Professions Track)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Bioengineering Major; " +
    "Fischell Department of Bioengineering, Tracks page, https://bioe.umd.edu/undergraduate/tracks (fetched 2026-09-28)",
  verified: false,
  reviewNotes: [
    ...REVIEW_NOTES_COMMON,
    "The tracks page heads this track's course list 'Sample Program', not 'Requirements' like the other three tracks, and says students should consult the Reed-Yorke Health Professions Advising Office for specific recommendations -- so this may be illustrative rather than fixed. Encoded as given since it's the only list the department publishes for this track; flagged in docs/project/owner-review.md.",
    "BIOE Electives for this track are given only as 'BIOE3xx+ Any BIOE course 3xx or higher' -- the same general rule as the default track's elective pool, so encoded the same way (any 300-499 BIOE course excluding core/foundational courses).",
  ],
  requirements: [
    ...CORE_REQUIREMENTS,
    {
      kind: "choose",
      id: "bioe-foundational",
      name: "BIOE Foundationals (select two)",
      count: 2,
      minGrade: "C-",
      from: { courses: ["BIOE404", "BIOE413", "BIOE420", "BIOE453", "BIOE461", "BIOE462"] },
    },
    {
      kind: "choose",
      id: "bioe-elective",
      name: "BIOE Elective (any BIOE course 3xx or higher, select four)",
      count: 4,
      minGrade: "C-",
      from: { departments: ["BIOE"], minNumber: 300, maxNumber: 499, exclude: ["BIOE331", "BIOE340", "BIOE372", "BIOE457", "BIOE485", "BIOE486", "BIOE404", "BIOE413", "BIOE420", "BIOE453", "BIOE461", "BIOE462", "BIOE389", "BIOE489H"] },
    },
    { kind: "course", id: "breadth-elective", name: "Breadth Elective", options: ["CHEM241"], minGrade: "C-" },
    {
      kind: "choose",
      id: "bio-science-elective-1",
      name: "Biological Science Elective I (select two, at least one 300-level or above)",
      count: 1,
      minGrade: "C-",
      from: { courses: ["BSCI222", "HLSC322", "BSCI223", "CHEM271", "CHEM272", "BCHM463"] },
      alternatives: [["BSCI222", "HLSC322"], ["CHEM271", "CHEM272"]],
    },
    {
      kind: "choose",
      id: "bio-science-elective-2",
      name: "Biological Science Elective II (300-level or above)",
      count: 1,
      minGrade: "C-",
      from: { courses: ["CHEM271", "CHEM272", "BCHM463"] },
      alternatives: [["CHEM271", "CHEM272"]],
    },
  ],
};

export const bioeMajorPreHealthMeta: ProgramMeta = {
  kind: "major",
  college: "ENGR",
  short: "Bioengineering (Pre-Health Professions)",
  major: "bioe",
  track: "Pre-Health Professions",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/bioengineering/bioengineering-major/",
    department: "https://bioe.umd.edu/undergraduate/tracks",
  },
};
