// Professional Writing Minor, 2026–27 UMD Academic Catalog (Department of English).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/english-language-literature/
// professional-writing-minor/ (fetched 2026-09-28); https://english.umd.edu/ (fetched 2026-09-28; a
// homepage with no minor requirements); https://arhu.umd.edu/academics/undergraduate-studies/minors.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const pwrtMinor: Program = {
  id: "pwrt-minor",
  name: "Professional Writing Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Professional Writing Minor; https://english.umd.edu/ (homepage only, no requirements) (fetched 2026-09-28)",
  minGrade: "C-",
  verified: false,
  reviewNotes: [
    "Department page not checked: the fetched english.umd.edu page is just the department homepage with no minor requirements (the catalog points to english.umd.edu/minor-pw, not fetched). Encoded from the catalog alone.",
    "Open slot 'approved-courses' (openSlot requirement): 12 credits of approved courses (at least 9 credits at 3xx/4xx-level, at least 3 credits at 4xx-level); the approved-course list is a link (english.umd.edu/minor-pw) not in the source, and the catalog names no department, so the student confirms it with their advisor rather than the audit narrowing it.",
    "Not encoded (manual): electronic writing portfolio submitted in the final semester; 'ENGL281 or ENGL384, not both'; the PWP course used for the Gen Ed Professional Writing requirement can't count; up to 3 credits of the 9 upper-level credits may come from an approved writing-intensive internship; acceptance into the minor by the start of the semester before graduation; overall minor GPA of 2.0.",
    "Sharing: 'English majors may count two Professional Writing minor courses toward both the major and the minor' is a permission for English majors, not a cap on others; the catalog states no general cap, so no maxSharedWith is set.",
    "All courses must be passed with C- or better (minGrade).",
  ],
  requirements: [
    { kind: "course", id: "workplace-writing", name: "Research and Writing in the Workplace", options: ["ENGL297"] },
    {
      kind: "openSlot",
      id: "approved-courses",
      name: "Approved courses",
      credits: 12,
      note: "From the English department's approved list (english.umd.edu/minor-pw): at least 9 credits at the 300–400 level, at least 3 at the 400 level.",
    },
  ],
};

export const pwrtMinorMeta: ProgramMeta = {
  kind: "minor",
  college: "ARHU",
  short: "Professional Writing",
  sources: {
    catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/english-language-literature/professional-writing-minor/",
    department: "https://english.umd.edu/",
  },
};
