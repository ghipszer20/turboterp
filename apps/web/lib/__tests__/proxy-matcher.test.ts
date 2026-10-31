import { describe, expect, it } from "vitest";
import { config } from "../../proxy";

// The proxy is a billed function call on every request it matches, so static files skip it.
// Next reads `matcher` as a path-to-regexp source; a plain anchored RegExp matches the same paths here.
const runs = (path: string) => config.matcher.some((source) => new RegExp(`^${source}$`).test(path));

describe("proxy matcher", () => {
  it("runs on pages and data the gate protects", () => {
    for (const p of ["/", "/advisor", "/campus/dining", "/coming-soon", "/api/access", "/api/schedule/202701/index.json", "/api/dining", "/data/advisor/index.json"]) {
      expect(runs(p), p).toBe(true);
    }
  });
  it("skips build assets, public files, icons and the scheduled jobs", () => {
    for (const p of ["/_next/static/chunks/a.js", "/_next/image", "/sw.js", "/vendor/pdf.worker.mjs", "/api/cron/fast", "/favicon.ico", "/icon.svg", "/apple-icon", "/manifest.webmanifest", "/robots.txt"]) {
      expect(runs(p), p).toBe(false);
    }
  });
  it("doesn't skip look-alike paths", () => {
    for (const p of ["/api/cronjob", "/vendorx", "/sw.json", "/icon.svgx"]) {
      expect(runs(p), p).toBe(true);
    }
  });
});
