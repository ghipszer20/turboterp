// Anthropology Major, Bachelor of Science, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/anthropology/anthropology-major/
// (fetched 2026-09-28); Department of Anthropology, "How to become an Anthropology Major?",
// https://anth.umd.edu/undergraduate/how-become-anthropology-major (fetched 2026-09-28).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree,
// follow the department page; each such difference is recorded below citing both.
// Encoded by hand. UNVERIFIED until the owner signs off.
//
// Shared requirements (Foundational, Method and Theory, Applied Field Methods, Anthropology
// Electives) are duplicated from anth-major-ba-2026-27.ts, same pattern as the CPSE tracks --
// see reviewNotes there for the shared reasoning.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const anthMajorBs: Program = {
  id: "anth-major-bs",
  name: "Anthropology Major (Bachelor of Science)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Anthropology Major, " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/anthropology/anthropology-major/ " +
    "(fetched 2026-09-28); Department of Anthropology, \"How to become an Anthropology Major?\", " +
    "https://anth.umd.edu/undergraduate/how-become-anthropology-major (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Posted substitution (owner, 2026-10-07): footnotes 2 and 3 say 'For students taking BSCI160, BSCI161 may count for BSCI180' and 'For students taking BSCI170, BSCI171 may count for BSCI180', so the supporting list also has the rows BSCI160 & BSCI161 and BSCI170 & BSCI171.",
    "No department-vs-catalog disagreement found on degree requirements: the department page only describes the admission process (meet the undergraduate advisor, complete an academic planning workshop, submit a graduation plan for approval, up to 15 business days) -- an admission gate, not a degree-completion rule, so it isn't encoded.",
    "Foundational Courses ('select three of the following: ANTH210, ANTH222, ANTH240, ANTH260') and Method and Theory Courses ('select two of: ANTH310, ANTH322, ANTH340, ANTH360') are encoded as `choose` requirements with `count`, not `credits`, since ANTH222 (4 credits) makes the pool's total credits variable (9-10) depending which three are picked.",
    "Applied Field Methods ('select a minimum of 3 credits' from a named list) is encoded as a `choose` requirement with `credits: 3` over that course list.",
    "Anthropology Electives ('a minimum of 12 credits offered in Anthropology, not double-counted for other Anthropology requirements') is encoded as a `choose` requirement over department ANTH, `credits: 12`, excluding every course already used by Foundational, Method and Theory, and Applied Field Methods above (same pattern as geol-major-professional-2026-27.ts's geology elective) so it can't double-count against them.",
    "Sample plan only: the Anthropology Electives requirement matches any ANTH-department course not used elsewhere, but every ANTH course number named in the fetched source (program-sources/anthropology-major.md) is already claimed by Foundational, Method and Theory, or Applied Field Methods. The sample plan fills the 12 credits with ANTH323, ANTH441, ANTH415 and ANTH440 -- real ANTH courses (checked against the Academic Catalog approved-course list, 2026-09-28); flagged in docs/project/owner-review.md for the owner to substitute real current ANTH elective offerings.",
    "Quantitative Skills Requirement (B.S., 'select two of: STAT100, MATH140, MATH141, MATH120, MATH121', 7-8 credits) is encoded with `count: 2` (the pool mixes 3- and 4-credit courses, so credits alone can't pin the requirement).",
    "Supporting Course Work (B.S., 'select three of' a ~45-row course list, 9-12 credits) is encoded as a `sets` requirement with `count: 3`: most rows are a single course, but three rows are two-course sequences (BSCI160&BSCI180, BSCI170&BSCI180, GEOL100&GEOL110) that must be taken together to satisfy that row, so each row is one 'set' (one or two members) per the `sets` kind's documented use for exactly this shape.",
    "NOT encoded (ambiguous source, flagged in docs/project/owner-review.md): the footnote 'Students with an archaeological focus must take this class' appears twice around the Applied Field Methods list in the fetched source; it isn't clear which course it modifies (most likely ANTH496, 'Field Methods in Archaeology 1') or what defines an 'archaeological focus', since the catalog page never establishes a formal archaeology concentration/track elsewhere.",
    "Not encoded (engine gap): the catalog's 'minimum 2.0 cumulative grade point average across all courses used to satisfy major degree requirements' -- the audit checks per-course minGrade (encoded here as C-), not a GPA average across the major's courses. Also not encoded: the program's own credit-range totals (39-54, driven entirely by the variable Foundational/Quantitative/Supporting Course Work sub-ranges) -- the audit has no total-credit-minimum concept.",
    "Re-checked against the ANTH BS Major Checklist (Feller Center, dated 5/2/24, program-sources/anthropology-major.md 'ANTH BS Major Checklist' section) -- older than the 2026-27 catalog, so the catalog governs where they differ:",
    "Checked, matches: the checklist's Applied Field Methods and 'ANTH Specialization Science Courses of Choice' rows don't name specific courses themselves (both point to an external list at ter.ps/anthreq); the catalog's own explicit lists, already encoded above as applied-field-methods and supporting-coursework-bs, are unaffected.",
    "NOT encoded (ambiguous, flagged in docs/project/owner-review.md): the checklist's Method and Theory row adds '1 of which must be in your area of focus' -- neither source defines 'area of focus' formally (same gap as the archaeological-focus footnote above), so this isn't encoded as an extra constraint beyond the existing count: 2.",
    "NOT encoded (engine gap, flagged in docs/project/owner-review.md): the checklist's 'ANTH Courses of Choice' (its name for the catalog's 12-credit Anthropology Electives) caps at most 6 of the 12 credits from ANTH358/ANTH386/ANTH398A and requires 2 of the 4 slots to be upper-level -- the `choose` requirement kind has no per-subset credit cap or partial-level-minimum concept, so anthropology-electives above stays an unrestricted 12-credit ANTH choose, matching the catalog's plain wording.",
    "Flagged, not changed (checklist older, contradicts catalog): the checklist's Quantitative Requirement course list ('MATH107, 135 or STAT100+, MATH120, 140 or 136, and/or MATH121 or MATH141') names MATH107/MATH135/MATH136, which the 2026-27 catalog's B.S. Quantitative Skills list (STAT100, MATH140, MATH141, MATH120, MATH121) does not include. Per the owner's ruling that a checklist older than the 2026-27 catalog loses to the catalog on contradiction, quantitative-skills-bs above is left matching the catalog; flagged for the owner in case the department intends the broader list.",
  ],
  requirements: [
    {
      kind: "choose",
      id: "foundational",
      name: "Foundational Courses (select three)",
      count: 3,
      from: { courses: ["ANTH210", "ANTH222", "ANTH240", "ANTH260"] },
    },
    {
      kind: "choose",
      id: "method-theory",
      name: "Method and Theory Courses (select two)",
      count: 2,
      from: { courses: ["ANTH310", "ANTH322", "ANTH340", "ANTH360"] },
    },
    {
      kind: "choose",
      id: "applied-field-methods",
      name: "Applied Field Methods (minimum 3 credits)",
      credits: 3,
      from: {
        courses: [
          "ANTH271", "ANTH341", "ANTH447", "ANTH451", "ANTH464", "ANTH467",
          "ANTH468", "ANTH472", "ANTH491", "ANTH492", "ANTH498", "ANTH496",
        ],
      },
    },
    {
      kind: "choose",
      id: "anthropology-electives",
      name: "Anthropology Electives (minimum 12 credits)",
      credits: 12,
      from: {
        departments: ["ANTH"],
        exclude: [
          "ANTH210", "ANTH222", "ANTH240", "ANTH260",
          "ANTH310", "ANTH322", "ANTH340", "ANTH360",
          "ANTH271", "ANTH341", "ANTH447", "ANTH451", "ANTH464", "ANTH467",
          "ANTH468", "ANTH472", "ANTH491", "ANTH492", "ANTH498", "ANTH496",
        ],
      },
    },
    {
      kind: "choose",
      id: "quantitative-skills-bs",
      name: "Quantitative Skills Requirement (B.S., select two)",
      count: 2,
      from: { courses: ["STAT100", "MATH140", "MATH141", "MATH120", "MATH121"] },
    },
    {
      kind: "sets",
      id: "supporting-coursework-bs",
      name: "Supporting Course Work (B.S., select three)",
      count: 3,
      options: [
        ["AGNR301"], ["AREC241"], ["AREC326"], ["AREC345"], ["AREC365"], ["AREC433"], ["AREC453"],
        ["AOSC123"], ["BSCI103"], ["BSCI160", "BSCI180"], ["BSCI160", "BSCI161"], ["BSCI170", "BSCI180"], ["BSCI170", "BSCI171"], ["BSCI135"], ["BSCI189"],
        ["BSCI201"], ["BSCI202"], ["BSCI222"], ["BSCI223"], ["BSCI360"], ["BSCI361"], ["BSCI363"], ["BSCI370"],
        ["BSCI462"], ["BSCI471"], ["CMSC131"], ["CMSC132"], ["ENST233"], ["ENST440"], ["GEOL100", "GEOL110"],
        ["GEOL340"], ["GEOL342"], ["GEOL446"], ["GEOG330"], ["GEOG332"], ["GEOG372"], ["GEOG373"], ["GEOG416"],
        ["GEOG431"], ["GEOG472"], ["GEOG473"], ["MIEH300"], ["MIEH321"], ["HLTH130"], ["HLTH200"], ["HLTH300"],
        ["HIST204"],
      ],
    },
  ],
};

export const anthMajorBsMeta: ProgramMeta = {
  kind: "major",
  college: "BSOS",
  short: "Anthropology (B.S.)",
  major: "anth",
  track: "B.S.",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/anthropology/anthropology-major/",
    department: "https://anth.umd.edu/undergraduate/how-become-anthropology-major",
  },
};
