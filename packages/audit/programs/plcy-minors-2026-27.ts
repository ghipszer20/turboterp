// School of Public Policy minors, 2026-27 UMD Academic Catalog: Science, Technology, Ethics and
// Policy (cross-listed ENGR + INFO + PLCY, encoded once here), Public Leadership, and Nonprofit
// Leadership and Social Innovation.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/public-policy/<minor>/ and the
// School of Public Policy pages (spp.umd.edu), all fetched 2026-09-28. Owner ruling
// (docs/project/rulings.md): where the department page and the catalog disagree, follow the
// department page; where it lists fewer options, accept the union.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const CATALOG = "https://academiccatalog.umd.edu/undergraduate/colleges-schools/public-policy/";

/** Course numbers of 300 or above (level is fixed by the code), for the "9 credits at 300-400" overlays. */
const upper = (codes: string[]): string[] => codes.filter((c) => Number(/\d{3}/.exec(c)![0]) >= 300);

// ---------------------------------------------------------------------------------------------
// Science, Technology, Ethics and Policy Minor
// ---------------------------------------------------------------------------------------------

export const plcyMinorStep: Program = {
  id: "plcy-minor-step",
  name: "Science, Technology, Ethics and Policy Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Science, Technology, Ethics and Policy Minor " +
    `(${CATALOG}science-technology-ethics-policy-minor/); School of Public Policy STEP Minor page, ` +
    "https://spp.umd.edu/science-technology-ethics-and-policy-step-minor (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Cross-listed minor: the same requirement table appears under ENGR, INFO and PLCY catalog pages (the three pages differ only in their title line, checked by diff). Encoded once, under PLCY (main college per the owner ruling).",
    "Open slot 'step-electives' (openSlot requirement): 9 credits (3 courses) of STEP electives, at least 6 credits at 300-400 level; the catalog says 'see website' and the department page's elective list isn't in the fetched text, so no list is published and the student confirms it with their advisor (the 300-400 rule is in the slot note, not enforced).",
    "Two tracks (Track 1 capstone ENES440, Track 2 SSRD capstone ENES401) share ENES240 and differ only in the capstone and the elective list; encoded as one program with the capstone as ENES440 or ENES401. The department page says ENES401 is only for students in the SSRD concentration who took at least 2 SSRD electives; not checked.",
    "ENES240 is also PLCY240 (department page: 'ENES 240/PLCY 240'); both accepted. ENES240 needs a B- to register for ENES440 or ENES401 (catalog footnote), encoded as a B- minimum on ENES240 alone.",
    "No overall grade floor is stated in either source while sibling minors state C-; C- applied by owner ruling.",
    "Department page's sequencing rules (ENES240 and three electives before the capstone; 60 credits before ENES440; capstone last or concurrent with the last elective) are not encoded.",
    "Department FAQ: 'up to two courses that satisfy both major and STEP' -> maxSharedWith [{ courses: 2 }]. 'If a student has a second minor, they cannot use a course for both' is not encoded (no per-kind sharing limit).",
    "Manual, not encoded: 2.5 cumulative GPA to apply; application and mandatory advising; cohort cap of 55 students per graduating year with a waitlist; at least 3 semesters remaining at entry.",
  ],
  requirements: [
    {
      kind: "course",
      id: "core",
      name: "Ethical, Policy and Social Implications of Science and Technology (B- required)",
      options: ["ENES240", "PLCY240"],
      minGrade: "B-",
    },
    {
      kind: "course",
      id: "capstone",
      name: "Capstone: ENES440 (Track 1) or ENES401 (Track 2, SSRD concentration)",
      options: ["ENES440", "ENES401"],
    },
    {
      kind: "openSlot",
      id: "step-electives",
      name: "STEP electives",
      credits: 9,
      note: "Three STEP elective courses, at least 6 credits at the 300-400 level; the list is on the SPP STEP minor page (spp.umd.edu/science-technology-ethics-and-policy-step-minor); confirm with your advisor.",
    },
  ],
};

