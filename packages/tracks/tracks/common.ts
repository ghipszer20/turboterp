// Category → UMD course mappings shared by several tracks. HPAO publishes categories, not UMD
// course numbers, so every mapping here is TurboTerp's reading of UMD's own pages (SOURCES.md);
// MAPPING_NOTES lists each choice for the owner to verify.

import type { Requirement, SetMember } from "@turboterp/audit";
import type { Milestone, TrackCategory } from "../src/types.ts";

/** One course by number, with any suffix (honors "H", "S" sections…), e.g. CHEM232 matches CHEM232S. */
function num(id: string): SetMember {
  const m = /^([A-Z]{4})(\d{3})$/.exec(id);
  if (!m) throw new Error(`Not a course number: ${id}`);
  const n = Number(m[2]);
  return { count: 1, from: { departments: [m[1]!], minNumber: n, maxNumber: n } };
}

/** All of the courses in one of the options, e.g. [["CHEM131", "CHEM132"], ["CHEM135", "CHEM136"]]. */
export function sets(id: string, name: string, options: string[][]): Requirement {
  return { kind: "sets", id, name, options: options.map((o) => o.map(num)) };
}

/** One course from a list. */
export function oneOf(id: string, name: string, courses: string[]): Requirement {
  return sets(id, name, courses.map((c) => [c]));
}

export type Extra = Omit<TrackCategory, "requirement" | "source">;
export const cat = (requirement: Requirement, source: string, extra: Extra = {}): TrackCategory => ({ requirement, source, ...extra });

// --- Chemistry -------------------------------------------------------------------------------
// UMD's general chemistry is split around organic chemistry: CHEM131/132 (Chemistry I and lab)
// come first, and CHEM271/272 (General Chemistry and Energetics, and lab) come after organic.

// CHEM146/CHEM177 (the chemistry/biochemistry majors' first-semester alternative) are confirmed
// by UMD's Chemistry major catalog page (MAPPING_NOTES.genChem).
const GEN_CHEM_1_OPTIONS = [
  ["CHEM131", "CHEM132"],
  ["CHEM135", "CHEM136"], // engineering students
  ["CHEM146", "CHEM177"], // chemistry/biochemistry majors
];
const GEN_CHEM_2_OPTIONS = [
  ["CHEM271", "CHEM272"],
  ["CHEM276", "CHEM277"], // chemistry/biochemistry majors
];

export const genChem1 = (source: string, extra?: Extra) =>
  cat(sets("gen-chem-1", "General chemistry I with lab", GEN_CHEM_1_OPTIONS), source, {
    examCreditAdvice: "HPAO: with AP Chemistry 4 or 5, go on to CHEM231/232, 241/242, 271/272 and biochemistry; you don't need to start with CHEM131/132.",
    ...extra,
  });
export const genChem2 = (source: string, extra?: Extra) =>
  cat(sets("gen-chem-2", "General chemistry II with lab", GEN_CHEM_2_OPTIONS), source, extra);

const ORGANIC_CHEM_1_OPTIONS = [["CHEM231", "CHEM232"], ["CHEM237"]];

// CHEM237/CHEM247 (the chemistry/biochemistry majors' organic sequence) are confirmed by UMD's
// Chemistry major catalog page (MAPPING_NOTES.organic).
export const organicChem = (source: string, extra?: Extra) =>
  cat(
    sets("organic-chem", "Organic chemistry I and II with labs", [
      ["CHEM231", "CHEM232", "CHEM241", "CHEM242"],
      ["CHEM237", "CHEM247"], // chemistry/biochemistry majors
    ]),
    source,
    extra,
  );

/** One semester of organic chemistry with lab. */
export const organicChem1 = (source: string, extra?: Extra) =>
  cat(sets("organic-chem-1", "Organic chemistry I with lab", ORGANIC_CHEM_1_OPTIONS), source, extra);

export const biochem = (source: string, extra?: Extra) =>
  cat(oneOf("biochem", "Biochemistry", ["BCHM461", "BCHM463"]), source, extra);

