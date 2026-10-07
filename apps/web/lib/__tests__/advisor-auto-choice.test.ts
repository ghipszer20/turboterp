import { readFileSync } from "node:fs";
import type { Course } from "@turboterp/course-data";
import { buildCatalog } from "@turboterp/plan/catalog";
import { describe, expect, it } from "vitest";
import { runAnalysis } from "../advisor/analysis";
import { choiceAwardsOf, computePriorCredit } from "../advisor/prior-credit";
import { newPlan, type AdvisorPlan } from "../advisor/plan-state";

const COURSES = (
  JSON.parse(readFileSync(new URL("../../../../packages/plan/test/fixtures/courses-202701.json", import.meta.url), "utf8")) as { courses: Course[] }
).courses;
const catalog = buildCatalog(COURSES);
const genEdOf = (id: string) => catalog.get(id)?.genEd ?? [];
const APUSH = "AP United States History (4)";

function student(programs: string[], choices: Record<string, string> = {}): AdvisorPlan {
  const plan = newPlan({ programs, catalogYear: "2026-27", startTerm: "Fall 2026" });
  return { ...plan, prior: { ap: [{ key: "a", exam: "United States History", score: 4 }], ib: [], dual: [], choices } };
}
const run = (plan: AdvisorPlan) => runAnalysis({ plan, catalog, priorCourses: computePriorCredit(plan.prior, genEdOf).courses });
const status = (a: Awaited<ReturnType<typeof run>>, program: string, id: string) =>
  a.audits.find((x) => x.program.id === program)!.requirements.find((r) => r.requirement.id === id)!.result.status;

describe("automatic choice of an exam course", () => {
  it("picks HIST201 for Gen Ed alone, and its DVUP is used", async () => {
    const a = await run(student([]));
    expect(a.autoChoices).toEqual({ [APUSH]: "HIST201" });
    const gen = a.audits.find((x) => x.program.id === "gen-ed")!;
    expect(gen.requirements.flatMap((r) => r.result.assigned)).toContain("HIST201");
  });

  it("picks HIST200 when a program requires it", async () => {
    const a = await run(student(["elem-major"]));
    expect(a.autoChoices).toEqual({ [APUSH]: "HIST200" });
    expect(status(a, "elem-major", "elem-hist200")).toBe("satisfied");
  });

  it("picks HIST201 for a program requiring it", async () => {
    const a = await run(student(["plcy-pp-major"]));
    expect(a.autoChoices).toEqual({ [APUSH]: "HIST201" });
  });

  it("keeps an explicit pick even when the other option scores higher", async () => {
    const a = await run(student([], { [APUSH]: "HIST200" }));
    expect(a.autoChoices).toEqual({});
    const gen = a.audits.find((x) => x.program.id === "gen-ed")!;
    expect(gen.requirements.flatMap((r) => r.result.assigned)).not.toContain("HIST201");
  });

  it("makes a single audit run without a choice award", async () => {
    const plan = { ...student(["elem-major"]), prior: { ap: [], ib: [], dual: [], choices: {} } };
    const a = await run(plan);
    expect(a.auditRuns).toBe(1);
    expect(a.autoChoices).toEqual({});
  });

  it("tries each option of one unpicked award", async () => {
    expect((await run(student([]))).auditRuns).toBe(2);
  });

  it("goes to the chart's first option when the options tie", async () => {
    // IB French SL 5 is FREN203 or FREN204, neither with Gen Ed codes, and no program here needs either.
    const plan = { ...student([]), prior: { ap: [], ib: [{ key: "i", exam: "French", level: "SL" as const, score: 5 }], dual: [], choices: {} } };
    const a = await run(plan);
    expect(a.auditRuns).toBe(2);
    expect(Object.values(a.autoChoices)).toEqual(["FREN203"]);
  });

  it("marks the auto pick in the prior credit and skips the 'could be' hint for it", () => {
    const plan = student([]);
    const p = computePriorCredit(plan.prior, genEdOf, { [APUSH]: "HIST201" });
    expect(p.courses.map((c) => c.id)).toContain("HIST201");
    expect(choiceAwardsOf(p.entries)[0]).toMatchObject({ picked: "HIST201", auto: true });
    const own = computePriorCredit({ ...plan.prior, choices: { [APUSH]: "HIST200" } }, genEdOf, { [APUSH]: "HIST201" });
    expect(choiceAwardsOf(own.entries)[0]).toMatchObject({ picked: "HIST200" });
    expect(choiceAwardsOf(own.entries)[0]!.auto).toBeUndefined();
  });
});
