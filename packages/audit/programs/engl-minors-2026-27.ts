// Digital Storytelling and Poetics Minor and Creative Writing Minor, 2026–27 UMD Academic Catalog
// (Department of English Language and Literature). Sources: academiccatalog.umd.edu/undergraduate/
// colleges-schools/arts-humanities/english-language-literature/digital-storytelling-poetics-minor/
// and .../creative-writing-minor/ (fetched 2026-09-28); department page https://english.umd.edu/
// (fetched 2026-09-28; site navigation only, no minor requirements). No official published sample
// plans (constructed; see docs/project/owner-review.md). Encoded by hand. UNVERIFIED until the owner
// signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

const SOURCE_ENGL_MINORS =
  "UMD Academic Catalog 2026–27, English Language and Literature minors; Department of English, " +
  "https://english.umd.edu/ (fetched 2026-09-28)";

export const englMinorDigitalStorytelling: Program = {
  id: "engl-minor-digital-storytelling",
  name: "Digital Storytelling and Poetics Minor",
  catalogYear: "2026-27",
  source: SOURCE_ENGL_MINORS,
  verified: false,
  minGrade: "C-",
  maxSharedWith: [
    {
      programs: [
        "engl-major-creative-writing",
        "engl-major-language-writing-rhetoric",
        "engl-major-literary-cultural-studies",
        "engl-major-media-studies",
      ],
      courses: 2,
    },
  ],
  reviewNotes: [
    "Department page not checked: english.umd.edu is only a homepage with no requirements. Encoded from the catalog.",
    "Open slot 'approved-courses' (openSlot requirement): 12 credits of approved 3xx/4xx courses; the approved list is only at go.umd.edu/digitalstorytelling, so the student confirms it with their advisor. The conditions (at least one 4xx course, at least one critical analysis & theory course, at least one craft & creative process course) are manual.",
    "'English majors may count two Digital Storytelling and Poetics minor courses toward both' -> maxSharedWith toward the English major tracks: 2 courses. The catalog is silent on sharing with other programs, so none is set for them.",
    "Not encoded (manual): the final-semester digital portfolio (by Nov 1 / Apr 1 / Aug 1); acceptance into the minor by the start of the semester before graduation; minor GPA 2.0.",
  ],
  requirements: [
    { kind: "course", id: "engl295", name: "Introduction to Digital Storytelling and Poetics", options: ["ENGL295"] },
    {
      kind: "openSlot",
      id: "approved-courses",
      name: "Approved courses",
      credits: 12,
      note: "From the approved list at go.umd.edu/digitalstorytelling: 3xx/4xx courses, at least one 4xx, one critical analysis & theory and one craft & creative process course.",
    },
  ],
};

export const englMinorDigitalStorytellingMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Digital Storytelling & Poetics",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/english-language-literature/digital-storytelling-poetics-minor/",
    department: "https://english.umd.edu/",
  },
};

export const englMinorCreativeWriting: Program = {
  id: "engl-minor-creative-writing",
  name: "Creative Writing Minor",
  catalogYear: "2026-27",
  source: SOURCE_ENGL_MINORS,
  verified: false,
  minGrade: "C-",
  reviewNotes: [
    "Department page not checked: english.umd.edu (and arhu.umd.edu/.../minors) carry no requirements. Encoded from the catalog.",
    "'Select two sections of ENGL498 / ENGL499' can be the same course taken twice (sections); encoded as two courses from ENGL498/ENGL499. If the audit counts a repeated course once, a student who takes ENGL498 twice would show a gap -- owner to check.",
    "'Any upper-level English Literature course' has no list: the whole ENGL 3xx-4xx range is accepted (broader than literature-only courses).",
    "AASP/ENGL274 is accepted as either code.",
    "Specialization (prose: ENGL352 + ENGL498, poetry: ENGL353 + ENGL499) is not enforced; any mix of the listed courses counts. Direct admission to a 3xx workshop (three 4xx workshops, 9 credits) is not encoded.",
    "Neither source states a sharing cap; none is set. Minor GPA 2.0 is manual.",
  ],
  requirements: [
    { kind: "course", id: "intro-workshop", name: "One 2xx introductory workshop", options: ["ENGL271", "ENGL272", "ENGL273", "ENGL274", "AASP274"] },
    { kind: "course", id: "intermediate-workshop", name: "Intermediate workshop (fiction or poetry)", options: ["ENGL352", "ENGL353"] },
    { kind: "choose", id: "advanced-workshops", name: "Two advanced workshop sections", count: 2, from: { courses: ["ENGL498", "ENGL499"] } },
    { kind: "choose", id: "upper-literature", name: "One upper-level English literature course", count: 1, from: { departments: ["ENGL"], minNumber: 300, maxNumber: 499 } },
  ],
};

export const englMinorCreativeWritingMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Creative Writing",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/english-language-literature/creative-writing-minor/",
    department: "https://english.umd.edu/",
  },
};
