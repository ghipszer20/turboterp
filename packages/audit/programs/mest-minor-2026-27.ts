// Middle Eastern Studies Minor, 2026–27 UMD Academic Catalog (Department of History).
// Sources: academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/history/middle-eastern-studies-minor/
// (fetched 2026-09-28); Department of History, https://history.umd.edu/ (fetched 2026-09-28; only
// a homepage, no requirements: department page not checked). No official published sample plan.
// Encoded by hand. UNVERIFIED until the owner signs off.

import type { Program, ProgramMeta } from "../src/audit.ts";

export const mestMinor: Program = {
  id: "mest-minor",
  name: "Middle Eastern Studies Minor",
  catalogYear: "2026-27",
  source:
    "UMD Academic Catalog 2026–27, Middle Eastern Studies Minor; Department of History, " +
    "https://history.umd.edu/ (fetched 2026-09-28; homepage only)",
  minGrade: "C-",
  minGpa: 2.0,
  verified: false,
  maxSharedWith: [{ courses: 2 }],
  reviewNotes: [
    "Department page not checked: history.umd.edu is only a homepage with no requirements, so this is encoded from the catalog alone.",
    "Open slot 'area-courses' (openSlot requirement): 6 credits from two of five area categories (Arab world; Iran and the Persian world; (Middle Eastern) Jewish and Israel; Turkish and Ottoman; Middle Eastern Diasporas and All Middle East); the course list is available from the minor's advisor and the MESM webpage, so the student confirms it with their advisor. The two-category rule is manual.",
    "Open slot 'pre-modern' (openSlot requirement): 6 credits of pre-modern (7th to 19th century) Middle East courses; no list published. May overlap the area or elective courses (HIST120 can serve both, counting credit once); the audit treats the slots as separate, so check the overlap manually.",
    "Open slot 'me-elective' (openSlot requirement): 3 credits of approved Middle East Studies elective (a language course of 3+ credits qualifies); no list published, so the student confirms it with their advisor.",
    "The catalog names no qualifying courses (only HIST120 as an example), so nothing but the C- minimum grade and the sharing cap is enforced; the 15-18 credit total (5 courses) is manual.",
    "'A maximum of two courses can count towards both the major and the minor' -> maxSharedWith: [{ courses: 2 }]. 'Courses cannot count towards multiple minors' is stricter for minors and is manual.",
    "Not encoded (manual): at least 3 courses (9 credits) at 3xx/4xx level (6 taken at UMD); no more than 6 credits from another institution; only one 1xx/2xx or grammar-based Arabic, Hebrew, Persian or Turkish course may count; no Pass/Fail; other areas of concentration with the director's approval.",
  ],
  requirements: [
    {
      kind: "openSlot",
      id: "area-courses",
      name: "Middle East area courses (two of five areas)",
      credits: 6,
      note: "From two of five area categories: Arab world; Iran and the Persian world; (Middle Eastern) Jewish and Israel; Turkish and Ottoman; Middle Eastern Diasporas and All Middle East. The list is available from the minor's advisor and the MESM webpage.",
    },
    {
      kind: "openSlot",
      id: "pre-modern",
      name: "Pre-modern Middle East course",
      credits: 6,
      note: "Pre-modern (7th to 19th century) Middle East courses; may overlap the area or elective courses.",
    },
    {
      kind: "openSlot",
      id: "me-elective",
      name: "Middle East Studies elective",
      credits: 3,
      note: "Approved Middle East Studies elective; a language course of 3+ credits qualifies.",
    },
  ],
};

export const mestMinorMeta: ProgramMeta = { kind: "minor", college: "ARHU", short: "Middle Eastern Studies", sources: { catalog: "https://academiccatalog.umd.edu/undergraduate/colleges-schools/arts-humanities/history/middle-eastern-studies-minor/", department: "https://history.umd.edu/" } };
