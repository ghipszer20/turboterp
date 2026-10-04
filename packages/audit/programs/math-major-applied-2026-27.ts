// Mathematics Major, Applied Mathematics Track, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/mathematics/mathematics-major/
// (packages/catalog/test/fixtures/math-major.html, lists[1]); Department of Mathematics,
// https://www-math.umd.edu/course-requirements.html (fetched 2026-09-26). Owner ruling
// (docs/project/rulings.md): where the department page and the catalog disagree, follow the
// department page; each such difference is recorded below citing both sources.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const MATH_400_LEVEL = { departments: ["MATH", "AMSC", "STAT"], minNumber: 400, maxNumber: 499 };
// Footnote 3: electives may not include these.
const NOT_ELECTIVES = ["MATH461", "MATH478", "MATH480", "MATH481", "MATH482", "MATH483", "MATH484", "STAT464"];

// Owner-confirmed 2026-09-25: CMSC141 counts for CMSC131 and CMSC142 for CMSC132.
const CMSC_I = ["CMSC131", "CMSC141"];
const CMSC_II = ["CMSC132", "CMSC142"];
// Sequence Nine: BSCI171 and BSCI161 together may count for BSCI180; either general-chemistry pair.
const BIO_LABS = [["BSCI180"], ["BSCI171", "BSCI161"]];
const GEN_CHEM = [["CHEM131", "CHEM132"], ["CHEM146", "CHEM177"]];
// Sequence Eleven: GEOL100–GEOL110 plus two of these.
const GEOL_UPPER = ["GEOL322", "GEOL340", "GEOL341", "GEOL375"];
// Sequence Twelve: AOSC200–AOSC201 plus two additional 400-level AOSC courses.
const AOSC_400_TWO = { count: 2, from: { departments: ["AOSC"], minNumber: 400, maxNumber: 499 } };

