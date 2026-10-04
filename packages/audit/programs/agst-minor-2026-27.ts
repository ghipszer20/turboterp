// Agricultural Science and Technology Minor, 2026-27 UMD Academic Catalog (College of Agriculture and
// Natural Resources, Department of Plant Science and Landscape Architecture).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/
// plant-sciences-landscape-architecture/agricultural-science-technology-minor/ and
// https://psla.umd.edu/undergraduate/degrees/minors (both fetched 2026-09-28).
// No official published sample plan (constructed; see docs/project/owner-review.md).
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const agstMinor: Program = {
  id: "agst-minor",
  name: "Agricultural Science and Technology Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Agricultural Science and Technology Minor; Department of Plant Science and Landscape Architecture, https://psla.umd.edu/undergraduate/degrees/minors (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ courses: 2 }, { credits: 6 }],
  reviewNotes: [
    "Department page not checked for requirements: psla.umd.edu/undergraduate/degrees/minors gives only a description ('select courses in either agronomy or environmental horticulture') and points to an advising sheet not in the fetched sources. Encoded from the catalog.",
    "Catalog: 'maximum of six credits or two courses' may count toward both major and minor -> maxSharedWith courses 2 and credits 6 (both apply, against every program).",
    "Core: PLSC110+111 (Horticulture + lab) or PLSC112+113 (Crop Science + lab); ENST200; PLSC201+206; PLSC389 or PLSC460. Supporting: 6 credits from the listed rows; 'BSCI497 or BSCI337' is one row (at most one counts).",
    "Catalog footnote '6 credits must be from 300+ level or higher' is ambiguous: the supporting block is itself 6 credits, yet it lists 200-level PLSC253/PLSC254. Not enforced (a rule would either make PLSC253/254 unusable or guess at the meaning); manual check. Flagged.",
    "Catalog: 'Other courses may be approved. Consult with your advisor.' The supporting block is marked advisorMayApprove (the audit shows 'other courses may count with advisor approval'); only the listed courses count.",
    "Manual, not encoded: prerequisites for matriculation (MATH113 or higher, CHEM131/132), all courses at UMD College Park (residency), mandatory advising twice a year, and the minor GPA.",
  ],
  requirements: [
    {
      kind: "sets",
      id: "horticulture-or-crop",
      name: "Introduction to Horticulture or Introductory Crop Science, with lab",
      options: [["PLSC110", "PLSC111"], ["PLSC112", "PLSC113"]],
    },
    { kind: "course", id: "soil", name: "Fundamentals of Soil Science", options: ["ENST200"] },
    {
      kind: "sets",
      id: "plant-structure",
      name: "Plant Structure and Function with lab",
      options: [["PLSC201", "PLSC206"]],
    },
    {
      kind: "course",
      id: "internship",
      name: "Internship or Application of Knowledge in Plant Sciences",
      options: ["PLSC389", "PLSC460"],
    },
    {
      kind: "choose",
      id: "supporting",
      name: "Supporting courses (6 credits)",
      credits: 6,
      advisorMayApprove: true,
      from: {
        courses: [
          "AGST333",
          "AGST399",
          "AGST400",
          "AGST401",
          "AGST426",
          "PLSC253",
          "PLSC254",
          "PLSC400",
          "PLSC420",
          "PLSC433",
          "PLSC452",
          "PLSC453",
          "BSCI497",
          "BSCI337",
        ],
      },
      alternatives: [["BSCI497", "BSCI337"]],
    },
  ],
};

export const agstMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "AGNR",
  short: "Ag Science & Technology",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/plant-sciences-landscape-architecture/agricultural-science-technology-minor/",
    department: "https://psla.umd.edu/undergraduate/degrees/minors",
  },
};
