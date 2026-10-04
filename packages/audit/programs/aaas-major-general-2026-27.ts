// African American and Africana Studies Major, General track, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/african-american-africana-studies/african-american-africana-studies-major/;
// Feller Center (College of Behavioral and Social Sciences) "AAAS Major Checklist" (department
// checklist), https://fellercenter.umd.edu (Internet Archive copy, fetched 2026-02-10 per the
// checklist's own watermark, refetched 2026-09-28), which includes the department's own four-year
// graduation-plan grid. Checklist dated 5/1/24 (updated); the catalog is the current 2026-27 edition.
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree, follow
// the department page -- EXCEPT the checklists here are older (2024) than the 2026-27 catalog and use
// the retired AASP course prefix (the catalog's current prefix is AAAS, same course numbers). Per the
// builder brief: courses are encoded under AAAS, with the matching AASP code kept as an accepted
// alternative (older transcripts), and on any OTHER disagreement (not the prefix) the newer catalog
// wins over the 2024 checklists -- the reverse of the usual department-wins default.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const aaasMajorGeneral: Program = {
  id: "aaas-major-general",
  name: "African American and Africana Studies Major (General)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, African American and Africana Studies Major; " +
    "Feller Center, AAAS Major Checklist (department checklist, dated 5/1/24), " +
    "https://fellercenter.umd.edu/sites/fellercenter.umd.edu/files/Major%20Cards/AAAS%20Major%20Checklist%20050224%20Writable.pdf " +
    "(Internet Archive copy, fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "PREFIX CHANGE: both fetched department checklists (dated 2024) use the retired AASP course prefix; the current 2026-27 catalog uses AAAS for the same course numbers. Every AAAS course below also accepts the matching AASP code as an alternative, so a student with an older AASP-coded transcript still gets credit. Flagged for owner confirmation that no course was actually renumbered (not just re-prefixed) along the way.",
    "Foundation choice: the catalog's 'AAAS101 or AAAS202' row carries a footnote ('Required for Public Policy Concentration Students') that the fetched table markup couldn't cleanly attach to one row, but read together with both checklists it means: Public Policy concentration students must take AAAS101 specifically (see aaas-major-public-policy-2026-27.ts), while General-track students may take either AAAS101 or AAAS202, as encoded here. Flagged in docs/project/owner-review.md for owner confirmation.",
    "Research Practicum (AAAS399) is listed by the catalog as a single 2-credit line but both checklists show it taken as two separate 1-credit registrations ('Lab 1' / 'Lab 2') across two semesters; encoded as one `choose` requirement needing 2 credits of AAAS399/AASP399 rather than a single course instance.",
    "Capstone: the catalog names only AAAS397 (Senior Thesis) as a real course number for this 'Choose One' slot; its other two options are printed as unnumbered placeholders ('AAAS4XX (Study Abroad in Africa or African Diaspora)' and 'AAAS4XX (Capstone Seminar and Community Practicum)'). The department checklist's parallel row names 'AASP401: Professional Seminar' or an approved Education Abroad experience for the same slot, but AAAS401 is not on the Academic Catalog's current AAAS course list, so it isn't clear that number is still live -- not encoded (only AAAS397 is), flagged in docs/project/owner-review.md.",
    "Not encoded (no named list; per the no-named-list ruling this is instead a department + 300-400 `choose` filter, matching the Geography majors' gateway-course precedent): the catalog's 'Five courses at the 300 or 400 level ... at least one course in Cluster 1 and one in Cluster 2' -- the Cluster 1 / Cluster 2 rosters are only described as available on the AAAS department website each semester, not present in either fetched source, so the cluster split itself isn't checked, only the count and level. Flagged in docs/project/owner-review.md.",
    "Not encoded (engine gaps): the checklist's residency rules (15 of the final 30 credits at the 300-400 level, 12 upper-level major credits at UMD, at least 30 credits at UMD, cumulative 2.0 UMD GPA); and the 120-credit graduation minimum.",
  ],
  requirements: [
    { kind: "course", id: "aaas100", name: "Introduction to African American and Africana Studies", options: ["AAAS100", "AASP100"] },
    { kind: "course", id: "aaas200", name: "African Civilization", options: ["AAAS200", "AASP200"] },
    {
      kind: "course",
      id: "aaas101-or-202",
      name: "AAAS101 (Public Policy and the Black Community) or AAAS202 (Black Culture in the United States)",
      options: ["AAAS101", "AASP101", "AAAS202", "AASP202"],
    },
    { kind: "course", id: "aaas210", name: "Intro to Research Design and Analysis in African American and Africana Studies", options: ["AAAS210", "AASP210"] },
    {
      kind: "choose",
      id: "research-practicum",
      name: "Research Practicum (AAAS399, taken 1 credit per semester, 2 credits total)",
      credits: 2,
      from: { courses: ["AAAS399", "AASP399"] },
    },
    {
      kind: "course",
      id: "advanced-methods",
      name: "Advanced Methods: AAAS395 (Fundamentals of Quantitative Research) or AAAS390 (Advanced Qualitative Methods)",
      options: ["AAAS395", "AASP395", "AAAS390", "AASP390"],
    },
    {
      kind: "choose",
      id: "capstone",
      name: "Capstone (choose one): AAAS397 Senior Thesis, or a 400-level AAAS capstone seminar / study-abroad course",
      count: 1,
      // The catalog's other two options are printed as "AAAS4XX" (Capstone Seminar and Community
      // Practicum; Study Abroad), so any 400-level AAAS/AASP course is accepted (broader than the
      // department's list; main session, 2026-09-28).
      from: { courses: ["AAAS397", "AASP397"], departments: ["AAAS", "AASP"], minNumber: 400, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "upper-level-electives",
      name: "Upper-Level AAAS Electives (5 courses, 300/400 level; at least one in Cluster 1 and one in Cluster 2 -- clusters not enumerated in fetched sources)",
      count: 5,
      from: {
        departments: ["AAAS", "AASP"],
        minNumber: 300,
        maxNumber: 499,
        exclude: [
          "AAAS100", "AASP100", "AAAS200", "AASP200", "AAAS101", "AASP101", "AAAS202", "AASP202",
          "AAAS210", "AASP210", "AAAS399", "AASP399", "AAAS395", "AASP395", "AAAS390", "AASP390",
          "AAAS397", "AASP397",
        ],
      },
    },
  ],
};

export const aaasMajorGeneralMeta: ProgramMeta = {
  kind: "major",
  college: "BSOS",
  short: "AAAS (General)",
  major: "aaas",
  track: "General",
  defaultTrack: true,
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/african-american-africana-studies/african-american-africana-studies-major/",
    department: "https://fellercenter.umd.edu/sites/fellercenter.umd.edu/files/Major%20Cards/AAAS%20Major%20Checklist%20050224%20Writable.pdf",
  },
};
