// What-if program changes (switch major, add/drop a program): compares a plan's courses,
// missing requirements, freed credits and graduation-term estimate under a current vs a proposed
// set of majors. Uses small synthetic programs for the isolated rules, and the owner's real
// Math (Applied) + CS plan for an integration check.

import type { Program } from "@turboterp/audit";
import { describe, expect, it } from "vitest";
import { cmscMajor } from "../../audit/programs/cmsc-major-2026-27.ts";
import { mathMajorApplied } from "../../audit/programs/math-major-applied-2026-27.ts";
import { mathMajorTraditional } from "../../audit/programs/math-major-2026-27.ts";
import { buildCatalog } from "../src/catalog.ts";
import type { Plan } from "../src/check.ts";
import { whatIf } from "../src/what-if.ts";
import { ownerPlan } from "./fixtures/owner-plan.ts";
import { SPRING_2027 } from "./helpers.ts";

const catalog = buildCatalog(SPRING_2027);

// Two small majors over made-up courses (real ids so credits resolve from the fixture catalog).
const majorA: Program = {
  id: "a-major",
  name: "A Major",
  requirements: [{ kind: "course", id: "cmsc131", name: "CMSC131", options: ["CMSC131"] }],
};
const majorB: Program = {
  id: "b-major",
  name: "B Major",
  requirements: [
    { kind: "course", id: "cmsc132", name: "CMSC132", options: ["CMSC132"] },
    { kind: "course", id: "cmsc250", name: "CMSC250", options: ["CMSC250"] },
  ],
};
// A tiny Gen Ed stand-in and a 9-credit "university" floor, small enough to test the elective/
// unused split without needing a 120-credit plan.
const genEdish: Program = {
  id: "gen-ed-ish",
  name: "Gen Ed",
  requirements: [{ kind: "choose", id: "hist", name: "History elective", count: 1, from: { departments: ["HIST"] } }],
};
const universityish: Program = {
  id: "university-ish",
  name: "University",
  requirements: [{ kind: "choose", id: "credits", name: "9 credits", credits: 9, overlay: true, from: { anyCourse: true } }],
};

const planWith = (...ids: string[]): Plan => ({ terms: [{ name: "Fall 2026", courses: ids.map((id) => ({ id })) }] });

