// Types for the program registry (src/registry.ts / src/registry.generated.ts). Split out so
// registry.generated.ts (which needs ProgramEntry) and registry.ts (which re-exports it) don't
// import each other's values, only this file's types.

import type { NotOpenTo, Program } from "@turboterp/audit";
import type { College } from "@turboterp/plan/credit-caps";

export type ProgramKind = "major" | "minor" | "certificate" | "special";

export type ProgramEntry = {
  /** The Program's own id. */
  id: string;
  /** The Program's own name (a test keeps the two in sync). */
  name: string;
  /** Short name for headers, e.g. "Math (Applied)". Defaults to `name`. */
  short?: string;
  kind: ProgramKind;
  /** The college that owns the program's catalog page (`colleges-schools/<slug>/` in its URL);
   * the Advisor's default for the credit-cap check. Special programs run by Undergraduate
   * Studies or the Honors College use UGST. */
  college: College;
  catalogYear: string;
  /** Mirrors Program.verified: only owner-verified programs lose the "Unverified" label. */
  verified: boolean;
  /** Tracks of one major share this key; a student has one track per major. Defaults to `id`. */
  major?: string;
  /** Name of the track within its major, if any. */
  track?: string;
  /** The catalog page and the department's own page (the department page wins where they differ). */
  sources: { catalog?: string; department?: string };
  /** Majors this program is closed to (ProgramMeta.notOpenTo); see src/eligibility.ts. */
  notOpenTo?: NotOpenTo;
  /** Majors this program is open only to (ProgramMeta.onlyOpenTo); see src/eligibility.ts. */
  onlyOpenTo?: NotOpenTo;
  load: () => Promise<Program>;
};
