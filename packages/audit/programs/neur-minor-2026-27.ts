// Neuroscience Minor, 2026–27 UMD Academic Catalog (Department of Psychology, BSOS).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/psychology/neuroscience-minor/
// (fetched 2026-09-28); Department of Psychology, https://psyc.umd.edu/undergraduate/neuroscience-minor
// (fetched 2026-09-28). Owner ruling: where the department page and the catalog disagree, follow the
// department page. No official published sample plan (built from the requirements below; see
// docs/project/owner-review.md). Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const neurMinor: Program = {
  id: "neur-minor",
  name: "Neuroscience Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Neuroscience Minor; Department of Psychology, " +
    "https://psyc.umd.edu/undergraduate/neuroscience-minor (fetched 2026-09-28)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Department page: 'No more than 2 courses can count towards both the minor and your major' -> maxSharedWith: [{ courses: 2 }]. The catalog is silent on sharing.",
    "Eligibility restriction (department page): all majors are eligible EXCEPT students in the Physiology & Neurobiology (PHNB) track of Biological Sciences and the Neuroscience (NEUR) major. Enforced via notOpenTo (bsci-major-phnb, its Shady Grove track bsci-usg-major, and neur-major).",
    "Application prerequisites (both sources): 30 college credits with 15 at UMD, good standing, and C- or better in BSCI170, CHEM131/CHEM132 and NEUR200 or PSYC202. These gate admission and are not among the minor's 21-23 credits, so they are not encoded as requirements; manual check.",
    "Program GPA 2.0 encoded as minGpa. The C- minimum grade is encoded on the whole program.",
    "Open slot 'neur-electives' (openSlot requirement): 6-8 credits (two elective courses) from the eligible-elective list on the department program website; the list is not published in either fetched source. Set to the 6-credit minimum.",
    "Seniors must apply before the end of fall schedule adjustment because PSYC409 is offered only in the fall; application deadlines are Oct 1, Mar 1 and Jun 1. Timing rules, not encoded.",
  ],
  requirements: [
    { kind: "course", id: "psyc300", name: "Research Methods in Psychology Laboratory", options: ["PSYC300"] },
    { kind: "course", id: "psyc409", name: "Topics in Neurosciences Seminar", options: ["PSYC409"] },
    { kind: "course", id: "lab", name: "Laboratory or data science course", options: ["NEUR405", "PSYC407", "PSYC417"] },
    { kind: "course", id: "biological", name: "Biological neuroscience course", options: ["PSYC304", "PSYC406", "BSCI446"] },
    { kind: "course", id: "behavior", name: "Animal behavior course", options: ["PSYC403", "PSYC302", "BSCI360"] },
    {
      kind: "openSlot",
      id: "neur-electives",
      name: "Neuroscience electives",
      credits: 6,
      note: "Two courses (6-8 credits) from the eligible-elective list on the Psychology department's Neuroscience Minor page; confirm with your advisor.",
    },
  ],
};

export const neurMinorMeta: ProgramMeta = { kind: "minor", college: "BSOS", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/behavioral-social-sciences/psychology/neuroscience-minor/", department: "https://psyc.umd.edu/undergraduate/neuroscience-minor" }, notOpenTo: { programs: ["bsci-major-phnb", "bsci-usg-major", "neur-major"], reason: "Not open to Biological Sciences (Physiology and Neurobiology) or Neuroscience majors." } };
