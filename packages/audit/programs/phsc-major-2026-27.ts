// Public Health Science Major (College Park), School of Public Health, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/public-health-science/public-health-science-major/,
// sph.umd.edu/degrees/bachelor-science-public-health-science-college-park (HTTP 404 at fetch) and
// sph.umd.edu/content/four-year-plans (all fetched 2026-09-28); see program-sources/public-health-science-major.md.
// Shared SPHL pieces come from sphl-shared-2026-27.ts. Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";
import {
  sphlAnatomyPhysiology,
  sphlBiologyLab,
  sphlBiologyLecture,
  sphlEpidemiology,
  sphlFoundations,
  sphlSharedReviewNotes,
} from "./sphl-shared-2026-27.ts";

const c = (id: string, name: string, course: string): Requirement => ({
  kind: "course",
  id,
  name: `${name} (${course})`,
  options: [course],
});

export const phscMajor: Program = {
  id: "phsc-major",
  name: "Public Health Science Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Public Health Science Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/public-health-science/public-health-science-major/); " +
    "SPH Four Year Plans and Benchmarks, https://sph.umd.edu/content/four-year-plans (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...sphlSharedReviewNotes,
    "Department page not checked: the sph.umd.edu Public Health Science College Park degree page returned HTTP 404. Encoded from the catalog; the SPH four-year-plans page benchmarks (CHEM131/132 and CHEM231/232) match the catalog.",
    "Grade floor: 'C-' or higher in all Public Health Science major-required coursework; applied as the program-level minimum.",
    "'CHEM131 & CHEM132' and 'CHEM231 & CHEM232' are each listed as one paired row; encoded as four separate required courses.",
    "'BSCI180 or BSCI171' is one row with either option.",
    "Open slot 'phsc-options' (openSlot requirement): 12 credits of Public Health Science options ('300 and 400 level courses primarily offered within the School of Public Health'; the approved list is on a PHSC page not in the sources, so the student confirms with their advisor).",
    "Not enforced (manual): catalog says 74 of 120 credits are specific to the degree.",
    "The sources contain no term-by-term four-year plan (the SPH page links to one); the sample plan is CONSTRUCTED from the catalog table and the CHEM benchmarks. Option slots are filled with HLTH424, MIEH330, MIEH331 and HLSA484, unconfirmed placeholders taken from other SPH programs' course lists. Flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    c("phsc-math120", "Elementary Calculus I", "MATH120"),
    sphlBiologyLecture,
    sphlBiologyLab,
    ...sphlAnatomyPhysiology,
    c("phsc-chem131", "Chemistry I - Fundamentals of General Chemistry", "CHEM131"),
    c("phsc-chem132", "General Chemistry I Laboratory", "CHEM132"),
    c("phsc-chem231", "Organic Chemistry I", "CHEM231"),
    c("phsc-chem232", "Organic Chemistry Laboratory I", "CHEM232"),
    c("phsc-bsci222", "Principles of Genetics", "BSCI222"),
    c("phsc-bsci223", "General Microbiology", "BSCI223"),
    sphlFoundations,
    c("phsc-hlth366", "Behavioral and Community Issues in Public Health", "HLTH366"),
    sphlEpidemiology,
    c("phsc-epib315", "Biostatistics for Public Health Practice", "EPIB315"),
    c("phsc-hlsa300", "Introduction to Health Policy and Services", "HLSA300"),
    c("phsc-mieh300", "A Public Health Perspective: Introduction to Environmental Health", "MIEH300"),
    c("phsc-phsc450", "Addressing Social and Structural Inequities Through Public Health", "PHSC450"),
    c("phsc-knes320", "Physiological Basis of Physical Activity and Human Health", "KNES320"),
    c("phsc-phsc415", "Essentials of Public Health Biology: The Cell, The Individual, and Disease", "PHSC415"),
    c("phsc-phsc497", "Public Health Science Capstone", "PHSC497"),
    {
      kind: "openSlot",
      id: "phsc-options",
      name: "Public Health Science options",
      credits: 12,
      note: "300 and 400 level courses primarily offered within the School of Public Health; ask your advisor for the approved list.",
    },
  ],
};

export const phscMajorMeta: ProgramMeta = {
  kind: "major",
  college: "SPHL",
  short: "Public Health Science",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/public-health-science/public-health-science-major/",
    department: "https://sph.umd.edu/degrees/bachelor-science-public-health-science-college-park",
  },
};
