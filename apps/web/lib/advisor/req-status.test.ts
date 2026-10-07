import { describe, expect, it } from "vitest";
import type { RequirementResult, StudentCourse } from "@turboterp/audit";
import { REQ_STATUS_LABEL, displayStatus, metText } from "./req-status";

const result = (status: RequirementResult["status"], assigned: string[]): RequirementResult => ({ id: "r", name: "R", status, assigned }) as RequirementResult;
const course = (id: string, status: StudentCourse["status"]): StudentCourse => ({ id, credits: 3, status });

describe("displayStatus", () => {
  it("satisfied with every assigned course completed stays satisfied", () => {
    expect(displayStatus(result("satisfied", ["A", "B"]), [course("A", "completed"), course("B", "completed")])).toBe("satisfied");
  });
  it("satisfied with one assigned course planned is in progress", () => {
    expect(displayStatus(result("satisfied", ["A", "B"]), [course("A", "completed"), course("B", "planned")])).toBe("in-progress");
  });
  it("partial stays partial, even with planned courses", () => {
    expect(displayStatus(result("partial", ["A"]), [course("A", "planned")])).toBe("partial");
  });
  it("missing stays missing", () => {
    expect(displayStatus(result("missing", []), [])).toBe("missing");
  });
  it("a satisfied row with nothing assigned stays satisfied", () => {
    expect(displayStatus(result("satisfied", []), [course("A", "planned")])).toBe("satisfied");
  });
  it("overlay rows sharing assigned ids with other rows behave the same", () => {
    const courses = [course("A", "completed"), course("B", "planned")];
    expect(displayStatus(result("satisfied", ["A"]), courses)).toBe("satisfied");
    expect(displayStatus(result("satisfied", ["A", "B"]), courses)).toBe("in-progress");
  });
});

describe("labels and header text", () => {
  it("names the four statuses", () => {
    expect(REQ_STATUS_LABEL).toEqual({ satisfied: "Satisfied", "in-progress": "In progress", partial: "Partly met", missing: "Missing" });
  });
  it("counts only fully satisfied rows as met and adds the in-progress count", () => {
    expect(metText(5, 8, 2)).toBe("5 of 8 requirements met · 2 in progress");
    expect(metText(5, 8, 0)).toBe("5 of 8 requirements met");
  });
});
