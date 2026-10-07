// Positive, info-only notices: the plan completes (or nearly completes) another major, or
// qualifies for a dual degree. Uses the real 2026–27 Math (Applied) and CS program encodings.

import type { Program } from "@turboterp/audit";
import { describe, expect, it } from "vitest";
import { cmscMajor } from "../../audit/programs/cmsc-major-2026-27.ts";
import { mathMajorApplied } from "../../audit/programs/math-major-applied-2026-27.ts";
import { buildCatalog } from "../src/catalog.ts";
import type { Plan } from "../src/check.ts";
import { programNotices, type ProgramNotice } from "../src/notices.ts";
import { ownerPlan } from "./fixtures/owner-plan.ts";
import { SPRING_2027 } from "./helpers.ts";

const catalog = buildCatalog(SPRING_2027);
const of = (notices: ProgramNotice[], kind: ProgramNotice["kind"]) => notices.filter((n) => n.kind === kind);
const without = (plan: Plan, ...ids: string[]): Plan => ({
  ...plan,
  terms: plan.terms.map((t) => ({ ...t, courses: t.courses.filter((c) => !ids.includes(c.id)) })),
});

describe("double major", () => {
  it("tells a Math student their plan also completes the CS major, with the declaration deadline", async () => {
    const notices = await programNotices(ownerPlan(), catalog, [
      { program: mathMajorApplied, declared: true },
      { program: cmscMajor, declared: false },
    ]);
    expect(of(notices, "double-major")).toEqual([
      {
        kind: "double-major",
        severity: "info",
        programs: ["math-major-applied", "cmsc-major"],
        declared: false,
        message:
          "Your plan also completes the Computer Science Major. You're eligible to declare it as a double major. A double major has to be declared at least one full academic year before you graduate: by the end of Spring 2029, since your plan ends in Spring 2030.",
      },
    ]);
  });

  it("confirms a declared double major", async () => {
    const notices = await programNotices(ownerPlan(), catalog, [
      { program: mathMajorApplied, declared: true },
      { program: cmscMajor, declared: true },
    ]);
    expect(of(notices, "double-major").map((n) => n.message)).toEqual([
      "Your plan completes both the Mathematics Major (Applied Mathematics Track) and the Computer Science Major: a double major.",
    ]);
  });

  it("says nothing about a major the plan doesn't come close to", async () => {
    // AMSC460 now counts as CMSC460 (cross-listed), so the plan needs one more course dropped to be out of reach.
    const plan = without(ownerPlan(), "CMSC330", "CMSC351", "CMSC420", "CMSC414");
    const notices = await programNotices(plan, catalog, [
      { program: mathMajorApplied, declared: true },
      { program: cmscMajor, declared: false },
    ]);
    expect(notices).toEqual([]);
  });
});

