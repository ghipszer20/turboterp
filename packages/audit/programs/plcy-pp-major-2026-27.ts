// Public Policy Major (BA), School of Public Policy, 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/public-policy/public-policy-major/
// and the School of Public Policy department page (spp.umd.edu), fetched 2026-09-28; see
// program-sources/public-policy-major.md. Global and Foreign Policy is a separate major, encoded elsewhere.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const plcyPpMajor: Program = {
  id: "plcy-pp-major",
  name: "Public Policy Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Public Policy Major " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/public-policy/public-policy-major/); " +
    "School of Public Policy Bachelor of Arts in Public Policy page, " +
    "https://spp.umd.edu/your-education/undergraduate/public-policy-major (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "The four policy electives are one pool of four PLCY-department courses. The catalog lists 'Introduction to Public Policy Focus' plus three 'Focus/PLCY Elective' rows with no course ids, and the department page gives areas (sustainability, science and technology, social policy, global and foreign policy, philanthropy and nonprofits) but no course list, so the department is the range: any PLCY course counts. The rule that one of the four be an introductory focus-area course is not enforced (no list published). Non-PLCY electives are allowed with advisor approval and the Using Non-PLCY Courses as Electives Form; not encodable as a list; the plcy-electives requirement is marked advisorMayApprove.",
    "Manual, not encoded: 58-61 total credits; 2.0 average across major courses; benchmark deadlines (PLCY100/101 within two semesters into the major, STAT100 or equivalent and PLCY200 within four); PLCY400/PLCY401 only after 90 credits; prerequisites shown on the department page.",
    "PLCY309 (Policy Internship, 3-6 credits) also satisfies the experiential learning requirement (at least 3 credits of internship, research or study abroad); the department page says research credit or an approved study abroad may stand in, which is not encoded.",
    "STAT100 is listed as 'STAT100 or higher (STAT100 equivalent accepted)' on the department page; encoded as any STAT course numbered 100 or higher (main session, 2026-09-28: STAT100 alone was narrower than the source); non-STAT equivalents are not encoded. Confirm.",
    "The SPP four-year plan page is only a link to downloadable Plans of Study; no plan text is in the source, so the sample plan is CONSTRUCTED from the catalog, not official.",
    "The catalog marks PLCY302 'UP Pending'; encoded as an ordinary required course.",
  ],
  requirements: [
    { kind: "course", id: "plcy100", name: "Foundations of Public Policy (PLCY100)", options: ["PLCY100"] },
    { kind: "course", id: "plcy101", name: "Great Thinkers on Public Policy (PLCY101)", options: ["PLCY101"] },
    { kind: "choose", id: "stat100", name: "Statistics (STAT100 or higher)", count: 1, from: { departments: ["STAT"], minNumber: 100 } },
    { kind: "course", id: "plcy200", name: "Introduction to Research Methods for Policy Analysis (PLCY200)", options: ["PLCY200"] },
    { kind: "course", id: "hist201", name: "Interpreting American History: From 1865 to the Present (HIST201)", options: ["HIST201"] },
    { kind: "course", id: "econ200", name: "Principles of Microeconomics (ECON200)", options: ["ECON200"] },
    { kind: "course", id: "plcy201", name: "Public Leaders and Active Citizens (PLCY201)", options: ["PLCY201"] },
    { kind: "course", id: "plcy203", name: "Liberty and Justice for All: Ethics and Moral Issues in Public Policy (PLCY203)", options: ["PLCY203"] },
    { kind: "course", id: "plcy300", name: "Governance: Collective Action in the Public Interest (PLCY300)", options: ["PLCY300"] },
    { kind: "course", id: "plcy302", name: "Examining Pluralism in Public Policy (PLCY302)", options: ["PLCY302"] },
    { kind: "course", id: "plcy303", name: "Public Economics: Raising and Spending the People's Money (PLCY303)", options: ["PLCY303"] },
    { kind: "course", id: "plcy304", name: "Evaluating Evidence: Finding Truth in Numbers (PLCY304)", options: ["PLCY304"] },
    { kind: "course", id: "plcy309", name: "Internship in Public and Nonprofit Institutions (PLCY309)", options: ["PLCY309"] },
    { kind: "course", id: "plcy400", name: "Senior Capstone (PLCY400)", options: ["PLCY400"] },
    { kind: "course", id: "plcy401", name: "Making Policy Work: Contemporary Challenges and Solutions (PLCY401)", options: ["PLCY401"] },
    {
      kind: "choose",
      id: "plcy-electives",
      advisorMayApprove: true,
      name: "Policy electives (four: one introductory focus course plus three, any PLCY course)",
      count: 4,
      from: { departments: ["PLCY"] },
    },
  ],
};

export const plcyPpMajorMeta: ProgramMeta = {
  kind: "major",
  college: "PLCY",
  short: "Public Policy",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/public-policy/public-policy-major/",
    department: "https://spp.umd.edu/your-education/undergraduate/public-policy-major",
  },
};
