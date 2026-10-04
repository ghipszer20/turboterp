// A Student's Degrees and their Programs, checked together: double major (1 degree, 2 majors) vs
// double degree (2 degrees, 150 credits, 18 unique credits per degree), college rules per degree,
// dropped programs, and the declaration-deadline warning. The owner's verification target:
// Math (Applied) + CS, as both a double major and a double degree.

import type { Program } from "@turboterp/audit";
import { describe, expect, it } from "vitest";
import { cmscMajor } from "../../audit/programs/cmsc-major-2026-27.ts";
import { genEd, university } from "../../audit/programs/gen-ed-2026-27.ts";
import { mathMajorApplied } from "../../audit/programs/math-major-applied-2026-27.ts";
import { buildCatalog } from "../src/catalog.ts";
import type { Plan } from "../src/check.ts";
import { checkDegrees, declarationDeadline, type Degree, type DegreeProgram } from "../src/degrees.ts";
import { planCourses } from "../src/notices.ts";
import { ownerPlan } from "./fixtures/owner-plan.ts";
import { SPRING_2027 } from "./helpers.ts";

const catalog = buildCatalog(SPRING_2027);
const layers = [genEd, university];
const major = (program: Program, status: DegreeProgram["status"] = "declared"): DegreeProgram => ({ program, kind: "major", status });
const doubleMajor: Degree[] = [{ programs: [major(mathMajorApplied), major(cmscMajor)] }];
const doubleDegree: Degree[] = [{ programs: [major(mathMajorApplied)] }, { programs: [major(cmscMajor)] }];

const credits = (plan: Plan) => planCourses(plan, catalog).reduce((t, c) => t + c.credits, 0);
/** The owner's plan topped up with transfer elective credit to `total` credits. */
const toCredits = (plan: Plan, total: number): Plan => ({
  ...plan,
  priorCredit: [...(plan.priorCredit ?? []), { id: "L1:Transfer electives", credits: total - credits(plan), source: "Transfer credit" }],
});
const without = (plan: Plan, ...ids: string[]): Plan => ({
  ...plan,
  terms: plan.terms.map((t) => ({ ...t, courses: t.courses.filter((c) => !ids.includes(c.id)) })),
});
const kinds = (issues: { kind: string }[]) => issues.map((i) => i.kind);
const complete = (check: Awaited<ReturnType<typeof checkDegrees>>, id: string) =>
  check.audits.filter((a) => a.program.id === id).every((a) => a.result.requirements.every((r) => r.status === "satisfied"));

describe("double major (Math Applied + CS)", () => {
  it("is one degree with both majors complete and nothing to fix", async () => {
    const check = await checkDegrees(ownerPlan(), catalog, doubleMajor, layers);
    expect(check.mode).toBe("double-major");
    expect(check.minimumCredits).toBe(120);
    expect(complete(check, "math-major-applied")).toBe(true);
    expect(complete(check, "cmsc-major")).toBe(true);
    expect(check.issues).toEqual([]);
  });

  it("doesn't ask for 150 credits or unique credits", async () => {
    const check = await checkDegrees(ownerPlan(), catalog, doubleMajor, layers);
    expect(check.totalCredits).toBeLessThan(150);
    expect(check.uniqueCredits).toBeUndefined();
  });
});

describe("double degree (Math Applied + CS)", () => {
  it("passes with a realistic plan at 150 credits: both degrees complete, 18+ unique credits each", async () => {
    const check = await checkDegrees(toCredits(ownerPlan(), 150), catalog, doubleDegree, layers);
    expect(check.mode).toBe("double-degree");
    expect(check.minimumCredits).toBe(150);
    expect(complete(check, "math-major-applied")).toBe(true);
    expect(complete(check, "cmsc-major")).toBe(true);
    expect(Math.min(...check.uniqueCredits!)).toBeGreaterThanOrEqual(18);
    expect(check.issues).toEqual([]);
  });

  it("fails when the plan has fewer than 150 credits", async () => {
    const check = await checkDegrees(ownerPlan(), catalog, doubleDegree, layers);
    const issue = check.issues.find((i) => i.kind === "double-degree-credits")!;
    expect(issue.severity).toBe("error");
    expect(issue.message).toBe(
      `A double degree needs at least 150 credits. Your plan has ${check.totalCredits}: add ${150 - check.totalCredits} more.`,
    );
  });

  it("fails when a degree has fewer than 18 credits not used for the other", async () => {
    // An early plan: Math has only its calculus and linear algebra, most of which CS also uses.
    const early = toCredits(without(ownerPlan(), "MATH246", "MATH310", "MATH410", "MATH411", "MATH401", "AMSC460", "MATH420", "MATH462"), 150);
    const check = await checkDegrees(early, catalog, doubleDegree, layers);
    const [math] = check.uniqueCredits!;
    expect(math).toBeLessThan(18);
    const issue = check.issues.find((i) => i.kind === "double-degree-unique")!;
    expect(issue).toMatchObject({ severity: "error", programs: ["math-major-applied"] });
    expect(issue.message).toBe(
      `A double degree needs at least 18 credits in each degree that don't count toward the other. The Mathematics Major (Applied Mathematics Track) degree has ${math}.`,
    );
  });
});

