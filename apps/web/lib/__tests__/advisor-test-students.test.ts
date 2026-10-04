// The owner's test students (first-draft item 12): Advisor plan fixtures that the real analysis
// (runAnalysis / checkDegrees / checkPlan / whatIf) must accept as described.
import { readFileSync } from "node:fs";
import type { Course } from "@turboterp/course-data";
import { buildCatalog } from "@turboterp/plan/catalog";
import { checkPlan } from "@turboterp/plan/check";
import { checkDegrees } from "@turboterp/plan/degrees";
import { describe, expect, it } from "vitest";
import { runAnalysis } from "../advisor/analysis";
import { checkerPlan } from "../advisor/checker";
import type { AdvisorPlan } from "../advisor/plan-state";
import { computePriorCredit } from "../advisor/prior-credit";
import { AUTOMATIC_PROGRAMS, studentDegrees } from "../advisor/programs";
import { seedFromUrl } from "../advisor/seed";
import { TEST_STUDENTS } from "../advisor/test-students";
import { runWhatIf } from "../advisor/what-if";

const COURSES = (
  JSON.parse(readFileSync(new URL("../../../../packages/plan/test/fixtures/courses-202701.json", import.meta.url), "utf8")) as {
    courses: Course[];
  }
).courses;
const catalog = buildCatalog(COURSES);

const student = (id: string): AdvisorPlan => {
  const s = TEST_STUDENTS.find((x) => x.id === id);
  if (!s) throw new Error(`no test student ${id}`);
  return s.plan;
};
const analyse = (plan: AdvisorPlan) => {
  const prior = computePriorCredit(plan.prior, (id) => catalog.get(id)?.genEd ?? []);
  return { prior, run: runAnalysis({ plan, catalog, priorCourses: prior.courses }) };
};
const allSatisfied = (a: Awaited<ReturnType<typeof runAnalysis>>, programId: string) => {
  const audit = a.audits.find((x) => x.program.id === programId);
  expect(audit, `${programId} is audited`).toBeDefined();
  expect(audit!.requirements.filter((r) => r.result.status !== "satisfied").map((r) => r.requirement.id)).toEqual([]);
};

