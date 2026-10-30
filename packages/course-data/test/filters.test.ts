// Filtering layouts by workday windows, days off and open seats, applied during generation.
// Expected results are worked out by hand.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { generateLayouts, generateSchedules, sameHoursEveryDay, type ScheduleFilters } from "../src/schedules.ts";
import type { Meeting, Section } from "../src/soc.ts";

const mins = (t: string) => Number(t.split(":")[0]) * 60 + Number(t.split(":")[1]);
const at = (days: string[], start: string, end: string): Meeting => ({
  days,
  start: mins(start),
  end: mins(end),
  building: "ESJ",
  room: "0202",
  type: "Lecture",
});
const section = (courseId: string, id: string, open: number, ...meetings: Meeting[]): Section => ({
  id,
  courseId,
  instructors: [],
  seats: { total: 30, open, waitlist: 0, holdfile: 0 },
  delivery: "f2f",
  meetings,
  notes: null,
});
const layoutIds = (courseIds: string[], sections: Section[], filters?: ScheduleFilters) =>
  [...generateLayouts(courseIds, sections, filters)].map((layout) =>
    layout.map((choices) => choices.map((s) => `${s.courseId}-${s.id}`)),
  );

describe("generateLayouts with filters", () => {
  const sections = [
    section("CMSC330", "0101", 5, at(["M", "W", "F"], "09:00", "09:50")),
    section("CMSC330", "0201", 5, at(["Tu", "Th"], "12:30", "13:45")),
    section("CMSC351", "0101", 5, at(["M", "W"], "11:00", "12:15")),
  ];

  it("leaves out layouts with any meeting on a day off", () => {
    expect(layoutIds(["CMSC330", "CMSC351"], sections, { days: { F: "off" } })).toEqual([
      [["CMSC330-0201"], ["CMSC351-0101"]],
    ]);
  });

  it("keeps a meeting only if it lies inside that day's window, ends inclusive", () => {
    // Tu 12:30-13:45 is outside a Tu 8:00-13:00 window; M/W/F 9:00 fits.
    expect(layoutIds(["CMSC330"], sections, { days: { Tu: { from: mins("08:00"), to: mins("13:00") } } })).toEqual([
      [["CMSC330-0101"]],
    ]);
    // A class 12:00-13:00 fits an 8:00-13:00 window exactly.
    const exact = [section("MATH140", "0101", 5, at(["M"], "12:00", "13:00"))];
    expect(layoutIds(["MATH140"], exact, { days: { M: { from: mins("08:00"), to: mins("13:00") } } })).toHaveLength(1);
    expect(layoutIds(["MATH140"], exact, { days: { M: { from: mins("08:00"), to: mins("12:59") } } })).toHaveLength(0);
    expect(layoutIds(["MATH140"], exact, { days: { M: { from: mins("12:01"), to: mins("13:00") } } })).toHaveLength(0);
  });

  it("applies the same window to every weekday with sameHoursEveryDay", () => {
    // No 8ams and nothing after 1pm: only CMSC330-0101 (9:00) fits; CMSC351 ends 12:15 so fits too.
    const filters = { days: sameHoursEveryDay(mins("09:00"), mins("13:00")) };
    expect(Object.keys(filters.days)).toEqual(["M", "Tu", "W", "Th", "F"]);
    expect(layoutIds(["CMSC330", "CMSC351"], sections, filters)).toEqual([[["CMSC330-0101"], ["CMSC351-0101"]]]);
  });

  it("fails a meeting with no set time that is listed on a day off, but lets it pass a window", () => {
    const tba: Meeting = { days: ["F"], start: null, end: null, building: null, room: null, type: "Lecture" };
    const s = [section("MATH140", "0101", 5, tba)];
    expect(layoutIds(["MATH140"], s, { days: { F: "off" } })).toEqual([]);
    expect(layoutIds(["MATH140"], s, { days: { F: { from: mins("10:00"), to: mins("11:00") } } })).toHaveLength(1);
  });

  it("never restricts weekend meetings or asynchronous sections with no days", () => {
    const online: Meeting = { days: [], start: null, end: null, building: "ONLINE", room: null, type: "Lecture" };
    const s = [
      section("ENGL101", "ESG1", 5, online),
      section("MATH140", "0101", 5, at(["Sa"], "07:00", "08:00")),
    ];
    const everyDayOff: ScheduleFilters = { days: { M: "off", Tu: "off", W: "off", Th: "off", F: "off" } };
    expect(layoutIds(["ENGL101", "MATH140"], s, everyDayOff)).toEqual([[["ENGL101-ESG1"], ["MATH140-0101"]]]);
  });

  describe("full sections", () => {
    const s = [
      section("CMSC330", "0101", 0, at(["M", "W"], "10:00", "10:50")),
      section("CMSC330", "0102", 3, at(["M", "W"], "10:00", "10:50")), // same times, open
      section("CMSC330", "0201", 0, at(["M", "W"], "14:00", "14:50")), // only section at 14:00, full
    ];

    it("are never generated: a time group lists only its open sections, and a group with none is dropped", () => {
      expect(layoutIds(["CMSC330"], s)).toEqual([[["CMSC330-0102"]]]);
      expect(layoutIds(["CMSC330"], s, {})).toEqual([[["CMSC330-0102"]]]);
    });

    it("leave no layout when every section of a course is full", () => {
      const full = [section("CMSC330", "0101", 0, at(["M"], "10:00", "10:50"))];
      expect(layoutIds(["CMSC330"], full)).toEqual([]);
      expect([...generateSchedules(["CMSC330"], full)]).toEqual([]);
    });

    it("can be included with the includeFull opt-out", () => {
      expect(layoutIds(["CMSC330"], s, { includeFull: true })).toEqual([
        [["CMSC330-0101", "CMSC330-0102"]],
        [["CMSC330-0201"]],
      ]);
    });
  });

  it("also filters individual schedules", () => {
    const schedules = [...generateSchedules(["CMSC330", "CMSC351"], sections, { days: { F: "off" } })];
    expect(schedules.map((s) => s.map((x) => `${x.courseId}-${x.id}`).join(" "))).toEqual([
      "CMSC330-0201 CMSC351-0101",
    ]);
  });
});

describe("filters on real Spring 2027 data", () => {
  const sample = JSON.parse(readFileSync(new URL("./fixtures/soc-202701-sample.json", import.meta.url), "utf8")) as {
    sections: Section[];
  };
  const count = (ids: string[], filters?: ScheduleFilters) => {
    let n = 0;
    for (const _ of generateLayouts(ids, sample.sections, filters)) n++;
    return n;
  };

  it("gives the same layouts with an empty filter as with none", () => {
    expect(count(["CMSC351", "STAT400", "ENGL394"])).toBe(494);
    expect(count(["CMSC351", "STAT400", "ENGL394"], {})).toBe(494);
  });

  it("finds no CMSC351 + STAT400 + ENGL394 layout with Fridays off", () => {
    expect(count(["CMSC351", "STAT400", "ENGL394"], { days: { F: "off" } })).toBe(0);
  });
});
