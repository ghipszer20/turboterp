import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseStampVenues } from "../src/stamp-dining.ts";
import { SourceError } from "../src/http.ts";

const feed = readFileSync(new URL("./fixtures/stamp-dining-gviz.txt", import.meta.url), "utf8");

describe("Stamp dining sheet", () => {
  const venues = parseStampVenues(feed);

  it("lists the seven Dining Services venues in the Stamp", () => {
    expect(venues.map((v) => v.name)).toEqual([
      "Chick-fil-A", "The Coffee Bar", "Maryland Dairy", "Panera Bread", "Subway", "Qdoba", "Union Pizza",
    ]);
    expect(venues[0]!.id).toBe("chick-fil-a");
    expect(venues[0]!.location).toBe("Stamp Food Court");
    expect(venues[1]!.location).toBe("Stamp Student Union, first floor");
    expect(venues[0]!.url).toBe("https://dining.umd.edu/hours-locations/dining-stamp");
  });

  it("keys hours by ISO date, parsed as day hours", () => {
    const cfa = venues[0]!;
    expect(cfa.days["2026-01-01"]).toEqual({ kind: "closed", label: "Closed" });
    expect(cfa.days["2026-01-05"]).toMatchObject({ kind: "ranges", ranges: [{ start: 510, end: 900 }] });
    expect(Object.keys(cfa.days).length).toBeGreaterThan(300);
  });

  it("keeps unannounced days as text", () => {
    expect(venues[0]!.days["2027-01-28"]).toEqual({ kind: "text", label: "TBD" });
  });

  it("fails loudly when the sheet format changes", () => {
    expect(() => parseStampVenues("<html>nope</html>")).toThrow(SourceError);
  });
});
