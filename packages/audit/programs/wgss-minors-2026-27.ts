// Women, Gender, and Sexuality Studies Minor and LGBTQ Studies Minor, 2026-27 UMD Academic Catalog
// (Harriet Tubman Department of Women, Gender, and Sexuality Studies).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/women-gender-sexuality-studies/
// womens-gender-sexuality-studies-minor/ and .../lesbian-gay-bisexual-transgender-studies/
// lesbian-gay-bisexual-transgender-studies-minor/ (fetched 2026-09-28); https://wgss.umd.edu/ (fetched
// 2026-09-28; homepage only, no requirements). The lists of Lower/Upper Level courses are the WGSS major's
// (the minor's catalog page points to them). The certificates are not encoded here.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const CATALOG_BASE =
  "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/women-gender-sexuality-studies/";

const INTRO_LIST = ["LGBT200", "WGSS105", "WGSS200", "WGSS205", "WGSS250", "WGSS263"];

const LLC_LIST = [
  "LGBT200", "LGBT264", "LGBT298",
  "WGSS105", "WGSS115", "WGSS200", "WGSS205", "WGSS250", "WGSS263", "WGSS265", "WGSS267", "WGSS271",
  "WGSS280", "WGSS290", "WGSS291",
];

const LLE_LIST = [
  "LGBT265",
  "WGSS210", "WGSS211", "WGSS212", "WGSS230", "WGSS255", "WGSS275", "WGSS298",
  "FMSC190", "HIST215", "KNES225",
];

const ULC_LIST = [
  "LGBT310", "LGBT327", "LGBT350", "LGBT386", "LGBT398", "LGBT411", "LGBT448", "LGBT488", "LGBT499",
  "WGSS302", "WGSS315", "WGSS319", "WGSS330", "WGSS358", "WGSS360", "WGSS368", "WGSS370", "WGSS378",
  "WGSS379", "WGSS410", "WGSS428", "WGSS468", "WGSS486", "WGSS488", "WGSS489", "WGSS497", "WGSS498Z",
  "WGSS499",
];

const ULE_LIST = [
  "LGBT359", "ENGL359",
  "LGBT448C", "LGBT448W", "LGBT448Y", "ENGL439D",
  "WGSS314", "WGSS320", "WGSS325", "WGSS326", "WGSS336",
  "WGSS348", "ENGL348",
  "WGSS408", "ENGL408",
  "WGSS420", "WGSS425",
  "WGSS444", "ENGL444",
  "WGSS448", "ENGL448",
  "WGSS452", "WGSS455", "WGSS456", "WGSS457", "WGSS458", "WGSS469", "WGSS471", "WGSS491", "WGSS492", "WGSS498",
  "AASP493", "AMST320", "ANTH403", "CCJS346", "CINE423", "COMM324",
  "ENGL329A", "ENGL329C", "CMLT398L", "ENGL329Y", "ENGL362", "ENGL388D",
  "FMSC310", "FMSC330", "HESI422",
  "HIST338A", "HIST360", "WGSS498M", "HIST412", "HIST467",
  "HLTH377", "HLTH424", "JAPN316", "JWST373", "PLCY311", "PSYC354",
  "SOCY335", "SOCY435", "SOCY470",
  "SPAN412", "SPAN433", "SPAN471",
];

