// Global Engineering Leadership Minor, Nanoscale Science and Technology Minor, and Quantum Science
// and Engineering Minor, 2026-27 UMD Academic Catalog (A. James Clark School of Engineering).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/
// global-engineering-leadership-minor/, nanoscale-science-technology-minor/, and
// electrical-and-computer/quantum-science-engineering-minor/ (all fetched 2026-09-28); department pages
// eng.umd.edu/global/coursework, nanocenter.umd.edu/education/nano-minor,
// mse.umd.edu/undergraduate/degrees/minor-nano, ece.umd.edu/undergraduate/degrees/minor-quantum-science-and-engineering
// (fetched 2026-09-28).
// Owner rulings (docs/project/rulings.md, "Minors"): where the department page and the catalog disagree,
// follow the department page; where one lists fewer options, accept both lists. No official published
// sample plans (built from the requirements; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const engrMinorGlobalEngineeringLeadership: Program = {
  id: "engr-minor-global-engineering-leadership",
  name: "Global Engineering Leadership Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Global Engineering Leadership Minor; eng.umd.edu/global/coursework (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Catalog: 'a maximum of six credits may also count toward the student's major' -> maxSharedWith: [{ credits: 6 }]. The department page states no cap. 'No more than six credits at an institution other than UMD' is a transfer cap, not encoded.",
    "Department-vs-catalog difference: the catalog's 1-credit dialogue slot is ENES138 or WEID138, WEID139 or CHSE328 (and titles it 'Exploring Engineering Design Through Dialogue'); the department page names ENES138 ('Equity and Inclusion in Engineering Design') 'or other approved intergroup dialogue course'. Encoded as the union of the catalog's four courses; the dialogue requirement is marked advisorMayApprove (other approved dialogue courses need minor-advisor approval).",
    "Global Perspectives Elective: the approved list is encoded as printed on the department page. The page's row 'Global Classrooms Signature Courses' points to an external list (globalmaryland.umd.edu/content/global-classrooms) that is not in the source, so those courses are not encoded; 'courses in the other Global Minor Programs' need permission from the named contacts (manual).",
    "Leadership Elective: the department page says the list is EXAMPLES, 'not exhaustive', and a minor advisor may approve any other leadership course. Encoded as the listed courses; the leadership-elective requirement is marked advisorMayApprove (other courses may count with advisor approval). Not encoded: 'a course taken abroad that has connections to leadership', 'other leadership course approved by minor director', and the IDEA courses (a combination such as IDEA247 (2 cr) + IDEA200 (1 cr) can make up the 3 credits; the engine cannot combine partial credits).",
    "Rows with a slash (BMGT390H/ENED390, BMGT397/ENES397, ENEE200/ENES200, ENES401/ENME401, ENME426/BMGT385) are encoded as each course id; special-topics sections (e.g. ANTH298B, GVPT368A, HESI318A) are recorded by the named section. The study-abroad course CPSP279T/ENES359T/LASC269T is included by its three ids.",
  ],
  requirements: [
    { kind: "course", id: "enes317", name: "Introduction to Leadership in Engineering, Science, and Technology", options: ["ENES317"] },
    { kind: "course", id: "enes472", name: "Leading Global Teams and Engaging Across Cultures", options: ["ENES472"] },
    { kind: "course", id: "enes424", name: "Engineering Leadership Capstone", options: ["ENES424"] },
    {
      kind: "course",
      id: "dialogue",
      advisorMayApprove: true,
      name: "Intergroup dialogue course (1 credit)",
      options: ["ENES138", "WEID138", "WEID139", "CHSE328"],
    },
    {
      kind: "choose",
      id: "global-elective",
      name: "Global Perspectives Elective",
      count: 1,
      from: {
        courses: [
          "ANTH265", "ANTH266", "ANTH298B", "ANTH310", "AREC345", "AREC365", "BSST240", "BSST331", "BSST334",
          "BSST335", "BSST340", "ECON317", "ENES269Z", "FMSC100", "GBHL200", "GBHL310", "GBHL449A", "GEOG330",
          "GEOG331", "GEOG333", "GVPT200", "GVPT203", "GVPT204", "GVPT273", "GVPT280", "GVPT282", "GVPT306",
          "GVPT354", "GVPT368A", "GVPT409H", "GVPT409W", "GVPT411", "GVPT457", "GVPT459G", "GVPT459H",
          "HGLO397", "HIST142", "PLCY288W", "SOCY340", "SOCY443",
        ],
      },
    },
    {
      kind: "choose",
      id: "leadership-elective",
      advisorMayApprove: true,
      name: "Leadership Elective",
      count: 1,
      from: {
        courses: [
          "BMGT360", "BMGT363", "BMGT364", "BMGT390H", "ENED390", "BMGT392", "BMGT395", "BMGT397", "ENES397",
          "CPSP279T", "ENES359T", "LASC269T", "COMM324", "ECON414", "ENCE320", "ENCE325", "ENCE421", "ENCE422",
          "ENCE424", "ENEE200", "ENES200", "ENES140", "ENES210", "ENES401", "ENME401", "ENES461", "ENES466",
          "ENME426", "BMGT385", "ENME466", "ENME489Q", "GEMS208", "HESI318A", "HESI318J", "HESI418V", "LEAD305",
          "LEAD315", "LEAD321", "PLCY201", "PLCY203", "PLCY213", "PLCY214", "PLCY215", "PLCY310", "PLCY311",
          "PLCY380", "PLCY388N", "PSYC334", "PSYC361", "SOCY325",
        ],
      },
    },
  ],
};