describe("course classification", () => {
  it("counts a course required by a current or proposed major", async () => {
    const result = await whatIf(planWith("CMSC131"), catalog, [majorA], [majorA], []);
    const c = result.courses.find((x) => x.id === "CMSC131")!;
    expect(c.currentStatus).toBe("counts");
    expect(c.proposedStatus).toBe("counts");
    expect(c.currentPrograms).toEqual(["a-major"]);
    expect(c.proposedPrograms).toEqual(["a-major"]);
  });

  it("carries the course's credits, from the catalog, for a totals display", async () => {
    // CMSC131 is a 4-credit course in the fixture catalog (see catalog.get("CMSC131").credits.min).
    const result = await whatIf(planWith("CMSC131"), catalog, [majorA], [majorA], []);
    const c = result.courses.find((x) => x.id === "CMSC131")!;
    expect(c.credits).toBe(4);
  });

  it("becomes elective when no major needs it but Gen Ed or the credit floor does", async () => {
    // HIST200 matches the Gen Ed stand-in; CMSC131 (4 cr) is within the 9-credit floor even
    // though no major or Gen Ed rule claims it.
    const result = await whatIf(planWith("HIST200", "CMSC131"), catalog, [], [], [genEdish, universityish]);
    const hist = result.courses.find((x) => x.id === "HIST200")!;
    const cmsc131 = result.courses.find((x) => x.id === "CMSC131")!;
    expect(hist.currentStatus).toBe("elective");
    expect(cmsc131.currentStatus).toBe("elective");
  });

  it("is unused once neither a major, Gen Ed, nor the credit floor needs it", async () => {
    // Chronologically: HIST200 (3cr, before=0<9, running total 3) counts for the floor; CMSC131
    // (4cr, before=3<9, running total 7) counts too; CMSC132 (4cr, before=7<9, running total 11)
    // also counts -- still within the floor's one-course overshoot allowance (cap 9+3=12).
    // CMSC250 (4cr, before=11>=9) starts after the floor is already full, and matches nothing
    // else, so it's unused.
    const result = await whatIf(planWith("HIST200", "CMSC131", "CMSC132", "CMSC250"), catalog, [], [], [genEdish, universityish]);
    const cmsc250 = result.courses.find((x) => x.id === "CMSC250")!;
    expect(cmsc250.currentStatus).toBe("unused");
  });

  it("never lets a failed/withdrawn attempt's credits fill the credit floor, or push a later real course out of it", async () => {
    // Floor is 9 credits. X1 (F, 4cr) earns no credit and must not consume floor space: without
    // that fix its phantom 4 credits would push X4 past the 9-credit floor into "unused".
    const plan: Plan = {
      terms: [
        {
          name: "Fall 2026",
          courses: [
            { id: "X1", status: "completed", grade: "F", credits: 4 },
            { id: "X2", status: "completed", credits: 4 },
            { id: "X3", status: "completed", credits: 4 },
            { id: "X4", status: "completed", credits: 4 },
          ],
        },
      ],
    };
    const result = await whatIf(plan, catalog, [], [], [universityish]);
    const of = (id: string) => result.courses.find((c) => c.id === id)!;
    expect(of("X1").currentStatus).toBe("unused");
    expect(of("X4").currentStatus).toBe("elective");
  });

  it("fills the credit floor chronologically: prior credit, then term order", async () => {
    const plan: Plan = {
      priorCredit: [{ id: "L1:Transfer", credits: 6, source: "Transfer credit" }],
      terms: [{ name: "Fall 2026", courses: [{ id: "CMSC131" }] }],
    };
    // Floor is 9 credits: the 6-credit prior block fills first, leaving 3 of CMSC131's 4 credits
    // "covered" -- but since a course is all-or-nothing, CMSC131 (4cr) pushes the total to 10 and
    // still counts as within the floor (a credit requirement may overshoot by less than one course).
    const result = await whatIf(plan, catalog, [], [], [universityish]);
    const cmsc131 = result.courses.find((x) => x.id === "CMSC131")!;
    expect(cmsc131.currentStatus).toBe("elective");
  });
});

describe("no phantom diffs", () => {
  it("keeps a major's own assignment the same whether it's alone or alongside another program", async () => {
    const alone = await whatIf(planWith("CMSC131"), catalog, [majorA], [majorA], []);
    const withOther = await whatIf(planWith("CMSC131", "CMSC132", "CMSC250"), catalog, [majorA], [majorA, majorB], []);
    const a1 = alone.courses.find((x) => x.id === "CMSC131")!;
    const a2 = withOther.courses.find((x) => x.id === "CMSC131")!;
    expect(a1.currentPrograms).toEqual(a2.currentPrograms);
  });
});

describe("newly missing requirements", () => {
  it("reports the shortfall of a program only newly proposed, not one already declared", async () => {
    // Switching from A to B: B's requirements are newly missing (nothing satisfies them yet).
    const result = await whatIf(planWith("CMSC131"), catalog, [majorA], [majorB], []);
    expect(result.newlyMissing).toHaveLength(1);
    expect(result.newlyMissing[0]!.program.id).toBe("b-major");
    expect(result.newlyMissing[0]!.coursesShort).toBe(2);
    expect(result.newlyMissing[0]!.missing).toEqual(["CMSC132", "CMSC250"]);
  });

  it("reports nothing newly missing when dropping a program", async () => {
    const result = await whatIf(planWith("CMSC131"), catalog, [majorA, majorB], [majorA], []);
    expect(result.newlyMissing).toEqual([]);
  });

  it("reports nothing newly missing when a program is already satisfied", async () => {
    const result = await whatIf(planWith("CMSC131"), catalog, [], [majorA], []);
    expect(result.newlyMissing).toEqual([]);
  });
});

