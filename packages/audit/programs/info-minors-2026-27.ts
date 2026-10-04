// Information Risk Management, Ethics, and Privacy Minor and Technology Innovation Leadership
// Minor, 2026–27 UMD Academic Catalog (College of Information).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/information/
// information-risk-management-ethics-privacy-minor/ and technology-innovation-leadership-minor/
// (fetched 2026-09-28). No department page was fetched (program-sources holds the catalog only).
// No official published sample plans (built from the requirements; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const SOURCE_IRMEP =
  "UMD Academic Catalog 2026–27, Information Risk Management, Ethics, and Privacy Minor (fetched 2026-09-28)";
const SOURCE_TIL =
  "UMD Academic Catalog 2026–27, Technology Innovation Leadership Minor (fetched 2026-09-28)";

export const infoMinorIrmep: Program = {
  id: "info-minor-irmep",
  name: "Information Risk Management, Ethics, and Privacy Minor",
  catalogYear: "2026-27",
  source: SOURCE_IRMEP,
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Department page not checked (catalog only).",
    "All five courses are required (15 credits). 'At least nine credits at the 400-level' is implied by the list itself (INST455, INST456, INST461 = 9 credits), so no separate rule is encoded.",
    "'Only six credits or two courses may satisfy a degree requirement towards your major' -> maxSharedWith: [{ courses: 2 }].",
    "The catalog also lists an 'at Shady Grove' version of this minor; program-sources holds a single page with one requirement table, so it is encoded once and no separate Shady Grove program exists.",
    "Cumulative 2.0 GPA in minor and major, the 6-credit cap on credit from other institutions, and completion before graduation are not encoded (manual).",
  ],
  requirements: [
    { kind: "course", id: "inst364", name: "Human-Centered Cybersecurity", options: ["INST364"] },
    { kind: "course", id: "inst366", name: "Privacy, Security and Ethics for Big Data", options: ["INST366"] },
    { kind: "course", id: "inst455", name: "Information Assurance and Compliance", options: ["INST455"] },
    { kind: "course", id: "inst456", name: "Risk Management Leadership in the Information Age", options: ["INST456"] },
    { kind: "course", id: "inst461", name: "Emerging Technologies and Risk Management", options: ["INST461"] },
  ],
};

export const infoMinorTechInnovationLeadership: Program = {
  id: "info-minor-tech-innovation-leadership",
  name: "Technology Innovation Leadership Minor",
  catalogYear: "2026-27",
  source: SOURCE_TIL,
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Department page not checked (catalog only).",
    "All five courses are required (15 credits). 'At least nine credits at the 400-level' is implied by the list itself (INST407, INST453, INST457, INST463 are 400-level: 12 credits), so no separate rule is encoded.",
    "'Only six credits or two courses may satisfy a degree requirement towards your major' -> maxSharedWith: [{ courses: 2 }].",
    "The catalog also lists an 'at Shady Grove' version of this minor; program-sources holds a single page with one requirement table, so it is encoded once and no separate Shady Grove program exists.",
    "Cumulative 2.0 GPA in minor and major, the 6-credit cap on credit from other institutions, and completion before graduation are not encoded (manual).",
  ],
  requirements: [
    { kind: "course", id: "inst363", name: "Fundamentals of Technology Innovation", options: ["INST363"] },
    { kind: "course", id: "inst407", name: "Leading and Sustaining a Culture of Innovation", options: ["INST407"] },
    { kind: "course", id: "inst457", name: "Lean Startup", options: ["INST457"] },
    { kind: "course", id: "inst453", name: "Project Management for Information Science", options: ["INST453"] },
    { kind: "course", id: "inst463", name: "The Technology Socialpreneur", options: ["INST463"] },
  ],
};

export const infoMinorIrmepMeta: ProgramMeta = { kind: "minor", college: "INFO", short: "Info Risk Mgmt, Ethics & Privacy", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/information/information-risk-management-ethics-privacy-minor/" } };

export const infoMinorTechInnovationLeadershipMeta: ProgramMeta = { kind: "minor", college: "INFO", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/information/technology-innovation-leadership-minor/" } };