describe("college rules", () => {
  const college: Program = {
    id: "cmns-rules",
    name: "CMNS college rules",
    layer: "college",
    requirements: [{ kind: "choose", id: "upper", name: "Two upper-level CMNS courses", count: 2, from: { departments: ["MATH", "CMSC", "STAT", "AMSC"], minNumber: 300, maxNumber: 499 } }],
  };

  it("apply once for a double major and once per degree for a double degree", async () => {
    const one = await checkDegrees(ownerPlan(), catalog, [{ ...doubleMajor[0]!, collegeRules: [college] }], layers);
    expect(one.audits.filter((a) => a.program.id === "cmns-rules").map((a) => a.degree)).toEqual([0]);
    const two = await checkDegrees(
      toCredits(ownerPlan(), 150),
      catalog,
      doubleDegree.map((d) => ({ ...d, collegeRules: [college] })),
      layers,
    );
    expect(two.audits.filter((a) => a.program.id === "cmns-rules").map((a) => a.degree)).toEqual([0, 1]);
    expect(two.audits.filter((a) => a.program.layer === "gen-ed").map((a) => a.degree)).toEqual([null]);
  });
});

describe("program status", () => {
  it("leaves a dropped program out of the audit and the mode", async () => {
    const check = await checkDegrees(ownerPlan(), catalog, [{ programs: [major(mathMajorApplied), major(cmscMajor, "dropped")] }], layers);
    expect(check.mode).toBe("single");
    expect(check.audits.map((a) => a.program.id)).not.toContain("cmsc-major");
  });
});

describe("declaration deadline", () => {
  it("is one full academic year before the plan's last term", () => {
    expect(declarationDeadline(ownerPlan())).toEqual({ term: "Spring 2029", graduation: "Spring 2030", date: "2029-05-31" });
  });

  it("warns ahead of the deadline while a second major is only planned", async () => {
    const planned = [{ programs: [major(mathMajorApplied), major(cmscMajor, "planned")] }];
    const check = await checkDegrees(ownerPlan(), catalog, planned, layers, { today: new Date("2029-01-15") });
    expect(check.issues).toEqual([
      {
        kind: "declaration-deadline",
        severity: "warning",
        programs: ["math-major-applied", "cmsc-major"],
        message:
          "Declare your double major by the end of Spring 2029: it has to be declared at least one full academic year before you graduate (Spring 2030).",
      },
    ]);
  });

  it("is only a note while the deadline is far off", async () => {
    const planned = [{ programs: [major(mathMajorApplied), major(cmscMajor, "planned")] }];
    const check = await checkDegrees(ownerPlan(), catalog, planned, layers, { today: new Date("2027-01-15") });
    expect(check.issues.map((i) => i.severity)).toEqual(["info"]);
  });

  it("is an error once the deadline has passed", async () => {
    const planned = [{ programs: [major(mathMajorApplied)] }, { programs: [major(cmscMajor, "planned")] }];
    const check = await checkDegrees(toCredits(ownerPlan(), 150), catalog, planned, layers, { today: new Date("2029-09-01") });
    const issue = check.issues.find((i) => i.kind === "declaration-deadline")!;
    expect(issue.severity).toBe("error");
    expect(issue.message).toBe(
      "The deadline to declare your double degree (end of Spring 2029) has passed for a Spring 2030 graduation. Talk to your advisor.",
    );
  });

  it("says nothing once every program is declared", async () => {
    const check = await checkDegrees(ownerPlan(), catalog, doubleMajor, layers, { today: new Date("2029-01-15") });
    expect(kinds(check.issues)).not.toContain("declaration-deadline");
  });
});