describe("freed credits", () => {
  it("counts credits of not-yet-completed courses that stop being required", async () => {
    const plan: Plan = { terms: [{ name: "Fall 2026", courses: [{ id: "CMSC132" }, { id: "CMSC250" }] }] };
    const result = await whatIf(plan, catalog, [majorB], [], []);
    // CMSC132 (4cr) + CMSC250 (4cr) both stop being required.
    expect(result.freedCredits).toBe(8);
  });

  it("never counts a completed course's credits as freed", async () => {
    const plan: Plan = { terms: [{ name: "Fall 2026", courses: [{ id: "CMSC132", status: "completed", grade: "B" }] }] };
    const result = await whatIf(plan, catalog, [majorB], [], []);
    expect(result.freedCredits).toBe(0);
  });
});

describe("graduation term estimate", () => {
  it("documents the rule: typical load is the median credits of Fall/Spring terms with courses", async () => {
    const plan: Plan = {
      terms: [
        { name: "Fall 2026", courses: [{ id: "CMSC131" }] }, // 4 credits
        { name: "Spring 2027", courses: [{ id: "CMSC132" }] }, // 4 credits
      ],
    };
    const result = await whatIf(plan, catalog, [], [], []);
    expect(result.graduation.typicalLoad).toBe(4);
  });

  it("estimates a later graduation term when the proposed set needs more terms at the plan's typical load", async () => {
    // Two 4-credit terms (typical load 4). Proposed adds majorB, needing 2 more courses (8
    // credits) not yet in the plan: ceil(8/4) = 2 more terms than before.
    const plan: Plan = {
      terms: [
        { name: "Fall 2026", courses: [{ id: "CMSC131" }] },
        { name: "Spring 2027", courses: [{ id: "MATH140" }] },
      ],
    };
    const result = await whatIf(plan, catalog, [], [majorB], []);
    expect(result.graduation.deltaTerms).toBeGreaterThan(0);
    expect(result.graduation.proposedFinishTerm).not.toBe(result.graduation.currentFinishTerm);
  });

  it("estimates an earlier graduation term when dropping a program frees required, not-yet-taken courses", async () => {
    const plan: Plan = {
      terms: [
        { name: "Fall 2026", courses: [{ id: "CMSC131" }] },
        { name: "Spring 2027", courses: [{ id: "CMSC132" }, { id: "CMSC250" }] },
      ],
    };
    const result = await whatIf(plan, catalog, [majorB], [], []);
    expect(result.graduation.deltaTerms).toBeLessThanOrEqual(0);
  });

  it("shifts the plan's own last Fall/Spring term by the term delta", async () => {
    const plan: Plan = {
      terms: [
        { name: "Fall 2026", courses: [{ id: "CMSC131" }] },
        { name: "Spring 2027", courses: [{ id: "MATH140" }] },
      ],
    };
    const result = await whatIf(plan, catalog, [], [majorB], []);
    // Typical load is 4 (both terms). majorB needs CMSC132 + CMSC250 (4cr each = 8cr), neither in
    // the plan: ceil(8/4) = 2 extra terms, so the finish term moves from Spring 2027 to Spring 2028
    // (Spring 2027 -> Fall 2027 -> Spring 2028, alternating).
    expect(result.graduation.currentFinishTerm).toBe("Spring 2027");
    expect(result.graduation.deltaTerms).toBe(2);
    expect(result.graduation.proposedFinishTerm).toBe("Spring 2028");
  });
});

