// African American and Africana Studies Major, Public Policy concentration, 2026–27 UMD Academic
// Catalog. Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/african-american-africana-studies/african-american-africana-studies-major/;
// Feller Center (College of Behavioral and Social Sciences) "AAAS Public Policy Major Checklist"
// (department checklist), https://fellercenter.umd.edu (Internet Archive copy, fetched 2026-09-28),
// which includes the department's own four-year graduation-plan grid. Checklist dated 4/8/24; the
// catalog is the current 2026-27 edition.
// Owner ruling (docs/project/rulings.md): where the department page and the catalog disagree, follow
// the department page -- EXCEPT the checklists here are older (2024) than the 2026-27 catalog and use
// the retired AASP course prefix (the catalog's current prefix is AAAS, same course numbers). Per the
// builder brief: courses are encoded under AAAS, with the matching AASP code kept as an accepted
// alternative (older transcripts), and on any OTHER disagreement (not the prefix) the newer catalog
// wins over the 2024 checklist -- the reverse of the usual department-wins default.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const aaasMajorPublicPolicy: Program = {
  id: "aaas-major-public-policy",
  name: "African American and Africana Studies Major (Public Policy)",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, African American and Africana Studies Major, Public Policy Concentration; " +
    "Feller Center, AAAS Public Policy Major Checklist (department checklist, dated 4/8/24), " +
    "https://fellercenter.umd.edu/sites/fellercenter.umd.edu/files/Major%20Cards/AAAS%20Public%20Policy%20Major%20Checklist%20040824%20writable.pdf " +
    "(Internet Archive copy, fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "PREFIX CHANGE: both fetched department checklists (dated 2024) use the retired AASP course prefix; the current 2026-27 catalog uses AAAS for the same course numbers. Every AAAS course below also accepts the matching AASP code as an alternative, so a student with an older AASP-coded transcript still gets credit. Flagged for owner confirmation that no course was actually renumbered (not just re-prefixed) along the way.",
    "Foundation: Public Policy concentration students take AAAS100, AAAS200, AND AAAS101 specifically (not the General track's AAAS101-or-AAAS202 choice) -- read from the catalog's footnote on the AAAS101 row ('Required for Public Policy Concentration Students') together with this checklist's own two separate Foundation rows (a benchmark 'AASP100 or AASP200' choice, then a second row requiring whichever of AASP100/200 wasn't taken first, PLUS a standalone required AASP101 row). Flagged in docs/project/owner-review.md for owner confirmation.",
    "Methods: this checklist requires AASP395 specifically (not the General track's AASP390-or-395 choice) as the Advanced Methods course for the Public Policy concentration. The 2026-27 catalog's Methods section doesn't itself carve out a Public Policy-specific line here (it only states the general AAAS395-or-AAAS390 choice and separately tabulates the Public Policy Analytic Component), so this narrowing comes from the department checklist filling a gap the catalog leaves generic, not from a catalog/checklist conflict -- department wins per the default ruling. Flagged in docs/project/owner-review.md for owner confirmation.",
    "Research Practicum (AAAS399) is listed by the catalog as a single 2-credit line but the checklist shows it taken as two separate 1-credit registrations ('Lab 1' / 'Lab 2') across two semesters; encoded as one `choose` requirement needing 2 credits of AAAS399/AASP399 rather than a single course instance.",
    "PLCY388/PLCY401 (Analytic Component) are PLCY-prefixed, not AAAS/AASP, so no AASP alternative applies to that requirement.",
    "AASP Policy Electives in African American Studies: the catalog names all 6 eligible courses explicitly (AAAS398, AAAS411, AAAS441, AAAS443, AAAS498, AAAS499; choose 3), so -- unlike the General track's un-enumerated Cluster requirement -- this is encoded as a literal 6-course `choose` list, each course paired with its AASP alternative.",
    "Capstone: the catalog names only AAAS397 (Senior Thesis) as a real course number for this 'Choose One' slot (shared with the General track); its other two options are printed as unnumbered placeholders. The checklist's parallel row names 'AASP401: Professional Seminar' or an approved Education Abroad experience, but AAAS401 is not on the Academic Catalog's current AAAS course list -- not encoded (only AAAS397 is), flagged in docs/project/owner-review.md (same issue as the General track).",
    "Not encoded (engine gaps): Program GPA 2.0 encoded as minGpa. the checklist's residency rules (15 of the final 30 credits at the 300-400 level, 12 upper-level major credits at UMD, at least 30 credits at UMD, cumulative 2.0 UMD GPA); and the 120-credit graduation minimum.",
  ],
  requirements: [
    { kind: "course", id: "aaas100", name: "Introduction to African American and Africana Studies", options: ["AAAS100", "AASP100"] },
    { kind: "course", id: "aaas200", name: "African Civilization", options: ["AAAS200", "AASP200"] },
    { kind: "course", id: "aaas101", name: "Public Policy and the Black Community", options: ["AAAS101", "AASP101"] },
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
      name: "Advanced Methods: AAAS395 (Fundamentals of Quantitative Research in Socio-Cultural Perspective)",
      options: ["AAAS395", "AASP395"],
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
    { kind: "course", id: "econ200", name: "Principles of Microeconomics", options: ["ECON200"] },
    { kind: "course", id: "aaas301", name: "Applied Policy Analysis and the Black Community", options: ["AAAS301", "AASP301"] },
    {
      kind: "course",
      id: "plcy-analytic",
      name: "PLCY388 (Special Topics in Public Policy) or PLCY401 (Making Policy Work)",
      options: ["PLCY388", "PLCY401"],
    },
    {
      kind: "choose",
      id: "policy-electives",
      name: "AASP Policy Electives in African American Studies (choose 3 of 6)",
      count: 3,
      from: {
        courses: [
          "AAAS398", "AASP398",
          "AAAS411", "AASP411",
          "AAAS441", "AASP441",
          "AAAS443", "AASP443",
          "AAAS498", "AASP498",
          "AAAS499", "AASP499",
        ],
      },
    },
  ],
};

export const aaasMajorPublicPolicyMeta: ProgramMeta = {
  kind: "major",
  college: "BSOS",
  short: "AAAS (Public Policy)",
  major: "aaas",
  track: "Public Policy",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/african-american-africana-studies/african-american-africana-studies-major/",
    department: "https://fellercenter.umd.edu/sites/fellercenter.umd.edu/files/Major%20Cards/AAAS%20Public%20Policy%20Major%20Checklist%20040824%20writable.pdf",
  },
};
