// Golden tests for three hand-transcribed special programs, one of each kind:
// College Park Scholars Arts (Scholars), Honors Humanities (Honors) and the
// Jiménez-Porter Writers' House (other LLP). Each has a plan that completes the
// program and plans broken on purpose that must fail a named requirement.

import { describe, expect, it } from "vitest";
import { auditProgram, type Program, type StudentCourse } from "@turboterp/audit";
import { scholarsArts } from "../special-programs/scholars-arts-2026-27.ts";
import { honorsHumanities } from "../special-programs/honors-humanities-2026-27.ts";
import { writersHouse } from "../special-programs/llp-writers-house-2026-27.ts";

const c = (id: string, credits = 3, grade = "A"): StudentCourse => ({ id, credits, status: "completed", grade });

const statuses = async (program: Program, courses: StudentCourse[]) =>
  Object.fromEntries((await auditProgram(program, courses)).requirements.map((r) => [r.id, r.status]));

async function expectAllSatisfied(program: Program, courses: StudentCourse[]) {
  for (const [id, status] of Object.entries(await statuses(program, courses))) expect(`${id}: ${status}`).toBe(`${id}: satisfied`);
}

const replace = (plan: StudentCourse[], id: string, by: StudentCourse | null) =>
  plan.flatMap((x) => (x.id === id ? (by ? [by] : []) : [x]));

describe("College Park Scholars: Arts (2026-27)", () => {
  const plan = [
    c("CPSA100", 1),
    c("CPSA101", 1),
    c("CPSA200", 1),
    c("CPSA201", 1),
    c("CPSA250", 2),
    c("AMST204"), // listed supporting course
    c("THET110"), // any THET course is approved
    c("PHYS103", 1),
  ];

  it("passes a complete plan", async () => expectAllSatisfied(scholarsArts, plan));

  it("misses Colloquium IV when CPSA201 is dropped", async () => {
    expect((await statuses(scholarsArts, replace(plan, "CPSA201", null))).cpsa201).toBe("missing");
  });

  it("needs three supporting courses, not two", async () => {
    expect((await statuses(scholarsArts, replace(plan, "PHYS103", null)))["supporting-courses"]).toBe("partial");
  });

  it("doesn't count a course outside the list and the approved prefixes", async () => {
    expect((await statuses(scholarsArts, replace(plan, "THET110", c("CMSC131", 4))))["supporting-courses"]).toBe("partial");
  });
});

describe("Honors Humanities (2026-27)", () => {
  const plan = [c("HHUM105"), c("HHUM106"), c("HHUM205"), c("HHUM206"), c("HIST319")];

  it("passes a complete plan", async () => expectAllSatisfied(honorsHumanities, plan));

  it("requires C- or better in each course", async () => {
    expect((await statuses(honorsHumanities, replace(plan, "HHUM106", c("HHUM106", 3, "D+")))).hhum106).toBe("missing");
  });

  it("requires the experience course to be upper-level ARHU", async () => {
    expect((await statuses(honorsHumanities, replace(plan, "HIST319", c("HIST219")))).experience).toBe("missing");
  });
});

describe("Jiménez-Porter Writers' House (2026-27)", () => {
  const plan = [c("ARHU300", 1), c("ARHU309", 1), c("ARHU318A", 1), c("ARHU319B"), c("ARHU320"), c("ENGL271")];

  it("passes a complete plan", async () => expectAllSatisfied(writersHouse, plan));

  it("requires B or better: a B- in ARHU320 doesn't count", async () => {
    expect((await statuses(writersHouse, replace(plan, "ARHU320", c("ARHU320", 3, "B-")))).arhu320).toBe("missing");
  });

  it("requires a supporting creative-writing course from the approved list", async () => {
    expect((await statuses(writersHouse, replace(plan, "ENGL271", c("ENGL101"))))["supporting-course"]).toBe("missing");
  });
});
