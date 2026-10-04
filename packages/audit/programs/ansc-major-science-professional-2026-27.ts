// Animal Sciences Major, Science/Professional & Combined Ag-Veterinary Medicine Specialization,
// 2026-27 UMD Academic Catalog. Source: academiccatalog.umd.edu/undergraduate/colleges-schools/
//   agriculture-natural-resources/animal-sciences/animal-sciences-major/ (fetched 2026-09-28).
// See ansc-shared-2026-27.ts for the shared Animal Sciences Core, Management Courses list and common
// review notes; this file adds the Science/Professional specialization's own Required Courses and
// Advanced ANSC Electives list.
// Encoded by hand from the catalog alone (no department page found). UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { anscCommonReviewNotes, anscCore, anscManagementCourses } from "./ansc-shared-2026-27.ts";

export const anscMajorScienceProfessional: Program = {
  id: "ansc-major-science-professional",
  name: "Animal Sciences Major (Science/Professional & Combined Ag-Veterinary Medicine Specialization)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Animal Sciences Major, " +
    "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/animal-sciences/animal-sciences-major/ " +
    "(fetched 2026-09-28); no department page found (see program-sources/animal-sciences-major.md)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    ...anscCommonReviewNotes,
    "Science/Professional's Required Courses, Advanced ANSC Electives (9 credits) and Management " +
      "Courses (3 credits) are exactly as the catalog states. Unlike the Animal Care and Management " +
      "specialization, this specialization's ANSC327 is a flat requirement with no ANSC450 " +
      "alternative, and its Advanced ANSC Electives list gives ANSC446 and ANSC447 as two separate " +
      "line items rather than a required pair -- both kept exactly as the catalog table states them.",
  ],
  requirements: [
    ...anscCore,
    { kind: "course", id: "ansc327", name: "Molecular and Quantitative Animal Genetics (ANSC327)", options: ["ANSC327"] },
    {
      kind: "sets",
      id: "cell-biology-gateway",
      name: "Cell Biology and Physiology: BSCI331 & BSCI332, or BCHM463",
      options: [["BSCI331", "BSCI332"], ["BCHM463"]],
    },
    { kind: "course", id: "chem231", name: "Organic Chemistry I (CHEM231)", options: ["CHEM231"] },
    { kind: "course", id: "chem232", name: "Organic Chemistry Laboratory I (CHEM232)", options: ["CHEM232"] },
    { kind: "course", id: "chem241", name: "Organic Chemistry II (CHEM241)", options: ["CHEM241"] },
    { kind: "course", id: "chem242", name: "Organic Chemistry Laboratory II (CHEM242)", options: ["CHEM242"] },
    { kind: "course", id: "chem271", name: "General Chemistry and Energetics (CHEM271)", options: ["CHEM271"] },
    { kind: "course", id: "chem272", name: "General Bioanalytical Chemistry Laboratory (CHEM272)", options: ["CHEM272"] },
    {
      kind: "course",
      id: "physics1-gateway",
      name: "Fundamentals of Physics I (PHYS121 or PHYS131)",
      options: ["PHYS121", "PHYS131"],
    },
    {
      kind: "course",
      id: "physics2-gateway",
      name: "Fundamentals of Physics II (PHYS122 or PHYS132)",
      options: ["PHYS122", "PHYS132"],
    },
    {
      kind: "choose",
      id: "sp-advanced-electives",
      name: "Advanced ANSC Electives: Select 9 credits",
      count: 3,
      credits: 9,
      from: {
        courses: [
          "ANSC330", "ANSC340", "ANSC359", "ANSC410", "ANSC417", "ANSC435", "ANSC437", "ANSC440",
          "ANSC443", "ANSC444", "ANSC446", "ANSC447", "ANSC450", "ANSC452", "ANSC453", "ANSC455",
          "ANSC460", "ANSC497",
        ],
      },
    },
    {
      kind: "choose",
      id: "sp-management-courses",
      name: "Management Courses: Select 3 credits",
      count: 1,
      credits: 3,
      from: { courses: anscManagementCourses },
    },
  ],
};

export const anscMajorScienceProfessionalMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Animal Sciences (Science/Professional)",
  major: "ansc",
  track: "Science/Professional & Combined Ag-Veterinary Medicine",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/animal-sciences/animal-sciences-major/",
  },
};
