// Pre-Pharmacy (Pharm.D.). Source: HPAO "Pharmacy" page, fetched 2026-09-25 (SOURCES.md).
// Encoded by hand. UNVERIFIED until the owner signs off. HPAO names no admission test for
// pharmacy, so no category here is tied to exam content and no exam milestone is included.

import { HPAO_DISCLAIMER, type Track } from "../src/types.ts";
import {
  HPAO,
  MAPPING_NOTES,
  anatomyPhysiology,
  biochem,
  calculus,
  communications,
  englishComposition,
  genChem1,
  genChem2,
  introBio,
  microbiology,
  microeconomics,
  organicChem,
  physicsOneSemester,
  statistics,
} from "./common.ts";

export const prePharmacy: Track = {
  id: "pre-pharmacy",
  name: "Pre-Pharmacy",
  schools: "pharmacy schools",
  minGrade: "C",
  minGradeNote: "Confirm each target school's minimum prerequisite grade; HPAO doesn't state one for pharmacy.",
  usesScienceGpa: true,
  entry: { kind: "after-degree" },
  categories: [
    genChem1("General chemistry with labs"),
    genChem2("General chemistry with labs"),
    organicChem("Organic chemistry with labs"),
    biochem("Biochemistry"),
    introBio("General biology with labs"),
    calculus("Calculus"),
    statistics("Statistics"),
    physicsOneSemester("Physics with lab"),
    anatomyPhysiology("Human anatomy and physiology 1 and 2 with labs"),
    microbiology("Microbiology with lab"),
    englishComposition("English composition"),
    microeconomics("Microeconomics"),
    communications("Communications"),
  ],
  milestones: [
    {
      id: "pharmacy-experience",
      kind: "experience",
      name: "Pharmacy technician or shadowing experience",
      detail: "Not required everywhere, but HPAO says pharmacy technician experience (or shadowing a pharmacist) helps an application.",
      optional: true,
    },
    {
      id: "primary-application",
      kind: "application",
      name: "Primary application (PharmCAS)",
      detail: "Pharm.D. programs are 2+4, 3+4 or 4+4 (2, 3 or 4 years of prerequisites before 4 years of pharmacy school); apply through PharmCAS in the cycle before the entry program starts. Some programs accept AP credit for prerequisites and some don't; check each one.",
    },
  ],
  disclaimer: HPAO_DISCLAIMER,
  sources: [HPAO.career("pharmacy")],
  verified: false,
  reviewNotes: [
    MAPPING_NOTES.genChem,
    MAPPING_NOTES.organic,
    MAPPING_NOTES.biochem,
    MAPPING_NOTES.introBio,
    MAPPING_NOTES.calculus,
    MAPPING_NOTES.statistics,
    "\"Physics with lab\" is mapped as one semester (physicsOneSemester), matching HPAO's singular wording for pharmacy, unlike medicine's two-semester requirement.",
    "Microeconomics maps to ECON200 and communications to COMM107 (Oral Communication), UMD's most general course in each area. Re-checked directly against HPAO's pharmacy page (https://prehealth.umd.edu/explore-careers/pharmacy, fetched 2026-09-27): it does list \"Microeconomics\" and \"Communications\" as their own categories, confirming the wording, but names no UMD course for either, so ECON200/COMM107 stay TurboTerp's own reading.",
    "No admission test (PCAT or otherwise) is named on HPAO's pharmacy page, so no category is tied to exam content and no exam milestone is included; PharmCAS itself does not require a standardized test.",
    "Entry is modeled as after a UMD bachelor's degree (4+4), the most common UMD path; a 2+4 or 3+4 student can adjust their planned entry year themselves.",
  ],
};
