// resolvedPlan: checkTrack (@turboterp/tracks) sums credits for GPA protection using each term
// course's own `credits`, defaulting a missing one to 0 (see check.ts's studentCourses). Advisor
// plan courses usually have no explicit `credits` override, so without resolving them from the
// catalog first, every course would count as 0 credits and the GPA math would always divide by 0.

import { describe, expect, it } from "vitest";
import type { PlanCatalog } from "@turboterp/plan/catalog";
import type { Plan } from "@turboterp/plan/check";
import { resolvedPlan } from "../advisor/track-plan";

const catalog: PlanCatalog = new Map([
  ["CHEM131", { id: "CHEM131", title: "Chemistry I", credits: { min: 3, max: 3 }, genEd: [], prerequisite: null, corequisite: null, repeat: { kind: "unknown" } }],
]);

describe("resolvedPlan", () => {
  it("fills a course's credits from the catalog when it has none of its own", () => {
    const plan: Plan = { terms: [{ name: "Fall 2026", courses: [{ id: "CHEM131", status: "completed", grade: "A" }] }] };
    const out = resolvedPlan(plan, catalog);
    expect(out.terms[0]!.courses[0]!.credits).toBe(3);
  });

  it("keeps a course's own credits override instead of the catalog's", () => {
    const plan: Plan = { terms: [{ name: "Fall 2026", courses: [{ id: "CHEM131", status: "completed", grade: "A", credits: 4 }] }] };
    const out = resolvedPlan(plan, catalog);
    expect(out.terms[0]!.courses[0]!.credits).toBe(4);
  });

  it("falls back to 0 for a course not in the catalog", () => {
    const plan: Plan = { terms: [{ name: "Fall 2026", courses: [{ id: "ZZZZ999", status: "planned" }] }] };
    const out = resolvedPlan(plan, catalog);
    expect(out.terms[0]!.courses[0]!.credits).toBe(0);
  });

  it("leaves prior credit and other course fields untouched", () => {
    const plan: Plan = {
      terms: [{ name: "Fall 2026", courses: [{ id: "CHEM131", status: "completed", grade: "A" }] }],
      priorCredit: [{ id: "MATH140", credits: 4, grade: "B+" }],
    };
    const out = resolvedPlan(plan, catalog);
    expect(out.priorCredit).toEqual(plan.priorCredit);
    expect(out.terms[0]!.courses[0]).toEqual({ id: "CHEM131", status: "completed", grade: "A", credits: 3 });
  });
});
