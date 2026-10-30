import { describe, expect, it } from "vitest";
import type { DepartmentSections } from "@turboterp/course-data/schedule-files";
import type { Section } from "@turboterp/course-data/schedules";
import { feedResponse } from "../feed-response";

const section = (courseId: string, id: string): Section => ({
  id,
  notes: null,
  courseId,
  instructors: [],
  seats: { total: 10, open: 1, waitlist: 0, holdfile: 0 },
  delivery: "f2f",
  meetings: [{ type: "Lecture", days: ["M", "W"], start: 600, end: 650, building: "IRB", room: "0324" }],
} as Section);

const cmsc: DepartmentSections = {
  term: "202608",
  dept: "CMSC",
  generatedAt: "2026-10-01T00:00:00Z",
  courses: [],
  sections: [section("CMSC131", "0202"), section("CMSC132", "0101")],
  ratings: {},
  reviews: [],
};
const load = async (_term: string, dept: string) => (dept === "CMSC" ? cmsc : null);

describe("feedResponse", () => {
  it("returns a calendar for the chosen sections only", async () => {
    const res = await feedResponse("202608", "CMSC131-0202", load);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/calendar");
    expect(res.headers.get("Cache-Control")).toContain("s-maxage");
    const body = await res.text();
    expect(body).toContain("BEGIN:VCALENDAR");
    expect(body).toContain("CMSC131-0202-0@turboterp");
    expect(body).not.toContain("CMSC132");
  });
  it("is 400 for bad input", async () => {
    expect((await feedResponse("202608", "nope", load)).status).toBe(400);
    expect((await feedResponse(null, "CMSC131-0202", load)).status).toBe(400);
  });
  it("is 404 when a section isn't in the snapshot", async () => {
    expect((await feedResponse("202608", "CMSC131-9999", load)).status).toBe(404);
    expect((await feedResponse("202608", "MATH141-0121", load)).status).toBe(404);
  });
});
