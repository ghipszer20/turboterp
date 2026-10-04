// Secondary Education - World Language Major (P-12), College of Education (TLPL), 2026-27 UMD Academic Catalog.
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/
// world-language-education-major/; education.umd.edu/MCERT (a graduate program page), terrapinteachers.umd.edu (no
// requirements) and the College of Education major-four-year-plans page (links only), all fetched 2026-09-28;
// see program-sources/world-language-education-major.md. The department pages carry no requirements for this
// major, so there is no disagreement to resolve. Shared teacher-prep pieces come from educ-shared-2026-27.ts.
// Only the education component is encoded: the catalog defines the language content per language with no
// course lists. Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta, Requirement } from "../src/audit.ts";
import {
  educAdolescentDevelopment,
  educContentAreaLiteracy,
  educFieldExperience,
  educFoundations,
  educInternship,
  educProfessionalSeminar,
  educSharedReviewNotes,
} from "./educ-shared-2026-27.ts";

const c = (id: string, name: string, course: string): Requirement => ({
  kind: "course",
  id,
  name: `${name} (${course})`,
  options: [course],
});

export const educWorldLanguageMajor: Program = {
  id: "educ-world-language-major",
  name: "Secondary Education - World Language Major",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026-27, Secondary Education Major - World Language " +
    "(https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/world-language-education-major/); " +
    "College of Education pages (education.umd.edu/MCERT, terrapinteachers.umd.edu, major four-year-plans page), fetched 2026-09-28",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    ...educSharedReviewNotes,
    "Department pages checked: the MCERT page describes a graduate certification program, terrapinteachers.umd.edu is a STEM-only landing page and the four-year-plans page only links out (it lists Chinese, French, German, Italian, Latin, Russian and Spanish, with no requirements). None adds or contradicts a requirement, so the catalog is encoded alone.",
    "The language content is not encoded: the catalog gives the Primary World Language (WL) area as generic rows with no course lists ('pre-professional courses vary by subject area; consult the academic department'), and no per-language tracks are defined. Encoded here is the education component only, plus the internship.",
    "Primary WL Area, 36 credits, is now an openSlot requirement ('educ-wl-primary-area'): Intermediate (200 level) courses (6), Reading Strategies (3), Grammar and Composition at 300-400 level (6), Survey of Literature at 300-400 level (6), Conversation at 300-400 level (3), Literature at 400 level and above (6) and Culture and Civilization (6). No department, course or range is named; per-language lists must come from the language department.",
    "Primary WL Area Applied Linguistics, 3 credits, is now an openSlot requirement ('educ-wl-applied-linguistics'): the source says 'Applied Linguistics in the Primary WL Area if available; otherwise LING200 may satisfy this requirement; check with your advisor'. It is a slot rather than a LING200 course because that would narrow the rule.",
    "Electives in a Supporting Area/WL-Related Courses, 9 credits (minimum three courses), is now an openSlot requirement ('educ-wl-supporting-area'); the second area must be approved by a WL advisor, and no courses are named. The minimum-three-courses rule is not checked.",
    "Manual: ACTFL Oral Proficiency Interview (Advanced Low for French, German, Italian, Russian and Spanish; Intermediate High for Chinese) and Praxis II Content Knowledge or the ACTFL Written Proficiency Test at Intermediate High. Primary WL Area courses must almost always be completed before the internship; six hours of intermediate coursework must precede the 300-400 level courses. Neither is encoded.",
    "TLPL445, TLPL450 and TLPL479 are 'Fall only' in the catalog; term offering is not encoded. TLPL479 (as TLPL479J), TLPL478 (TLPL478K) and TLPL489 (TLPL489J) are matched by course code; the section is not distinguishable.",
    "The catalog's Total Credits line (82) is not checked.",
    "No official 4-year plan is published for World Language Education in the fetched sources (only links). The sample plan is CONSTRUCTED, education courses only; flagged in docs/project/owner-review.md.",
  ],
  requirements: [
    educAdolescentDevelopment,
    educContentAreaLiteracy,
    c("educ-wl-tlpl442", "Foundations of Literacy and Biliteracy Development", "TLPL442"),
    educFoundations,
    c("educ-wl-tlpl445", "Methods I: World Language Methods and Technology", "TLPL445"),
    c("educ-wl-tlpl450", "Advanced World Language Methods and Technology", "TLPL450"),
    educFieldExperience(1),
    educProfessionalSeminar(1),
    educInternship(1),
    c(
      "educ-wl-tlpl477",
      "Teaching Academically, Culturally, and Linguistically Diverse Students in Middle School and Secondary Education",
      "TLPL477",
    ),
    {
      kind: "openSlot",
      id: "educ-wl-primary-area",
      name: "Primary World Language Area courses",
      credits: 36,
      note: "Intermediate (200 level) 6, Reading Strategies 3, Grammar and Composition (300-400) 6, Survey of Literature (300-400) 6, Conversation (300-400) 3, Literature (400+) 6, Culture and Civilization 6. No course list is published; get the per-language list from your language department and confirm with your advisor.",
    },
    {
      kind: "openSlot",
      id: "educ-wl-applied-linguistics",
      name: "Applied Linguistics in the Primary WL Area",
      credits: 3,
      note: "Applied Linguistics in your Primary WL Area if available; otherwise LING200 may satisfy this. Check with your advisor.",
    },
    {
      kind: "openSlot",
      id: "educ-wl-supporting-area",
      name: "Supporting Area / WL-Related electives",
      credits: 9,
      note: "At least three courses in a second area approved by a World Language advisor; no courses are named.",
    },
  ],
};

export const educWorldLanguageMajorMeta: ProgramMeta = {
  kind: "major",
  college: "EDUC",
  short: "Secondary Education - World Language",
  sources: {
    catalog:
      "https://academiccatalog.umd.edu/undergraduate/colleges-schools/education/teaching-learning-policy-leadership/world-language-education-major/",
    department: "https://education.umd.edu/student-resources/student-services/coe-undergraduate-studies-student-services-office/major-four",
  },
};
