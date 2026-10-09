import { describe, expect, it } from "vitest";
import type { FitnessClass } from "@turboterp/campus-data";
import { clockLabel, filterClasses, signupNote, weekdayOf, WEEKDAYS } from "../fitness-classes";

const c = (over: Partial<FitnessClass>): FitnessClass => ({
  day: "Monday",
  name: "Pilates",
  location: "ERC Fitness Studio",
  instructor: "A. B.",
  start: 9 * 60,
  end: 10 * 60,
  signupUrl: "https://activeterp.umd.edu/Program/GetProgramDetails?courseId=x",
  ...over,
});

describe("weekdayOf", () => {
  it("names the weekday of an ISO date", () => {
    expect(weekdayOf("2026-10-09")).toBe("Friday");
    expect(WEEKDAYS).toHaveLength(7);
  });
});

describe("clockLabel", () => {
  it("formats minutes after midnight", () => {
    expect(clockLabel(450)).toBe("7:30 AM");
    expect(clockLabel(12 * 60)).toBe("12:00 PM");
    expect(clockLabel(17 * 60 + 15)).toBe("5:15 PM");
    expect(clockLabel(0)).toBe("12:00 AM");
  });
});

describe("filterClasses", () => {
  const all = [
    c({}),
    c({ name: "Rhythm Ride 45", location: "Regents Cycle Studio", start: 8 * 60 }),
    c({ name: "Yoga Flow", location: "Ritchie MPR", start: 7 * 60 }),
    c({ day: "Tuesday", name: "Zumba" }),
  ];

  it("keeps one day, sorted by start time", () => {
    expect(filterClasses(all, { day: "Monday" }).map((x) => x.name)).toEqual(["Yoga Flow", "Rhythm Ride 45", "Pilates"]);
  });
  it("filters by kind", () => {
    expect(filterClasses(all, { day: "Monday", kind: "Cycling" }).map((x) => x.name)).toEqual(["Rhythm Ride 45"]);
    expect(filterClasses(all, { day: "Monday", kind: "Mind-body" })).toHaveLength(2);
  });
  it("filters by place", () => {
    expect(filterClasses(all, { day: "Monday", place: "Ritchie" }).map((x) => x.name)).toEqual(["Yoga Flow"]);
  });
});

describe("signupNote", () => {
  // Friday 2026-10-09, 10:00.
  const today = "2026-10-09";
  const now = 10 * 60;

  it("is empty inside the 24 hour window", () => {
    expect(signupNote(c({ day: "Friday", start: 18 * 60 }), today, now)).toBeNull();
    expect(signupNote(c({ day: "Saturday", start: 9 * 60 }), today, now)).toBeNull();
  });
  it("is empty for a class earlier today", () => {
    expect(signupNote(c({ day: "Friday", start: 8 * 60 }), today, now)).toBeNull();
  });
  it("says when sign-ups open for a later class", () => {
    expect(signupNote(c({ day: "Saturday", start: 18 * 60 }), today, now)).toBe("Sign-ups open Friday 6:00 PM");
    expect(signupNote(c({ day: "Monday", start: 7 * 60 + 30 }), today, now)).toBe("Sign-ups open Sunday 7:30 AM");
  });
  it("treats an earlier weekday as next week", () => {
    expect(signupNote(c({ day: "Thursday", start: 9 * 60 }), today, now)).toBe("Sign-ups open Wednesday 9:00 AM");
  });
});