describe("CS gateway", () => {
  const gatewayPlan = (grade: string): Plan => ({
    terms: [{ name: "Fall 2026", courses: [{ id: "CMSC131", status: "completed", grade }] }],
  });

  it("is included when the CS major is in either the current or proposed set", async () => {
    const withCurrent = await whatIf(gatewayPlan("B-"), catalog, [cmscMajor], [], [], { matriculationTerm: "202408" });
    const withProposed = await whatIf(gatewayPlan("B-"), catalog, [], [cmscMajor], [], { matriculationTerm: "202408" });
    const withNeither = await whatIf(gatewayPlan("B-"), catalog, [majorA], [majorB], [], { matriculationTerm: "202408" });
    expect(withCurrent.gateway).not.toBeUndefined();
    expect(withProposed.gateway).not.toBeUndefined();
    expect(withNeither.gateway).toBeUndefined();
  });

  it("applies the pre-Fall-2024 C-/2.7 rule for an earlier matriculation term", async () => {
    const result = await whatIf(gatewayPlan("C"), catalog, [cmscMajor], [], [], { matriculationTerm: "202405" });
    const c131 = result.gateway!.courses.find((c) => c.id === "CMSC131")!;
    expect(c131.status).toBe("met");
  });

  it("applies the Fall-2024-or-later B-/3.0 rule for a later matriculation term", async () => {
    const result = await whatIf(gatewayPlan("C"), catalog, [cmscMajor], [], [], { matriculationTerm: "202408" });
    const c131 = result.gateway!.courses.find((c) => c.id === "CMSC131")!;
    expect(c131.status).toBe("below-minimum");
  });
});

describe("retakes", () => {
  // Owner ruling: a course may appear twice in a plan only after a failed or withdrawn attempt.
  // The failed attempt should stop counting toward a minimum-grade requirement (so a later,
  // passing retake is the one that counts), and the failed attempt itself should show as unused.
  const gradedMajor: Program = {
    id: "graded-major",
    name: "Graded Major",
    minGrade: "C-",
    requirements: [{ kind: "course", id: "cmsc131", name: "CMSC131", options: ["CMSC131"] }],
  };

  it("lets a passing retake count after a failed attempt, leaving the failed attempt unused", async () => {
    const plan: Plan = {
      terms: [
        { name: "Fall 2026", courses: [{ id: "CMSC131", status: "completed", grade: "F" }] },
        { name: "Spring 2027", courses: [{ id: "CMSC131" }] },
      ],
    };
    const result = await whatIf(plan, catalog, [gradedMajor], [gradedMajor], []);
    const counted = result.courses.filter((c) => c.id === "CMSC131");
    expect(counted).toHaveLength(2);
    expect(counted.filter((c) => c.currentStatus === "counts")).toHaveLength(1);
    expect(counted.filter((c) => c.currentStatus === "unused")).toHaveLength(1);
  });

  it("attributes 'counts' to the passing retake, not the earlier failed attempt, when the program has no minimum grade", async () => {
    // majorA has no minGrade at all, unlike gradedMajor above -- this is the case the audit's own
    // meetsGrade bug missed (no minGrade meant "always counts"), so it must land on the retake here.
    const plan: Plan = {
      terms: [
        { name: "Fall 2026", courses: [{ id: "CMSC131", status: "completed", grade: "F" }] },
        { name: "Spring 2027", courses: [{ id: "CMSC131", status: "completed", grade: "B" }] },
      ],
    };
    const result = await whatIf(plan, catalog, [majorA], [majorA], []);
    const [first, second] = result.courses.filter((c) => c.id === "CMSC131");
    expect(first!.currentStatus).toBe("unused");
    expect(first!.currentPrograms).toEqual([]);
    expect(first!.earnsCredit).toBe(false);
    expect(second!.earnsCredit).toBe(true);
    expect(second!.currentStatus).toBe("counts");
    expect(second!.currentPrograms).toEqual(["a-major"]);
  });
});