// ---------------------------------------------------------------------------------------------
// Public Leadership Minor
// ---------------------------------------------------------------------------------------------

const PL_CORE = ["PLCY201", "PLCY302"];
const PL_LIST = [
  "PLCY288A", "PLCY309", "PLCY311", "PLCY313", "PLCY380", "PLCY388A", "PLCY388F",
  "AASP101", "AASP314", "AMST202", "AMST212", "FGSM310", "FGSM315", "HESI318", "HESI418", "HIST222",
  "LASC234", "LASC235", "LEAD217", "LEAD315", "PSYC221", "PSYC362", "PSYC424", "SOCY432", "SOCY425", "WMST425",
];

export const plcyMinorPublicLeadership: Program = {
  id: "plcy-minor-public-leadership",
  name: "Public Leadership Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Public Leadership Minor " +
    `(${CATALOG}public-leadership-minor/); School of Public Policy Minors page, ` +
    "https://spp.umd.edu/your-education/undergraduate/minors (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Catalog: 3 credits core (PLCY201 or PLCY302) plus 12 credits from an approved list it doesn't print. Department page: 3 credits core, 6 credits signature, 6 credits elective, with one list of courses after the core pair. The page doesn't say which listed courses are 'signature' and which 'elective', so the 6/6 split is not encoded; all 12 credits come from the one list (union of both sources).",
    "PLCY201 and PLCY302 are also accepted in the 12-credit pool (a second core-list course can fill a signature slot); the sources don't say either way. Cross-listed codes on the page (SOCY425/WMST425) are both accepted.",
    "Catalog: 'at least 9 of the 15 credits at 300 or 400 level' encoded as an overlay over the 300+ courses of the core and list. The department page says the same.",
    "An approved credit-bearing experiential-learning option (internship, study abroad, research project) linked to public leadership and approved in advance can count in the 12 credits: manual approval, not encoded (PLCY309 internship is on the list).",
    "'No more than 6 credits may overlap between your major and the minor, unless approved by your major' -> maxSharedWith [{ credits: 6 }] (applies to all other programs; the stricter 'no course may count for more than one minor' is not separately encoded). Program GPA 2.0 encoded as minGpa. Apply one year before graduation; mandatory advising.",
  ],
  requirements: [
    { kind: "course", id: "core", name: "Core course (PLCY201 or PLCY302)", options: PL_CORE },
    {
      kind: "choose",
      id: "signature-electives",
      name: "Signature and elective courses (12 credits from the approved list)",
      credits: 12,
      from: { courses: [...PL_CORE, ...PL_LIST] },
    },
    {
      kind: "choose",
      id: "upper-level",
      name: "At least 9 credits at 300-400 level",
      overlay: true,
      credits: 9,
      from: { courses: upper([...PL_CORE, ...PL_LIST]) },
    },
  ],
};

// ---------------------------------------------------------------------------------------------
// Nonprofit Leadership and Social Innovation Minor
// ---------------------------------------------------------------------------------------------

const NP_THIRD = ["PLCY215", "PLCY380", "ARHU380", "BSOS388B", "ENME467", "ENES467", "HONR348D"];
const NP_PHILANTHROPY = ["PLCY214", "PLCY359I", "PLCY388G", "HONR349"];
const NP_ELECTIVES = [
  "AASP101", "AASP187", "AASP301", "AASP468A", "AGNR301", "AMST418G", "ANTH264", "ANTH265", "ANTH266", "ARCH272",
  "AREC200", "AREC365", "BMGT350", "BMGT355", "BMGT468U", "BMGT468W", "BSOS388F", "CCJS325", "CMLT270", "COMM448C",
  "CPCV225", "EDCP220", "EDHD230", "ENCE215", "ENGL292", "ENGL361", "ENGL395", "ENGL398B", "ENGL398N", "ENSP340",
  "ENSP342", "ENST282", "FGSM310", "FGSM320", "FGSM380", "FMSC381", "GEOG110", "GEOG130", "GEOG202", "GEOG330",
  "GEOG331", "GEOG332", "GEOG333", "GEOG413", "GEOG421", "GEOG423", "GEOG430", "GEOG431", "GVPT368N", "GVPT388B",
  "HEIP144", "HLSA484", "HNUH318T", "HNUH328T", "HNUH388T", "JWST429M", "LARC151", "LASC248B", "MIEH330",
  "MIEH331", "MIEH333", "PHSC430", "PLCY201", "PLCY288A", "PLCY302", "PLCY388A", "PLSC125",
  ...NP_PHILANTHROPY,
];

