// Public Health Practice Major (Department of Behavioral and Community Health, School of Public Health),
// 2026-27 UMD Academic Catalog. Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/behavioral-community-health/public-health-practice-major/
// and sph.umd.edu/content/four-year-plans (both fetched 2026-09-28); see program-sources/public-health-practice-major.md.
// Shared SPHL pieces (SPHL100, BSCI170, biology lab, EPIB301, manual notes) come from sphl-shared-2026-27.ts;
// the anatomy row is "HLTH212 or BSCI201", so the BSCI201/202 pair is NOT used. Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";
import {
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

export const phpMajor: Program = {
  id: "php-major",
  name: "Public Health Practice Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Public Health Practice Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/behavioral-community-health/public-health-practice-major/); " +
    "SPH Four Year Plans and Benchmarks, https://sph.umd.edu/content/four-year-plans (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...sphlSharedReviewNotes,
    "The department page (SPH Four Year Plans and Benchmarks) lists only benchmarks and links to a plan not in the sources; its benchmarks match the catalog table (BSCI170/171, SPHL100, HLTH124, HLTH140, HLTH200, EPIB301, 'HLTH212 or BSCI201'). No disagreement found.",
    "Grade floor: 'C-' or higher in all Public Health Practice major-required coursework; applied as the program-level minimum.",
    "'BSCI180 or BSCI171' (biology lab) and 'HLTH212 or BSCI201' (anatomy and physiology) are each one row with either option.",
    "Open slot 'php-health-electives' (openSlot requirement): 12 credits of health electives ('a pre-approved list of 3-credit health elective offerings'; the list is not in the sources, so the student confirms with their advisor).",
    "Not enforced (manual): HLTH491 Community Health Internship is taken in the final semester after all other coursework is complete. The optional areas of specialization (Special Populations, Health Communication, Health Risk Behavior) are not listed in the sources and are not encoded.",
    "The sources contain no term-by-term four-year plan (the SPH page links to one); the sample plan is CONSTRUCTED from the catalog table. Health electives are filled with HLTH300, HLTH325, HLTH377 and HLTH424, unconfirmed placeholders taken from other SPH programs' course lists. Flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    sphlFoundations,
    c("php-hlth124", "Introduction to Behavioral and Community Health", "HLTH124"),
    sphlEpidemiology,
    c("php-epib315", "Biostatistics for Public Health Practice", "EPIB315"),
    c("php-hlth306", "Macro Level Influences on Community Health", "HLTH306"),
    sphlBiologyLecture,
    sphlBiologyLab,
    {
      kind: "course",
      id: "php-anatomy",
      name: "Anatomy and Physiology (HLTH212 or BSCI201)",
      options: ["HLTH212", "BSCI201"],
    },
    c("php-hlth200", "Introduction to Research in Community Health", "HLTH200"),
    c("php-hlth230", "Introduction to Health Behavior", "HLTH230"),
    c("php-hlth364", "Social Media & Digital Tools for Community & Public Health", "HLTH364"),
    c("php-hlth140", "Personal and Community Health", "HLTH140"),
    c("php-hlth302", "Methods of Community Health Assessment", "HLTH302"),
    c("php-hlth391", "Making a Difference: Applying Community Health", "HLTH391"),
    c("php-hlth420", "Effective Strategies for Public Health Practice", "HLTH420"),
    c("php-hlth490", "Professional Preparation in Community Health", "HLTH490"),
    c("php-hlth491", "Community Health Internship", "HLTH491"),
    {
      kind: "openSlot",
      id: "php-health-electives",
      name: "Health electives",
      credits: 12,
      note: "Four 3-credit courses from the pre-approved health elective list; ask your advisor for the list.",
    },
  ],
};

export const phpMajorMeta: ProgramMeta = {
  kind: "major",
  college: "SPHL",
  short: "Public Health Practice",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/public-health/behavioral-community-health/public-health-practice-major/",
    department: "https://sph.umd.edu/content/four-year-plans",
  },
};