const NANO_DEPARTMENTS = ["ENMA", "CHBE", "ENEE", "ENME", "BIOE", "PHYS", "CHEM"];

export const engrMinorNanoscale: Program = {
  id: "engr-minor-nanoscale-science-technology",
  name: "Nanoscale Science and Technology Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Nanoscale Science and Technology Minor; nanocenter.umd.edu/education/nano-minor and mse.umd.edu/undergraduate/degrees/minor-nano (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "The approved course list (classified into Nanofabrication/Nanosynthesis, Nanocharacterization, Fundamental Science/Nanoscience and Specialization/Application) lives on the Maryland NanoCenter courses page, which is not among the sources, so no course is named. The five courses are encoded as any five courses from the participating departments named on the department pages (ENMA, CHBE, ENEE, ENME, BIOE in the Clark School; PHYS and CHEM in CMNS); this accepts the whole range and is broader than the approved list.",
    "Open slot 'nano-fab-char' (openSlot requirement): 6 credits (two courses) of Nanofabrication/Nanosynthesis and/or Nanocharacterization electives. Open slot 'nano-science-spec' (openSlot requirement): 6 credits (two courses) of Fundamental Science and/or Nanoscience electives, at least one also a Nanospecialization/Application elective. No list is in the sources (it lives on the NanoCenter courses page). The broad 'five-courses' filter checks the credits; the two slots take no courses and only ask the student to confirm with the advisor that those courses are on the approved list, so nothing is counted twice.",
    "Grade floor: the catalog and the MSE page say C-; nanocenter.umd.edu says C. C- used (the MSE page and catalog agree).",
    "Department-vs-catalog difference: both department pages restrict the minor to students majoring in Engineering, Physics or Chemistry (the NanoCenter page also says 'any student' in the Colleges of Engineering and CMNS); the catalog states no restriction. Enforced via onlyOpenTo (Engineering college majors, plus Physics and Chemistry majors).",
    "Sharing: 'up to two courses (6 credits) may be double counted' -> maxSharedWith: [{ courses: 2 }]. 'Three of the courses (9 credits) must be from outside the individual major', 'at least 15 credits', and 'no more than two courses from any one department' are manual (the engine cannot cap courses per department or tell the student's major).",
    "'At least three courses at the 400 level or above' is an overlay over the same department range. XXXX499 research (if NS&T-related and in a participating department) and a design capstone judged NS&T (e.g. ENMA490, as a Specialization Elective) are inside the department range; the NS&T-related judgment is the departmental advisor's (manual).",
    "Declaration: students must formally declare and meet the department NS&T representative (advising step, not encoded).",
  ],
  requirements: [
    {
      kind: "choose",
      id: "five-courses",
      name: "Five NS&T courses",
      count: 5,
      from: { departments: NANO_DEPARTMENTS },
    },
    {
      kind: "openSlot",
      id: "nano-fab-char",
      name: "Nanofabrication / Nanocharacterization electives",
      credits: 6,
      note: "Two courses on the approved Nanofabrication/Nanosynthesis and/or Nanocharacterization list (Maryland NanoCenter courses page). Confirm with your advisor that your courses are on it; they are already counted in the five courses above.",
    },
    {
      kind: "openSlot",
      id: "nano-science-spec",
      name: "Fundamental Science / Nanoscience electives",
      credits: 6,
      note: "Two courses on the approved Fundamental Science and/or Nanoscience list, at least one also a Nanospecialization/Application elective (Maryland NanoCenter courses page). Confirm with your advisor; they are already counted in the five courses above.",
    },
    {
      kind: "choose",
      id: "upper-level",
      name: "At least three courses at the 400 level or above",
      count: 3,
      overlay: true,
      from: { departments: NANO_DEPARTMENTS, minNumber: 400 },
    },
  ],
};

