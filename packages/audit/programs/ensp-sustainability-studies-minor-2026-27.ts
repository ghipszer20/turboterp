// Sustainability Studies Minor, 2026-27 UMD Academic Catalog. Cross-listed: the same requirement table
// appears under Agriculture and Natural Resources (Environmental Science and Policy) and under Public
// Policy; encoded once, under AGNR.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/
// environmental-science-policy/sustainability-studies-minor/ and https://spp.umd.edu/your-education/undergraduate/minors
// (fetched 2026-09-28). Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const enspSustainabilityStudiesMinor: Program = {
  id: "ensp-sustainability-studies-minor",
  name: "Sustainability Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Sustainability Studies Minor (AGNR/ENSP and PLCY listings); " +
    "School of Public Policy, https://spp.umd.edu/your-education/undergraduate/minors (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ credits: 6 }],
  reviewNotes: [
    "Cross-listed: the AGNR and PLCY catalog pages differ only in title and URL (diffed); encoded once under AGNR. Flagged for owner.",
    "The department page (SPP minors page) matches the catalog: AGNR301/PLCY301 core, one approved course from each of three thematic areas, one more approved course or approved experiential learning.",
    "Open slot 'science-technology' (openSlot requirement): 3 credits, science and Technology approved course; no list is published in the sources, so the student confirms it with their advisor.",
    "Open slot 'policy-institutions' (openSlot requirement): 3 credits, policy and Institutions approved course; no list is published in the sources, so the student confirms it with their advisor.",
    "Open slot 'social-human-dimensions' (openSlot requirement): 3 credits, social and Human Dimensions approved course; no list is published in the sources, so the student confirms it with their advisor.",
    "Open slot 'additional-approved' (openSlot requirement): 3 credits, additional approved course or experiential learning; no list is published in the sources, so the student confirms it with their advisor.",
    "The SPP page's Nonprofit Leadership elective list mentions some sustainability courses but is not this minor's list; not used.",
    "'15 credits, at least 9 at the 300-400 level' is not encoded because the approved courses are unpublished; manual check.",
    "'No more than 6 credits may overlap between your major and Sustainability Studies, unless otherwise approved by your major' -> maxSharedWith: [{ credits: 6 }]. This applies to every other program (the engine cannot cap the major only); the 'unless approved' exception is not encoded. Catalog also bars a course counting in another minor (manual).",
    "Program GPA 2.0 encoded as minGpa. Students must declare the minor a full academic year before intended graduation (not encoded).",
    "AGNR301 and PLCY301 are the same course (cross-listed); either satisfies the core.",
    "Sample plan is constructed and contains only the core course because the approved lists are unpublished.",
  ],
  requirements: [
    { kind: "course", id: "core", name: "Sustainability (AGNR/PLCY301)", options: ["AGNR301", "PLCY301"] },
    { kind: "openSlot", id: "science-technology", name: "Science and Technology approved course", credits: 3, note: "Approved list on the Sustainability Studies minor web site." },
    { kind: "openSlot", id: "policy-institutions", name: "Policy and Institutions approved course", credits: 3, note: "Approved list on the Sustainability Studies minor web site." },
    { kind: "openSlot", id: "social-human-dimensions", name: "Social and Human Dimensions approved course", credits: 3, note: "Approved list on the Sustainability Studies minor web site." },
    { kind: "openSlot", id: "additional-approved", name: "Additional approved course or experiential learning", credits: 3, note: "Another approved course from one of the three areas, or approved credit-bearing experiential learning (internship, study abroad, research linked to sustainability), approved in advance." },
  ],
};

export const enspSustainabilityStudiesMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "AGNR",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/environmental-science-policy/sustainability-studies-minor/",
    department: "https://spp.umd.edu/your-education/undergraduate/minors",
  },
};
