// Program-wide minimum GPA: one synthetic "program-gpa" result per program that sets minGpa.

import { describe, expect, it } from "vitest";
import { auditProgram, type Program, type StudentCourse } from "../src/audit.ts";

const c = (id: string, grade?: string, status: "completed" | "planned" = "completed"): StudentCourse => ({ id, credits: 3, status, ...(grade ? { grade } : {}) });

const program = (minGpa: number, extra: Program["requirements"] = []): Program => ({
  id: "p",
  name: "Test",
  minGpa,
  requirements: [
    { kind: "course", id: "a", name: "A", options: ["AAAA100"] },
    { kind: "course", id: "b", name: "B", options: ["BBBB100"] },
    ...extra,
  ],
});

const gpaResult = async (p: Program, courses: StudentCourse[]) => {
  const result = await auditProgram(p, courses);
  const last = result.requirements[result.requirements.length - 1]!;
  expect(last.id).toBe("program-gpa");
  return last;
};

describe("program minGpa", () => {
  it("adds no result when the program sets no minGpa", async () => {
    const { minGpa: _m, ...rest } = program(2);
    const result = await auditProgram(rest, [c("AAAA100", "A")]);
    expect(result.requirements.map((r) => r.id)).toEqual(["a", "b"]);
  });

  it("is satisfied with no gpa when no graded course is used", async () => {
    const r = await gpaResult(program(2), [c("AAAA100"), c("BBBB100", undefined, "planned")]);
    expect(r).toEqual({ id: "program-gpa", name: "Program GPA (at least 2.0)", status: "satisfied", assigned: [] });
  });

  it("is satisfied when the credit-weighted GPA meets the minimum", async () => {
    const r = await gpaResult(program(2.0), [c("AAAA100", "A"), c("BBBB100", "C")]);
    expect(r.name).toBe("Program GPA (at least 2.0)");
    expect(r.status).toBe("satisfied");
    expect([...r.assigned].sort()).toEqual(["AAAA100", "BBBB100"]);
    expect(r.gpa).toEqual({ value: 3, min: 2 });
  });

  it("stays satisfied but at risk below the minimum while courses are planned", async () => {
    const r = await gpaResult(program(2.0), [c("AAAA100", "D"), c("BBBB100", undefined, "planned")]);
    expect(r.status).toBe("satisfied");
    expect(r.gpa).toEqual({ value: 1, min: 2, atRisk: true });
  });

  it("is missing below the minimum with nothing planned", async () => {
    const r = await gpaResult(program(2.0), [c("AAAA100", "D"), c("BBBB100", "D")]);
    expect(r.status).toBe("missing");
    expect(r.gpa).toEqual({ value: 1, min: 2 });
  });

  it("counts a course once when it fills an overlay requirement too", async () => {
    const p = program(2.0, [{ kind: "course", id: "a-again", name: "A again", options: ["AAAA100"], overlay: true }]);
    // Counted twice, the A would give (4+4+1)/3 = 3.0; once each it is (4+1)/2 = 2.5.
    const r = await gpaResult(p, [c("AAAA100", "A"), c("BBBB100", "D")]);
    expect([...r.assigned].sort()).toEqual(["AAAA100", "BBBB100"]);
    expect(r.gpa).toEqual({ value: 2.5, min: 2 });
  });
});
