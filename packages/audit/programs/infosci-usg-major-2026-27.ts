// Information Science Major at Shady Grove (BSIS), College of Information, 2026-27 UMD Academic Catalog.
// Sources: catalog page for Information Science at Universities at Shady Grove and the ischool Shady Grove
// department page (fetched 2026-09-28); see program-sources/information-science.md.
// Builds on the College Park major (infosci-major) and its shared pieces. Encoded by hand. UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";
import { infosciMajor } from "./infosci-major-2026-27.ts";
import { infosciBenchmarkRequirements, infosciCoreRequirements } from "./infosci-shared-2026-27.ts";

const CATALOG =
  "https://academiccatalog.umd.edu/undergraduate/colleges-schools/universities-shady-grove/information/information-science/";
const DEPARTMENT =
  "https://ischool.umd.edu/academics/bachelors-programs/bachelor-of-science-in-information-science-shady-grove";

// Benchmarks: MATH115 is "or higher" at Shady Grove, so that row accepts any MATH course numbered 115+.
const benchmarks: Requirement[] = infosciBenchmarkRequirements.map((r) =>
  r.id === "infosci-math115"
    ? {
        kind: "choose",
        id: "infosci-math115",
        name: "Precalculus (MATH115 or higher)",
        count: 1,
        from: { departments: ["MATH"], minNumber: 115 },
      }
    : r,
);

// Core: the Shady Grove list opens with INST301 (Introduction to Information Science) where College Park has INST201.
const core: Requirement[] = infosciCoreRequirements.map((r) =>
  r.id === "infosci-inst201"
    ? { kind: "course", id: "infosci-inst301", name: "Introduction to Information Science (INST301)", options: ["INST301"] }
    : r,
);

export const infosciUsgMajor: Program = {
  ...infosciMajor,
  id: "infosci-usg-major",
  name: "Information Science Major at Shady Grove",
  source:
    `UMD Academic Catalog 2026-27, Information Science at Shady Grove, ${CATALOG}; ` +
    `College of Information Shady Grove page ${DEPARTMENT} (both fetched 2026-09-28)`,
  reviewNotes: [
    "Shady Grove version of the Information Science major. Differences from College Park: benchmark courses with MATH115 'or higher'; the core list names INST301 (College Park: INST201); no cognate areas (15 credits of INST-coded electives only); a 3-credit Professional Writing course and 12 credits of open electives; 20 courses / 60 credits taken at Shady Grove.",
    "Open slot 'professional-writing' (openSlot requirement): 3 credits of Professional Writing (catalog names no course or department).",
    "Open slot 'open-electives' (openSlot requirement): 12 credits of open electives (no course, department or range given). A literal any-course rule fails the Shady Grove sample plan (it has no 12 spare credits), so the advisor confirms it.",
    "Catalog says 'Select ten of the following' but lists exactly ten core courses, so all ten are required. INST301 is the source's code for Introduction to Information Science; College Park uses INST201. Check INST301 with the advisor if it does not appear in the course catalog.",
    "MATH115 'or higher' is encoded as any MATH course numbered 115 or above. The catalog footnote says other courses also fulfill the benchmarks; check with the advisor (not encodable).",
    "Manual, not encoded: at least 45 of the 60 program credits must be College of Information courses (no engine form); benchmark courses (C- or better) must be complete before program courses (ordering); cumulative 2.0 GPA and one-semester probation rule; 120-credit degree total; four-semester pre-set schedule for transfer students (associate's degree or 60 credits).",
    "Department page checked; it gives no course lists beyond the catalog's (it mentions Dynamic Web Applications and Advanced Data Science as example program courses, which fall under INST electives). No official four-year plan was in the sources; the sample plan is CONSTRUCTED from the catalog, with benchmark courses in years 1-2 (the transfer years).",
  ],
  requirements: [
    ...benchmarks,
    ...core,
    {
      kind: "choose",
      id: "infosci-electives",
      name: "Major electives: 15 credits of INST-coded courses",
      credits: 15,
      from: { departments: ["INST"] },
    },
    {
      kind: "openSlot",
      id: "professional-writing",
      name: "Professional Writing",
      credits: 3,
      note: "One Professional Writing course; the catalog names none, so confirm with your advisor.",
    },
    {
      kind: "openSlot",
      id: "open-electives",
      name: "Open electives",
      credits: 12,
      note: "12 credits of electives; the catalog gives no course, department or range, so confirm with your advisor.",
    },
  ],
};

export const infosciUsgMajorMeta: ProgramMeta = {
  kind: "major",
  college: "USG",
  short: "Information Science (Shady Grove)",
  sources: { catalog: CATALOG, department: DEPARTMENT },
};