describe("graduation clamp", () => {
  it("never estimates an earlier finish than the layers' own credit floor allows", async () => {
    // Only 8 credits in the whole plan (CMSC132 + CMSC250), already under the 9-credit university
    // floor. Dropping majorB would otherwise "free" all 8 of those credits (ceil(8/4) = 2 terms
    // earlier), but the plan has no room to lose any credits and stay at or above the floor, so
    // the clamp holds freed credits to 0: no earlier finish at all.
    const plan: Plan = {
      terms: [
        { name: "Fall 2026", courses: [{ id: "CMSC132" }] },
        { name: "Spring 2027", courses: [{ id: "CMSC250" }] },
      ],
    };
    const result = await whatIf(plan, catalog, [majorB], [], [universityish]);
    expect(result.graduation.deltaTerms).toBe(0);
  });

  it("never lets a failed/withdrawn attempt's credits loosen the clamp (they aren't credits earned)", async () => {
    // A failed CMSC131 (4cr) plus the 8 planned credits of majorB (CMSC132 + CMSC250). Dropping
    // majorB frees 8 credits, but only the real 8 planned credits are "in the plan" toward the
    // 9-credit floor -- the failed attempt's 4 credits must not count as headroom above the floor.
    const plan: Plan = {
      terms: [
        { name: "Fall 2026", courses: [{ id: "CMSC131", status: "completed", grade: "F" }] },
        { name: "Spring 2027", courses: [{ id: "CMSC132" }, { id: "CMSC250" }] },
      ],
    };
    const result = await whatIf(plan, catalog, [majorB], [], [universityish]);
    expect(result.graduation.deltaTerms).toBe(0);
  });
});

/** ownerPlan() without a course, for a scenario the full plan wouldn't create. */
const without = (plan: Plan, ...ids: string[]): Plan => ({
  ...plan,
  terms: plan.terms.map((t) => ({ ...t, courses: t.courses.filter((c) => !ids.includes(c.id)) })),
});

describe("real programs: the owner's Math (Applied) + CS plan", () => {
  it("dropping CS creates no newly-missing requirements and frees CS-only planned courses", async () => {
    const result = await whatIf(ownerPlan(), catalog, [mathMajorApplied, cmscMajor], [mathMajorApplied], []);
    expect(result.newlyMissing).toEqual([]);
    expect(result.freedCredits).toBeGreaterThan(0);
    // CMSC414 counts toward nothing but the CS major in this plan.
    const c = result.courses.find((x) => x.id === "CMSC414")!;
    expect(c.currentStatus).toBe("counts");
  });

  // The full owner plan happens to satisfy Math Traditional too (it shares almost all of Applied's
  // courses), so these two tests drop MATH411 -- Traditional's depth sequence and its "eight
  // 400-level courses" overlay both need it, with no spare 400-level course to replace it -- to
  // exercise a genuine shortfall.
  const shortOfTraditional = () => without(ownerPlan(), "MATH411");

  it("switching Math Applied to Math Traditional reports the traditional track's shortfall", async () => {
    const result = await whatIf(shortOfTraditional(), catalog, [mathMajorApplied, cmscMajor], [mathMajorTraditional, cmscMajor], []);
    expect(result.newlyMissing.map((g) => g.program.id)).toEqual(["math-major-traditional"]);
  });

  it("gives the proposed program's catalog year", async () => {
    const result = await whatIf(shortOfTraditional(), catalog, [mathMajorApplied], [mathMajorTraditional], []);
    expect(result.newlyMissing[0]!.program.catalogYear).toBe("2026-27");
  });
});

describe("adding or dropping a minor", () => {
  const minor: Program = {
    id: "x-minor",
    name: "X Minor",
    requirements: [
      { kind: "course", id: "hist200", name: "HIST200", options: ["HIST200"] },
      { kind: "course", id: "arth200", name: "ARTH200", options: ["ARTH200"] },
    ],
  };
  const plan = planWith("CMSC131", "HIST200", "ARTH200");

  it("dropping it frees its credits and lists the courses that now count toward nothing", async () => {
    const result = await whatIf(plan, catalog, [majorA, minor], [majorA], []);
    expect(result.freedCredits).toBe(6);
    expect(result.orphaned).toEqual(["HIST200", "ARTH200"]);
  });

  it("doesn't call a course orphaned when a layer still uses it as an elective", async () => {
    const result = await whatIf(plan, catalog, [majorA, minor], [majorA], [genEdish]);
    expect(result.orphaned).toEqual(["ARTH200"]);
  });

  it("adding it orphans nothing", async () => {
    const result = await whatIf(plan, catalog, [majorA], [majorA, minor], []);
    expect(result.orphaned).toEqual([]);
  });
});