export const wgssMinor: Program = {
  id: "wgss-minor",
  name: "Women, Gender, and Sexuality Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Women, Gender, and Sexuality Studies Minor " +
    `(${CATALOG_BASE}womens-gender-sexuality-studies-minor/), fetched 2026-09-28; ` +
    "course lists from the WGSS Major catalog page (as encoded in wgss-major)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Department page not checked: none was provided for this minor. Encoded from the catalog alone.",
    "The Lower Level and Upper Level Core/Elective lists are the WGSS major's (the minor page says 'refer to the WGSS major'), copied from wgss-major's encoding. Intro (3), lower level core or elective (3; accepts the Intro, LLC and LLE lists), WGSS301, one upper level core or elective (3) and a 4xx upper level core course (3) make 15 credits.",
    "'At least 9 credits at 3xx or above' is met automatically by WGSS301 plus the two upper level slots (9 credits), so it has no separate requirement.",
    "'Maximum six credits (or two courses) to satisfy both major and minor' -> maxSharedWith: [{ courses: 2 }]; this caps overlap with every other program (the student's major isn't known). 'Courses used for the minor may not be used for another minor' is not encoded (no way to cap overlap by program kind): manual check.",
    "Not encoded: overall 2.0 minor GPA; the transfer cap (no more than six credits or two courses outside UMD College Park, with at least six 3xx/4xx credits taken at UMD); the advisor consultation.",
  ],
  requirements: [
    { kind: "choose", id: "wgss-intro", name: "Introductory Course", credits: 3, from: { courses: INTRO_LIST } },
    {
      kind: "choose",
      id: "wgss-ll",
      name: "Lower Level core or elective",
      credits: 3,
      from: { courses: [...new Set([...LLE_LIST, ...INTRO_LIST, ...LLC_LIST])] },
    },
    { kind: "course", id: "wgss301", name: "Feminist Knowledge Production", options: ["WGSS301"] },
    {
      kind: "choose",
      id: "wgss-ul",
      name: "Upper Level core or elective",
      credits: 3,
      from: { courses: [...new Set([...ULC_LIST, ...ULE_LIST])] },
    },
    {
      kind: "choose",
      id: "wgss-ul-4xx",
      name: "Upper Level core, 4xx level",
      credits: 3,
      from: { courses: ULC_LIST, minNumber: 400, maxNumber: 499 },
    },
  ],
};

