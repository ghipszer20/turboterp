import { describe, expect, it } from "vitest";
import type { Section } from "@turboterp/course-data/schedules";
import { dayWalks, formatWalk, walkNote } from "../walks";

const buildings = [
  { id: "078", name: "Reckord Armory", code: "ARM", lat: 38.9857, lon: -76.9384 },
  { id: "432", name: "Brendan Iribe Center", code: "", lat: 38.98916, lon: -76.93644 },
  { id: "035", name: "McKeldin Library", code: "MCK", lat: 38.98595, lon: -76.94505 },
];

const sec = (courseId: string, meetings: Section["meetings"]): Section => ({
  id: "0101",
  courseId,
  instructors: [],
  seats: { total: 30, open: 3, waitlist: 0, holdfile: 0 },
  delivery: "f2f",
  meetings,
});
const m = (days: Section["meetings"][number]["days"], start: number, end: number, building: string | null) => ({
  days,
  start,
  end,
  building,
  room: "1",
  type: "Lecture",
});

describe("dayWalks", () => {
  it("lists back-to-back classes in different known buildings", () => {
    const walks = dayWalks(
      [sec("CMSC351", [m(["M"], 600, 650, "ARM")]), sec("MATH240", [m(["M"], 660, 710, "IRB")])],
      buildings,
    );
    expect(walks).toHaveLength(1);
    expect(walks[0]).toMatchObject({ day: "M", from: "ARM", to: "IRB", gap: 10, fromCourse: "CMSC351", toCourse: "MATH240" });
    expect(walks[0]!.minutes).toBeGreaterThan(3);
    expect(walks[0]!.minutes).toBeLessThan(10);
    expect(walks[0]!.tight).toBe(false);
    expect(formatWalk(walks[0]!)).toMatch(/^Mon · ARM → IRB · ~\d+ min walk \(10 min between\)$/);
  });

  it("flags a walk longer than the gap", () => {
    const [w] = dayWalks(
      [sec("A", [m(["Tu"], 600, 650, "ARM")]), sec("B", [m(["Tu"], 655, 700, "MCK")])],
      buildings,
    );
    expect(w!.tight).toBe(true);
    expect(walkNote(w!)).toBe(`Tight: ~${w!.minutes} min walk, 5 min between`);
  });

  it("skips unknown buildings, TBA, same building, overlaps and long gaps", () => {
    const walks = dayWalks(
      [
        sec("A", [m(["W"], 600, 650, "ATL")]),
        sec("B", [m(["W"], 660, 700, "ARM")]),
        sec("C", [m(["W"], 705, 750, "ARM")]),
        sec("D", [m(["W"], 745, 800, "IRB")]),
        sec("E", [m(["W"], 1000, 1050, "MCK")]),
        sec("F", [m(["W"], 1060, 1100, "TBA")]),
      ],
      buildings,
    );
    expect(walks).toEqual([]);
  });

  it("orders by weekday, then time, and ignores untimed meetings", () => {
    const walks = dayWalks(
      [
        sec("A", [m(["Th"], 600, 650, "ARM"), m(["M"], 600, 650, "ARM"), m([], 0, 0, null)]),
        sec("B", [m(["Th"], 660, 700, "IRB"), m(["M"], 660, 700, "IRB")]),
      ],
      buildings,
    );
    expect(walks.map((w) => w.day)).toEqual(["M", "Th"]);
  });
});
