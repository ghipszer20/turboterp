import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseSections, scanSeats } from "../src/soc.ts";

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

describe("scanSeats", () => {
  for (const name of ["soc-seats-real.html", "soc-sections.html"]) {
    it(`matches parseSections' seat counts on ${name}`, () => {
      const html = fixture(name);
      const full = parseSections(html).map((s) => [s.courseId, s.id, s.seats.total, s.seats.open, s.seats.waitlist, s.seats.holdfile]);
      const scanned = scanSeats(html);
      expect(scanned.length).toBeGreaterThan(0);
      expect(scanned).toEqual(full);
    });
  }

  it("covers a section with a waitlist or holdfile in the real fixture", () => {
    const rows = scanSeats(fixture("soc-seats-real.html"));
    expect(rows.some(([, , , , w, h]) => w > 0 || h > 0)).toBe(true);
  });

  it("returns nothing for a page without sections", () => {
    expect(scanSeats("<html><body>none</body></html>")).toEqual([]);
  });
});
