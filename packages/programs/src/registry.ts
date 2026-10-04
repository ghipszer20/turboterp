// Every encoded UMD program the Advisor offers, its picker metadata and a lazy loader for the
// Program itself, so a page that lists ~270 programs never bundles their requirements (each
// `import()` becomes its own chunk). The list itself (PROGRAMS) is generated from each program
// file's own metadata (registry.generated.ts, scripts/build-registry.ts); this file keeps the
// types and the lookups built on top. Adding a program = one program file (packages/audit/programs
// or packages/catalog/special-programs) with a ProgramMeta next to its Program, then
// `npm run build:registry -w @turboterp/programs`; see docs/project/program-batches.md.
//
// Lives in its own package because it sits above both @turboterp/audit (the majors) and
// @turboterp/catalog (the special programs), which depends on audit.

import type { Program } from "@turboterp/audit";

export type { ProgramEntry, ProgramKind } from "./registry-types.ts";
import type { ProgramEntry } from "./registry-types.ts";

export { PROGRAMS } from "./registry.generated.ts";
export { blockedReason } from "./eligibility.ts";
import { PROGRAMS } from "./registry.generated.ts";

const byId = new Map(PROGRAMS.map((p) => [p.id, p]));

export const findProgram = (id: string): ProgramEntry | undefined => byId.get(id);

/** The major key tracks of one major share. */
export const majorKey = (entry: ProgramEntry): string => entry.major ?? entry.id;

export async function loadProgram(id: string): Promise<Program | undefined> {
  return findProgram(id)?.load();
}

/** Loads several programs in the order given, skipping unknown ids. */
export async function loadPrograms(ids: string[]): Promise<Program[]> {
  const programs = await Promise.all(ids.map(loadProgram));
  return programs.filter((p): p is Program => p !== undefined);
}
