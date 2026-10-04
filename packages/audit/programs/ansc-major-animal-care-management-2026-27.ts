// Animal Sciences Major, Animal Care and Management Specialization, 2026-27 UMD Academic Catalog.
// Source: academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/
//   animal-sciences/animal-sciences-major/ (fetched 2026-09-28).
// See ansc-shared-2026-27.ts for the shared Animal Sciences Core, Management Courses list and common
// review notes; this file adds the Animal Care and Management specialization's own Required Courses
// and Advanced ANSC Electives list.
// Encoded by hand from the catalog alone (no department page found). UNVERIFIED until owner sign-off.

import type { Program, ProgramMeta } from "../src/audit.ts";
import { anscCommonReviewNotes, anscCore, anscManagementCourses } from "./ansc-shared-2026-27.ts";

export const anscMajorAnimalCareManagement: Program = {
  id: "ansc-major-animal-care-management",
  name: "Animal Sciences Major (Animal Care and Management Specialization)",
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
    "Animal Care and Management's Required Courses, Advanced ANSC Electives (9 credits) and " +
      "Management Courses (9 credits) are exactly as the catalog states.",
  ],
  requirements: [
    ...anscCore,
    {
      kind: "course",
      id: "genetics-gateway",
      name: "Molecular and Quantitative Animal Genetics or Animal Breeding Plans (ANSC327 or ANSC450)",
      options: ["ANSC327", "ANSC450"],
    },
    { kind: "course", id: "ansc446", name: "Physiology of Mammalian Reproduction (ANSC446)", options: ["ANSC446"] },
    { kind: "course", id: "ansc447", name: "Physiology of Mammalian Reproduction Laboratory (ANSC447)", options: ["ANSC447"] },
    {
      kind: "course",
      id: "farm-management-gateway",
      name: "Farm/Enterprise Management (AREC306, ANSC270, or INAG204)",
      options: ["AREC306", "ANSC270", "INAG204"],
    },
    {
      kind: "course",
      id: "organic-chem-gateway",
      name: "Organic Chemistry I or equivalent (CHEM231, PLSC275, or AGST275)",
      options: ["CHEM231", "PLSC275", "AGST275"],
    },
    { kind: "course", id: "ansc359", name: "Internship Experience in Animal and Avian Sciences (ANSC359)", options: ["ANSC359"] },
    {
      kind: "choose",
      id: "acm-advanced-electives",
      name: "Advanced ANSC Electives: Select 9 credits",
      count: 3,
      credits: 9,
      from: {
        courses: [
          "ANSC330", "ANSC340", "ANSC410", "ANSC417", "ANSC435", "ANSC437", "ANSC440",
          "ANSC443", "ANSC444", "ANSC450", "ANSC452", "ANSC453", "ANSC455", "ANSC460", "ANSC497",
        ],
      },
    },
    {
      kind: "choose",
      id: "acm-management-courses",
      name: "Management Courses: Select 9 credits",
      count: 3,
      credits: 9,
      from: { courses: anscManagementCourses },
    },
  ],
};

export const anscMajorAnimalCareManagementMeta: ProgramMeta = {
  kind: "major",
  college: "AGNR",
  short: "Animal Sciences (Animal Care and Management)",
  major: "ansc",
  track: "Animal Care and Management",
  defaultTrack: true,
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/animal-sciences/animal-sciences-major/",
  },
};
