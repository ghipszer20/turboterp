// International Agriculture and Natural Resources Certificate, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/international-agriculture-natural-resources-certificate/
// (fetched 2026-09-28); AGNR, https://agnr.umd.edu/undergraduate/programs-pathways/international-agriculture-and-natural-resources
// (fetched 2026-09-28). Owner ruling: where the department page and the catalog disagree, follow the department page.
// Encoded by hand from program-sources/international-agriculture-natural-resources-certificate.md. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const agnrCert: Program = {
  id: "agnr-cert",
  name: "International Agriculture and Natural Resources Certificate",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, International Agriculture and Natural Resources Certificate; AGNR, " +
    "https://agnr.umd.edu/undergraduate/programs-pathways/international-agriculture-and-natural-resources (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  reviewNotes: [
    "Department vs catalog, International Courses: the two lists differ. The department page (10 courses) has AREC365, AREC433, AREC445, BMGT392, ECON315, GEOG330, GVPT306, NFSC425, ENST440, ENST100; the catalog (13) has AREC365, AREC433, AREC445, BMGT390, BMGT392, BSCI365, ECON440, ENST100, ENST440, GEOG422, GEOG434, GVPT306, NFSC425. Both lists are accepted (union), so no student following either source is wrongly failed; the owner decides whether the catalog-only BMGT390, BSCI365, ECON440, GEOG422, GEOG434 stay. Department-only courses accepted: ECON315, GEOG330.",
    "The department page prints 'BGMT 392'; read as BMGT392 (Introduction to International Business Management, which the catalog lists as BMGT392).",
    "Department vs catalog titles: GVPT306 is 'Global Ecopolitics' (department) vs 'Global Environmental Politics' (catalog). Same course code.",
    "Foreign language (6-8 credits, both sources): neither names any language courses. Encoded as 6 credits from a broad set of language departments (ARAB, CHIN, FREN, GERM, GREK, HEBR, HIND, ITAL, JAPN, KORE, LATN, PERS, PORT, RUSS, SPAN, SWAH) at 100-499, never narrower. Flagged: languages under other prefixes are not recognised, and the 8-credit maximum is not checked.",
    "Not encoded (manual): 'At least 3 of the international courses must be in the College of Agriculture and Natural Resources' for students majoring outside AGNR (conditional on the student's major; both sources agree, though the catalog's wording is garbled).",
    "Travel Study or Travel Abroad (3-4 credits, prerequisite: language coursework and 6 international-course credits; requires prior approval of the AGNR Associate Dean) and Travel Study Seminar (1 credit, prerequisite: the travel study): neither source names course codes, so both are manual, not encoded.",
    "Not encoded (manual): the Associate Dean's recommendation, completion of all bachelor's degree requirements, and the total of 19-21 credits (the catalog table says 19-22). The C- minimum per course is encoded. Program GPA 2.0 encoded as minGpa. No sharing limit: the catalog says the courses may also count toward other degree and general education requirements.",
  ],
  requirements: [
    {
      kind: "choose",
      id: "language",
      name: "Foreign language: 6-8 credits",
      credits: 6,
      from: {
        departments: ["ARAB", "CHIN", "FREN", "GERM", "GREK", "HEBR", "HIND", "ITAL", "JAPN", "KORE", "LATN", "PERS", "PORT", "RUSS", "SPAN", "SWAH"],
        minNumber: 100,
        maxNumber: 499,
      },
    },
    {
      kind: "choose",
      id: "international",
      name: "International courses: at least 9 credits",
      credits: 9,
      from: {
        courses: [
          "AREC365", "AREC433", "AREC445", "BMGT392", "ECON315", "GEOG330",
          "GVPT306", "NFSC425", "ENST440", "ENST100",
          // Catalog-only; accepted too (never narrower; main session 2026-09-28).
          "BMGT390", "BSCI365", "ECON440", "GEOG422", "GEOG434",
        ],
      },
    },
  ],
};

export const agnrCertMeta: ProgramMeta = {
  kind: "certificate",
  college: "AGNR",
  short: "International Ag. & Natural Resources Certificate",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/agriculture-natural-resources/international-agriculture-natural-resources-certificate/",
    department: "https://agnr.umd.edu/undergraduate/programs-pathways/international-agriculture-and-natural-resources",
  },
};