// --- Biology ---------------------------------------------------------------------------------
// BSCI180 (Principles of Biology Laboratory) replaced BSCI161 and BSCI171 in Fall 2026; the
// catalog says BSCI161 and BSCI171 may count for it, and AP Biology still awards them.

// BSCI161 and BSCI171 (the courses BSCI180 replaced) aren't in the Spring 2027 Schedule of Classes
// and aren't being scheduled for new students, but the Biological Sciences catalog page confirms
// them by number (a student with credit for them may count it toward BSCI180), so they're kept as
// an alternative rather than dropped for not being in one term's schedule (MAPPING_NOTES.introBio).
export const introBio = (source: string, extra?: Extra) =>
  cat(
    sets("intro-bio", "Introductory biology with lab", [
      ["BSCI160", "BSCI170", "BSCI180"],
      ["BSCI160", "BSCI161", "BSCI170", "BSCI171"],
    ]),
    source,
    {
      examCreditAdvice: "HPAO: don't repeat BSCI160/161 or 170/171; take upper-level biology with labs instead (BSCI223 and BSCI331/BSCI332 are good first choices).",
      ...extra,
    },
  );

/** One lecture and its lab, for tracks asking for a single semester of general biology. */
export const introBioOneSemester = (source: string, extra?: Extra) =>
  cat(
    sets("intro-bio", "General biology with lab", [
      ["BSCI170", "BSCI180"],
      ["BSCI160", "BSCI180"],
      ["BSCI170", "BSCI171"],
      ["BSCI160", "BSCI161"],
    ]),
    source,
    extra,
  );

// BSCI330 (the lecture-plus-lab course BSCI331 + BSCI332 replaced) isn't in the Spring 2027
// Schedule of Classes, but it's confirmed by number on the Biological Sciences (Universities at
// Shady Grove) catalog page, so it's kept as an alternative to BSCI331 + BSCI332
// (MAPPING_NOTES.upperBio).
export const upperBioLab = (source: string, extra?: Extra) =>
  cat(
    sets("upper-bio", "Upper-level biology with lab", [
      ["BSCI223"],
      ["BSCI330"],
      ["BSCI331", "BSCI332"],
      ["BSCI222"],
      ["BSCI201"],
      ["BSCI202"],
    ]),
    source,
    extra,
  );

export const anatomyPhysiology = (source: string, extra?: Extra) =>
  cat(sets("anatomy-physiology", "Human anatomy and physiology I and II with labs", [["BSCI201", "BSCI202"]]), source, extra);

export const microbiology = (source: string, extra?: Extra) =>
  cat(oneOf("microbiology", "Microbiology with lab", ["BSCI223", "BSCI283"]), source, extra);

// --- Physics ---------------------------------------------------------------------------------

// PHYS141/PHYS142 aren't in the Spring 2027 Schedule of Classes, but the Biological Sciences
// catalog page names them directly ("PHYS131 or 141, PHYS132 or 142"), so they're kept as an
// alternative rather than dropped for not being in one term's schedule (MAPPING_NOTES.physics).
export const physics = (source: string, extra?: Extra) =>
  cat(
    sets("physics", "Physics I and II with labs", [
      ["PHYS131", "PHYS132"], // for life sciences
      ["PHYS121", "PHYS122"],
      ["PHYS141", "PHYS142"], // Biological Sciences catalog's alternate to PHYS131/132
      ["PHYS161", "PHYS261", "PHYS260", "PHYS271"], // engineering sequence with its labs
    ]),
    source,
    {
      examCreditAdvice: "HPAO: even with two semesters of AP physics credit, take at least one semester of physics with a lab at UMD.",
      ...extra,
    },
  );

export const physicsOneSemester = (source: string, extra?: Extra) =>
  cat(sets("physics", "Physics with lab", [["PHYS131"], ["PHYS121"], ["PHYS141"], ["PHYS161", "PHYS261"]]), source, extra);

