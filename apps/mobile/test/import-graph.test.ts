// Spike case (d): nothing Node-only is reachable from the app or the engine bridge.
import { describe, expect, it } from "vitest";
// @ts-expect-error plain .mjs script
import { findViolations, isBanned } from "../scripts/check-import-graph.mjs";

describe("import graph", () => {
  it("flags Node-only specifiers", () => {
    for (const s of ["node:fs", "fs", "fs/promises", "path", "cheerio", "@napi-rs/canvas"]) expect(isBanned(s)).toBe(true);
    for (const s of ["react", "highs", "pdfjs-dist/legacy/build/pdf.mjs", "./audit.ts"]) expect(isBanned(s)).toBe(false);
  });

  it("reaches no Node-only module from the app or bridge entries", async () => {
    const { violations, files } = await findViolations();
    expect(files).toBeGreaterThan(5);
    expect(violations).toEqual([]);
  }, 60_000);
});
