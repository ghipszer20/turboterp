// Israel Studies Minor, 2026–27 UMD Academic Catalog (Meyerhoff Center for Jewish Studies /
// Gildenhorn Institute for Israel Studies).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/jewish-studies/israel-studies-minor/
// (fetched 2026-09-28); Jewish Studies, https://jewishstudies.umd.edu/academic-programs/undergraduate/is-minor
// (fetched 2026-09-28). Owner ruling (docs/project/rulings.md): where the department page and the
// catalog disagree, follow the department page. No official published sample plan.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const isrlMinor: Program = {
  id: "isrl-minor",
  name: "Israel Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Israel Studies Minor; Jewish Studies, " +
    "https://jewishstudies.umd.edu/academic-programs/undergraduate/is-minor (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Department-vs-catalog difference (owner ruling: follow the department page): the department page's elective list gives HEBR211 and HEBR212, while the catalog lists HEBR106, HEBR107 and HEBR212 (no HEBR211). Encoded per the department page, so HEBR106/HEBR107 are not accepted.",
    "Department-vs-catalog difference: the department page's introductory paragraph says the minor includes 'ISRL349Z: History of Zionism and Israel' and 4 other ISRL courses, but its own 'Minor Requirements' list (and the catalog) name ISRL342/HIST376 as the required history course. Encoded per the requirements list (ISRL342/HIST376); ISRL349Z is not required. Please confirm.",
    "The catalog also lists ISRL448 (Seminar, sections A/B) as an elective row; it is already the required core course, and a course counts once, so it isn't repeated in the elective list.",
    "Middle East Studies slot: HIST120 or HIST491 only. Both sources say the list is not complete, other courses may be substituted with the advisor's approval, and ISRL courses can't count; the substitution is not encoded (manual).",
    "'A student may use a maximum of 6 credits (two courses) to satisfy requirements for both a major and a minor' -> maxSharedWith: [{ courses: 2 }]. The rule that courses for one minor can't count for another minor is stricter than this cap; the cap applies to any other program, and the minor-to-minor ban is manual.",
    "Not encoded (manual): at least 9 credits at 3xx/4xx level (6 taken at UMD, including UM Study Abroad); no more than 3 credits of language below the 3xx level; up to 2 courses may be taken elsewhere with advisor approval; application rules (30 credits completed, ISRL342 grade of C or higher before applying, admission before the final six credits); other courses by petition.",
  ],
  requirements: [
    { kind: "course", id: "history", name: "History of Modern Israel", options: ["ISRL342", "HIST376"] },
    { kind: "course", id: "seminar", name: "Seminar in Israel Studies", options: ["ISRL448"] },
    { kind: "course", id: "middle-east", name: "Middle East Studies course", options: ["HIST120", "HIST491"] },
    {
      kind: "choose",
      id: "electives",
      name: "Two elective courses",
      count: 2,
      from: {
        courses: [
          "ISRL289", "ISRL449",
          "HEBR211", "HEBR212", "HEBR313", "HEBR314", "HEBR381",
          "ARAB104", "ARAB105", "ARAB204", "ARAB205", "ARAB207", "ARAB304", "ARAB305",
          "JWST304", "JWST471", "JWST478",
        ],
      },
    },
  ],
};

export const isrlMinorMeta: ProgramMeta = { kind: "minor", college: "ARHU", short: "Israel Studies", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/jewish-studies/israel-studies-minor/", department: "https://jewishstudies.umd.edu/academic-programs/undergraduate/is-minor" } };