// --- Math, statistics, English ---------------------------------------------------------------

/** MATH135 is Discrete Mathematics for Life Sciences, not calculus, so it isn't here. */
const CALCULUS = ["MATH120", "MATH136", "MATH140"];

export const calculus = (source: string, extra?: Extra) =>
  cat(oneOf("calculus", "Calculus", CALCULUS), source, {
    examCredit: "accepted",
    examCreditAdvice: "HPAO: schools that require math accept AP/IB credit for it; don't repeat the course.",
    ...extra,
  });

/** The NEUR pre-med plan's approved statistics courses, plus STAT100. */
const STATISTICS = ["BIOM301", "EPIB315", "PSYC200", "STAT400", "STAT464", "STAT100"];

export const statistics = (source: string, extra?: Extra) => cat(oneOf("statistics", "Statistics", STATISTICS), source, extra);

/** Two semesters of writing: ENGL101 and an upper-level ENGL39X, as HPAO's AP page describes. */
export const english = (source: string, extra?: Extra) =>
  cat(
    {
      kind: "sets",
      id: "english",
      name: "English: ENGL101 and an ENGL39X",
      options: [[num("ENGL101"), { count: 1, from: { departments: ["ENGL"], minNumber: 390, maxNumber: 398 } }]],
    },
    source,
    {
      examCredit: "accepted",
      examCreditAdvice: "HPAO: with AP credit for ENGL101, you may complete just an ENGL39X.",
      ...extra,
    },
  );

export const englishComposition = (source: string, extra?: Extra) =>
  cat(oneOf("english", "English composition", ["ENGL101"]), source, extra);

// --- Psychology and social science -----------------------------------------------------------

export const generalPsych = (source: string, extra?: Extra) => cat(oneOf("psychology", "General psychology", ["PSYC100"]), source, extra);
export const abnormalPsych = (source: string, extra?: Extra) =>
  cat(oneOf("abnormal-psych", "Abnormal psychology", ["PSYC353", "PSYC330"]), source, extra);
export const developmentalPsych = (source: string, extra?: Extra) =>
  cat(oneOf("developmental-psych", "Developmental psychology", ["PSYC355"]), source, extra);
export const humanDevelopment = (source: string, extra?: Extra) =>
  cat(oneOf("human-development", "Human growth and development", ["EDHD320", "PSYC355"]), source, extra);
export const sociology = (source: string, extra?: Extra) => cat(oneOf("sociology", "Sociology", ["SOCY100", "SOCY105"]), source, extra);
export const nutrition = (source: string, extra?: Extra) => cat(oneOf("nutrition", "Nutrition", ["NFSC100"]), source, extra);
export const microeconomics = (source: string, extra?: Extra) =>
  cat(oneOf("microeconomics", "Microeconomics", ["ECON200"]), source, extra);
/** HPAO's pharmacy page names no course; ECON200's own general-education communication requirement
 * doesn't fit, so this maps to Oral Communication, UMD's most general communications course. */
export const communications = (source: string, extra?: Extra) =>
  cat(oneOf("communications", "Communications", ["COMM107"]), source, extra);

/** Medical terminology: HPAO says UMD offers it in winter, but names no course, so the student confirms it. */
export const medicalTerminology = (source: string): TrackCategory => ({
  id: "medical-terminology",
  name: "Medical terminology",
  source,
});

/** "College Algebra or Calculus" (HPAO's dentistry page; also PT's "3 credits of mathematics"). */
export const collegeAlgebraOrCalculus = (source: string, extra?: Extra) =>
  cat(oneOf("math", "College algebra or calculus", ["MATH113", "MATH115", ...CALCULUS]), source, {
    examCredit: "accepted",
    examCreditAdvice: "HPAO: schools that require math accept AP/IB credit for it; don't repeat the course.",
    ...extra,
  });

/** "College Algebra" alone (HPAO's Dental Hygiene page names no calculus alternative here, unlike
 * dentistry's and PT's "College Algebra or Calculus"; see MAPPING_NOTES.collegeAlgebra). */
