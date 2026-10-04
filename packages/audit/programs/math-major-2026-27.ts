// Mathematics Major, Traditional Track, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/mathematics/mathematics-major/
// (packages/catalog/test/fixtures/math-major.html, lists[0]); Department of Mathematics,
// https://www-math.umd.edu/course-requirements.html (fetched 2026-09-26). Owner ruling
// (docs/project/rulings.md): where the department page and the catalog disagree, follow the
// department page; each such difference is recorded below citing both sources.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const MATH_400_LEVEL = { departments: ["MATH", "AMSC", "STAT"], minNumber: 400, maxNumber: 499 };
// Footnote 4: electives may not include these.
const NOT_ELECTIVES = ["MATH461", "MATH478", "MATH480", "MATH481", "MATH482", "MATH483", "MATH484", "STAT464"];
// ASSUMPTION (PROJECT_MEMORY section 17, open question 4; owner to confirm): Sequence Four accepts
// CMSC141 for CMSC131 and CMSC142 for CMSC132, as the Applied track does (the owner ruled these
// substitute generally). To reverse, set these back to ["CMSC131"] and ["CMSC132"].
const CMSC_I = ["CMSC131", "CMSC141"];
const CMSC_II = ["CMSC132", "CMSC142"];
// Department page item 5, Sequence Nine: BSCI105 or (170 and 171), BSCI106 or (160 and 161),
// and one of CHEM131/132 or CHEM146/177. Encoded with the catalog's current BSCI/CHEM codes,
// matching the Applied track's Sequence Nine (the department page's "105"/"106" pairing is stale).
const BIO_LABS = [["BSCI180"], ["BSCI171", "BSCI161"]];
const GEN_CHEM = [["CHEM131", "CHEM132"], ["CHEM146", "CHEM177"]];
// Department page item 5, Sequence Eleven: GEOL100/110 plus two of these.
const GEOL_UPPER = ["GEOL322", "GEOL340", "GEOL341", "GEOL375"];
// Department page item 5, Sequence Twelve: AOSC200/201 plus two additional 400-level AOSC courses.
const AOSC_400_TWO = { count: 2, from: { departments: ["AOSC"], minNumber: 400, maxNumber: 499 } };

