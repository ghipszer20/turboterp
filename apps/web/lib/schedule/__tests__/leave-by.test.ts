import { describe, expect, it } from "vitest";
import type { Section } from "@turboterp/course-data/schedules";
import { emptySaved } from "../saved";
import { nextClassToday, pickedForToday, weekdayOf } from "../leave-by";

const sec = (courseId: string, days: Section["meetings"][number]["days"], start: number | null, end: number | null, building: string | null): Section => ({
  id: "0101",
  courseId,
  instructors: [],
  seats: { total: 30, open: 3, waitlist: 0, holdfile: 0 },
  delivery: "f2f",
  meetings: [{ days, start, end, building, room: "1", type: "Lecture" }],
});

describe("pickedForToday", () => {
  it("prefers Plan A, else Build my own", () => {
    const s = { ...emptySaved("202701"), own: { X: "1" } };
    expect(pickedForToday(s)).toEqual({ X: "1" });
    expect(pickedForToday({ ...s, plans: { A: { Y: "2" } } })).toEqual({ Y: "2" });
    expect(pickedForToday({ ...s, plans: { A: {} } })).toEqual({ X: "1" });
  });
});

describe("weekdayOf", () => {
  it("maps dates to schedule weekdays, null on weekends", () => {
    expect(weekdayOf("2026-09-28")).toBe("M");
    expect(weekdayOf("2026-10-01")).toBe("Th");
    expect(weekdayOf("2026-10-03")).toBeNull();
  });
});

describe("nextClassToday", () => {
  const sections = [
    sec("MATH140", ["M", "W"], 540, 590, "ARM"),
    sec("CMSC351", ["M", "W"], 600, 650, "IRB"),
    sec("ENGL101", ["Tu"], 600, 650, "TYD"),
  ];

  it("finds the next class after now and the class just before it", () => {
    const n = nextClassToday(sections, "M", 570);
    expect(n).toMatchObject({ courseId: "CMSC351", start: 600, building: "IRB", before: { building: "ARM", end: 590 } });
  });

  it("has no previous class for the first class of the day", () => {
    expect(nextClassToday(sections, "M", 400)).toMatchObject({ courseId: "MATH140", before: null });
  });

  it("is null when nothing is left today, or the building is TBA/unknown", () => {
    expect(nextClassToday(sections, "M", 640)).toBeNull();
    expect(nextClassToday(sections, "F", 0)).toBeNull();
    expect(nextClassToday([sec("A", ["M"], 600, 650, "TBA")], "M", 0)).toBeNull();
    expect(nextClassToday([sec("A", ["M"], 600, 650, null)], "M", 0)).toBeNull();
  });
});
