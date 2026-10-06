// Engine options: Requirement.within (an overlay counts a course only if it also fills one of the
// named requirements) and Program.examLimits (a cap on exam-credit courses across requirements).

import { describe, expect, it } from "vitest";
import { auditProgram, type Program, type StudentCourse } from "../src/audit.ts";

const c = (id: string, codes: string[], exam = false): StudentCourse => ({
  id,
  credits: 3,
  status: "completed",
  grade: "B",
  genEd: codes,
  ...(exam ? { exam: true as const } : {}),
});

const program: Program = {
  id: "t",
  name: "T",
  requirements: [
    { kind: "choose", id: "a", name: "A", count: 1, from: { genEd: ["A"] } },
    { kind: "choose", id: "b", name: "B", count: 1, from: { genEd: ["B"] } },
    { kind: "choose", id: "o", name: "O", count: 1, overlay: true, within: ["a", "b"], from: { genEd: ["O"] } },
  ],
};
const statuses = async (p: Program, courses: StudentCourse[]) =>
  Object.fromEntries((await auditProgram(p, courses)).requirements.map((r) => [r.id, r.status]));

describe("Requirement.within", () => {
  it("counts an overlay course that also fills one of the named requirements", async () => {
    expect((await statuses(program, [c("X1", ["A", "O"])])).o).toBe("satisfied");
  });

  it("doesn't count an overlay course that fills none of them", async () => {
    expect((await statuses(program, [c("X1", ["O"])])).o).toBe("missing");
  });

  it("counts only as many overlay courses as the named requirements have room for", async () => {
    // A and B take one course each, so only two of the three O courses can sit in them.
    const two: Program = { ...program, requirements: program.requirements.map((req) => (req.id === "o" ? { ...req, count: 3 } : req)) };
    const result = await statuses(two, [c("X1", ["A", "O"]), c("X2", ["B", "O"]), c("X3", ["A", "O"])]);
    expect(result.o).toBe("partial");
  });

  it("moves the overlay course into a named requirement when it can", async () => {
    const result = await statuses(program, [c("A1", ["A", "B"]), c("X1", ["A", "O"])]);
    expect([result.a, result.b, result.o]).toEqual(["satisfied", "satisfied", "satisfied"]);
  });
});

describe("Program.examLimits", () => {
  const limited: Program = {
    id: "t",
    name: "T",
    examLimits: [{ requirements: ["a", "b"], courses: 1 }],
    requirements: [
      { kind: "choose", id: "a", name: "A", count: 1, from: { genEd: ["A"] } },
      { kind: "choose", id: "b", name: "B", count: 1, from: { genEd: ["B"] } },
      { kind: "choose", id: "o", name: "O", count: 1, overlay: true, from: { genEd: ["O"] } },
    ],
  };

  it("allows exam courses up to the limit across the named requirements", async () => {
    const r = await statuses(limited, [c("A1", ["A"], true), c("B1", ["B"])]);
    expect([r.a, r.b]).toEqual(["satisfied", "satisfied"]);
  });

  it("leaves a requirement short when it would take too many exam courses", async () => {
    const r = await statuses(limited, [c("A1", ["A"], true), c("B1", ["B"], true)]);
    expect([r.a, r.b].filter((s) => s === "satisfied")).toHaveLength(1);
  });

  it("counts a course once even when it fills two named requirements' pairs", async () => {
    const r = await statuses(limited, [c("A1", ["A", "B"], true), c("B1", ["B"])]);
    expect([r.a, r.b]).toEqual(["satisfied", "satisfied"]);
  });

  it("doesn't limit requirements it doesn't name", async () => {
    const r = await statuses(limited, [c("O1", ["O"], true)]);
    expect(r.o).toBe("satisfied");
  });

  it("a limit of 0 bars exam courses", async () => {
    const zero: Program = { ...limited, examLimits: [{ requirements: ["o"], courses: 0 }] };
    expect((await statuses(zero, [c("O1", ["O"], true)])).o).toBe("missing");
    expect((await statuses(zero, [c("O1", ["O"])])).o).toBe("satisfied");
  });
});