const QSE_MATH = ["MATH240", "MATH461", "ENEE290", "PHYS274", "MATH243", "MATH341"];
const QSE_INTRO = ["ENEE491", "PHYS401", "ENMA434", "PHYS360"];
const QSE_CORE = ["PHYS467", "ENEE492", "ENMA436", "ENME434", "PHYS457", "CMSC457"];
const QSE_LAB = ["ENEE493", "CMSC437"];
const QSE_ELECTIVE = ["ENEE489C", "ENEE489W", "ENMA481", "ENEE435", "ENEE439G", "ENEE469Q"];

export const engrMinorQuantum: Program = {
  id: "engr-minor-quantum-science-engineering",
  name: "Quantum Science and Engineering Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Quantum Science and Engineering Minor; ece.umd.edu/undergraduate/degrees/minor-quantum-science-and-engineering (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Sharing: the department page caps overlap at six credits; the catalog says 2 courses (6-7 credits). Department page wins: maxSharedWith: [{ credits: 6 }] (a 4-credit plus 3-credit overlap would be 7, allowed by the catalog but not the department page).",
    "Union of lists: the catalog lists ENMA434 as an Introduction to Quantum option (the department page omits it) and ENEE489 (489C, 489W) as electives; the department page names ENEE435 (formerly 489C), ENEE439G, ENEE469Q and ENEE489W. Encoded as the union of both, keeping ENEE489C for students who took it under the old number.",
    "'Another course from the Core or Laboratory categories' may replace the elective (both sources); encoded by letting the elective slot accept any Core or Lab course as well (a course still counts once, so the student needs a second, different course).",
    "Cross-listed courses (PHYS467/ENEE492, PHYS457/CMSC457) are encoded by each id; the catalog writes 'PHYS/CMSC457'.",
    "Program GPA 2.0 encoded as minGpa.",
    "Not encoded (manual): the recommended Math -> Intro -> Core -> Lab sequence; admission requirements (MATH141 with B- or higher, cumulative 3.0 GPA at UMD, 30 credits not counting AP/IB, applying at least a year before graduation).",
    "Eligibility restriction (manual, flag): students in the Computer Science major Quantum Information specialization (0701G) may not enroll in this minor.",
  ],
  requirements: [
    { kind: "choose", id: "math", name: "Mathematics course", count: 1, from: { courses: QSE_MATH } },
    { kind: "choose", id: "intro-quantum", name: "Introduction to Quantum course", count: 1, from: { courses: QSE_INTRO } },
    { kind: "choose", id: "core", name: "Core course", count: 1, from: { courses: QSE_CORE } },
    { kind: "choose", id: "lab", name: "Laboratory course", count: 1, from: { courses: QSE_LAB } },
    {
      kind: "choose",
      id: "elective",
      name: "Elective course (or a second Core or Laboratory course)",
      count: 1,
      from: { courses: [...QSE_ELECTIVE, ...QSE_CORE, ...QSE_LAB] },
    },
  ],
};

const CAT = "https://academiccatalog.umd.edu/undergraduate/colleges-schools/engineering/";

export const engrMinorGlobalEngineeringLeadershipMeta: ProgramMeta = {
  kind: "minor",
  college: "ENGR",
  short: "Global Engineering Leadership",
  sources: { catalog: `${CAT}global-engineering-leadership-minor/`, department: "https://eng.umd.edu/global/coursework" },
};

export const engrMinorNanoscaleMeta: ProgramMeta = {
  kind: "minor",
  college: "ENGR",
  short: "Nanoscale Science and Technology",
  sources: { catalog: `${CAT}nanoscale-science-technology-minor/`, department: "https://mse.umd.edu/undergraduate/degrees/minor-nano" },
  onlyOpenTo: { colleges: ["ENGR"], programs: ["phys", "chem"], reason: "Only open to Engineering, Physics or Chemistry majors." },
};

export const engrMinorQuantumMeta: ProgramMeta = {
  kind: "minor",
  college: "ENGR",
  short: "Quantum Science and Engineering",
  sources: {
    catalog: `${CAT}electrical-and-computer/quantum-science-engineering-minor/`,
    department: "https://ece.umd.edu/undergraduate/degrees/minor-quantum-science-and-engineering",
  },
};
