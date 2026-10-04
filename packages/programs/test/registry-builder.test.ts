// orderEntries (scripts/registry-builder.ts) decides the registry's listing order: majors, then
// minors, then certificates, then special programs; alphabetically by name within a kind, except
// that a major's tracks stay together with the ProgramMeta.defaultTrack one first. Tested here
// against synthetic entries, not the real registry, so a program batch never has to touch this file.
import { describe, expect, it } from "vitest";
import { orderEntries } from "../scripts/registry-builder.ts";

const entry = (over: Partial<Parameters<typeof orderEntries>[0][number]> & { id: string; name: string; kind: "major" | "minor" | "certificate" | "special" }) => ({
  short: undefined,
  college: "CMNS",
  catalogYear: "2026-27",
  verified: false,
  major: undefined,
  track: undefined,
  sources: {},
  importPath: `@turboterp/audit/programs/${over.id}.ts`,
  exportName: over.id,
  ...over,
});

describe("orderEntries", () => {
  it("lists majors, then minors, then certificates, then special programs", () => {
    const ordered = orderEntries([
      entry({ id: "s", name: "S", kind: "special" }),
      entry({ id: "c", name: "C", kind: "certificate" }),
      entry({ id: "n", name: "N", kind: "minor" }),
      entry({ id: "m", name: "M", kind: "major" }),
    ]);
    expect(ordered.map((e) => e.kind)).toEqual(["major", "minor", "certificate", "special"]);
  });

  it("sorts alphabetically by name within a kind", () => {
    const ordered = orderEntries([
      entry({ id: "z", name: "Zebra Minor", kind: "minor" }),
      entry({ id: "a", name: "Apple Minor", kind: "minor" }),
    ]);
    expect(ordered.map((e) => e.id)).toEqual(["a", "z"]);
  });

  it("keeps a major's tracks together, the defaultTrack one first", () => {
    const ordered = orderEntries([
      entry({ id: "cs-ml", name: "CS (Machine Learning)", kind: "major", major: "cs" }),
      entry({ id: "cs-general", name: "CS (General)", kind: "major", major: "cs", defaultTrack: true }),
      entry({ id: "cs-cyber", name: "CS (Cybersecurity)", kind: "major", major: "cs" }),
      entry({ id: "math", name: "Mathematics Major", kind: "major" }),
    ]);
    // "CS (General)" alphabetizes after "CS (Cybersecurity)", but it's the default track, so it
    // still leads its group; the other tracks fall back to alphabetical order.
    expect(ordered.map((e) => e.id)).toEqual(["cs-general", "cs-cyber", "cs-ml", "math"]);
  });

  it("throws when a major has more than one track but none is marked defaultTrack", () => {
    expect(() =>
      orderEntries([
        entry({ id: "cs-a", name: "CS A", kind: "major", major: "cs" }),
        entry({ id: "cs-b", name: "CS B", kind: "major", major: "cs" }),
      ]),
    ).toThrow(/defaultTrack/);
  });

  it("doesn't require defaultTrack for a single-track major", () => {
    expect(() => orderEntries([entry({ id: "solo", name: "Solo Major", kind: "major" })])).not.toThrow();
  });
});
