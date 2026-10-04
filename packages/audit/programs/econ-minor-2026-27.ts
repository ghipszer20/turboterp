// Economics Minor, 2026–27 UMD Academic Catalog.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/economics/economics-minor/
// (fetched 2026-09-28). No department page was provided (department page not checked). No official
// published sample plan (built from the requirements below; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const econMinor: Program = {
  id: "econ-minor",
  name: "Economics Minor",
  catalogYear: "2026-27",
  source: "UMD Academic Catalog 2026–27, Economics Minor (fetched 2026-09-28); department page not checked",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Department page not checked (none provided); encoded from the catalog alone.",
    "'No more than 6 credits (or two courses) may count toward major requirements' -> maxSharedWith: [{ courses: 2 }]. The catalog's substitution rule (replace extra overlap with non-overlapping 300/400-level courses from an approved list) is what the sharing cap already forces; not separately encoded.",
    "Slot 2, '(1) 300 or 400-level ECON course OR a second intermediate theory course (ECON305/306/325/326)', is one 1-course choose over ECON 300-499 (the intermediate courses are ECON3xx, so the whole range covers the 'or').",
    "Eligibility gate (AREC, PHPE, SDSC-ECON, ENSP-Environmental Economics majors are not eligible) is enforced via notOpenTo for AREC, SDSC-ECON and Environmental Economics; PHPE is not a registered major, so it is left out.",
    "Prerequisites (Calculus I and Statistics: ECON230, BMGT230, ECON321, STAT401 or equivalent; Calculus III for ECON325/326) are prerequisites, not minor requirements; not encoded.",
  ],
  requirements: [
    { kind: "course", id: "econ200", name: "Principles of Microeconomics", options: ["ECON200"] },
    { kind: "course", id: "econ201", name: "Principles of Macroeconomics", options: ["ECON201"] },
    {
      kind: "choose",
      id: "intermediate",
      name: "Intermediate theory course (ECON305, ECON306, ECON325 or ECON326)",
      count: 1,
      from: { courses: ["ECON305", "ECON306", "ECON325", "ECON326"] },
    },
    {
      kind: "choose",
      id: "econ-300-400",
      name: "300- or 400-level ECON course, or a second intermediate theory course",
      count: 1,
      from: { departments: ["ECON"], minNumber: 300, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "econ-400",
      name: "Two 400-level ECON courses",
      count: 2,
      from: { departments: ["ECON"], minNumber: 400, maxNumber: 499 },
    },
  ],
};

export const econMinorMeta: ProgramMeta = { kind: "minor", notOpenTo: { programs: ["arec", "sds-major-econ", "ensp-major-environmental-economics"], reason: "Not open to Agricultural and Resource Economics, Social Data Science Economics or Environmental Economics majors." }, college: "BSOS", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/economics/economics-minor/" } };