describe("close to another major", () => {
  it("names the courses still needed when the plan is one or two courses short", async () => {
    const candidates = [
      { program: mathMajorApplied, declared: true },
      { program: cmscMajor, declared: false },
    ];
    const one = await programNotices(without(ownerPlan(), "CMSC351"), catalog, candidates);
    expect(one).toEqual([
      {
        kind: "close-to-major",
        severity: "info",
        programs: ["cmsc-major"],
        coursesShort: 1,
        missing: ["CMSC351"],
        message: "You're 1 course from the Computer Science Major: CMSC351.",
      },
    ]);
    const two = await programNotices(without(ownerPlan(), "CMSC330", "CMSC351"), catalog, candidates);
    expect(two.map((n) => n.message)).toEqual(["You're 2 courses from the Computer Science Major: CMSC330 and CMSC351."]);
  });

  // A course set with a filter member, like Math Applied's Sequence Twelve: AOSC200, AOSC201 and
  // any two 400-level AOSC courses.
  describe("a course set with an 'any N from a filter' member", () => {
    const sequence: Program = {
      id: "z-major",
      name: "Z Major",
      requirements: [
        {
          kind: "sets",
          id: "twelve",
          name: "Sequence Twelve",
          options: [["AOSC200", "AOSC201", { count: 2, from: { departments: ["AOSC"], minNumber: 400, maxNumber: 499 } }]],
        },
      ],
    };
    const declared: Program = { id: "home", name: "Home Major", requirements: [] };
    const planWith = (...ids: string[]): Plan => ({ terms: [{ name: "Fall 2026", courses: ids.map((id) => ({ id, credits: 3 })) }] });
    const notices = (plan: Plan) =>
      programNotices(plan, catalog, [
        { program: declared, declared: true },
        { program: sequence, declared: false },
      ]).then((n) => of(n, "close-to-major"));

    it("names a missing fixed course", async () => {
      expect((await notices(planWith("AOSC200", "AOSC431", "AOSC432"))).map((n) => n.message)).toEqual([
        "You're 1 course from the Z Major: AOSC201.",
      ]);
    });

    it("counts a filter member that's one course short", async () => {
      const [notice] = await notices(planWith("AOSC200", "AOSC201", "AOSC431"));
      expect(notice).toMatchObject({ coursesShort: 1, missing: ["1 more for Sequence Twelve"] });
    });

    it("gives no notice once the set is complete", async () => {
      expect(await notices(planWith("AOSC200", "AOSC201", "AOSC431", "AOSC432"))).toEqual([]);
    });

    /** Like planWith, but every course is completed with the given grade (an F/W attempt earns no credit). */
    const planGraded = (courses: [string, string][]): Plan => ({
      terms: [{ name: "Fall 2026", courses: courses.map(([id, grade]) => ({ id, credits: 3, status: "completed" as const, grade })) }],
    });

    it("still names a fixed course missing when its only attempt is graded F", async () => {
      const plan = planGraded([
        ["AOSC200", "F"],
        ["AOSC201", "B"],
        ["AOSC431", "B"],
        ["AOSC432", "B"],
      ]);
      expect((await notices(plan)).map((n) => n.message)).toEqual(["You're 1 course from the Z Major: AOSC200."]);
    });

    it("doesn't let a failed filter-member attempt fill the filter's count", async () => {
      const plan = planGraded([
        ["AOSC200", "B"],
        ["AOSC201", "B"],
        ["AOSC431", "B"],
        ["AOSC432", "F"],
      ]);
      const [notice] = await notices(plan);
      expect(notice).toMatchObject({ coursesShort: 1, missing: ["1 more for Sequence Twelve"] });
    });
  });
});

