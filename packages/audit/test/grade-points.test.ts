import { describe, expect, it } from "vitest";
import { gradePoints } from "../src/audit.ts";

describe("gradePoints (UMD 4.0 scale)", () => {
  it("maps letter grades, A+ = 4.0", () => {
    expect(gradePoints("A+")).toBe(4);
    expect(gradePoints("a-")).toBe(3.7);
    expect(gradePoints(" B+ ")).toBe(3.3);
    expect(gradePoints("C-")).toBe(1.7);
    expect(gradePoints("D")).toBe(1);
    expect(gradePoints("F")).toBe(0);
  });
  it("has no points for non-letter grades", () => {
    expect(gradePoints("P")).toBeUndefined();
    expect(gradePoints("W")).toBeUndefined();
    expect(gradePoints(undefined)).toBeUndefined();
  });
});
