// Army Leadership Studies Minor, Military Studies Minor and Naval Science Minor, 2026–27 UMD
// Academic Catalog (Undergraduate Studies).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/undergraduate-studies/
// army-leadership-studies-minor/, military-studies-minor/ and naval-science-minor/
// (fetched 2026-09-28). No department pages were provided: department page not checked.
// No official published sample plans (built from the requirements below; see
// docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const CATALOG_BASE = "https://academiccatalog.umd.edu/undergraduate/colleges-schools/undergraduate-studies/";

export const rotcMinorArmyLeadership: Program = {
  id: "rotc-minor-army-leadership",
  name: "Army Leadership Studies Minor",
  catalogYear: "2026-27",
  source: "UMD Academic Catalog 2026–27, Army Leadership Studies Minor (fetched 2026-09-28); department page not checked",
  verified: false,
  reviewNotes: [
    "Department page not checked; encoded from the catalog only.",
    "MANUAL: the ARMY301/302/401/402 sequence is the Army ROTC advanced course; enrollment in Army ROTC (and any contracting or commissioning conditions) is an eligibility gate the catalog page doesn't spell out. Not encoded.",
    "The catalog states no minimum grade, GPA, residency or sharing cap for this minor; none is set.",
  ],
  requirements: [
    { kind: "course", id: "army301", name: "Advanced Military Leadership I", options: ["ARMY301"] },
    { kind: "course", id: "army302", name: "Advanced Military Leadership II", options: ["ARMY302"] },
    { kind: "course", id: "army401", name: "Advanced Military Leadership III", options: ["ARMY401"] },
    { kind: "course", id: "army402", name: "Advanced Military Leadership IV", options: ["ARMY402"] },
    { kind: "course", id: "military-history", name: "Modern Military History", options: ["HIST224", "HIST225"] },
  ],
};

export const rotcMinorMilitaryStudies: Program = {
  id: "rotc-minor-military-studies",
  name: "Military Studies Minor",
  catalogYear: "2026-27",
  source: "UMD Academic Catalog 2026–27, Military Studies Minor (fetched 2026-09-28); department page not checked",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Department page not checked; encoded from the catalog only.",
    "MANUAL: the ARSC courses are Air Force ROTC courses and the catalog says coursework outside the listed courses must be approved by the Air Force ROTC advisor and ROTC Advisory Committee, so this minor is effectively for Air Force ROTC cadets; enrollment is an eligibility gate, not encoded.",
    "MANUAL: 'Courses completed in one minor may not be used to satisfy the requirements in another minor' can't be limited to minors (maxSharedWith would also restrict majors), so it is not encoded.",
    "MANUAL: residency rules (no more than six required credits, or two courses, at another institution; at least six upper-division credits at UMD College Park) are not encoded.",
    "'Other courses may be substituted with approval of the minor advisor and Advisory Committee' for the two elective slots is an advisor approval; the global-affairs and military-affairs requirements are marked advisorMayApprove and the named lists are accepted as printed.",
    "GVPT289L, GVPT360, HIST240, SOCY464 and SOCY869 print without titles in the catalog table; encoded by course code as printed. The Military Affairs slot's heading reads 'Select on of the following' (typo in source) and is encoded as one course.",
  ],
  requirements: [
    { kind: "course", id: "arsc300", name: "Leading People and Effective Communication I", options: ["ARSC300"] },
    { kind: "course", id: "arsc301", name: "Leading People and Effective Communication II", options: ["ARSC301"] },
    { kind: "course", id: "arsc400", name: "National Security and Preparation for Active Duty I", options: ["ARSC400"] },
    { kind: "course", id: "arsc401", name: "National Security and Preparation for Active Duty II", options: ["ARSC401"] },
    {
      kind: "course",
      id: "global-affairs",
      advisorMayApprove: true,
      name: "Global Affairs elective",
      options: [
        "GVPT200", "GVPT280", "GVPT289L", "GVPT354", "GVPT360", "GVPT456",
        "HIST224", "HIST225", "HIST240", "HIST266", "HIST353", "HIST355", "HIST357",
      ],
    },
    {
      kind: "course",
      id: "military-affairs",
      advisorMayApprove: true,
      name: "Military Affairs elective",
      options: ["BMGT360", "BMGT364", "JOUR283", "SOCY120", "SOCY464", "SOCY465", "SOCY869", "BSST334"],
    },
  ],
};

export const rotcMinorNavalScience: Program = {
  id: "rotc-minor-naval-science",
  name: "Naval Science Minor",
  catalogYear: "2026-27",
  source: "UMD Academic Catalog 2026–27, Naval Science Minor (fetched 2026-09-28); department page not checked",
  verified: false,
  reviewNotes: [
    "Department page not checked; encoded from the catalog only.",
    "MANUAL: the NAVY courses are Naval ROTC courses; NROTC enrollment or commissioning conditions are an eligibility gate, not encoded.",
    "The catalog states no minimum grade, GPA, residency or sharing cap for this minor; none is set.",
    "Naval Science Core is '18 credits selected from' the ten NAVY courses; encoded as an 18-credit choose over those ten courses.",
    "Cultural/Regional Studies: the catalog says 'courses are not limited to the examples listed' (one course on cultural and/or regional studies of developing nations) but names no department or range. Encoded as the five listed examples (GEOG130, HIST120, HIST284, HIST285, PERS251), which is narrower than the source; other approved courses may count with advisor approval (the requirement is marked advisorMayApprove).",
    "National Security/Military History is one course from HIST224 or HIST225.",
  ],
  requirements: [
    {
      kind: "choose",
      id: "naval-core",
      name: "Naval Science Core",
      credits: 18,
      from: {
        courses: [
          "NAVY100", "NAVY101", "NAVY200", "NAVY201", "NAVY300",
          "NAVY301", "NAVY302", "NAVY400", "NAVY401", "NAVY402",
        ],
      },
    },
    { kind: "course", id: "military-history", name: "National Security/Military History", options: ["HIST224", "HIST225"] },
    {
      kind: "course",
      id: "cultural-regional",
      advisorMayApprove: true,
      name: "Cultural/Regional Studies",
      options: ["GEOG130", "HIST120", "HIST284", "HIST285", "PERS251"],
    },
  ],
};

export const rotcMinorArmyLeadershipMeta: ProgramMeta = {
  kind: "minor",
  college: "UGST",
  short: "Army Leadership Studies",
  sources: { catalog: `${CATALOG_BASE}army-leadership-studies-minor/` },
};

export const rotcMinorMilitaryStudiesMeta: ProgramMeta = {
  kind: "minor",
  college: "UGST",
  sources: { catalog: `${CATALOG_BASE}military-studies-minor/` },
};

export const rotcMinorNavalScienceMeta: ProgramMeta = {
  kind: "minor",
  college: "UGST",
  sources: { catalog: `${CATALOG_BASE}naval-science-minor/` },
};
