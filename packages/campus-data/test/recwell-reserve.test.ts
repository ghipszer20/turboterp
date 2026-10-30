import { describe, expect, it } from "vitest";
import { RESERVE_AS_OF, RESERVE_CARDS } from "../src/recwell-reserve.ts";

describe("RecWell reserve cards", () => {
  it("has the six spec'd cards", () => {
    expect(RESERVE_CARDS.map((c) => c.id)).toEqual(["tennis", "courts", "bouldering", "pickleball", "climbing", "fields"]);
  });
  it("gives every card rules, an https source and an as-of date", () => {
    for (const c of RESERVE_CARDS) {
      expect(c.rules.length, c.id).toBeGreaterThan(10);
      expect(c.sourceUrl, c.id).toMatch(/^https:\/\//);
      expect(c.asOf, c.id).toBe(RESERVE_AS_OF);
      for (const l of c.links) expect(l.url, c.id).toMatch(/^https:\/\//);
    }
  });
  it("links every bookable thing, and nothing for pickleball", () => {
    const by = Object.fromEntries(RESERVE_CARDS.map((c) => [c.id, c]));
    expect(by.tennis!.links[0]!.url).toBe("https://www.planyo.com/booking.php?calendar=36698");
    expect(by.courts!.links[0]!.url).toBe("https://activeterp.umd.edu/booking");
    expect(by.bouldering!.links.length).toBeGreaterThan(0);
    expect(by.pickleball!.links).toEqual([]);
  });
});
