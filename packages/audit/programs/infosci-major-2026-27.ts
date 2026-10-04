// Information Science Major (College Park, InfoSci), College of Information, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/information/information-science-major/,
// ischool.umd.edu/academics/bachelors-programs/bachelor-of-science-in-information-science-college-park and
// .../change-major (all fetched 2026-09-28); see program-sources/information-science-major.md.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { infosciBenchmarkRequirements, infosciCoreRequirements } from "./infosci-shared-2026-27.ts";

export const infosciMajor: Program = {
  id: "infosci-major",
  name: "Information Science Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Information Science Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/information/information-science-major/); " +
    "College of Information department pages https://ischool.umd.edu/academics/bachelors-programs/" +
    "bachelor-of-science-in-information-science-college-park and .../change-major (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "The catalog offers two elective options: (1) 15 credits of INST-coded electives, or (2) an InfoSci Cognate Area " +
      "(Data Science, Cybersecurity and Privacy, Digital Curation, Health Information). The fetched catalog gives only " +
      "prose descriptions of the cognate areas and names NO courses for them, so they cannot be encoded as tracks. " +
      "The 15-credit elective is encoded as any INST course (option 1); a student taking a cognate area whose " +
      "courses are outside INST would show this row as unmet. Check the cognate course lists with the advisor.",
    "Department page says 'five courses of upper-level major electives'; the catalog says only 'INST-coded major " +
      "electives'. Encoded as the catalog's wider rule (any INST level, 15 credits) rather than narrowing; the " +
      "upper-level wording is not enforced.",
    "Department page: 45 credits in the major (10 core courses + 15 elective); the catalog total of 57 includes the " +
      "12-credit Benchmark Courses. Both are consistent with what is encoded.",
    "Catalog: 'Other courses exist which fulfill this requirement. Please check with your advisor' (footnote on the " +
      "elective rows). Not encodable.",
    "Manual: overall 2.0 GPA; change-of-major / admission process (Registration Projection form, TerpEngage); " +
      "total-credit minimum (120, including 40 Gen Ed).",
    "No official four-year plan was in the fetched sources; the sample plan is CONSTRUCTED from the catalog tables.",
  ],
  requirements: [
    ...infosciBenchmarkRequirements,
    ...infosciCoreRequirements,
    {
      kind: "choose",
      id: "infosci-electives",
      name: "Major electives: 15 credits of INST-coded courses (or an InfoSci Cognate Area, not encodable)",
      credits: 15,
      from: { departments: ["INST"] },
    },
  ],
};

export const infosciMajorMeta: ProgramMeta = {
  kind: "major",
  college: "INFO",
  short: "Information Science",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/information/information-science-major/",
    department:
      "https://ischool.umd.edu/academics/bachelors-programs/bachelor-of-science-in-information-science-college-park",
  },
};
