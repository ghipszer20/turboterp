import { parseHours } from "@turboterp/campus-data/hours";
import { describe, expect, it } from "vitest";
import { hoursLabel, hoursStatus } from "../status";

const at = (h: number, m = 0) => h * 60 + m;

describe("hoursStatus: one day on its own", () => {
  it("says when an open place closes", () => {
    expect(hoursStatus(parseHours("8am - 10pm"), at(14))).toEqual({ status: "open", text: "Open until 10pm" });
  });
  it("counts down in the last hour", () => {
    expect(hoursStatus(parseHours("8am - 10pm"), at(21, 30))).toEqual({ status: "soon", text: "Closes in 30 min" });
  });
  it("says when a closed place opens", () => {
    expect(hoursStatus(parseHours("11am - 12am"), at(9))).toEqual({ status: "closed", text: "Opens at 11am" });
  });
});

// McKeldin on a Sunday: UMD Libraries lists "11am - 12am" for Sunday and "24 Hours" for Monday,
// and shows it as "11:00AM - 24 Hours": it opens at 11 and does not close at midnight.
describe("hoursStatus: open through midnight into the next day", () => {
  const sunday = parseHours("11am - 12am");

  it("doesn't say midnight when tomorrow is open 24 hours", () => {
    expect(hoursStatus(sunday, at(14), parseHours("24 Hours"))).toEqual({ status: "open", text: "Open 24 hours" });
  });
  it("doesn't count down to midnight either", () => {
    expect(hoursStatus(sunday, at(23, 30), parseHours("24 Hours"))).toEqual({ status: "open", text: "Open 24 hours" });
  });
  it("gives tomorrow's closing time when tomorrow starts at midnight", () => {
    expect(hoursStatus(sunday, at(14), parseHours("12am - 5pm"))).toEqual({ status: "open", text: "Open until 5pm tomorrow" });
  });
  it("still closes at midnight when tomorrow opens later", () => {
    expect(hoursStatus(sunday, at(14), parseHours("8am - 10pm"))).toEqual({ status: "open", text: "Open until midnight" });
    expect(hoursStatus(sunday, at(14), parseHours("Closed"))).toEqual({ status: "open", text: "Open until midnight" });
  });
  it("is unchanged before opening", () => {
    expect(hoursStatus(sunday, at(9), parseHours("24 Hours"))).toEqual({ status: "closed", text: "Opens at 11am" });
  });
});

describe("hoursLabel", () => {
  it("is the day's own label by default", () => {
    expect(hoursLabel(parseHours("8am - 10pm"), parseHours("8am - 10pm"))).toBe("8am - 10pm");
    expect(hoursLabel(parseHours("11am - 12am"), undefined)).toBe("11am - 12am");
  });
  it("matches UMD's wording when the day runs into a 24-hour day", () => {
    expect(hoursLabel(parseHours("11am - 12am"), parseHours("24 Hours"))).toBe("11am - 24 hours");
  });
  it("shows the real closing time when the day runs into tomorrow morning", () => {
    expect(hoursLabel(parseHours("11am - 12am"), parseHours("12am - 2am"))).toBe("11am - 2am");
  });
  it("is nothing for days without times", () => {
    expect(hoursLabel(parseHours("24 Hours"), undefined)).toBeUndefined();
    expect(hoursLabel(undefined, undefined)).toBeUndefined();
  });
});
