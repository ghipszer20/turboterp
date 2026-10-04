// The owner's Math (Applied) + CS plan: clean as written, and broken in the ways students break plans.

import { describe, expect, it } from "vitest";
import { buildCatalog } from "../src/catalog.ts";
import { checkPlan, type PlanIssue } from "../src/check.ts";
import { added, moved, ownerPlan } from "./fixtures/owner-plan.ts";
import { SPRING_2027 } from "./helpers.ts";

const catalog = buildCatalog(SPRING_2027);
const problems = (issues: PlanIssue[]) => issues.filter((i) => i.severity === "error" || i.severity === "warning");

describe("the owner's Math (Applied) + CS plan", () => {
  it("has no errors or warnings", () => {
    expect(problems(checkPlan(ownerPlan(), catalog))).toEqual([]);
  });

  it("still lists what the student must confirm (department permission, the writing requirement)", () => {
    const confirms = checkPlan(ownerPlan(), catalog).filter((i) => i.severity === "confirm");
    expect(confirms.map((i) => i.course)).toEqual(expect.arrayContaining(["CMSC420", "MATH410", "ENGL394"]));
    expect(confirms.find((i) => i.course === "ENGL394")?.message).toBe(
      "ENGL394 (Spring 2029) also needs something TurboTerp can't check. Confirm it yourself: must have fulfilled the Academic Writing (FSAW) requirement.",
    );
  });

  it("flags CMSC351 moved before CMSC216", () => {
    const issues = problems(checkPlan(moved(ownerPlan(), "CMSC351", "Fall 2026"), catalog));
    expect(issues).toEqual([
      {
        kind: "prerequisite",
        severity: "error",
        term: "Fall 2026",
        course: "CMSC351",
        message:
          "CMSC351 (Fall 2026) needs CMSC250 (C- or better) and CMSC216 (C- or better) finished in an earlier term. CMSC250 is planned for Fall 2027, which is too late. CMSC216 is planned for Fall 2027, which is too late.",
      },
    ]);
  });

  it("flags a corequisite moved to a later term", () => {
    const issues = problems(checkPlan(moved(ownerPlan(), "CHEM132", "Fall 2027"), catalog));
    expect(issues).toEqual([
      {
        kind: "corequisite",
        severity: "error",
        term: "Spring 2027",
        course: "CHEM131",
        message: "CHEM131 (Spring 2027) must be taken with CHEM132 in the same term, or after it. CHEM132 is planned for Fall 2027, which is too late.",
      },
    ]);
  });

  it("flags an overloaded term", () => {
    // Two courses not already in the plan (PSYC100 is in Fall 2029, so adding it would also be a repeat).
    const issues = problems(checkPlan(added(ownerPlan(), "Spring 2027", "GVPT390", "THET110"), catalog));
    expect(issues).toEqual([
      {
        kind: "credit-load",
        severity: "error",
        term: "Spring 2027",
        message: "Spring 2027 has 24 credits, over the 20-credit limit for a spring term. Going over 20 credits needs your dean's approval.",
      },
    ]);
  });

  it("checks the whole 8-term plan well under 50 ms (it runs on every edit)", () => {
    const plan = ownerPlan();
    checkPlan(plan, catalog); // warm up
    const runs = 50;
    const t = performance.now();
    for (let i = 0; i < runs; i++) checkPlan(plan, catalog);
    const ms = (performance.now() - t) / runs;
    console.log(`[bench] checkPlan, 8 terms / ${plan.terms.flatMap((x) => x.courses).length} courses: ${ms.toFixed(3)} ms per check`);
    expect(ms).toBeLessThan(50);
  });
});
