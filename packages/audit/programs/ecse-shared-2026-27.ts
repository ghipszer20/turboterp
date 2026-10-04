// Early Childhood / Early Childhood Special Education (ECSE) Major, College of Education (HDQM), 2026-27 UMD
// Academic Catalog. Requirements shared by both tracks; not a program file (no `*Meta` export).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/education/human-development-quantitative-methodology/
// early-childhood-special-education-major/ and education.umd.edu/student-resources/student-services/
// coe-undergraduate-studies-student-services-office/major-four (both fetched 2026-09-28); see
// program-sources/early-childhood-special-education-major.md.

import type { Requirement } from "../src/audit.ts";
import { educFoundations, educSharedReviewNotes } from "./educ-shared-2026-27.ts";

const c = (id: string, name: string, course: string): Requirement => ({
  kind: "course",
  id,
  name: `${name} (${course})`,
  options: [course],
});

export const ecseSharedReviewNotes: string[] = [
  ...educSharedReviewNotes,
  "Department page: the College of Education 'Major Four Year Plans' page (education.umd.edu/.../major-four) lists programs and general College policy only, with no requirements that differ from the catalog, so there is no disagreement to resolve.",
  "Biological Science with lab, 4 credits (also a Gen Ed double count), is now an openSlot requirement ('ecse-biological-science'). The catalog names no course or department.",
  "Physical Science with lab (4 credits): the catalog names ASTR, CHEM, GEOL and PHYS 'with Lab'; encoded as one course from those four departments. The lab component is not checked.",
  "Social Science (3 credits): one course from ANTH, ECON, GEOG, GVPT, HIST or SOCY. HIST200 is its own row.",
  "Creative Art (2-3 credits): the catalog lists THET120, MUED155, TLPL202, TLPL331, ARTT100 or ARTT110, and ARTH221; encoded as one-of. TLPL331 has no title in the catalog.",
  "Not enforced (manual): total credits (pre-professional 34-35, professional 55), five semesters of field placement including the yearlong internship in a Professional Development School, and finishing all pre-professional and professional courses before the yearlong internship.",
  "Track choice: the catalog's 'Complete One of the Two Tracks' (6 credits) is encoded as two programs sharing the major key `ecse`; a student picks the track program that matches their plan.",
  "No official 4-year plan is published in the fetched sources (the department page only links to plans). The sample plans are CONSTRUCTED from the catalog tables; flagged in docs/project/owner-review.md.",
];

export const ecseRequirements: Requirement[] = [
  c("ecse-psyc100", "Introduction to Psychology", "PSYC100"),
  {
    kind: "choose",
    id: "ecse-social-science",
    name: "Social Science (ANTH, ECON, GEOG, GVPT, HIST or SOCY)",
    count: 1,
    from: { departments: ["ANTH", "ECON", "GEOG", "GVPT", "HIST", "SOCY"] },
  },
  c("ecse-hist200", "Interpreting American History: Beginnings to 1877", "HIST200"),
  {
    kind: "choose",
    id: "ecse-physical-science",
    name: "Physical Science with Lab (ASTR, CHEM, GEOL or PHYS)",
    count: 1,
    from: { departments: ["ASTR", "CHEM", "GEOL", "PHYS"] },
  },
  educFoundations,
  c("ecse-math212", "Elements of Numbers and Operations", "MATH212"),
  c("ecse-math213", "Elements of Geometry and Measurement", "MATH213"),
  {
    kind: "course",
    id: "ecse-creative-art",
    name: "Creative Art (one of THET120, MUED155, TLPL202, TLPL331, ARTT100, ARTT110, ARTH221)",
    options: ["THET120", "MUED155", "TLPL202", "TLPL331", "ARTT100", "ARTT110", "ARTH221"],
  },
  c("ecse-edhd210", "Foundations of Early Childhood Education", "EDHD210"),
  c("ecse-edhd220", "Exploring Early Childhood General and Special Education", "EDHD220"),
  {
    kind: "course",
    id: "ecse-child-development-birth-3",
    name: "Child Development, Birth to Three Years (EDHD434 or EDSP420)",
    options: ["EDHD434", "EDSP420"],
  },
  c("ecse-edhd425", "Language Development and Reading Acquisition", "EDHD425"),
  c("ecse-edhd314", "Reading in the Early Childhood Classroom", "EDHD314"),
  c("ecse-edhd431", "Child Development and Learning, Three to Eight Years", "EDHD431"),
  c("ecse-edsp423", "Assessment in Early Childhood Special Education", "EDSP423"),
  c("ecse-edsp315", "Inclusive Instruction: Reading Methods II", "EDSP315"),
  c("ecse-edsp321", "The Young Child As Scientist", "EDSP321"),
  c("ecse-edhd322", "The Young Child as Mathematician", "EDHD322"),
  c("ecse-edhd323", "Children Study their World", "EDHD323"),
  c("ecse-edsp417", "Reading Diagnosis and Assessment", "EDSP417"),
  c("ecse-edhd441", "Data Driven Decision Making in EC/ECSE", "EDHD441"),
  c("ecse-edhd442", "Interventions for Children with Behavioral Challenges", "EDHD442"),
  c("ecse-edhd443", "Interventions for Children with Social and Communication Challenges", "EDHD443"),
  c("ecse-edhd444", "Action Research in EC/ECSE", "EDHD444"),
  c("ecse-edhd437", "EC/ECSE Teachers as Researchers and Reflective Practitioners", "EDHD437"),
  c("ecse-edhd432", "Internship in EC/ECSE", "EDHD432"),
  {
    kind: "openSlot",
    id: "ecse-biological-science",
    name: "Biological science with lab",
    credits: 4,
    note: "The catalog names no course or department (also counts toward Gen Ed). Confirm with your advisor.",
  },
];