describe("test students", () => {
  it("lists the seven students, each with a label and unique id", () => {
    expect(TEST_STUDENTS.map((s) => s.id)).toEqual([
      "major-switch",
      "double-major",
      "double-degree",
      "bs-ms",
      "dropped-minor",
      "math-cs-double-major",
      "math-cs-double-degree",
    ]);
    expect(TEST_STUDENTS.every((s) => s.label.length > 0)).toBe(true);
  });

  it("opens each one from ?seed=student&id=", () => {
    for (const s of TEST_STUDENTS) {
      const seeded = seedFromUrl(`?seed=student&id=${s.id}`, { NODE_ENV: "development" });
      expect(seeded?.plan).toEqual(s.plan);
    }
    expect(seedFromUrl("?seed=student&id=nope", { NODE_ENV: "development" })?.plan).toBeNull();
    expect(seedFromUrl("?seed=student&id=bs-ms", { NODE_ENV: "production" })).toBeNull();
  });

  it("major-switch: CS audit complete, old courses count toward the 120, old major not audited", async () => {
    const plan = student("major-switch");
    expect(plan.programs).toEqual(["cmsc-major"]);
    const { prior, run } = analyse(plan);
    const a = await run;
    allSatisfied(a, "cmsc-major");
    expect(a.audits.map((x) => x.program.id).some((id) => id.startsWith("bsci"))).toBe(false);
    const old = plan.terms.slice(0, 2).flatMap((t) => t.courses);
    expect(old.length).toBeGreaterThan(0);
    // The 120-credit floor (university layer) counts the old Biological Sciences courses too.
    const university = a.audits.find((x) => x.program.id === "university")!;
    const floor = university.requirements.find((r) => r.requirement.kind === "choose" && (r.requirement as { credits?: number }).credits === 120)!;
    expect(floor).toBeDefined();
    const oldIds = new Set(old.map((c) => c.id));
    expect(floor.result.assigned.some((id) => oldIds.has(id))).toBe(true);
    expect(prior.courses).toEqual([]);
  });

  it("double-major: both audits complete, no degree issues", async () => {
    const { run } = analyse(student("double-major"));
    const a = await run;
    expect(a.degrees?.mode).toBe("double-major");
    allSatisfied(a, "econ-major-ba");
    allSatisfied(a, "gvpt-major-ba");
    expect(a.degrees!.issues.filter((i) => i.kind !== "declaration-deadline")).toEqual([]);
  });

  it("double-degree: at least 150 credits, 18 unique to each, no double-degree issue", async () => {
    const plan = student("double-degree");
    expect(plan.degreeMode).toBe("double-degree");
    const { run } = analyse(plan);
    const a = await run;
    expect(a.degrees?.mode).toBe("double-degree");
    expect(a.degrees!.issues.map((i) => i.kind).filter((k) => k !== "declaration-deadline")).toEqual([]);
    expect(a.degrees!.uniqueCredits!.every((n) => n >= 18)).toBe(true);
  });

  describe("bs-ms", () => {
    const plan = student("bs-ms");
    const prior = computePriorCredit(plan.prior, () => []);
    const issues = (p: AdvisorPlan) => checkPlan(checkerPlan(p, prior.courses), catalog).map((i) => i.kind);
    const gradCourses = plan.terms.flatMap((t) => t.courses).filter((c) => c.gradTag === "bs-ms");

    it("double-counts 600-level CMSC courses within the 35% cap, each at B- or better", () => {
      expect(plan.programs).toEqual(["cmsc-major"]);
      expect(gradCourses.length).toBeGreaterThan(0);
      expect(gradCourses.every((c) => /^CMSC6\d\d/.test(c.id) && c.status === "completed")).toBe(true);
      expect(plan.mastersCredits).toBeGreaterThan(0);
      const kinds = issues(plan);
      expect(kinds).not.toContain("grad-double-count-cap");
      expect(kinds).not.toContain("grad-double-count-grade");
      expect(kinds).toContain("grad-permission");
    });

    it("flags a grade under B- and a total over the cap", () => {
      const withGrade = (grade: string): AdvisorPlan => ({
        ...plan,
        terms: plan.terms.map((t) => ({ ...t, courses: t.courses.map((c) => (c.gradTag ? { ...c, grade } : c)) })),
      });
      expect(issues(withGrade("C+"))).toContain("grad-double-count-grade");
      expect(issues({ ...plan, mastersCredits: 10 })).toContain("grad-double-count-cap");
    });

    it("still completes the CS major audit", async () => {
      const a = await analyse(plan).run;
      allSatisfied(a, "cmsc-major");
    });
  });

  it("dropped-minor: the dropped minor is not audited, and dropping it reports freed credits", async () => {
    const plan = student("dropped-minor");
    const [major, minor] = plan.programs;
    expect(major).toBe("cmsc-major");
    const { prior } = analyse(plan);
    const cplan = checkerPlan(plan, prior.courses);
    const degrees = await studentDegrees(plan.programs, null);
    const dropped = degrees.map((d) => ({ ...d, programs: d.programs.map((p) => (p.program.id === minor ? { ...p, status: "dropped" as const } : p)) }));
    const check = await checkDegrees(cplan, catalog, dropped, AUTOMATIC_PROGRAMS);
    expect(check.audits.map((x) => x.program.id)).not.toContain(minor);
    expect(check.audits.map((x) => x.program.id)).toContain("cmsc-major");
    const w = await runWhatIf(cplan, catalog, plan.programs, [major!], plan.startTerm, undefined, plan.confirmedSlots);
    expect(w.freedCredits).toBeGreaterThan(0);
    const withMinor = await analyse(plan).run;
    allSatisfied(withMinor, "cmsc-major");
  });

  it.each(["math-cs-double-major", "math-cs-double-degree"])("%s: both audits complete, no degree issue but the declaration deadline", async (id) => {
    const plan = student(id);
    expect(plan.programs).toEqual(["math-major-applied", "cmsc-major"]);
    const a = await analyse(plan).run;
    expect(a.degrees?.mode).toBe(id.endsWith("degree") ? "double-degree" : "double-major");
    allSatisfied(a, "math-major-applied");
    allSatisfied(a, "cmsc-major");
    expect(a.degrees!.issues.filter((i) => i.kind !== "declaration-deadline")).toEqual([]);
  });
});
