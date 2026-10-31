import { describe, expect, it } from "vitest";
import { groupIssues } from "@turboterp/app-core/issues";
import { TEST_STUDENTS } from "@turboterp/app-core/test-students";
import { buildPlanView, moveTargets, nextMainTerm } from "../src/advisor/plan-view-model";

const raw = TEST_STUDENTS[0]!.plan;
const sample = { ...raw, terms: raw.terms.map((t) => ({ ...t, courses: t.courses.map(({ id }) => ({ id })) })) };
const names = sample.terms.map((t) => t.name);

describe("buildPlanView", () => {
  it("makes one section per term, grouped by academic year, with credits summed", () => {
    const vm = buildPlanView({
      plan: sample,
      lookup: (id) => ({ title: `T ${id}`, credits: 3 }),
      groups: null,
      categoryOf: () => "major",
    });
    expect(vm.years.flatMap((y) => y.terms.map((t) => t.name))).toEqual(names);
    const first = vm.years[0]!.terms[0]!;
    expect(first.credits).toBe(first.courses.length * 3);
    expect(first.courses[0]).toMatchObject({ title: `T ${first.courses[0]!.id}`, category: "major", severity: null, note: null });
    expect(vm.totalCredits).toBe(vm.years.reduce((s, y) => s + y.terms.reduce((t, x) => t + x.credits, 0), 0));
    expect(vm.countLabels).toEqual([]);
  });

  it("marks unknown credits as approximate and leaves the title empty", () => {
    const vm = buildPlanView({ plan: sample, lookup: () => null, groups: null, categoryOf: () => "elective" });
    const t = vm.years[0]!.terms[0]!;
    expect(t.creditsApprox).toBe(true);
    expect(t.courses[0]!.credits).toBeNull();
  });

  it("puts a course's issue on its row and a term issue on its term, with counts", () => {
    const term = names[0]!;
    const id = sample.terms[0]!.courses[0]!.id;
    const groups = groupIssues(
      [
        { kind: "prereq", severity: "error", term, course: id, message: "Needs MATH140 first", short: "Needs MATH140" },
        { kind: "credit-load", severity: "warning", term, message: "Over the credit cap" },
      ] as never,
      names,
    );
    const vm = buildPlanView({ plan: sample, lookup: () => null, groups, categoryOf: () => "gened" });
    const t = vm.years[0]!.terms[0]!;
    expect(t.courses[0]).toMatchObject({ severity: "error", note: "Needs MATH140" });
    expect(t.issues.map((i) => i.message)).toContain("Over the credit cap");
    expect(vm.countLabels.map((c) => c.text)).toEqual(["1 to fix", "1 to check"]);
  });
});

describe("term helpers", () => {
  it("nextMainTerm alternates fall and spring", () => {
    expect(nextMainTerm("Fall 2026")).toBe("Spring 2027");
    expect(nextMainTerm("Spring 2027")).toBe("Fall 2027");
  });
  it("moveTargets lists every other term", () => {
    expect(moveTargets(sample, names[0]!)).toEqual(names.slice(1));
  });
});
