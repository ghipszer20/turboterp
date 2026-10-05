import { describe, expect, it } from "vitest";
import type { AcademicEvent } from "@turboterp/campus-data";
import { calendarTitle, dedupeEvents, formatKeyDates, groupByMonth, isHighlighted, isKeyEvent, isPast, nextEvent, termKeyDates } from "../calendar";

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

const other = (label: string, start: string, end?: string, term = "Fall 2026"): AcademicEvent => ({
  term,
  kind: "other",
  label,
  start,
  ...(end ? { end } : {}),
});

describe("isKeyEvent", () => {
  it.each(["Fall Break", "Thanksgiving Break", "Winter Break", "Spring Break", "Reading Day", "Labor Day", "Commencement"])(
    "treats %s as key",
    (label) => expect(isKeyEvent(other(label, "2026-10-01"))).toBe(true),
  );

  it.each([
    "Last day to drop a course with 80% refund",
    "Official transcripts available for fall",
    "Degree clearances due",
    "Instructors can begin submitting final grades",
    "Mandatory waitlist check-in period",
    "Graduate student registration deadlines",
    "Schedule of classes available",
    "Cancel registration deadline",
    "General registration begins",
  ])("treats %s as not key", (label) => expect(isKeyEvent(other(label, "2026-10-01"))).toBe(false));

  it("treats the useful kinds as key", () => {
    for (const k of ["first-day", "last-class", "finals", "priority-registration", "schedule-adjustment", "pass-fail", "drop-w", "apply-to-graduate"] as const) {
      expect(isKeyEvent(ev(k, "2027-02-01"))).toBe(true);
    }
  });
});

describe("isHighlighted", () => {
  it("highlights breaks, holidays and finals only", () => {
    expect(isHighlighted(other("Fall Break", "2026-10-15"))).toBe(true);
    expect(isHighlighted(other("Labor Day", "2026-09-07"))).toBe(true);
    expect(isHighlighted(ev("finals", "2027-05-13", "2027-05-20"))).toBe(true);
    expect(isHighlighted(other("Reading Day", "2026-12-10"))).toBe(false);
    expect(isHighlighted(ev("first-day", "2027-01-27"))).toBe(false);
  });
});

describe("dedupeEvents", () => {
  it("merges repeated events across terms, keeping the range", () => {
    const got = dedupeEvents([
      other("Commencement", "2027-05-20", undefined, "Spring 2027"),
      other("Commencement", "2027-05-20", "2027-05-21", "Spring 2027"),
      other("Commencement", "2027-05-20", "2027-05-21", "Fall 2026"),
      other("Fall Break", "2026-10-15"),
    ]);
    expect(got).toHaveLength(2);
    expect(got.find((e) => e.label === "Commencement")?.end).toBe("2027-05-21");
  });
});

describe("groupByMonth", () => {
  it("groups by start month in date order", () => {
    const g = groupByMonth([other("B", "2026-11-02"), other("A", "2026-10-30"), other("C", "2026-10-05")]);
    expect(g.map((m) => m.title)).toEqual(["October 2026", "November 2026"]);
    expect(g[0]!.events.map((e) => e.label)).toEqual(["C", "A"]);
  });
});

describe("nextEvent", () => {
  const list = [other("Fall Break", "2026-10-15", "2026-10-16"), other("Thanksgiving Break", "2026-11-25", "2026-11-29")];
  it("returns the soonest event not yet over, counting one in progress", () => {
    expect(nextEvent(list, "2026-10-04")?.label).toBe("Fall Break");
    expect(nextEvent(list, "2026-10-16")?.label).toBe("Fall Break");
    expect(nextEvent(list, "2026-10-17")?.label).toBe("Thanksgiving Break");
    expect(nextEvent(list, "2027-01-01")).toBeUndefined();
  });
});

describe("calendar tab, review fixes", () => {
  const labelled = (kind: AcademicEvent["kind"], label: string, start: string, end?: string, term = "Fall 2026"): AcademicEvent => ({
    term,
    kind,
    label,
    start,
    ...(end ? { end } : {}),
  });

  it("keeps priority registration as a key date although its label mentions graduate students", () => {
    const e = labelled("priority-registration", "Priority registration and graduate student registration begins", "2026-10-29");
    expect(isKeyEvent(e)).toBe(true);
  });

  it("names the later term when the same event is listed under two terms", () => {
    const merged = dedupeEvents([
      labelled("other", "Commencement", "2027-05-23", "2027-05-26", "Fall 2026"),
      labelled("other", "Commencement", "2027-05-24", undefined, "Fall 2026"),
      labelled("other", "Commencement", "2027-05-23", "2027-05-26", "Spring 2027"),
    ]);
    expect(merged).toEqual([labelled("other", "Commencement", "2027-05-23", "2027-05-26", "Spring 2027")]);
  });

  it("splits finished dates from the ones still ahead or under way", () => {
    const list = [
      labelled("first-day", "First day of classes", "2026-08-31"),
      labelled("other", "Fall Break", "2026-10-12", "2026-10-13"),
      labelled("finals", "Final exams", "2026-12-14", "2026-12-21"),
    ];
    expect(isPast(list[0]!, "2026-10-13")).toBe(true);
    expect(isPast(list[1]!, "2026-10-13")).toBe(false);
    expect(isPast(list[2]!, "2026-10-13")).toBe(false);
  });
});

describe("calendarTitle", () => {
  const t = (kind: AcademicEvent["kind"], label: string, term: string): AcademicEvent => ({ term, kind, label, start: "2026-10-09" });
  it.each([
    ["registration-appointments", "Registration appointment and blocks available", "Spring 2027", "Spring 2027 registration: your time slot is posted on Testudo"],
    ["priority-registration", "Priority registration and graduate student registration begins", "Spring 2027", "Spring 2027 priority registration begins"],
    ["early-registration", "Early registration", "Spring 2027", "Spring 2027 early registration"],
    ["other", "General registration", "Spring 2027", "Spring 2027 general registration"],
    ["first-day", "First day of classes", "Spring 2027", "First day of Spring 2027 classes"],
    ["last-class", "Last day of classes", "Fall 2026", "Last day of Fall 2026 classes"],
    ["finals", "Final exams", "Fall 2026", "Fall 2026 final exams"],
    ["drop-w", "Last day to drop a course with a W (undergraduate students only)", "Fall 2026", "Last day to drop a Fall 2026 course with a W (undergraduate students only)"],
    ["drop-w", "Last day to drop a course with a W", "Fall 2026", "Last day to drop a Fall 2026 course with a W"],
    ["apply-to-graduate", "Last day to apply for December 2026 graduation", "Fall 2026", "Last day to apply for December 2026 graduation"],
    ["schedule-adjustment", "Schedule adjustment period", "Fall 2026", "Fall 2026 schedule adjustment period"],
    ["pass-fail", "Pass/fail deadline", "Fall 2026", "Fall 2026 pass/fail deadline"],
    ["other", "Labor Day - University closed", "Fall 2026", "Labor Day - University closed"],
    ["other", "Schedule of Classes available", "Spring 2027", "Spring 2027 Schedule of Classes available"],
  ] as const)("%s: %s", (kind, label, term, want) => expect(calendarTitle(t(kind, label, term))).toBe(want));

  it("leaves the Advisor's short forms alone", () => {
    expect(formatKeyDates([t("drop-w", "Last day to drop a course with a W", "Fall 2026")])).toContain("Drop with W");
  });
});
