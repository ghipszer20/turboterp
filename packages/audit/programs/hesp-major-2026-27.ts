// Hearing and Speech Sciences Major, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/hearing-speech-sciences/hearing-speech-sciences-major/;
// Feller Center "HESP Major Checklist" (dated 9/4/25, fetched via Internet Archive 2026-09-28), which doubles
// as the department source for this major (program-sources/hearing-speech-sciences-major.md).
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree, the department
// page wins. Main-session caveat: this checklist predates the 2026-27 catalog (dated 2025-09), so every
// disagreement below is flagged for owner confirmation rather than resolved silently.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const hespMajor: Program = {
  id: "hesp-major",
  name: "Hearing and Speech Sciences Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Hearing and Speech Sciences Major; " +
    "Feller Center HESP Major Checklist (dated 9/4/25, fetched via Internet Archive 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Main session, 2026-09-28: the Disorder and Elective lists now accept the UNION of the checklist and the 2026-27 catalog (HESP410 from the checklist, HESP498 and HESP413/415/416 from the catalog), so a student following either source is not failed. HESP410 is not in the current catalog's approved-course list. The notes below describe the builder's original checklist-only reading.",
    "Department-checklist-vs-catalog difference (flagged both ways per the main session's dated-checklist assumption): " +
      "the Disorder Courses list. The catalog names HESP402, HESP404, HESP406 or HESP498; the department " +
      "checklist names HESP402, HESP404, HESP406 or HESP410 (HESP498 not listed there). Encoded here with " +
      "the department checklist's HESP410, following the general 'department page wins' ruling -- please " +
      "confirm this should hold given the checklist predates the 2026-27 catalog.",
    "Department-checklist-vs-catalog difference (flagged both ways): the Elective Courses list. The catalog's " +
      "list includes HESP413, HESP415 and HESP416, which the department checklist's list omits; the " +
      "department checklist's list includes HESP410 and HESP420, which the catalog's list omits. Encoded " +
      "here with the department checklist's list (HESP410, HESP420 included; HESP413/415/416 excluded), " +
      "following 'department page wins' -- please confirm, same caveat as above.",
    "HESP386 (Experiential Learning), HESP388 and HESP389 (LEAP Classroom Internship) are excluded from the " +
      "Elective Courses pool even though the department checklist lists them (marked '*requires departmental " +
      "permission'), because the catalog carries an explicit footnote on this exact list: 'Internships, " +
      "clinical or research experiences do not fulfill the Elective Course requirement.' This is itself a " +
      "disagreement between the two sources; the catalog's explicit exclusion rule was followed. Flag for " +
      "confirmation.",
    "HESP Statistics Requirement: the catalog names QMMS251 (Introduction to Educational Statistics); the " +
      "department checklist names EDMS451, which other encoded UMD programs record as EDMS451's current " +
      "number, QMMS251/451 (see ccjs-major-2026-27.ts). Not treated as a disagreement -- both QMMS251 and " +
      "QMMS451 are encoded as options alongside PSYC200 and BIOM301.",
    "Allied/Related Fields (2 courses, 6 credits): both sources say the current approved list must be " +
      "obtained from the HESP Academic Advisor and only give illustrative examples (PHYS102/PHYS103 'Physics " +
      "of Music' and its lab; BSCI103, or BSCI170 with BSCI180 or BSCI171, or 'any Biology course based on " +
      "the biology of human systems'). Encoded narrowly as 'choose 2' from the catalog's named example " +
      "courses only (PHYS102, PHYS103, BSCI103, BSCI170, BSCI180, BSCI171); the open-ended 'any Biology " +
      "course based on the biology of human systems' clause has no enumerable course list and is not " +
      "encoded, and the engine can't enforce the BSCI170-plus-(180-or-171) sequencing implied by the " +
      "catalog's wording -- any two courses from the six listed satisfy this requirement as encoded. The " +
      "true advisor-approved list is almost certainly broader than these six courses; hesp-allied-fields is marked advisorMayApprove; flag for the owner.",
    "Not encoded (engine gaps, no sub-cap or GPA/residency mechanism): the 2.0 average required across all " +
      "major-requirement courses, the university residency rules (30 credits at UMD, 15 of the final 30 at " +
      "the 300-400 level, 12 upper-level major credits at UMD), and the 120-credit graduation minimum. The " +
      "audit engine checks per-requirement course assignment and per-course minGrade, not GPA, residency, or " +
      "credit totals.",
    "The existing HESP departmental-honors program under packages/catalog/special-programs/ was not touched.",
  ],
  requirements: [
    { kind: "course", id: "hesp120", name: "Introduction to Linguistics", options: ["HESP120"] },
    { kind: "course", id: "hesp202", name: "Introduction to Hearing and Speech Sciences", options: ["HESP202"] },
    { kind: "course", id: "hesp300", name: "Introduction to Psycholinguistics", options: ["HESP300"] },
    {
      kind: "course",
      id: "hesp305",
      name: "Anatomy and Physiology of the Speech Mechanism",
      options: ["HESP305"],
    },
    {
      kind: "course",
      id: "hesp311",
      name: "Anatomy, Pathology and Physiology of the Auditory System",
      options: ["HESP311"],
    },
    { kind: "course", id: "hesp400", name: "Speech and Language Development in Children", options: ["HESP400"] },
    { kind: "course", id: "hesp403", name: "Introduction to Phonetic Science", options: ["HESP403"] },
    { kind: "course", id: "hesp407", name: "Bases of Hearing Science", options: ["HESP407"] },
    { kind: "course", id: "hesp411", name: "Introduction to Audiology", options: ["HESP411"] },
    {
      kind: "choose",
      id: "hesp-disorder",
      name: "Disorder Course (select one)",
      count: 1,
      // Union of the 2025 checklist (HESP410) and the 2026-27 catalog (HESP498); HESP410 is not in
      // the current catalog's approved-course list (main session, 2026-09-28).
      from: { courses: ["HESP402", "HESP404", "HESP406", "HESP410", "HESP498"] },
    },
    {
      kind: "choose",
      id: "hesp-elective",
      name: "HESP Elective Course",
      count: 1,
      from: {
        courses: [
          "HESP402",
          "HESP404",
          "HESP406",
          "HESP410",
          "HESP413",
          "HESP415",
          "HESP416",
          "HESP417",
          "HESP418",
          "HESP420",
          "HESP422",
          "HESP469",
          "HESP498",
          "HESP499",
        ],
      },
    },
    { kind: "course", id: "psyc100", name: "Introduction to Psychology", options: ["PSYC100"] },
    {
      kind: "choose",
      id: "hesp-statistics",
      name: "Statistics Requirement",
      count: 1,
      from: { courses: ["QMMS251", "QMMS451", "PSYC200", "BIOM301"] },
    },
    {
      kind: "choose",
      id: "hesp-allied-fields",
      advisorMayApprove: true,
      name: "Allied/Related Fields (2 courses)",
      count: 2,
      from: { courses: ["PHYS102", "PHYS103", "BSCI103", "BSCI170", "BSCI180", "BSCI171"] },
    },
  ],
};

export const hespMajorMeta: ProgramMeta = {
  kind: "major",
  college: "BSOS",
  short: "Hearing & Speech Sciences",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/hearing-speech-sciences/hearing-speech-sciences-major/",
    department:
      "https://web.archive.org/web/20260210113440id_/https://fellercenter.umd.edu/sites/fellercenter.umd.edu/files/BSOS%20Forms/HESP%20Major%20Checklist%20090425%20Writable.pdf",
  },
};