describe("dual degree", () => {
  // Two small made-up majors over real courses, 24 and 22 credits, sharing CMSC131 (4 credits):
  // 20 credits only in X and 18 only in Y.
  const mathish: Program = {
    id: "x-major",
    name: "X Major",
    requirements: ["MATH240", "MATH241", "MATH246", "MATH310", "MATH401", "MATH410", "CMSC131"].map((id) => ({
      kind: "course" as const,
      id,
      name: id,
      options: [id],
    })),
  };
  const csish: Program = {
    id: "y-major",
    name: "Y Major",
    requirements: ["CMSC131", "CMSC132", "CMSC216", "CMSC250", "CMSC330", "CMSC351"].map((id) => ({
      kind: "course" as const,
      id,
      name: id,
      options: [id],
    })),
  };
  const candidates = [
    { program: mathish, declared: true },
    { program: csish, declared: true },
  ];
  /** Both majors' courses (42 credits) plus transfer elective credit to reach `total`. */
  const planWith = (total: number): Plan => ({
    priorCredit: [{ id: "L1:Transfer electives", credits: total - 42, source: "Transfer credit" }],
    terms: [
      { name: "Fall 2026", courses: ["MATH240", "CMSC131", "MATH246", "CMSC250"].map((id) => ({ id })) },
      { name: "Spring 2027", courses: ["MATH241", "CMSC132", "MATH310"].map((id) => ({ id })) },
      { name: "Fall 2027", courses: ["MATH401", "MATH410", "CMSC216", "CMSC330", "CMSC351"].map((id) => ({ id })) },
    ],
  });

  it("says the plan qualifies at 150 credits with 18 of each degree's credits used only there", async () => {
    const notices = await programNotices(planWith(150), catalog, candidates);
    expect(of(notices, "dual-degree")).toEqual([
      {
        kind: "dual-degree",
        severity: "info",
        programs: ["x-major", "y-major"],
        eligible: true,
        totalCredits: 150,
        creditsShort: 0,
        uniqueCredits: { "x-major": 20, "y-major": 18 },
        message:
          "Your plan qualifies for a dual degree (two degrees) in the X Major and the Y Major: 150 credits in all, and at least 18 credits in each degree that don't count toward the other. A dual degree has to be declared at least one full academic year before you graduate: by the end of Fall 2026, since your plan ends in Fall 2027.",
      },
    ]);
  });

  it("says how many more credits a dual degree needs", async () => {
    const [notice] = of(await programNotices(planWith(140), catalog, candidates), "dual-degree");
    expect(notice).toMatchObject({ eligible: false, totalCredits: 140, creditsShort: 10 });
    expect(notice?.message).toBe(
      "Your plan completes both the X Major and the Y Major. A dual degree (two degrees) also needs 150 credits in all: 10 more credits to reach 150.",
    );
  });

  it("doesn't let a failed/withdrawn attempt's credits count toward the dual-degree total", async () => {
    // Same 140-credit plan as above, plus a 10-credit course graded F: it must not push the total
    // to 150 (or shrink creditsShort), since a failed attempt earns no credit.
    const plan = planWith(140);
    plan.terms.push({ name: "Winter 2028", courses: [{ id: "CMSC420", status: "completed", grade: "F", credits: 10 }] });
    const [notice] = of(await programNotices(plan, catalog, candidates), "dual-degree");
    expect(notice).toMatchObject({ eligible: false, totalCredits: 140, creditsShort: 10 });
  });

  it("counts unique credits from the assignment that shares the fewest courses", async () => {
    // Either major can use any of the six 400-level courses; split three and three, nothing is shared.
    const upper = (id: string, name: string): Program => ({
      id,
      name,
      requirements: [{ kind: "choose", id: "upper", name: "9 credits of 400-level math", credits: 9, from: { departments: ["MATH", "STAT", "AMSC"], minNumber: 400, maxNumber: 499 } }],
    });
    const plan: Plan = {
      terms: [{ name: "Fall 2026", courses: ["MATH401", "MATH410", "MATH411", "MATH420", "STAT401", "STAT410"].map((id) => ({ id })) }],
    };
    const [notice] = of(
      await programNotices(plan, catalog, [
        { program: upper("p", "P Major"), declared: true },
        { program: upper("q", "Q Major"), declared: false },
      ]),
      "dual-degree",
    );
    expect(notice).toMatchObject({ uniqueCredits: { p: 9, q: 9 } });
  });

  describe("chosen degree mode", () => {
    it("drops the double-major and (non-eligible) dual-degree notices for a chosen pair when double degree is chosen", async () => {
      const notices = await programNotices(planWith(140), catalog, candidates, "double-degree");
      expect(of(notices, "double-major")).toEqual([]);
      expect(of(notices, "dual-degree")).toEqual([]);
    });

    it("also drops the positive (eligible) dual-degree notice for a chosen pair when double degree is chosen", async () => {
      // checkDegrees (a different, degree-grouped solve) owns the real double-degree result; this
      // notice's own "eligible" flag can disagree with it, so it's dropped for a chosen pair rather
      // than risk contradicting the Checks panel.
      const notices = await programNotices(planWith(150), catalog, candidates, "double-degree");
      expect(of(notices, "dual-degree")).toEqual([]);
    });

    it("keeps both notices for a chosen pair when double major is chosen (unchanged)", async () => {
      const notices = await programNotices(planWith(140), catalog, candidates, "double-major");
      expect(of(notices, "double-major")).not.toEqual([]);
      expect(of(notices, "dual-degree")).not.toEqual([]);
    });

    it("behaves the same as passing no mode at all", async () => {
      const withMode = await programNotices(planWith(140), catalog, candidates, "double-major");
      const withoutMode = await programNotices(planWith(140), catalog, candidates);
      expect(withMode).toEqual(withoutMode);
    });

    it("leaves an undeclared candidate's notices unchanged in double-degree mode", async () => {
      const mixed = [
        { program: mathish, declared: true },
        { program: csish, declared: false },
      ];
      const withMode = await programNotices(planWith(140), catalog, mixed, "double-degree");
      const withoutMode = await programNotices(planWith(140), catalog, mixed);
      expect(withMode).toEqual(withoutMode);
    });
  });
});
