// Core logic behind build-registry.ts (writes src/registry.generated.ts) and
// test/registry-generated.test.ts (fails if that file is stale): scans every program file in
// packages/audit/programs and packages/catalog/special-programs for `<name>Meta: ProgramMeta`
// exports (packages/audit/src/audit.ts), pairs each with its `<name>` Program export in the same
// module, and orders the result. See docs/project/program-batches.md.
import { readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

export type BuiltEntry = {
  id: string;
  name: string;
  short?: string;
  kind: "major" | "minor" | "certificate" | "special";
  college: string;
  catalogYear: string;
  verified: boolean;
  major?: string;
  track?: string;
  sources: { catalog?: string; department?: string };
  notOpenTo?: { programs?: string[]; colleges?: string[]; reason: string };
  onlyOpenTo?: { programs?: string[]; colleges?: string[]; reason: string };
  /** The literal specifier the generated file's `import()` must use, so the bundler can still
   * split this program into its own chunk -- e.g. "@turboterp/audit/programs/foo-2026-27.ts". */
  importPath: string;
  /** The Program's export name in that module, e.g. "fooMajor". */
  exportName: string;
};

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

const SOURCES = [
  { dir: repoRoot + "packages/audit/programs", importPrefix: "@turboterp/audit/programs/" },
  { dir: repoRoot + "packages/catalog/special-programs", importPrefix: "@turboterp/catalog/special-programs/" },
];

const KIND_RANK: Record<BuiltEntry["kind"], number> = { major: 0, minor: 1, certificate: 2, special: 3 };

/** Scans every program file for `<name>Meta` / `<name>` export pairs, in no particular order. */
async function collectEntries(): Promise<BuiltEntry[]> {
  const entries: BuiltEntry[] = [];
  for (const { dir, importPrefix } of SOURCES) {
    const files = readdirSync(dir).filter((f) => f.endsWith(".ts")).sort();
    for (const file of files) {
      const mod: Record<string, unknown> = await import(pathToFileURL(`${dir}/${file}`).href);
      for (const key of Object.keys(mod)) {
        if (!key.endsWith("Meta") || key === "Meta") continue;
        const programKey = key.slice(0, -"Meta".length);
        const meta = mod[key] as Record<string, unknown>;
        const program = mod[programKey] as Record<string, unknown> | undefined;
        if (!program || typeof program !== "object" || !Array.isArray(program.requirements)) {
          throw new Error(`${importPrefix}${file}: "${key}" has no matching Program export "${programKey}"`);
        }
        if (typeof program.id !== "string" || typeof program.name !== "string" || typeof program.catalogYear !== "string") {
          throw new Error(`${importPrefix}${file}: Program "${programKey}" is missing id/name/catalogYear`);
        }
        entries.push({
          id: program.id,
          name: program.name,
          short: meta.short as string | undefined,
          kind: meta.kind as BuiltEntry["kind"],
          college: meta.college as string,
          catalogYear: program.catalogYear,
          verified: program.verified === true,
          major: meta.major as string | undefined,
          track: meta.track as string | undefined,
          sources: meta.sources as { catalog?: string; department?: string },
          ...(meta.notOpenTo !== undefined ? { notOpenTo: meta.notOpenTo as BuiltEntry["notOpenTo"] } : {}),
          ...(meta.onlyOpenTo !== undefined ? { onlyOpenTo: meta.onlyOpenTo as BuiltEntry["onlyOpenTo"] } : {}),
          importPath: `${importPrefix}${file}`,
          exportName: programKey,
        });
        if (meta.defaultTrack === true) (entries[entries.length - 1] as BuiltEntry & { defaultTrack?: true }).defaultTrack = true;
      }
    }
  }
  return entries;
}

/**
 * Majors, then minors, then certificates, then special programs; within each kind, alphabetically
 * by name, except that a major's tracks are kept together right after each other, the track marked
 * `defaultTrack` (ProgramMeta) first -- the Advisor's default track for that major.
 */
export function orderEntries(raw: (BuiltEntry & { defaultTrack?: true })[]): BuiltEntry[] {
  const groupKey = (e: BuiltEntry) => `${e.kind}::${e.kind === "major" ? (e.major ?? e.id) : e.id}`;
  const groups = new Map<string, (BuiltEntry & { defaultTrack?: true })[]>();
  for (const e of raw) {
    const gk = groupKey(e);
    const list = groups.get(gk);
    if (list) list.push(e);
    else groups.set(gk, [e]);
  }
  for (const [gk, list] of groups) {
    if (list.length > 1 && !list.some((e) => e.defaultTrack)) {
      throw new Error(`${gk}: ${list.length} tracks share this major key but none has \`defaultTrack: true\` in its ProgramMeta`);
    }
    list.sort((a, b) => {
      const ad = a.defaultTrack ? 0 : 1;
      const bd = b.defaultTrack ? 0 : 1;
      return ad !== bd ? ad - bd : a.name.localeCompare(b.name);
    });
  }
  const orderedGroups = [...groups.values()].sort((a, b) => a[0]!.name.localeCompare(b[0]!.name));
  const byName = orderedGroups.flat();
  return byName
    .map(({ defaultTrack: _defaultTrack, ...rest }) => rest)
    .sort((a, b) => KIND_RANK[a.kind] - KIND_RANK[b.kind]);
}

export async function buildProgramEntries(): Promise<BuiltEntry[]> {
  return orderEntries(await collectEntries());
}
