// German Studies Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/germanic-studies/german-studies-major/;
// sllc.umd.edu/german (department page: general/nav content only, no German-Studies-specific
// requirement list to compare against the catalog); College of Arts and Humanities official
// four-year academic plan for German Studies (Google Drive PDF, converted to text, fetched
// 2026-09-28). The ARHU world-language-placement page was also fetched as context (generic
// ARHU-wide placement-exam procedure, no German-specific requirement content).
// Owner ruling (docs/project/rulings.md, 2026-09-26): where the department page (the college's own
// four-year plan counts as one) and the Academic Catalog disagree, the department page wins.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const gersMajor: Program = {
  id: "gers-major",
  name: "German Studies Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, German Studies Major; " +
    "College of Arts and Humanities official four-year academic plan for German Studies, " +
    "fetched 2026-09-28 (https://drive.google.com/uc?export=download&id=1hDoLft_mRqAwKEzh2voKvNnt32zj761n#German-Studies)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page vs. catalog: no disagreement found. sllc.umd.edu/german has no German-Studies-" +
      "specific requirement list (only site navigation and a general program description), so there is " +
      "nothing on it to conflict with the catalog. The college's official four-year plan (a department " +
      "source under the owner's ruling) DOES give a full requirement breakdown, and it matches the " +
      "catalog exactly: Core Language Sequence (GERS204, GERS301, GERS302, 9 credits), then three " +
      "6-credit Area Requirements (Language: two of GERS315/319/402/419/473; Literature: two of " +
      "GERS320/322/331/436/439/442/443/444/458; Culture: two of GERS356/399/441/449/489), then a " +
      "9-credit 'IV. Additional German Courses' bucket that is the catalog's 'Elective Courses' " +
      "section under a different label (the plan just doesn't repeat that section's specific 9-course " +
      "list: GERS255/289/299/339/349/367/383/385/389). Total matches the catalog's 36 credits.",
    "The four-year plan PDF's term-grid text conversion is garbled (a per-benchmark sidebar and the " +
      "Fall/Spring columns are interleaved on each line), but reading it as 3 columns (benchmark " +
      "sidebar, Fall, Spring) recovers exactly 12 GERS course slots in an order consistent with the " +
      "'Major Requirements' legend (3 core, 2 language-area, 2 literature-area, 2 culture-area, 3 " +
      "elective) with no leftovers and no gaps. `packages/programs/sample-plans/gers-major.json` is " +
      "`official: true`; the slot-to-course text mapping is legible but the exact term placement is " +
      "still flagged as reconstructed from that reading. Please verify against the original PDF if " +
      "exact term placement matters.",
    "Not encoded (no language-of-instruction attribute in the engine): 'No more than 9 credits of the " +
      "36 total required may be satisfied by courses taught in English. With the approval of the " +
      "German Studies advisor, 6 of the 9 credits may be taken outside the department.' All nine " +
      "catalog-listed elective options are footnoted 'Taught in English', so taking all three " +
      "electives already reaches the 9-credit cap; this isn't checked.",
    "The World Language Placement page (arhu.umd.edu/academics/world-language-placement, fetched as " +
      "context) has no German-specific placement rule to encode; it's a generic ARHU-wide procedure " +
      "description page.",
    "Not encoded (engine gaps): the plan's 'At least 27 credits " +
      "must be completed at 3xx-4xx level' aggregate check, residency rules (30 credits at UMD, 15 of " +
      "the final 30 at the 300-400 level, 12 upper-level major credits at UMD), ARHU's 39 upper-level-" +
      "credit graduation requirement, and the 120-credit graduation minimum. Program GPA 2.0 encoded as minGpa.",
  ],
  requirements: [
    { kind: "course", id: "gers204", name: "German Grammar Review", options: ["GERS204"] },
    {
      kind: "course",
      id: "gers301",
      name: "Conversation and Composition I: The German-Speaking World",
      options: ["GERS301"],
    },
    {
      kind: "course",
      id: "gers302",
      name: "Conversation and Composition II: Current Topics in German-Speaking Society",
      options: ["GERS302"],
    },
    {
      kind: "choose",
      id: "language-courses",
      name: "Select two of: GERS315, GERS319, GERS402, GERS419, GERS473",
      credits: 6,
      from: { courses: ["GERS315", "GERS319", "GERS402", "GERS419", "GERS473"] },
    },
    {
      kind: "choose",
      id: "literature-courses",
      name: "Select two of: GERS320, GERS322, GERS331, GERS436, GERS439, GERS442, GERS443, GERS444, GERS458",
      credits: 6,
      from: {
        courses: [
          "GERS320",
          "GERS322",
          "GERS331",
          "GERS436",
          "GERS439",
          "GERS442",
          "GERS443",
          "GERS444",
          "GERS458",
        ],
      },
    },
    {
      kind: "choose",
      id: "culture-courses",
      name: "Select two of: GERS356, GERS399, GERS441, GERS449, GERS489",
      credits: 6,
      from: { courses: ["GERS356", "GERS399", "GERS441", "GERS449", "GERS489"] },
    },
    {
      kind: "choose",
      id: "elective-courses",
      name: "Select three 2xx-4xx level elective courses",
      credits: 9,
      from: {
        courses: [
          "GERS255",
          "GERS289",
          "GERS299",
          "GERS339",
          "GERS349",
          "GERS367",
          "GERS383",
          "GERS385",
          "GERS389",
        ],
      },
    },
  ],
};

export const gersMajorMeta: ProgramMeta = {
  kind: "major",
  college: "ARHU",
  short: "German Studies",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/germanic-studies/german-studies-major/",
    department: "https://drive.google.com/uc?export=download&id=1hDoLft_mRqAwKEzh2voKvNnt32zj761n#German-Studies",
  },
};
