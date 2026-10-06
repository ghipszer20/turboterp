import type { Section } from "@turboterp/course-data/schedules";
import { describe, expect, it } from "vitest";
import { nextClass } from "../next-class";

const sec = (courseId: string, start: number, end: number, building: string, room: string): Section =>
  ({ courseId, id: "0101", meetings: [{ days: ["M"], start, end, building, room, type: "Lecture" }] }) as unknown as Section;

// Monday 2026-10-05, Eastern time.
const at = (h: number) => new Date(`2026-10-05T${String(h).padStart(2, "0")}:00:00-04:00`);
const plan = [sec("ENGL101", 9 * 60, 9 * 60 + 50, "TWS", "1100"), sec("CMSC132", 14 * 60, 14 * 60 + 50, "IRB", "0324")];

describe("nextClass", () => {
  it("in the morning, the first class", () => {
    expect(nextClass(plan, at(8))).toEqual({ courseId: "ENGL101", start: "9:00 AM", room: "TWS 1100" });
  });
  it("adds leave-by when the previous class and a walk estimate are known", () => {
    const r = nextClass(plan, at(10), () => 12);
    expect(r?.courseId).toBe("CMSC132");
    expect(r?.start).toBe("2:00 PM");
    expect(r?.leaveBy).toBe("1:46 PM");
  });
  it("after the last class, null", () => {
    expect(nextClass(plan, at(15))).toBeNull();
  });
  it("no plan, null", () => {
    expect(nextClass(null, at(8))).toBeNull();
    expect(nextClass([], at(8))).toBeNull();
  });
});
