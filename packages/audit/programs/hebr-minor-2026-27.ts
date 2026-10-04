// Hebrew Studies Minor, 2026–27 UMD Academic Catalog. Cross-listed: the same requirement table
// appears under Jewish Studies (JWST) and Languages, Literatures, and Cultures (SLLC); encoded once.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/hebrew-minor/
// and .../jewish-studies/hebrew-studies-minor/ (fetched 2026-09-28); https://sllc.umd.edu/hebrew
// (fetched 2026-09-28). No official published sample plan (see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const hebrMinor: Program = {
  id: "hebr-minor",
  name: "Hebrew Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Hebrew Studies Minor (cross-listed SLLC and Jewish Studies); " +
    "https://sllc.umd.edu/hebrew (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Cross-listed minor: the SLLC and JWST catalog pages carry the same requirement table; encoded once (id hebr-minor, college ARHU).",
    "Department page not checked: https://sllc.umd.edu/hebrew is a program homepage with no requirements (it only links to the catalog page), so the minor is encoded from the catalog alone.",
    "The JWST catalog page's fetch returned no requirement text; the SLLC catalog page supplied the table (same minor).",
    "'No more than six credits (two courses) may count toward both the major and the minor' -> maxSharedWith: [{ courses: 2 }].",
    "Prerequisites HEBR106, HEBR107 and HEBR206 (or placement) do not count toward the minor and are not requirements here.",
    "The '16 credits from five courses' total is met by the four required courses (14 credits) plus one elective of 3 or more credits; the elective is encoded as one course from the list.",
    "The elective list is 'previously offered' courses; 'other relevant courses in Jewish literature, Israeli film, Biblical Hebrew, etc. may be approved by the advisor' names no department or range, so it is not encoded; the electives requirement is marked advisorMayApprove (advisor approval). ISRL282 is listed without a title in the catalog.",
    "Nine credits at the 300/400 level: encoded as an overlay over the required and elective courses at that level.",
    "Students placing into the advanced level replace HEBR207 with equivalent credits chosen with the advisor; not encoded (advisor approval).",
    "Not encoded (engine gaps): no more than one upper-division course in English translation; independent study and Winter/Summer special courses with advisor approval; at most six credits at another institution with all upper-division credits at UMD; per-course C- minimum is encoded. Program GPA 2.0 encoded as minGpa.",
  ],
  requirements: [
    { kind: "course", id: "hebr207", name: "Intensive Intermediate Hebrew II", options: ["HEBR207"] },
    { kind: "course", id: "hebr249", name: "Special Topics in Hebrew Studies (taught in Hebrew)", options: ["HEBR249"] },
    { kind: "course", id: "hebr313", name: "Conversation and Composition I", options: ["HEBR313"] },
    { kind: "course", id: "hebr314", name: "Conversation and Composition II", options: ["HEBR314"] },
    {
      kind: "choose",
      id: "electives",
      advisorMayApprove: true,
      name: "One elective (3 or more credits)",
      count: 1,
      from: {
        courses: [
          "JWST219", "JWST262", "ISRL282", "JWST319", "HEBR381", "HEBR386",
          "HEBR499", "JWST478", "HEBR498", "JWST459",
        ],
      },
    },
    {
      kind: "choose",
      id: "upper-level",
      name: "Nine credits at the upper level (300/400)",
      overlay: true,
      credits: 9,
      from: {
        courses: [
          "HEBR313", "HEBR314", "JWST319", "HEBR381", "HEBR386",
          "HEBR499", "JWST478", "HEBR498", "JWST459",
        ],
      },
    },
  ],
};

export const hebrMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/languages-literatures-cultures/hebrew-minor/",
    department: "https://sllc.umd.edu/hebrew",
  },
};