export const lgbtMinor: Program = {
  id: "lgbt-minor",
  name: "LGBTQ Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, LGBTQ Studies Minor " +
    `(${CATALOG_BASE}lesbian-gay-bisexual-transgender-studies/lesbian-gay-bisexual-transgender-studies-minor/); ` +
    "Harriet Tubman Department of WGSS, https://wgss.umd.edu/ (homepage only); both fetched 2026-09-28",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Department page not checked: the fetched wgss.umd.edu page is a homepage listing the minor with no requirements. Encoded from the catalog alone.",
    "Foundation: LGBT200 and LGBT310 (6 credits). Capstone: 'approved 400 level LGBT course'; LGBT488 is the only course named, but the catalog says any approved 400-level LGBT course, so every LGBT course at 400-499 is accepted (never narrower than the source).",
    "Electives: 6 credits of LGBT-prefix courses ('automatically approved'), at least 3 credits at upper level (3xx or above, encoded as an overlay that excludes the foundation and LGBT488). The catalog implies non-LGBT courses can be approved as electives but names none, so only LGBT-prefix courses are accepted; other approved electives are manual.",
    "'Maximum six credits (or two courses) to satisfy both major and minor' -> maxSharedWith: [{ courses: 2 }] (caps overlap with every other program; the student's major isn't known). 'May not be used to satisfy another minor' is not encoded: manual check.",
    "Not encoded: overall 2.0 minor GPA; transfer cap (six credits or two courses outside UMD College Park, at least six 3xx/4xx credits at UMD).",
  ],
  requirements: [
    { kind: "course", id: "lgbt200", name: "Queer Worlds: Studies in Gender and Sexuality", options: ["LGBT200"] },
    { kind: "course", id: "lgbt310", name: "Transgender Studies", options: ["LGBT310"] },
    {
      kind: "choose",
      id: "capstone",
      name: "Capstone: approved 400-level LGBT course (e.g. LGBT488)",
      count: 1,
      from: { departments: ["LGBT"], minNumber: 400, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "electives",
      name: "Electives: 6 credits of LGBT-prefix courses",
      credits: 6,
      from: { departments: ["LGBT"], minNumber: 100, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "electives-upper",
      name: "At least 3 of the 6 elective credits at upper level",
      overlay: true,
      credits: 3,
      from: { departments: ["LGBT"], minNumber: 300, maxNumber: 499, exclude: ["LGBT310", "LGBT488"] },
    },
  ],
};

// Black Women's Studies Minor. Cross-listed: the same requirement table is published under WGSS (ARHU) and
// AAAS (BSOS); encoded once, here, under its main college. Catalog: .../arts-humanities/
// women-gender-sexuality-studies/black-womens-studies-minor/ (fetched 2026-09-28).
export const bwsMinor: Program = {
  id: "wgss-minor-black-womens-studies",
  name: "Black Women's Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Black Women's Studies Minor " +
    `(${CATALOG_BASE}black-womens-studies-minor/), cross-listed with African American and Africana Studies; ` +
    "wgss.umd.edu, aasd.umd.edu and arhu.umd.edu minors page (no requirements); all fetched 2026-09-28",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ programs: ["aaas-major-general", "aaas-major-public-policy", "wgss-major"], courses: 2 }],
  reviewNotes: [
    "Cross-listed: the same requirement table appears under WGSS (ARHU) and AAAS (BSOS); a diff of the two fetched pages shows only the college label and catalog URL differ. Encoded once here under WGSS/ARHU (the ARHU minors page lists it).",
    "Department pages not checked: wgss.umd.edu and aasd.umd.edu are homepages with no requirements, and the ARHU minors page only lists the minor as OPEN. Encoded from the catalog alone.",
    "Open slot 'bws-electives' (openSlot requirement): 9 credits of approved electives; the list (wgss.umd.edu/academic-programs/courses) was not among the sources, so the student confirms it with their advisor. The conditions (at least two at 300/400 level, one 300/400 level course Comparative or non-U.S.) are manual.",
    "Second foundation slot: the catalog lists 'AASP398 ... (AASP389G: Gender, Labor, and Racial Identity in Diasporic Communities)'; the parenthetical code AASP389G looks like a typo for AASP398G, so AASP398 (any topic) is accepted. WGSS314/AASP313 are cross-listed; either id counts.",
    "Catalog states C- minimum: encoded as minGrade C-. 'No more than two courses may count toward a major in African American Studies or Women's Studies' is maxSharedWith courses: 2 against aaas-major-general, aaas-major-public-policy and wgss-major (sds-major-aaas not named).",
    "Not encoded: overall 2.0 minor GPA, advisor consultation.",
  ],
  requirements: [
    {
      kind: "choose",
      id: "bws-foundation-1",
      name: "Foundation: one of WGSS/AASP263, WGSS/AASP265, WGSS/AASP/LGBT264",
      count: 1,
      from: { courses: ["WGSS263", "AASP263", "WGSS265", "AASP265", "WGSS264", "AASP264", "LGBT264"] },
    },
    {
      kind: "choose",
      id: "bws-foundation-2",
      name: "Foundation: one of WGSS314/AASP313, HIST360, AASP398",
      count: 1,
      from: { courses: ["WGSS314", "AASP313", "HIST360", "AASP398"] },
    },
    {
      kind: "openSlot",
      id: "bws-electives",
      name: "Approved electives",
      credits: 9,
      note: "See the approved electives at wgss.umd.edu/academic-programs/courses: at least two at 300/400 level, one 300/400 level course Comparative or non-U.S.",
    },
  ],
};

export const bwsMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Black Women's Studies",
  sources: { catalog: `${CATALOG_BASE}black-womens-studies-minor/`, department: "https://wgss.umd.edu/" },
};

export const wgssMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Women, Gender, and Sexuality Studies",
  sources: { catalog: `${CATALOG_BASE}womens-gender-sexuality-studies-minor/` },
};

export const lgbtMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "LGBTQ Studies",
  sources: {
    catalog: `${CATALOG_BASE}lesbian-gay-bisexual-transgender-studies/lesbian-gay-bisexual-transgender-studies-minor/`,
    department: "https://wgss.umd.edu/",
  },
};