export const mathMajorTraditional: Program = {
  id: "math-major-traditional",
  name: "Mathematics Major (Traditional Track)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Mathematics Major, Traditional Track; " +
    "Department of Mathematics, https://www-math.umd.edu/course-requirements.html (fetched 2026-09-26)",
  // Owner-confirmed 2026-09-25: C- minimum; CMSC131 may count for programming and Sequence Four.
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Honors sequence (footnote 1): 'MATH340 satisfies MATH241; MATH340–MATH341 satisfies MATH240–MATH241–MATH246.' Approximated: MATH340 counts for MATH240 (overlay) and MATH241; MATH341 counts for the MATH246/436/462 slot. MATH340 alone would wrongly satisfy MATH240 too.",
    "Eight 400-level MATH/AMSC/STAT courses: encoded as an overlay count of 8 that the specific requirements (MATH410, algebra, AMSC, STAT, depth) also count toward. Footnote 4's exclusions (MATH461, 478, 480–484, STAT464) are applied to all eight, not only the electives.",
    "The depth sequence is an overlay: its courses may also be MATH410 / the algebra course.",
    "Department page item (1)'s 'If MATH 436 or 462 is used to fulfill the MATH246 requirement, it may also be used to fulfill the upper level math requirement in (3)(f)' needs no code change here: 'eight' is already an overlay, so a MATH436/462 used for intro3 already counts toward it for free. The catalog is silent on this reuse.",
    "Applied Mathematics Track (the owner's track) is encoded separately in math-major-applied-2026-27.ts.",
    "Programming requirement also accepts CMSC141/CMSC142 (owner confirmed these substitute for CMSC131/132 in CS; assumed here too). Sequence Four also accepts CMSC141 for CMSC131 and CMSC142 for CMSC132, matching the Applied track (assumed, PROJECT_MEMORY section 17 open question 4; owner to confirm).",
    "Department-vs-catalog difference (owner ruling: follow the department page): the department page says 'the MATH 240 requirement may be fulfilled by MATH461'; the catalog's footnote 1 doesn't mention it. Added to math240 (overlay); MATH461 stays excluded from the eight electives (footnote 4).",
    "Department-vs-catalog difference (owner ruling: follow the department page): the department page's programming list, item (4), is 'CMSC 106, 131, 132, AOSC247, BIOE 241, ENAE 202, ENME202, ENME 351, ENME489I, ENEE150, PHYS 165, PHYS265, AOSC358L' — wider than the catalog's 'CMSC106, 131, 132, ENAE202, ENEE150, PHYS265'. The wider list is encoded (plus CMSC141/142, owner ruling above).",
    "Department-vs-catalog difference (owner ruling: follow the department page): the department page's supporting-sequence list, item 5, adds Sequences Nine (BSCI/CHEM), Ten (ASTR), Eleven (GEOL) and Twelve (AOSC) beyond the catalog's eight sequences. Sequences Nine and Ten are encoded with current course codes (BSCI170/160/180/171/161, ASTR130/131/232) taken from the Applied track's own catalog table (this Traditional catalog table has no equivalent row to check against), not the department page's stale ones (BSCI105/106, ASTR120/121, and a parenthetical 'becomes ASTR130, 131, and 132' that looks like a typo for ASTR232, and possibly for a past year). Flagged for the owner to confirm ASTR232 (not ASTR132) and the BSCI170/160/180/171/161 codes are still current; Eleven and Twelve match the Applied track's encoding exactly.",
    "Both sources state 'students must earn an overall 2.000 average in these major courses to meet graduation requirements' (department page item, unnumbered; catalog: 'with an overall major GPA of 2.0'). Not a department-vs-catalog difference since both agree. Program GPA 2.0 encoded as minGpa.",
    "Footnote 2 (at least four of the 400-level courses taken at College Park) and footnote 3 (outside substitutions with Undergraduate Office approval) are not enforced.",
  ],
  requirements: [
    // Introductory sequence (footnote 1: honors MATH340–341)
    { kind: "course", id: "math140", name: "Calculus I", options: ["MATH140"] },
    { kind: "course", id: "math141", name: "Calculus II", options: ["MATH141"] },
    { kind: "course", id: "math240", name: "Introduction to Linear Algebra", options: ["MATH240", "MATH340", "MATH461"], overlay: true },
    { kind: "course", id: "math241", name: "Calculus III", options: ["MATH241", "MATH340"] },
    { kind: "course", id: "math310", name: "Introduction to Mathematical Proof", options: ["MATH310"] },
    { kind: "course", id: "intro3", name: "MATH246, MATH436 or MATH462", options: ["MATH246", "MATH436", "MATH462", "MATH341"] },
    // MATH/AMSC/STAT courses: eight at the 400 level, which must include…
    { kind: "course", id: "math410", name: "Advanced Calculus I", options: ["MATH410"] },
    { kind: "course", id: "algebra", name: "MATH401, MATH403, MATH405 or MATH423", options: ["MATH401", "MATH403", "MATH405", "MATH423"] },
    { kind: "course", id: "numerical", name: "AMSC460 or AMSC466", options: ["AMSC460", "AMSC466"] },
    { kind: "choose", id: "stat4xx", name: "400-level STAT course other than STAT464", count: 1, from: { departments: ["STAT"], minNumber: 400, maxNumber: 499, exclude: ["STAT464"] } },
    {
      kind: "sets",
      id: "depth",
      name: "Depth sequence (one year)",
      overlay: true,
      options: [
        ["MATH410", "MATH411"],
        ["MATH410", "MATH463"],
        ["MATH403", "MATH404"],
        ["MATH403", "MATH405"],
        ["STAT410", "STAT420"],
      ],
    },
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
    // Supporting three-course sequence (one of twelve; department page item 5 adds Nine-Twelve
    // beyond the catalog's eight, matching the Applied track's supporting sequences)
    {
      kind: "sets",
      id: "supporting",
      name: "Supporting three-course sequence",
      overlay: true,
      options: [
        ["PHYS161", "PHYS260", "PHYS261", "PHYS270", "PHYS271"],
        ["PHYS171", "PHYS272", "PHYS273"],
        ["ENES102", "PHYS161", "ENES220"],
        // Sequence Four (CMSC141/142 substitutes: see CMSC_I and CMSC_II)
        ...CMSC_I.flatMap((i) => CMSC_II.map((ii) => [i, ii, "CMSC216"])),
        ["CHEM146", "CHEM177", "CHEM237", "CHEM247"],
        ["CHEM131", "CHEM132", "CHEM231", "CHEM232", "CHEM241", "CHEM242"],
        ["ECON200", "ECON201", "ECON305"],
        ["ECON200", "ECON201", "ECON306"],
        ["ECON200", "ECON201", "ECON325"],
        ["ECON200", "ECON201", "ECON326"],
        ["BMGT220", "BMGT221", "BMGT340"],
        // Sequence Nine
        ...BIO_LABS.flatMap((labs) => GEN_CHEM.map((chem) => ["BSCI170", "BSCI160", ...labs, ...chem])),
        // Sequence Ten
        ["ASTR130", "ASTR131", "ASTR232"],
        // Sequence Eleven
        ...GEOL_UPPER.flatMap((a, i) => GEOL_UPPER.slice(i + 1).map((b) => ["GEOL100", "GEOL110", a, b])),
        // Sequence Twelve
        ["AOSC200", "AOSC201", AOSC_400_TWO],
      ],
    },
  ],
};

export const mathMajorTraditionalMeta: ProgramMeta = { kind: "major", college: "CMNS", short: "Math (Traditional)", major: "math", track: "Traditional", defaultTrack: true, sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/computer-mathematical-natural-sciences/mathematics/mathematics-major/", department: "https://www-math.umd.edu/course-requirements.html" } };
