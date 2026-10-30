// Generating every conflict-free schedule from chosen courses' sections.
// Expected combinations are worked out by hand.

import { describe, expect, it } from "vitest";
import { generateLayouts, generateSchedules } from "../src/schedules.ts";
import type { Meeting, Section } from "../src/soc.ts";

const at = (days: string[], start: string, end: string): Meeting => {
  const mins = (t: string) => Number(t.split(":")[0]) * 60 + Number(t.split(":")[1]);
  return { days, start: mins(start), end: mins(end), building: "ESJ", room: "0202", type: "Lecture" };
};
const section = (courseId: string, id: string, ...meetings: Meeting[]): Section => ({
  id,
  courseId,
  instructors: [],
  seats: { total: 30, open: 10, waitlist: 0, holdfile: 0 },
  delivery: "f2f",
  meetings,
  notes: null,
});
const ids = (schedules: Section[][]) => schedules.map((s) => s.map((x) => `${x.courseId}-${x.id}`).join(" "));

describe("generateSchedules", () => {
  it("returns every combination when nothing conflicts", () => {
    const sections = [
      section("CMSC330", "0101", at(["M", "W"], "10:00", "10:50")),
      section("CMSC330", "0201", at(["M", "W"], "14:00", "14:50")),
      section("CMSC351", "0101", at(["Tu", "Th"], "10:00", "11:15")),
      section("CMSC351", "0201", at(["Tu", "Th"], "14:00", "15:15")),
    ];
    expect(ids([...generateSchedules(["CMSC330", "CMSC351"], sections)])).toEqual([
      "CMSC330-0101 CMSC351-0101",
      "CMSC330-0101 CMSC351-0201",
      "CMSC330-0201 CMSC351-0101",
      "CMSC330-0201 CMSC351-0201",
    ]);
  });

  it("leaves out combinations whose meetings overlap on a shared day", () => {
    const sections = [
      section("CMSC330", "0101", at(["M", "W"], "10:00", "10:50")),
      section("CMSC351", "0101", at(["W", "F"], "10:30", "11:45")), // overlaps Wednesday
      section("CMSC351", "0201", at(["Tu", "Th"], "10:30", "11:45")), // different days
    ];
    expect(ids([...generateSchedules(["CMSC330", "CMSC351"], sections)])).toEqual(["CMSC330-0101 CMSC351-0201"]);
  });

  it("allows back-to-back classes (one ends as the next starts)", () => {
    const sections = [
      section("CMSC330", "0101", at(["M", "W"], "10:00", "10:50")),
      section("CMSC351", "0101", at(["M", "W"], "10:50", "11:40")),
    ];
    expect(ids([...generateSchedules(["CMSC330", "CMSC351"], sections)])).toEqual(["CMSC330-0101 CMSC351-0101"]);
  });

  it("never treats an online section with no meeting time as a conflict", () => {
    const online: Meeting = { days: [], start: null, end: null, building: "ONLINE", room: null, type: "Lecture" };
    const sections = [section("CMSC330", "0101", at(["M", "W"], "10:00", "10:50")), section("ENGL101", "ESG1", online)];
    expect(ids([...generateSchedules(["CMSC330", "ENGL101"], sections)])).toEqual(["CMSC330-0101 ENGL101-ESG1"]);
  });
});

describe("generateLayouts", () => {
  it("groups sections that meet at identical times into one layout, listing the interchangeable sections", () => {
    const sections = [
      section("CMSC330", "0101", at(["M", "W"], "10:00", "10:50")),
      section("CMSC330", "0102", at(["M", "W"], "10:00", "10:50")), // same times as 0101
      section("CMSC330", "0201", at(["M", "W"], "14:00", "14:50")),
      section("CMSC351", "0101", at(["Tu", "Th"], "10:00", "11:15")),
    ];
    const layouts = [...generateLayouts(["CMSC330", "CMSC351"], sections)].map((layout) =>
      layout.map((choices) => choices.map((s) => `${s.courseId}-${s.id}`)),
    );
    expect(layouts).toEqual([
      [["CMSC330-0101", "CMSC330-0102"], ["CMSC351-0101"]],
      [["CMSC330-0201"], ["CMSC351-0101"]],
    ]);
  });
});
