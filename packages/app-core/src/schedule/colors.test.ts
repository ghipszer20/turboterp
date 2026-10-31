import { describe, expect, it } from "vitest";
import { COURSE_COLORS, courseColor } from "./colors";

describe("courseColor", () => {
  it("gives each course of the term its own color, in the order they were added", () => {
    const ids = ["CMSC351", "STAT400", "ENGL394"];
    expect(ids.map((c) => courseColor(ids, c))).toEqual([0, 1, 2]);
  });

  it("wraps around after the last color and falls back to the first for unknown courses", () => {
    const ids = Array.from({ length: COURSE_COLORS + 1 }, (_, i) => `TEST${100 + i}`);
    expect(courseColor(ids, ids.at(-1)!)).toBe(0);
    expect(courseColor(ids, "NOPE999")).toBe(0);
  });
});
