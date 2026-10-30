import { describe, expect, it } from "vitest";
import type { Section } from "@turboterp/course-data/schedules";
import { decodeSeats, overlaySeats } from "../seats-overlay";

const section = (courseId: string, id: string, open: number): Section => ({
  id, courseId, instructors: [], seats: { total: 30, open, waitlist: 0, holdfile: 0 }, delivery: "f2f", meetings: [], notes: null,
});

describe("overlaySeats", () => {
  const overlay = decodeSeats({ v: 1, term: "202701", generatedAt: "2026-10-30T12:00:00Z", seats: { "CMSC131-0101": [2, 5, 1, 40] } })!;

  it("replaces the counts of sections the seats file has and keeps the rest", () => {
    const [a, b] = overlaySeats([section("CMSC131", "0101", 9), section("CMSC131", "0102", 9)], overlay);
    expect(a!.seats).toEqual({ total: 40, open: 2, waitlist: 5, holdfile: 1 });
    expect(b!.seats.open).toBe(9);
  });

  it("returns the sections unchanged without a seats file", () => {
    const sections = [section("CMSC131", "0101", 9)];
    expect(overlaySeats(sections, null)).toBe(sections);
  });

  it("rejects a file it does not understand", () => {
    expect(decodeSeats({ v: 2 })).toBeNull();
    expect(decodeSeats(null)).toBeNull();
  });
});
