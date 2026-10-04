// Family Health Major, School of Public Health (Department of Family Science), 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/family-science/family-health-major/
// and sph.umd.edu/academics/advising-resources/undergraduate-center-academic-success-and-achievement/casa-advising/casa-declare-sph-major
// (both fetched 2026-09-28); see program-sources/family-health-major.md. The department page is a
// change-of-major page with no requirements. SPHL100 and the shared manual notes come from
// sphl-shared-2026-27.ts. Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";
import { sphlFoundations, sphlSharedReviewNotes } from "./sphl-shared-2026-27.ts";

const c = (id: string, name: string, course: string): Requirement => ({
  kind: "course",
  id,
  name: `${name} (${course})`,
  options: [course],
});

export const fmscMajor: Program = {
  id: "fmsc-major",
  name: "Family Health Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Family Health Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/family-science/family-health-major/); " +
    "SPH Declare an SPH Major page, https://sph.umd.edu/academics/advising-resources/undergraduate-center-academic-success-and-achievement/casa-advising/casa-declare-sph-major " +
    "(fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...sphlSharedReviewNotes,
    "The department page (SPH 'Declare an SPH Major') is a change-of-major and advising page with no course requirements, so there is no disagreement with the catalog to resolve.",
    "Grade floor: the catalog states that a 'C-' or better is required in all courses applied toward the major; applied as the program-level minimum.",
    "'FMSC431 or FMSC460' is one row (one course, either option).",
    "'Two 100-200 level FMSC courses' is encoded as two FMSC courses numbered 100-299 and 'two 300-400 level FMSC courses' as two numbered 300-499; required FMSC courses are matched by their own rows first, so they do not also fill an elective slot.",
    "FMSC290 Family Economics appears only in the economics pick-one. If a student uses ECON200 or ECON201 for that row, FMSC290 can fill a 100-200 level elective.",
    "The catalog lists no term-by-term four-year plan for Family Health; the sample plan is CONSTRUCTED from the catalog table. Flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    sphlFoundations,
    c("fmsc-fmsc110", "Families and Global Health", "FMSC110"),
    c("fmsc-fmsc260", "Couples, Marriage, and Families: Intimate Relationship Across the Life Course", "FMSC260"),
    c("fmsc-fmsc302", "Research Methods in Family Health", "FMSC302"),
    c("fmsc-fmsc310", "Maternal, Child and Family Health", "FMSC310"),
    c("fmsc-fmsc330", "Family Health: Health Happens in Families", "FMSC330"),
    c("fmsc-fmsc332", "Children in Families", "FMSC332"),
    c("fmsc-fmsc340", "Mental Health and Healing in Families", "FMSC340"),
    c("fmsc-fmsc374", "Working with Diverse Families in Public Health Practice", "FMSC374"),
    c("fmsc-fmsc381", "Family Inequality", "FMSC381"),
    c("fmsc-fmsc383", "Health and Human Services Delivery and Evaluation", "FMSC383"),
    c("fmsc-fmsc432", "Adult Development and Aging in Families", "FMSC432"),
    c("fmsc-fmsc477", "Internship and Analysis in Family Health", "FMSC477"),
    c("fmsc-fmsc487", "Family Law", "FMSC487"),
    {
      kind: "course",
      id: "fmsc-crises-violence",
      name: "Family Crises, Emergencies and Interventions (FMSC431) or Violence in Families (FMSC460)",
      options: ["FMSC431", "FMSC460"],
    },
    {
      kind: "choose",
      id: "fmsc-social-science",
      name: "Social sciences general course (PSYC100, SOCY100 or SOCY105)",
      count: 1,
      from: { courses: ["PSYC100", "SOCY100", "SOCY105"] },
    },
    {
      kind: "choose",
      id: "fmsc-statistics",
      name: "Statistics general course (QMMS251 or STAT100)",
      count: 1,
      from: { courses: ["QMMS251", "STAT100"] },
    },
    {
      kind: "choose",
      id: "fmsc-communication",
      name: "Communication general course (COMM107, COMM200 or INAG110)",
      count: 1,
      from: { courses: ["COMM107", "COMM200", "INAG110"] },
    },
    {
      kind: "choose",
      id: "fmsc-economics",
      name: "Economics general course (FMSC290, ECON200 or ECON201)",
      count: 1,
      from: { courses: ["FMSC290", "ECON200", "ECON201"] },
    },
    {
      kind: "choose",
      id: "fmsc-electives-lower",
      name: "FMSC electives, 100-200 level (two courses, 6 credits)",
      count: 2,
      from: { departments: ["FMSC"], minNumber: 100, maxNumber: 299 },
    },
    {
      kind: "choose",
      id: "fmsc-electives-upper",
      name: "FMSC electives, 300-400 level (two courses, 6 credits)",
      count: 2,
      from: { departments: ["FMSC"], minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const fmscMajorMeta: ProgramMeta = {
  kind: "major",
  college: "SPHL",
  short: "Family Health",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/family-science/family-health-major/",
    department:
      "https://sph.umd.edu/academics/advising-resources/undergraduate-center-academic-success-and-achievement/casa-advising/casa-declare-sph-major",
  },
};
