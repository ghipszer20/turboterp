// Carillon Communities (one-year first-year living-learning program).
// Sources: https://carillon.umd.edu/carillon-experience/year-carillon and …/carillon-studio,
// and the UMD Academic Catalog, Office of Undergraduate Studies (fetched 2026-09-25). Hand-transcribed. UNVERIFIED.

import type { Program, ProgramMeta } from "@turboterp/audit";
import { CATALOG_YEAR } from "./common.ts";

export const SOURCE = "https://carillon.umd.edu/carillon-experience/year-carillon";

export const carillon: Program = {
  id: "llp-carillon",
  name: "Carillon Communities",
  catalogYear: CATALOG_YEAR,
  source: SOURCE,
  verified: false,
  reviewNotes: [
    `[check] "Live with your Carillon peers and complete the two required program courses: Carillon Community Course: 3-credit course for each community; Carillon Studio Course: 1-credit course for all Carillon students". The Studio is "CRLN101" ("In the Carillon Studio (CRLN101)", carillon.umd.edu/carillon-experience/carillon-studio).`,
    `[manual] Community course: no course id is published for the 3-credit Community course of each community (2026-27: Constitutional Rights, Health Justice, iGive; the catalog lists "Constitutional Rights, Deliberative Democracy, iGive" for 2025-26). The student confirms it.`,
    `[manual] Residence: Carillon students live in Easton Hall; not a course requirement. No citation or notation is mentioned on the program pages.`,
  ],
  requirements: [{ kind: "course", id: "crln101", name: "Carillon Studio", options: ["CRLN101"] }],
};

export const carillonMeta: ProgramMeta = { kind: "special", college: "UGST", sources: { department: "https://carillon.umd.edu/carillon-experience/year-carillon" } };