export const collegeAlgebra = (source: string, extra?: Extra) =>
  cat(oneOf("math", "College algebra", ["MATH113", "MATH115"]), source, extra);

/** "Advanced Genetics" (HPAO's Genetic Counseling page); see MAPPING_NOTES.advancedGenetics. */
export const advancedGenetics = (source: string, extra?: Extra) =>
  cat(oneOf("advanced-genetics", "Advanced Genetics", ["BSCI410", "BSCI416"]), source, extra);

/** The ANSC Pre-Veterinary Advising Guide's "1-2 semesters of mathematics (statistics or (pre)calculus)". */
export const statisticsOrCalculus = (source: string, extra?: Extra) =>
  cat(sets("math", "Statistics or (pre)calculus", [...STATISTICS.map((c) => [c]), ...CALCULUS.map((c) => [c])]), source, extra);

/** One semester of organic chemistry with lab, or a second semester of general chemistry with lab
 * (HPAO's Physical Therapy page offers either). */
export const organicOrGenChem2 = (source: string, extra?: Extra) =>
  cat(sets("organic-or-chem2", "Organic chemistry I with lab, or General chemistry II with lab", [...ORGANIC_CHEM_1_OPTIONS, ...GEN_CHEM_2_OPTIONS]), source, extra);

// --- Milestones shared by the HPAO committee process (medical and dental applicants) --------

/** HPAO's Committee Process and application-year timeline (prehealth.umd.edu/application-process). */
export const COMMITTEE_MILESTONES: Milestone[] = [
  {
    id: "are-you-ready",
    kind: "advising",
    name: "HPAO \"Are You Ready?\" workshop",
    detail: "Attend it to confirm you're ready to apply in the coming cycle, and join HPAO's Committee Process Canvas course.",
    due: { year: -2, month: 10 },
  },
  {
    id: "pre-health-packet",
    kind: "committee",
    name: "HPAO Pre-Health Packet",
    detail: "The first-time applicant packet opens November 1 and is due February 15 at 4:30 p.m.; HPAO allows no exceptions. The packet review meeting must be done by May 15.",
    start: { year: -2, month: 11, day: 1 },
    due: { year: -1, month: 2, day: 15 },
  },
  {
    id: "letters",
    kind: "letters",
    name: "Letters of recommendation",
    detail: "Open an Interfolio account and start collecting letters (medical schools often want two science letters, one non-science academic letter and one clinical letter). Letters are due in Interfolio June 1.",
    start: { year: -2, month: 11 },
    due: { year: -1, month: 6, day: 1 },
  },
  {
    id: "committee-meetings",
    kind: "committee",
    name: "HPAO mock interview and school-list review",
    detail: "Finish the mock interview / personal statement review and the primary application and school list review meetings by July 15.",
    due: { year: -1, month: 7, day: 15 },
  },
];

/** The GRE, for tracks whose HPAO page says "most programs require the GRE". */
export const GRE_MILESTONE: Milestone = {
  id: "gre",
  kind: "exam",
  name: "GRE",
  detail: "Most programs require the GRE; check each target school. Take it in your junior year or the summer before you apply, leaving time for a retake.",
};

/** CPR certification, for tracks whose HPAO page says "most require the GRE and CPR". */
export const CPR_MILESTONE: Milestone = {
  id: "cpr",
  kind: "experience",
  name: "CPR certification",
  detail: "Most programs require current CPR certification (often BLS for Healthcare Providers) at the time you apply or matriculate.",
};

