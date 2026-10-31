import { describe, expect, it } from "vitest";
import type { AdvisorPlan } from "@turboterp/app-core/plan-state";
import { planSync, updatePlanAction } from "../src/schedule/planSync";

const plan = (terms: Record<string, string[]>): AdvisorPlan =>
  ({ terms: Object.entries(terms).map(([name, ids]) => ({ name, courses: ids.map((id) => ({ id })) })) }) as unknown as AdvisorPlan;

describe("planSync", () => {
  it("is unlinked without a plan or a parseable term", () => {
    expect(planSync(null, "202701", ["CMSC216"])).toMatchObject({ linked: false, courses: ["CMSC216"], prompt: null });
    expect(planSync(plan({}), null, null)).toMatchObject({ linked: false, courses: [], prompt: null });
  });

  it("follows the plan's term until the student's own list differs", () => {
    const p = plan({ "Spring 2027": ["CMSC216", "MATH241"] });
    expect(planSync(p, "202701", null)).toMatchObject({ linked: true, termName: "Spring 2027", courses: ["CMSC216", "MATH241"], prompt: null });
    expect(planSync(p, "202701", ["MATH241", "CMSC216"]).prompt).toBeNull();
  });

  it("offers Update plan with what changes once the lists differ, never writing on its own", () => {
    const p = plan({ "Spring 2027": ["CMSC216", "PHIL140"] });
    const s = planSync(p, "202701", ["CMSC216", "STAT400"]);
    expect(s.courses).toEqual(["CMSC216", "STAT400"]);
    expect(s.prompt).toEqual({ termName: "Spring 2027", text: "Adds STAT400 · Removes PHIL140", ids: ["CMSC216", "STAT400"] });
  });

  it("offers to create the term when the plan lacks it", () => {
    const s = planSync(plan({ "Fall 2026": ["CMSC131"] }), "202701", ["CMSC216"]);
    expect(s.prompt?.text).toBe("Adds CMSC216");
  });

  it("builds the confirmed dispatch for the Advisor store", () => {
    expect(updatePlanAction({ termName: "Spring 2027", text: "", ids: ["A1"] })).toEqual({ type: "set-term-courses", term: "Spring 2027", ids: ["A1"] });
  });
});
