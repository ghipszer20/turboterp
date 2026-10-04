import { describe, expect, it } from "vitest";
import type { AcademicEvent } from "@turboterp/campus-data";
import { formatKeyDates, termKeyDates, upcomingDates } from "../calendar";

const ev = (kind: AcademicEvent["kind"], start: string, end?: string, term = "Spring 2027"): AcademicEvent => ({
  term,
  kind,
  label: kind,
  start,
  ...(end ? { end } : {}),
});

const events = [
  ev("other", "2027-02-01"),
  ev("apply-to-graduate", "2027-02-09"),
  ev("pass-fail", "2027-02-09"),
  ev("drop-w", "2027-04-13"),
  ev("finals", "2027-05-13", "2027-05-20"),
  ev("first-day", "2027-01-27"),
  ev("drop-w", "2026-11-11", undefined, "Fall 2026"),
];

describe("upcomingDates", () => {
  it("keeps useful kinds within the window, soonest first, capped", () => {
    const got = upcomingDates(events, "2027-01-20", 45, 3);
    expect(got.map((e) => e.kind)).toEqual(["first-day", "apply-to-graduate", "pass-fail"]);
  });

  it("drops past dates, but keeps a range that has started and not ended", () => {
    expect(upcomingDates(events, "2027-05-15").map((e) => e.kind)).toEqual(["finals"]);
    expect(upcomingDates(events, "2027-05-21")).toEqual([]);
  });

  it("looks only `days` ahead", () => {
    expect(upcomingDates(events, "2027-02-10", 10)).toEqual([]);
  });
});

describe("termKeyDates", () => {
  it("returns drop, pass/fail and finals for the term", () => {
    expect(termKeyDates(events, "Spring 2027", false).map((e) => e.kind)).toEqual(["pass-fail", "drop-w", "finals"]);
  });

  it("adds apply-to-graduate only for the graduation term", () => {
    expect(termKeyDates(events, "Spring 2027", true).map((e) => e.kind)).toEqual([
      "apply-to-graduate",
      "pass-fail",
      "drop-w",
      "finals",
    ]);
  });

  it("is empty for a term with no data", () => {
    expect(termKeyDates(events, "Fall 2030", true)).toEqual([]);
  });
});

describe("formatKeyDates", () => {
  it("joins short labels with dates and date ranges", () => {
    const line = formatKeyDates(termKeyDates(events, "Spring 2027", false));
    expect(line).toBe("Pass/fail Feb 9 · Drop with W Apr 13 · Finals May 13–20");
  });
});
