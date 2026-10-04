// FIRE: The First-Year Innovation & Research Experience (Office of Undergraduate Research).
// Source: https://www.fire.umd.edu/about (fetched 2026-09-25). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://www.fire.umd.edu/about";

export const fire: Program = {
  id: "special-fire",
  name: "FIRE: First-Year Innovation & Research Experience",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "The course for FIRE Semester 1 is FIRE120." (3 credits, "3 credits of General Education Scholarship in Practice"); "The course for FIRE Semester 2 is FIRE198." (2 credits); "The course for FIRE Semester 3 is FIRE298." (3 credits).`,
    `[check] Recognition: the Office of Undergraduate Studies says of "living-learning and other special programs such as FIRE" that "Students who successfully complete the program earn recognition of their work on their transcript" (ugst.umd.edu/llsop). The FIRE page's FAQ "If I start FIRE am I required to complete the three-course sequence?" has its answer in a collapsed panel that wasn't captured.`,
    `[manual] Each student works in one of FIRE's research streams; stream-specific expectations aren't published as course requirements.`,
  ],
  requirements: [
    { kind: "course", id: "fire120", name: "FIRE Semester 1", options: ["FIRE120"] },
    { kind: "course", id: "fire198", name: "FIRE Semester 2", options: ["FIRE198"] },
    { kind: "course", id: "fire298", name: "FIRE Semester 3", options: ["FIRE298"] },
  ],
};

export const fireMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://www.fire.umd.edu/about" } };
