import { describe, expect, it } from "vitest";
import type { Section } from "@turboterp/course-data/schedules";
import { classEvents } from "@turboterp/app-core/schedule/ics";
import { ADD_TO_CALENDAR_NOTE, accessDecision, appleEvents } from "../src/schedule/calendarExport";

const sec = (meetings: Section["meetings"], over: Partial<Section> = {}): Section => ({
  id: "0101",
  notes: null,
  courseId: "CMSC351",
  instructors: ["Ada Lovelace"],
  seats: { total: 10, open: 1, waitlist: 0, holdfile: 0 },
  delivery: "f2f",
  meetings,
  ...over,
});
const mtg = (over = {}) => ({ days: ["Tu", "Th"], start: 9 * 60 + 30, end: 10 * 60 + 45, building: "IRB", room: "0324", type: "Lecture", ...over });

describe("appleEvents", () => {
  it("writes the class as a weekly series with title, room and Eastern times (Fall, daylight time)", () => {
    const [e] = appleEvents("202608", [sec([mtg()])]);
    expect(e.title).toBe("CMSC351 Lecture");
    expect(e.location).toBe("IRB 0324");
    expect(e.notes).toContain("Section 0101");
    expect(e.timeZone).toBe("America/New_York");
    expect(e.startDate.toISOString()).toBe("2026-09-01T13:30:00.000Z"); // Tue Sep 1 9:30 EDT
    expect(e.endDate.toISOString()).toBe("2026-09-01T14:45:00.000Z");
    expect(e.recurrenceRule.frequency).toBe("weekly");
    expect(e.recurrenceRule.daysOfTheWeek.map((d) => d.dayOfTheWeek)).toEqual([3, 5]); // Tue, Thu
  });

  it("uses standard time in Spring before the March change", () => {
    const [e] = appleEvents("202701", [sec([mtg({ days: ["M"] })])]);
    expect(e.startDate.toISOString()).toBe("2027-02-01T14:30:00.000Z"); // Mon Feb 1 9:30 EST
  });

  it("keeps holidays out by ending a series before a day off and restarting after it", () => {
    const events = appleEvents("202608", [sec([mtg({ days: ["M"] })])]);
    // Labor Day, Mon 2026-09-07, is a holiday: no series may include it.
    const covers = (day: string) =>
      events.some((e) => {
        const d = new Date(`${day}T20:00:00Z`);
        return e.startDate <= d && d <= (e.recurrenceRule.endDate as Date) && d.getUTCDay() === 1;
      });
    expect(covers("2026-08-31")).toBe(true);
    expect(covers("2026-09-07")).toBe(false);
    expect(covers("2026-09-14")).toBe(true);
    expect(covers("2026-10-12")).toBe(false); // Fall Break
    expect(covers("2026-12-07")).toBe(true);
    expect(events.every((e) => (e.recurrenceRule.endDate as Date) <= new Date("2026-12-12T05:00:00Z"))).toBe(true);
  });

  it("is built from the same events as the .ics and skips untimed or unknown-term meetings", () => {
    const s = sec([mtg(), mtg({ start: null })]);
    expect(classEvents("202608", [s])).toHaveLength(1);
    expect(appleEvents("202608", [s]).length).toBeGreaterThan(0);
    expect(appleEvents("209901", [s])).toEqual([]);
  });
});

describe("accessDecision", () => {
  it("proceeds when granted, asks again when only undetermined, sends to Settings when blocked", () => {
    expect(accessDecision({ granted: true, canAskAgain: true })).toBe("granted");
    expect(accessDecision({ granted: false, canAskAgain: true })).toBe("denied");
    expect(accessDecision({ granted: false, canAskAgain: false })).toBe("settings");
  });
});

describe("copy", () => {
  it("says plainly that the export is one-time", () => {
    expect(ADD_TO_CALENDAR_NOTE).toContain("If UMD changes a room or time, delete these events and add them again");
  });
});
