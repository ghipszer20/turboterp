// Kinesiology Major, School of Public Health (Department of Kinesiology), 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/kinesiology/kinesiology-major/,
// sph.umd.edu/academics/departments-units/department-kinesiology and sph.umd.edu/content/four-year-plans
// (all fetched 2026-09-28); see program-sources/kinesiology-major.md. The department page lists no
// requirements; the four-year-plans page gives only benchmarks (no term-by-term plan).
// Shared SPH pieces come from sphl-shared-2026-27.ts. Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";
import {
  sphlAnatomyPhysiology,
  sphlBiologyLab,
  sphlBiologyLecture,
  sphlFoundations,
  sphlSharedReviewNotes,
} from "./sphl-shared-2026-27.ts";

const c = (id: string, name: string, course: string): Requirement => ({
  kind: "course",
  id,
  name: `${name} (${course})`,
  options: [course],
});

export const knesMajor: Program = {
  id: "knes-major",
  name: "Kinesiology Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Kinesiology Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/kinesiology/kinesiology-major/); " +
    "SPH Department of Kinesiology page and four-year-plans page, https://sph.umd.edu/academics/departments-units/department-kinesiology, " +
    "https://sph.umd.edu/content/four-year-plans (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...sphlSharedReviewNotes,
    "The department page lists no requirements beyond the catalog's, so there is no disagreement to resolve.",
    "Grade floor: the catalog says only that KNES option prerequisites (the KNES core) need 'C-' or better, and the SPH benchmarks name 'C-' for KNES200, BSCI202 and three KNES core courses. A program-level 'C-' minimum is applied to every requirement (as Family Health states outright); flagged in owner-review.md.",
    "'MATH113 (or higher level MATH course)' is encoded as one MATH course numbered 113-499.",
    "'MATH/STAT Statistics Course' names no course; encoded as one course from the whole STAT and MATH departments (100-499), the widest reading of 'MATH/STAT'.",
    "'Select 15 credits of KNES upper level option courses': encoded as 15 credits of KNES courses numbered 300-499 (the catalog points to the handbook for the list, which was not read). The KNES core courses are matched by their own rows first.",
    "'4 different KNES physical activity courses, 4 credits': the catalog points to the handbook for the list; encoded as four KNES courses numbered 100-199 (the KNES 1XX activity range, one credit each).",
    "The four-year plan on sph.umd.edu is benchmarks only: KNES200 within two semesters; BSCI202 plus three KNES core courses within four. The sample plan is CONSTRUCTED from the catalog table; flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    sphlBiologyLecture,
    sphlBiologyLab,
    ...sphlAnatomyPhysiology,
    {
      kind: "choose",
      id: "knes-math",
      name: "College Algebra and Trigonometry (MATH113) or a higher-level MATH course",
      count: 1,
      from: { departments: ["MATH"], minNumber: 113, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "knes-statistics",
      name: "Statistics course (MATH or STAT)",
      count: 1,
      from: { departments: ["STAT", "MATH"], minNumber: 100, maxNumber: 499 },
    },
    sphlFoundations,
    c("knes-knes200", "Introduction to Kinesiology", "KNES200"),
    c("knes-knes285", "History of Physical Culture, Sport, & Science in America", "KNES285"),
    c("knes-knes287", "Sport and American Society", "KNES287"),
    c("knes-knes300", "Biomechanics of Human Motion", "KNES300"),
    c("knes-knes350", "The Psychology of Sports & Exercise", "KNES350"),
    c("knes-knes360", "Physiology of Exercise", "KNES360"),
    c("knes-knes370", "Motor Development", "KNES370"),
    c("knes-knes385", "Motor Control and Learning", "KNES385"),
    {
      kind: "choose",
      id: "knes-options",
      name: "KNES upper-level option courses (15 credits)",
      credits: 15,
      from: { departments: ["KNES"], minNumber: 300, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "knes-activity",
      name: "Four different KNES physical activity courses (4 credits)",
      count: 4,
      from: { departments: ["KNES"], minNumber: 100, maxNumber: 199 },
    },
  ],
};

export const knesMajorMeta: ProgramMeta = {
  kind: "major",
  college: "SPHL",
  short: "Kinesiology",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/kinesiology/kinesiology-major/",
    department: "https://sph.umd.edu/academics/departments-units/department-kinesiology",
  },
};
