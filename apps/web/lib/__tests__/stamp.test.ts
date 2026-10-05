import { describe, expect, it } from "vitest";
import type { StampVenue } from "@turboterp/campus-data";
import { parseHours } from "@turboterp/campus-data/hours";
import { stampSummary } from "../stamp";

const venue = (name: string, hours: string): StampVenue => ({
  id: name,
  name,
  location: "Stamp",
  url: "",
  days: { "2026-10-05": parseHours(hours) },
});

describe("stampSummary", () => {
  const venues = [venue("A", "8am-3pm"), venue("B", "11am-9pm"), venue("C", "Closed")];

  it("counts the places open right now", () => {
    expect(stampSummary(venues, "2026-10-05", 12 * 60)).toBe("2 of 3 places open now");
  });

  it("says when nothing is open", () => {
    expect(stampSummary(venues, "2026-10-05", 22 * 60)).toBe("Everything is closed right now");
  });

  it("uses the singular for one place", () => {
    expect(stampSummary([venues[0]!], "2026-10-05", 9 * 60)).toBe("1 of 1 place open now");
  });

  it("falls back when there are no hours for the day", () => {
    expect(stampSummary(venues, "2026-10-06", 12 * 60)).toBe("Hours unavailable");
  });
});
