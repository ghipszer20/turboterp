import { describe, expect, it } from "vitest";
import type { Section } from "@turboterp/course-data/schedules";
import { overlapNote, saveBlockedBy, tightWalkLine } from "../conflicts";

const sec = (courseId: string, days: string[], start: number, end: number, building = "ARM"): Section => ({
  id: "0101",
  courseId,
  instructors: [],
  seats: { total: 30, open: 3, waitlist: 0, holdfile: 0 },
  delivery: "f2f",
  meetings: [{ days, start, end, building, room: "1", type: "Lecture" }],
});
const buildings = [
  { id: "1", name: "Armory", code: "ARM", lat: 38.9857, lon: -76.9384 },
  { id: "2", name: "McKeldin", code: "MCK", lat: 38.98595, lon: -76.94505 },
];

describe("saveBlockedBy", () => {
  it("is empty when nothing overlaps", () => {
    expect(saveBlockedBy([sec("A100", ["M"], 600, 650), sec("B100", ["M"], 700, 750)])).toEqual([]);
  });
  it("names each overlapping pair", () => {
    expect(saveBlockedBy([sec("A100", ["M"], 600, 650), sec("B100", ["M"], 630, 700)])).toEqual([["A100", "B100"]]);
  });
});

describe("overlapNote", () => {
  it("says saving is blocked until fixed", () => {
    expect(overlapNote([["A100", "B100"]])).toBe("A100 and B100 overlap. Saving as a Plan is blocked until the overlap is fixed.");
  });
});

describe("tightWalkLine", () => {
  it("is null with no tight walk", () => {
    expect(tightWalkLine([sec("A100", ["M"], 600, 650), sec("B100", ["M"], 700, 750, "MCK")], buildings)).toBeNull();
  });
  it("names the first tight walk, day first so a narrow card cuts off the least", () => {
    const line = tightWalkLine([sec("A100", ["M"], 600, 650), sec("B100", ["M"], 655, 700, "MCK")], buildings);
    expect(line).toMatch(/^Tight walk Mon: ~\d+ min, A100 → B100$/);
  });
});
