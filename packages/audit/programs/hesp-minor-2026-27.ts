// Hearing and Speech Sciences Minor, 2026-27 UMD Academic Catalog (Department of Hearing and Speech Sciences).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/hearing-speech-sciences/hearing-speech-sciences-minor/
// (fetched 2026-09-28). Department pages (https://hesp.umd.edu/, /landingtopic/advising) fetched 2026-09-28 hold no minor
// requirements, so this is encoded from the catalog alone.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const hespMinor: Program = {
  id: "hesp-minor",
  name: "Hearing and Speech Sciences Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Hearing and Speech Sciences Minor; Department of Hearing and Speech Sciences, https://hesp.umd.edu/ (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department page not checked: the fetched hesp.umd.edu pages are a homepage and an empty advising page with no minor requirements. Encoded from the catalog.",
    "Not encoded: program GPA 2.0 across the minor's courses is encoded as minGpa; the catalog's note that a C- is needed to enroll in courses that require a class as a prerequisite.",
    "Elective area: two courses in ONE of two areas. Option 1 (speech-language pathology) is HESP305 plus one of HESP402, HESP404, HESP406, HESP498; Option 2 (audiology) is HESP311 plus HESP411. Encoded as two alternative sets so the courses must come from one area.",
    "Neither source states a cap on overlap with a major or other programs; no sharing limit is set.",
    "No published sample plan; the sample plan is constructed.",
  ],
  requirements: [
    { kind: "course", id: "intro", name: "Introduction to Hearing and Speech Sciences", options: ["HESP202"] },
    { kind: "course", id: "psycholinguistics", name: "Introduction to Psycholinguistics", options: ["HESP300"] },
    { kind: "course", id: "development", name: "Speech and Language Development in Children", options: ["HESP400"] },
    { kind: "course", id: "phonetics", name: "Introduction to Phonetic Science", options: ["HESP403"] },
    { kind: "course", id: "hearing", name: "Bases of Hearing Science", options: ["HESP407"] },
    {
      kind: "sets",
      id: "elective-area",
      name: "Elective area (two courses in one area)",
      options: [
        ["HESP305", { count: 1, from: { courses: ["HESP402", "HESP404", "HESP406", "HESP498"] } }],
        ["HESP311", "HESP411"],
      ],
    },
  ],
};

export const hespMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "BSOS",
  short: "Hearing & Speech Sciences",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/hearing-speech-sciences/hearing-speech-sciences-minor/",
    department: "https://hesp.umd.edu/",
  },
};