// Re-checked against HPAO's published pages (this builder, fetched 2026-09-27): the AP/IB page
// (https://prehealth.umd.edu/prospective-students/ap-ib-credit) and the explore-careers pages for
// medicine, pharmacy, occupational-therapy, genetic-counseling, dental-hygiene, dentistry,
// optometry, podiatry, physical-therapy, nursing, anesthesiologist-assistant and
// physician-assistant (each at https://prehealth.umd.edu/explore-careers/<slug>), plus the BIOE
// sample pre-med plan (https://bioe.umd.edu/sites/bioe.umd.edu/files/resource_documents/PreHealth%20Sample%20Plan%20(New%20Curric)%20-%20Update060216.pdf)
// and the NEUR pre-med benchmark plan (HPAO.neurPlan). None of the mappings below disagreed with
// what these pages say; each note below records what was checked and cites the page. Where a page
// names no UMD course number for a category (most of them -- HPAO deliberately names categories,
// not course numbers, and points students to 4yearplans.umd.edu / their advisor instead), the
// existing course choice is kept and flagged as TurboTerp's own reading, not HPAO's. (CHEM146/177
// and CHEM237/247 are the one exception already resolved above, confirmed by the main session
// against the Chemistry major catalog page, not by this fetch pass.)
export const MAPPING_NOTES = {
  genChem:
    "General chemistry (\"8 credits of inorganic chemistry with labs\") = CHEM131 & CHEM132 then CHEM271 & CHEM272, UMD's two general chemistry courses, split around organic chemistry (Bio major supporting courses; HPAO AP/IB page). Engineering CHEM135 & CHEM136 and majors' CHEM276 & CHEM277 are accepted as alternatives (assumed). Majors' first-semester alternative, CHEM146 & CHEM177, is also accepted -- confirmed by UMD's Chemistry major catalog page (main session, 2026-09-27). Re-checked against the AP/IB page (https://prehealth.umd.edu/prospective-students/ap-ib-credit, fetched 2026-09-27): it recommends CHEM231/232, 241/242, 271/272 for a 4-5 AP score rather than starting at CHEM131/132, which matches genChem1's examCreditAdvice; it says nothing about CHEM146/177 or the 276/277 alternative one way or the other.",
  organic:
    "Organic chemistry = CHEM231 & CHEM232 and CHEM241 & CHEM242, or majors' CHEM237 & CHEM247 (a one-semester CHEM237 alone is also accepted as an alternative to CHEM231 & CHEM232, ORGANIC_CHEM_1_OPTIONS) -- CHEM237/CHEM247 confirmed by UMD's Chemistry major catalog page (main session, 2026-09-27). The AP/IB page (fetched 2026-09-27) folds organic into the same CHEM241/242 recommendation as general chemistry above; it doesn't mention CHEM237/247 separately.",
  biochem:
    "Biochemistry = BCHM461 or BCHM463 (HPAO's AP/IB page, https://prehealth.umd.edu/prospective-students/ap-ib-credit, names both; the medicine and pharmacy career pages, https://prehealth.umd.edu/explore-careers/medicine and /pharmacy, also list \"Biochemistry\" as its own category, with no course number, fetched 2026-09-27).",
  introBio:
    "Introductory biology with lab = BSCI160, BSCI170 and BSCI180, or the older BSCI160/161 and BSCI170/171 (Bio major catalog page: BSCI180 replaced BSCI161 and BSCI171 in Fall 2026, and they may count for it). BSCI161/171 aren't in the Spring 2027 Schedule of Classes and aren't being scheduled for new students, but the Biological Sciences catalog page names them directly, so they're kept as an alternative for a student with older transfer or AP credit under those numbers, rather than dropped for not being in one term's schedule. The NEUR pre-med benchmark plan (fetched 2026-09-27) independently lists the same BSCI160/161 and BSCI170/171 pairing as Benchmark 1 requirements, confirming the numbers.",
  upperBio:
    "HPAO's \"8–12 credits of biology with labs\" and \"nearly all medical schools require at least two biology courses with formal laboratories\" are encoded as intro biology plus one upper-level biology course with a lab: BSCI223, BSCI330 (now BSCI331 + BSCI332 lab, kept as an alternative), BSCI222, BSCI201 or BSCI202. HPAO's AP/IB page (https://prehealth.umd.edu/prospective-students/ap-ib-credit, fetched 2026-09-27) names BSCI223 and BSCI330 as \"recommended starting points\"; BSCI330 itself isn't in the Spring 2027 schedule, but the Biological Sciences (Universities at Shady Grove) catalog page names it directly (\"Cell Biology and Physiology Laboratory\"), so it's kept rather than dropped. That BSCI222 includes a lab is assumed from its 4 credits; HPAO names neither BSCI222, BSCI201 nor BSCI202.",
  physics:
    "Physics with labs = PHYS131 & 132 (life sciences), PHYS121 & 122, PHYS141 & 142, or engineering PHYS161 + PHYS261 lab and PHYS260 + PHYS271 lab (BIOE sample plan). PHYS141/142 aren't in the Spring 2027 schedule, but the Biological Sciences catalog page names them directly (\"PHYS131 or 141, PHYS132 or 142\"), so they're kept rather than dropped for not being in one term's schedule; majors' PHYS171/272/273 sequence is not included. Re-checked 2026-09-27: HPAO's AP/IB page (https://prehealth.umd.edu/prospective-students/ap-ib-credit) names PHYS121/122 specifically (\"even if two semesters of AP credit are awarded\"); the NEUR pre-med benchmark plan (https://neur.umd.edu/sites/neur.umd.edu/files/Four-Year%20Plans/NEUR%20Pre-Med%20Sample%204%20Year%20Plan%2011_06_20_0.pdf) uses PHYS131/132; the BIOE sample pre-med plan (https://bioe.umd.edu/sites/bioe.umd.edu/files/resource_documents/PreHealth%20Sample%20Plan%20(New%20Curric)%20-%20Update060216.pdf) uses PHYS161, then PHYS260/261, then PHYS271 -- all three already-encoded options are independently confirmed by a source.",
  calculus:
    "Calculus = MATH120, MATH136 or MATH140. MATH135 (Discrete Mathematics for Life Sciences) is not calculus. MATH120 is closed to science majors but is calculus. HPAO's AP/IB page (https://prehealth.umd.edu/prospective-students/ap-ib-credit, fetched 2026-09-27) only says schools accepting math generally accept AP/IB credit for it; it names no specific UMD calculus course, so this list stays TurboTerp's own reading of \"calculus\" at UMD.",
  statistics:
    "Statistics = BIOM301, EPIB315, PSYC200, STAT400 or STAT464 (the NEUR pre-med plan's approved list) plus STAT100, which is on no UMD pre-health list (assumed acceptable). Re-checked directly against the NEUR pre-med benchmark plan (https://neur.umd.edu/sites/neur.umd.edu/files/Four-Year%20Plans/NEUR%20Pre-Med%20Sample%204%20Year%20Plan%2011_06_20_0.pdf, fetched 2026-09-27): its \"Approved Statistics Courses\" note reads verbatim \"BIOM301 or EPIB315 or PSYC200 or STAT400 or STAT464\", an exact match; HPAO's own career pages list \"Statistics\" as a category but name no course.",
  english:
    "English (\"6 credits\") = ENGL101 plus one ENGL390–398 (HPAO AP/IB page: \"If you have received AP credit for ENGL 101, you may complete just 39X\"). AP credit here is noted, not warned about. Re-checked 2026-09-27 against https://prehealth.umd.edu/prospective-students/ap-ib-credit: the wording is unchanged.",
  grades:
    "Minimum grade C (HPAO: \"a C (not a C-)\"): a completed course below C doesn't count, and a low-grade warning is shown. Pass/fail (P/S) courses do count in the audit but get a warning; AP/IB credit counts but gets a warning, except calculus and English, where HPAO says it is accepted.",
  fixture:
    "test/fixtures/umd-courses.json is built from the Spring 2027 Schedule of Classes (packages/course-data/.cache/soc-202701.json in the main checkout), the only Schedule of Classes snapshot cached anywhere in this repo. A course not being offered that one term doesn't make its number invalid, so courses this package names that the Spring 2027 schedule doesn't confirm (CHEM146, CHEM177, CHEM247, BSCI161, BSCI171, BSCI330, PHYS141, PHYS142, PHIL170) are still in both the fixture and the requirement options above; each is independently confirmed by another UMD page (CHEM146/177/237/247 by the Chemistry major catalog page, main session, 2026-09-27; BSCI161/171/330, PHYS141/142, PHIL170 by the Biological Sciences catalog page or the Pre-Law timeline document).",
  collegeAlgebra:
    "\"College Algebra\" (Dental Hygiene) = MATH113 (College Algebra and Trigonometry), UMD's actual college-algebra course, or MATH115 (Precalculus), a more advanced course that assumedly covers the same ground and more. Unlike dentistry's and PT's \"College Algebra or Calculus\", HPAO's Dental Hygiene page offers no calculus alternative, so the CALCULUS courses aren't included here. Re-checked directly against that page (https://prehealth.umd.edu/explore-careers/dental-hygiene, fetched 2026-09-27): the math requirement reads exactly \"College Algebra\", with no calculus alternative offered and no UMD course number named.",
  advancedGenetics:
    "\"Advanced Genetics\" (Genetic Counseling) = BSCI410 (Molecular Genetics), whose own catalog description calls it \"An advanced genetics course emphasizing the molecular basis of gene structure and function\" — the clearest match for HPAO's wording. BSCI416 (Human Genetics), which requires BSCI410 first (a minimum grade of C- in it, or concurrent enrollment), is kept as a further alternative. BSCI222 (Principles of Genetics), the introductory course both of these build on, is NOT used here: it's the prerequisite for \"advanced\" genetics, not the advanced course itself, and it's already used elsewhere in this package (upperBioLab). Re-checked directly against HPAO's Genetic Counseling page (https://prehealth.umd.edu/explore-careers/genetic-counseling, fetched 2026-09-27): it lists \"Advanced Genetics\" as its own category but names no UMD course, so BSCI410/416 stays TurboTerp's own reading.",
  socialScience:
    "Sociology (SOCY100 or SOCY105), human growth and development (EDHD320 or PSYC355) and nutrition (NFSC100) each map to UMD's most general course in the area. Checked directly against HPAO's Occupational Therapy page (https://prehealth.umd.edu/explore-careers/occupational-therapy: \"Sociology\", \"Human Growth and Development\") and Nursing page (https://prehealth.umd.edu/explore-careers/nursing: \"Nutrition\", \"Human Growth and Development\"), both fetched 2026-09-27: both name the category but no UMD course number for any of the three, so these three mappings stay TurboTerp's own reading, same as microeconomics/communications above.",
};