export const plcyMinorNonprofitLeadership: Program = {
  id: "plcy-minor-nonprofit-leadership",
  name: "Nonprofit Leadership and Social Innovation Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Nonprofit Leadership and Social Innovation Minor " +
    `(${CATALOG}nonprofit-leadership-and-social-innovation-minor/); School of Public Policy Minors page, ` +
    "https://spp.umd.edu/your-education/undergraduate/minors (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Department-vs-catalog differences (department page wins; both accepted where one lists more): the department page also lists ENES467 with ENME467 ('ENME/ENES467'), and names BSOS388B and HONR348D where the catalog says BSOS388/HONR348 with those sections in parentheses; the catalog's electives are 'see website', the department page prints the full list (used). The department page adds a minimum C (2.00) GPA across minor courses. Program GPA 2.0 encoded as minGpa.",
    "Catalog: 'one of PLCY214, PLCY359 (PLCY359I), PLCY388 (PLCY388G), HONR349 is allowed and encouraged as an elective, but no more than one counts' -> those four are in the elective pool with an 'or' group so only one counts. The department page lists only PLCY214 and HONR349 of them; union taken.",
    "Catalog: 'other electives are being added and students may propose other courses' and 3 credits of study abroad or of a director-approved nonprofit internship count as an elective. Not encoded; other courses may count with director approval.",
    "Catalog: at least 9 credits at 300-400 level, encoded as an overlay over the 300+ courses of the required and elective lists.",
    "'No course may be used to satisfy more than one minor' is not encoded (no per-kind sharing limit); 'no more than 6 credits may overlap between your major and the minor' -> maxSharedWith [{ credits: 6 }]. Apply one year before graduation; mandatory advising.",
    "PLCY201, PLCY302, PLCY288A and PLCY388A appear on the department elective list and are accepted.",
  ],
  requirements: [
    { kind: "course", id: "foundations", name: "Foundations of Nonprofit Leadership and Social Innovation", options: ["PLCY213"] },
    { kind: "course", id: "in-action", name: "Nonprofit Leadership and Social Innovation in Action", options: ["PLCY310"] },
    { kind: "course", id: "innovation", name: "One innovation and social change course", options: NP_THIRD },
    {
      kind: "choose",
      id: "electives",
      name: "Two electives (6 credits)",
      count: 2,
      from: { courses: NP_ELECTIVES },
      alternatives: [NP_PHILANTHROPY],
    },
    {
      kind: "choose",
      id: "upper-level",
      name: "At least 9 credits at 300-400 level",
      overlay: true,
      credits: 9,
      from: { courses: upper(["PLCY213", "PLCY310", ...NP_THIRD, ...NP_ELECTIVES]) },
    },
  ],
};

export const plcyMinorStepMeta: ProgramMeta = { kind: "minor", college: "PLCY", short: "Science, Technology, Ethics and Policy", sources: { catalog: `${CATALOG}science-technology-ethics-policy-minor/`, department: "https://spp.umd.edu/science-technology-ethics-and-policy-step-minor" } };

export const plcyMinorPublicLeadershipMeta: ProgramMeta = { kind: "minor", college: "PLCY", sources: { catalog: `${CATALOG}public-leadership-minor/`, department: "https://spp.umd.edu/your-education/undergraduate/minors" } };

export const plcyMinorNonprofitLeadershipMeta: ProgramMeta = { kind: "minor", college: "PLCY", short: "Nonprofit Leadership", sources: { catalog: `${CATALOG}nonprofit-leadership-and-social-innovation-minor/`, department: "https://spp.umd.edu/your-education/undergraduate/minors" } };
