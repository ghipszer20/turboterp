import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { listCalendarTerms, parseAcademicCalendar } from "../src/calendar.ts";

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");
const spring = fixture("academic-calendar-447.html");
const fall = fixture("academic-calendar-435.html");

describe("listCalendarTerms", () => {
  it("reads the term picker", () => {
    const terms = listCalendarTerms(spring);
    expect(terms.slice(0, 3)).toEqual([
      { id: "447", name: "Spring 2027" },
      { id: "435", name: "Fall 2026" },
      { id: "424", name: "Spring 2026" },
    ]);
  });
});

describe("parseAcademicCalendar", () => {
  const find = (events: ReturnType<typeof parseAcademicCalendar>, kind: string) => events.find((e) => e.kind === kind);

  it("classifies Spring 2027", () => {
    const ev = parseAcademicCalendar(spring, "Spring 2027");
    expect(find(ev, "drop-w")).toMatchObject({ term: "Spring 2027", label: "Last day to drop a course with a W", start: "2027-04-13" });
    expect(find(ev, "finals")).toMatchObject({ start: "2027-05-13", end: "2027-05-20" });
    expect(find(ev, "apply-to-graduate")).toMatchObject({ start: "2027-02-09" });
    expect(find(ev, "pass-fail")).toMatchObject({ start: "2027-02-09", derived: true });
    expect(find(ev, "schedule-adjustment")).toMatchObject({ start: "2027-01-27", end: "2027-02-09" });
    expect(find(ev, "first-day")?.start).toBe("2027-01-27");
    expect(find(ev, "last-class")?.start).toBe("2027-05-11");
    expect(find(ev, "early-registration")).toMatchObject({ start: "2026-11-02", end: "2026-12-10" });
    expect(find(ev, "registration-appointments")?.start).toBe("2026-10-09");
    expect(find(ev, "priority-registration")?.start).toBe("2026-10-29");
    expect(ev.filter((e) => e.kind === "drop-w")).toHaveLength(1);
    expect(ev.find((e) => e.label === "Spring Break")).toMatchObject({ kind: "other" });
  });

  it("classifies Fall 2026", () => {
    const ev = parseAcademicCalendar(fall, "Fall 2026");
    expect(find(ev, "drop-w")?.start).toBe("2026-11-11");
    expect(find(ev, "finals")).toMatchObject({ start: "2026-12-14", end: "2026-12-21" });
    expect(find(ev, "apply-to-graduate")?.start).toBe("2026-09-14");
    expect(find(ev, "pass-fail")).toMatchObject({ start: "2026-09-14", derived: true });
  });
});
