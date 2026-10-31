import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseAcademicCalendar, type AcademicEvent } from "../src/calendar.ts";
import { newYorkInstant, seatHotWindows } from "../src/seat-windows.ts";

describe("newYorkInstant", () => {
  it("is UTC-4 in summer and UTC-5 in winter", () => {
    expect(newYorkInstant("2026-10-30").toISOString()).toBe("2026-10-30T04:00:00.000Z");
    expect(newYorkInstant("2027-01-27").toISOString()).toBe("2027-01-27T05:00:00.000Z");
  });
  it("handles the DST change days (2026-11-01 fall back, 2027-03-14 spring forward)", () => {
    expect(newYorkInstant("2026-11-01").toISOString()).toBe("2026-11-01T04:00:00.000Z"); // midnight is still EDT
    expect(newYorkInstant("2026-11-02").toISOString()).toBe("2026-11-02T05:00:00.000Z");
    expect(newYorkInstant("2027-03-14").toISOString()).toBe("2027-03-14T05:00:00.000Z"); // midnight is still EST
    expect(newYorkInstant("2027-03-15").toISOString()).toBe("2027-03-15T04:00:00.000Z");
  });
  it("end of day is the last second of that New York date", () => {
    expect(newYorkInstant("2026-10-30", true).toISOString()).toBe("2026-10-31T03:59:59.000Z");
    expect(newYorkInstant("2026-11-01", true).toISOString()).toBe("2026-11-02T04:59:59.000Z");
  });
});

const ev = (term: string, kind: AcademicEvent["kind"], start: string, end?: string): AcademicEvent => ({ term, kind, label: kind, start, ...(end ? { end } : {}) });

describe("seatHotWindows", () => {
  it("opens at the first priority/early registration day and stays open 14 days past the last one", () => {
    const w = seatHotWindows([ev("Spring 2027", "priority-registration", "2026-11-09", "2026-11-13"), ev("Spring 2027", "early-registration", "2026-11-16")]);
    expect(w).toEqual([{ startsAt: "2026-11-09T05:00:00.000Z", endsAt: "2026-12-01T04:59:59.000Z" }]);
  });
  it("adds the schedule-adjustment period, start through end of its last day", () => {
    const w = seatHotWindows([ev("Spring 2027", "schedule-adjustment", "2027-01-27", "2027-02-09")]);
    expect(w).toEqual([{ startsAt: "2027-01-27T05:00:00.000Z", endsAt: "2027-02-10T04:59:59.000Z" }]);
  });
  it("a one-day adjustment event ends on that day", () => {
    expect(seatHotWindows([ev("T", "schedule-adjustment", "2027-01-27")])).toEqual([{ startsAt: "2027-01-27T05:00:00.000Z", endsAt: "2027-01-28T04:59:59.000Z" }]);
  });
  it("one registration window per term, sorted, ignoring other kinds", () => {
    const w = seatHotWindows([
      ev("Fall 2026", "early-registration", "2026-04-13"),
      ev("Spring 2027", "priority-registration", "2026-11-09"),
      ev("Fall 2026", "finals", "2026-12-10", "2026-12-17"),
      ev("Fall 2026", "first-day", "2026-08-31"),
    ]);
    expect(w.map((x) => x.startsAt)).toEqual(["2026-04-13T04:00:00.000Z", "2026-11-09T05:00:00.000Z"]);
  });
  it("no events, no windows", () => {
    expect(seatHotWindows([])).toEqual([]);
  });
  it("works on the real registrar page fixture", () => {
    const events = parseAcademicCalendar(readFileSync(new URL("./fixtures/academic-calendar-447.html", import.meta.url), "utf8"), "Spring 2027");
    const w = seatHotWindows(events);
    expect(w.length).toBeGreaterThanOrEqual(1);
    for (const x of w) expect(Date.parse(x.endsAt)).toBeGreaterThan(Date.parse(x.startsAt));
  });
});