/** N credits from a list of courses (a credit-minimum category, e.g. "24 credits of life and physical science"). */
export const creditsFrom = (id: string, name: string, credits: number, courses: string[], source: string, extra?: Extra): TrackCategory =>
  cat({ kind: "choose", id, name, credits, from: { courses } }, source, extra);

/** A category that counts alongside a credit pool without using its courses up (e.g. "including 1 semester of microbiology"). */
export const overlaySets = (id: string, name: string, options: string[][], source: string, extra?: Extra): TrackCategory =>
  cat({ ...sets(id, name, options), overlay: true }, source, extra);

export const HPAO = {
  home: "https://prehealth.umd.edu/",
  apIb: "https://prehealth.umd.edu/prospective-students/ap-ib-credit",
  application: "https://prehealth.umd.edu/application-process",
  career: (page: string) => `https://prehealth.umd.edu/explore-careers/${page}`,
  catalog:
    "https://academiccatalog.umd.edu/undergraduate/campus-administration-resources-student-services/academic-resources-services/pre-health-professions-advising-programs/",
  bioMajor: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/biological-sciences/",
  neurPlan: "https://neur.umd.edu/sites/neur.umd.edu/files/Four-Year%20Plans/NEUR%20Pre-Med%20Sample%204%20Year%20Plan%2011_06_20_0.pdf",
};
