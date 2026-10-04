// LGBTQ Studies Certificate, 2026–27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/women-gender-sexuality-studies/lesbian-gay-bisexual-transgender-studies/LGBTQ-studies-certificate/
// (fetched 2026-09-28); Department of WGSS, https://wgss.umd.edu/academic-programs/undergraduate/LGBTQ-Certificate
// (fetched 2026-09-28). Owner ruling: where the department page and the catalog disagree, follow the
// department page. Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const lgbtCert: Program = {
  id: "lgbt-cert",
  name: "LGBTQ Studies Certificate",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, LGBTQ Studies Certificate; Department of WGSS, " +
    "https://wgss.umd.edu/academic-programs/undergraduate/LGBTQ-Certificate (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  maxSharedWith: [{ credits: 9 }],
  reviewNotes: [
    "Encodes the requirements for students admitted in or after 2020. The department page also lists a pre-2020 structure (one of LGBT265/ENGL265 or LGBT291/CMLT291; one of LGBT350, LGBT407/PHIL407, LGBT494/WMST494; one of LGBT359/ENGL359, LGBT459/ENGL459, LGBT465/ENGL465, LGBT327; LGBT488 or LGBT386; two electives, one at 300+). Not encoded.",
    "Department vs catalog: the department page says 'comprised of 15 required and six elective credits' but its own detail (LGBT200 plus a capstone = 6 required credits, 15 elective credits) and the catalog (Required Core 6, Electives 15) agree. Encoded as 6 required + 5 electives (15 credits).",
    "Department vs catalog: the department page requires at least 12 credits at 300+ (encoded as an overlay choose of 12 credits from LGBT 300-499); the catalog instead says at least three of the five electives are upper division. The department page wins; the catalog's wording is not separately encoded (the capstone plus the department's 12 credits at 300+ implies at least 3 upper-division electives).",
    "The capstone is LGBT488 or LGBT386 in both sources. Same rule. The department page's 'LGBT200 Introduction to LGBT Studies' is the catalog's 'Queer Worlds: Studies in Gender and Sexuality'.",
    "The 5 electives have no course list in either source ('consult the department'). Encoded as any 5 LGBT courses (100-499), never narrower. Cross-listed courses under other prefixes (e.g. ENGL265, PHIL407, WMST494) that the department approves are not recognised. Not enforced (manual check): 'electives must cover at least three of the six thematic areas' (Arts, Technology and Cultural Production; Transnational Politics and Perspectives; Institutions, Politics, and/or Social Movements; Race, Ethnicity, and Class; Transgender Studies; Queer and/or Feminist Theory).",
    "'No more than 9 credits can overlap with the student's major' (department page; the catalog says 'a maximum of nine credits (or three courses)') -> maxSharedWith: [{ credits: 9 }], which caps overlap with ALL other programs, not majors only; the engine can't restrict the cap to majors; flagged.",
    "Not encoded (engine gaps, manual): the 2.0 overall certificate GPA; the cap of 9 credits at institutions other than UMD; certificate admission gates. The C- minimum per course is encoded.",
  ],
  requirements: [
    { kind: "course", id: "foundation", name: "Foundation: Queer Worlds", options: ["LGBT200"] },
    {
      kind: "course",
      id: "capstone",
      name: "Capstone: LGBT386 (internship) or LGBT488 (seminar)",
      options: ["LGBT386", "LGBT488"],
    },
    {
      kind: "choose",
      id: "electives",
      name: "Five elective courses (15 credits), any LGBT course",
      count: 5,
      from: { departments: ["LGBT"], minNumber: 100, maxNumber: 499 },
    },
    {
      kind: "choose",
      id: "upper-credits",
      name: "At least 12 credits at the 300 level or above",
      overlay: true,
      credits: 12,
      from: { departments: ["LGBT"], minNumber: 300, maxNumber: 499 },
    },
  ],
};

export const lgbtCertMeta: ProgramMeta = {
  kind: "certificate",
  college: "ARHU",
  short: "LGBTQ Studies Certificate",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/women-gender-sexuality-studies/lesbian-gay-bisexual-transgender-studies/LGBTQ-studies-certificate/",
    department: "https://wgss.umd.edu/academic-programs/undergraduate/LGBTQ-Certificate",
  },
};
