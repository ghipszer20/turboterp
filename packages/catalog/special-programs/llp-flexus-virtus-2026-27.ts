// Flexus (Women in Engineering) and Virtus (Men in Engineering) living-learning programs.
// Sources: https://eng.umd.edu/women/current-students/communities/flexus and …/virtus
// (fetched 2026-09-25). Both pages list the same four seminars. Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const FLEXUS_SOURCE = "https://eng.umd.edu/women/current-students/communities/flexus";
export const VIRTUS_SOURCE = "https://eng.umd.edu/women/current-students/communities/virtus";

function engineeringLlp(id: string, name: string, source: string, community: string): Program {
  return {
    id,
    name,
    catalogYear: CATALOG_YEAR,
    source,
    verified: false,
    reviewNotes: [
      `[check] "All Flexus and Virtus students are required to enroll in a 1-credit seminar course each semester for a total of four seminar courses during their first and second year. Completing all four seminars is a requirement to complete the Flexus & Virtus programs."`,
      `[check] Seminars: "Fall, First Year: Transitions & Engineering Identity Development ENED115; Spring, First Year: Engineering Professional & Career Development ENES114/ENES116; Fall, Second Year: Introduction to Engineering Culture & Leadership* ENED215; Spring, Second Year: Introduction to Engineering & Social Impact ENES214/ENES216". "ENES114/ENES116" and "ENES214/ENES216" are encoded as either id; the page doesn't say whether they are cross-listings or one per program.`,
      `[manual] Residence: "Living in Easton Hall with the ${community} community as a first-year student is a requirement for participation in the program" (waivers available), and "students are required to participate in Flexus and Virtus Welcome Week programming".`,
      `[manual] No transcript notation or citation is mentioned on the page; completion is the program's own record.`,
    ],
    requirements: [
      { kind: "course", id: "ened115", name: "Transitions & Engineering Identity Development", options: ["ENED115"] },
      { kind: "course", id: "enes114", name: "Engineering Professional & Career Development", options: ["ENES114", "ENES116"] },
      { kind: "course", id: "ened215", name: "Introduction to Engineering Culture & Leadership", options: ["ENED215"] },
      { kind: "course", id: "enes214", name: "Introduction to Engineering & Social Impact", options: ["ENES214", "ENES216"] },
    ],
  };
}

export const flexus = engineeringLlp("llp-flexus", "Flexus: Women in Engineering", FLEXUS_SOURCE, "Flexus");
export const virtus = engineeringLlp("llp-virtus", "Virtus: Men in Engineering", VIRTUS_SOURCE, "Virtus");

export const flexusMeta: ProgramMeta = { kind: "special", college: "ENGR", sources: { department: "https://eng.umd.edu/women/current-students/communities/flexus" } };

export const virtusMeta: ProgramMeta = { kind: "special", college: "ENGR", sources: { department: "https://eng.umd.edu/women/current-students/communities/virtus" } };