export const mathMajorApplied: Program = {
  id: "math-major-applied",
  name: "Mathematics Major (Applied Mathematics Track)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Mathematics Major, Applied Mathematics Track; " +
    "Department of Mathematics, https://www-math.umd.edu/course-requirements.html (fetched 2026-09-26)",
  // Owner-confirmed 2026-09-25: C- minimum; CMSC131 may count for programming and Sequence Four.
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Honors sequence (footnote 1): 'MATH340 satisfies MATH241; MATH340–MATH341 satisfies MATH240–MATH241–MATH246.' Approximated as in the Traditional track: MATH340 counts for MATH240 (overlay) and MATH241; MATH341 counts for the MATH246/462 slot. MATH340 alone would wrongly satisfy MATH240 too.",
    "Eight 400-level MATH/AMSC/STAT courses: encoded as an overlay count of 8 that the specific requirements (MATH410, STAT410, STAT4xx, MATH401/405/423, AMSC460/466, the applied list, depth) also count toward. MATH462 used for the introductory MATH246 slot still counts toward the eight.",
    "Footnote 3's exclusions (MATH461, 478, 480–484, STAT464) are attached to the electives in the catalog but applied here to all eight, and STAT400/STAT410/STAT464 are also excluded from the STAT4xx course (both the catalog row and the department page's item (3)(c) say 'other than STAT400, STAT410, STAT464').",
    "'400-level or higher' is capped at 499: 500+ graduate courses don't count toward the eight.",
    "The depth sequence is an overlay: its courses may also fill MATH410, STAT410, STAT4xx or the applied-list course. So STAT410–STAT420 alone fills stat410, stat4xx and depth, and MATH462–MATH463 may fill both the applied list and depth.",
    "Department-vs-catalog difference (owner ruling: follow the department page): department page item (1) lists only 'MATH 246 requirement may be fulfilled by MATH 462 instead' for the Applied track, while the academic catalog's Applied table also offers MATH436 for the same slot. MATH436 is dropped from intro3 here; it remains an option in the Traditional track, where both sources list it.",
    "Department-vs-catalog difference (owner ruling: follow the department page): department page items (1) and (3)(f) say 'If MATH 462 is used to fulfill the MATH 246 requirement, it may also be used as one of the upper level math requirements in (3)(f)'; the academic catalog's footnote 3 is silent on reuse. The applied-list requirement is an overlay so a MATH462 used for intro3 can also satisfy it; previously this was (wrongly) forbidden. Side effect: like every overlay here, a course an overlay requirement reuses also escapes the audit's cross-program sharing limit (auditPrograms' maxSharedCourses only restricts non-overlay requirements); no caller currently audits Math Applied with a sharing limit (grepped maxSharedCourses call sites 2026-09-26), so this doesn't bite today.",
    "Department-vs-catalog difference (owner ruling: follow the department page): both tracks' department pages say 'the MATH 240 requirement may be fulfilled by MATH461'; the catalog's footnote 1 doesn't mention it. Added to math240 (overlay); MATH461 stays excluded from the eight electives (footnote 3 / department item (3)(h)).",
    "Department-vs-catalog difference (owner ruling: follow the department page): the department page's programming list, item (4), is 'CMSC 106, 131, 132, AOSC247, BIOE 241, ENAE 202, ENME202, ENME 351, ENME489I, ENEE150, PHYS 165, PHYS265, AOSC358L' — wider than the catalog's 'CMSC106, 131, 132, ENAE202, ENEE150, PHYS265'. The wider list is encoded (plus CMSC141/142, owner ruling below).",
    "Both sources state 'students must earn an overall 2.000 average in these major courses to meet graduation requirements' (department page item, unnumbered; catalog: 'with an overall major GPA of 2.0'). Not a department-vs-catalog difference since both agree. Program GPA 2.0 encoded as minGpa.",
    "Programming requirement also accepts CMSC141/CMSC142 (owner confirmed these substitute for CMSC131/132 in CS; assumed here too). Sequence Four also accepts CMSC141 for CMSC131 and CMSC142 for CMSC132 (the Traditional track now does the same).",
    "CMSC131 may count for both the programming requirement and Sequence Four (owner-confirmed): the supporting sequence is an overlay.",
    "Sequence Seven (ECON200, ECON201, ECON305 or 306, OR ECON325 or 326) is expanded into four three-course sets.",
    "Sequence Nine (BSCI170, BSCI160, BSCI180, CHEM131–132 or CHEM146–177; 'BSCI171 and BSCI161 may count for BSCI180') is expanded into four sets, all courses required. The department page's own Applied item 5 defers to the Traditional track's supporting-sequence list for its stale BSCI105/106 wording, but the catalog's Applied table spells out this sequence directly with current codes (BSCI170/160/180, with BSCI171/161 as the lab substitute); the catalog's own current numbering is followed here.",
    "Sequence Ten (ASTR130, ASTR131, ASTR232) uses the catalog's current codes, straight from this Applied table's own row; the department page's Traditional list (which Applied's item 5 defers to for its supporting sequences) has the stale 'ASTR120, 121' and a parenthetical 'starting Fall 206 this sequence becomes ASTR130, 131, and 132' -- likely a typo for a past year, and for ASTR132 where this catalog table says ASTR232. Flagged for the owner to confirm ASTR232 (not ASTR132) is still current.",
    "Sequence Eleven (GEOL100–GEOL110 plus two of GEOL322/340/341/375) is expanded into six sets.",
    "Sequence Twelve (AOSC200–AOSC201 plus two additional 400-level AOSC courses) is encoded as a set with a filter part: AOSC200, AOSC201 and any two AOSC courses numbered 400–499. 'Additional' is read as two courses other than AOSC200/201 (automatic, since those are 200-level); 500+ graduate AOSC courses don't count.",
    "Footnote 2 (at least four of the 400-level courses taken at College Park) and footnote 4 (other sequences approved by the Undergraduate Office) are not enforced.",
    "Footnote 5 (ASTR121 restricted to Astronomy majors) is cited by no row of the Applied table; ASTR121 is not in any Applied sequence. Ignored.",
  ],
  requirements: [
    // Introductory sequence (footnote 1: honors MATH340–341)
    { kind: "course", id: "math140", name: "Calculus I", options: ["MATH140"] },
    { kind: "course", id: "math141", name: "Calculus II", options: ["MATH141"] },
    { kind: "course", id: "math240", name: "Introduction to Linear Algebra", options: ["MATH240", "MATH340", "MATH461"], overlay: true },
    { kind: "course", id: "math241", name: "Calculus III", options: ["MATH241", "MATH340"] },
    { kind: "course", id: "math310", name: "Introduction to Mathematical Proof", options: ["MATH310"] },
    { kind: "course", id: "intro3", name: "MATH246 or MATH462", options: ["MATH246", "MATH462", "MATH341"] },
    // MATH/AMSC/STAT courses: eight at the 400 level, which must include… (footnote 2)
    { kind: "course", id: "math410", name: "Advanced Calculus I", options: ["MATH410"] },
    { kind: "course", id: "stat410", name: "Introduction to Probability Theory", options: ["STAT410"] },
    { kind: "choose", id: "stat4xx", name: "STAT4XX (other than STAT400, STAT410 and STAT464)", count: 1, from: { departments: ["STAT"], minNumber: 400, maxNumber: 499, exclude: ["STAT400", "STAT410", "STAT464"] } },
    { kind: "course", id: "algebra", name: "MATH401, MATH405 or MATH423", options: ["MATH401", "MATH405", "MATH423"] },
    { kind: "course", id: "numerical", name: "AMSC460 or AMSC466", options: ["AMSC460", "AMSC466"] },
    {
      kind: "course",
      id: "applied",
      name: "One of MATH416, 420, 424, 431, 452, 456, 462, 463, 464, 475",
      options: ["MATH416", "MATH420", "MATH424", "MATH431", "MATH452", "MATH456", "MATH462", "MATH463", "MATH464", "MATH475"],
      // Department page (3)(f): a MATH462 used for the MATH246 slot may also count here.
      overlay: true,
    },
    {
      kind: "sets",
      id: "depth",
      name: "Depth sequence (one year)",
      overlay: true,
      options: [
        ["MATH410", "MATH411"],
        ["MATH410", "MATH463"],
        ["MATH416", "MATH464"],
        ["MATH462", "MATH463"],
        ["STAT410", "STAT420"],
      ],
    },
    // Electives (footnote 3) fill out the eight.
    { kind: "choose", id: "eight", name: "Eight 400-level MATH/AMSC/STAT courses", count: 8, overlay: true, from: { ...MATH_400_LEVEL, exclude: NOT_ELECTIVES } },
    // Computer programming requirement
    {
      kind: "course",
      id: "programming",
      name: "Computer programming course",
      options: [
        "CMSC106", "CMSC131", "CMSC141", "CMSC132", "CMSC142",
        "AOSC247", "BIOE241", "ENAE202", "ENME202", "ENME351", "ENME489I", "ENEE150", "PHYS165", "PHYS265", "AOSC358L",
      ],
    },
    // Supporting three-course sequence (one of twelve; footnote 4)
    {
      kind: "sets",
      id: "supporting",
      name: "Supporting three-course sequence",
      overlay: true,
      options: [
        // One
        ["PHYS161", "PHYS260", "PHYS261", "PHYS270", "PHYS271"],
        // Two
        ["PHYS171", "PHYS272", "PHYS273"],
        // Three
        ["ENES102", "PHYS161", "ENES220"],
        // Four
        ...CMSC_I.flatMap((i) => CMSC_II.map((ii) => [i, ii, "CMSC216"])),
        // Five
        ["CHEM146", "CHEM177", "CHEM237", "CHEM247"],
        // Six
        ["CHEM131", "CHEM132", "CHEM231", "CHEM232", "CHEM241", "CHEM242"],
        // Seven
        ["ECON200", "ECON201", "ECON305"],
        ["ECON200", "ECON201", "ECON306"],
        ["ECON200", "ECON201", "ECON325"],
        ["ECON200", "ECON201", "ECON326"],
        // Eight
        ["BMGT220", "BMGT221", "BMGT340"],
        // Nine
        ...BIO_LABS.flatMap((labs) => GEN_CHEM.map((chem) => ["BSCI170", "BSCI160", ...labs, ...chem])),
        // Ten
        ["ASTR130", "ASTR131", "ASTR232"],
        // Eleven
        ...GEOL_UPPER.flatMap((a, i) => GEOL_UPPER.slice(i + 1).map((b) => ["GEOL100", "GEOL110", a, b])),
        // Twelve
        ["AOSC200", "AOSC201", AOSC_400_TWO],
      ],
    },
  ],
};

export const mathMajorAppliedMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "Math (Applied)", major: "math", track: "Applied Mathematics", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/mathematics/mathematics-major/", department: "https://www-math.umd.edu/course-requirements.html" } };
