// Technology and Information Design Major (BA, College Park), College of Information, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/information/technology-info-design-major/,
// ischool.umd.edu/academics/bachelors-programs/bachelor-of-arts-in-technology-and-information-design-at-college-park
// and .../change-major (all fetched 2026-09-28); see program-sources/technology-info-design-major.md.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";
import { infosciBenchmarkRequirements, infosciCoreRequirements } from "./infosci-shared-2026-27.ts";

const shared = (id: string): Requirement => {
  const found = [...infosciBenchmarkRequirements, ...infosciCoreRequirements].find((r) => r.id === id);
  if (!found) throw new Error(`missing shared requirement ${id}`);
  return found;
};

const c = (code: string, name: string): Requirement => ({
  kind: "course",
  id: `tid-${code.toLowerCase()}`,
  name: `${name} (${code})`,
  options: [code],
});

export const tidMajor: Program = {
  id: "tid-major",
  name: "Technology and Information Design Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Technology and Information Design Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/information/technology-info-design-major/); " +
    "College of Information department pages https://ischool.umd.edu/academics/bachelors-programs/" +
    "bachelor-of-arts-in-technology-and-information-design-at-college-park and .../change-major (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Department page says 45 credits in the major: 'ten core courses' plus 15 credits (five courses) of upper-level " +
      "electives, and elsewhere 'six additional elective' courses. The catalog lists 13 core rows (37 credits, " +
      "INST380 or PLCY380 counted once) plus 18 elective credits = 55. The department page is internally " +
      "inconsistent and does not list courses, so the catalog is encoded (18 elective credits from the 10 named " +
      "courses); the 15-credit / 45-credit figures are not enforced. Confirm with the advisor.",
    "Catalog: 'Additional elective courses may be added upon approval by the program committee.' Not encodable; " +
      "an approved substitute would show the elective row as unmet.",
    "Catalog Benchmark I (INST104, INST126, IDEA258; C- or higher in first two semesters) and Benchmark II " +
      "(INST201, SOCY105, STAT100; first three semesters), with possible dismissal, are encoded as ordinary course " +
      "rows at the C- minimum; the semester timelines are not encodable.",
    "Manual: overall 2.0 GPA; change-of-major / admission process (TerpEngage, Registration Projection form); " +
      "total-credit minimum (120, including 40 Gen Ed).",
    "IDEA258 is encoded as IDEA258 in general (catalog names section IDEA258A as the intended topic). INST404, " +
      "INST460 and INST463 are catalog rows with a parenthetical special-topic title.",
    "No official four-year plan was in the fetched sources; the sample plan is CONSTRUCTED from the catalog.",
  ],
  requirements: [
    // Benchmark I
    c("INST104", "Design Across Campus"),
    shared("infosci-inst126"),
    c("IDEA258", "Special Topics in Innovation (Becoming a Design Thinker)"),
    // Benchmark II
    shared("infosci-inst201"),
    c("SOCY105", "Understanding Contemporary Social Problems"),
    shared("infosci-stat100"),
    // Core
    c("INST204", "Designing Fair Systems"),
    {
      kind: "course",
      id: "tid-inst380",
      name: "Technology and Information Design: Do Good Now (INST380 or PLCY380)",
      options: ["INST380", "PLCY380"],
    },
    c("INST367", "Prototyping and Development Studio"),
    c("INST406", "Cross Disciplinary Design Communication Lab"),
    c("INST454", "Project Development Studio"),
    c("INST466", "Technology, Culture, and Society"),
    c("INST491", "Integrated Capstone for Technology and Information Design"),
    {
      kind: "choose",
      id: "tid-electives",
      name: "Major electives: 18 credits from the approved list",
      credits: 18,
      from: {
        courses: [
          "INST311", "INST352", "INST366", "INST401", "INST402",
          "INST404", "INST405", "INST441", "INST460", "INST463",
        ],
      },
    },
  ],
};

export const tidMajorMeta: ProgramMeta = {
  kind: "major",
  college: "INFO",
  short: "Technology & Information Design",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/information/technology-info-design-major/",
    department:
      "https://ischool.umd.edu/academics/bachelors-programs/bachelor-of-arts-in-technology-and-information-design-at-college-park",
  },
};
