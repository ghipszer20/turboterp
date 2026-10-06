import { describe, expect, it } from "vitest";
import { buildCatalog } from "../src/catalog.ts";
import { checkPlan, type Plan, type PlanCourse, type PlanIssue } from "../src/check.ts";
import { SPRING_2027 } from "./helpers.ts";

const catalog = buildCatalog(SPRING_2027);

/** A plan from "Term: A B C" lines, every course planned. */
function plan(lines: Record<string, string[]>, priorCredit: Plan["priorCredit"] = []): Plan {
  return { priorCredit, terms: Object.entries(lines).map(([name, ids]) => ({ name, courses: ids.map((id) => ({ id })) })) };
}

const AP_CALC = [
  { id: "MATH140", credits: 4, source: "AP Calculus BC (5)" },
  { id: "MATH141", credits: 4, source: "AP Calculus BC (5)" },
];

const of = (issues: PlanIssue[], kind: PlanIssue["kind"]) => issues.filter((i) => i.kind === kind);
/** Errors only: MATH140's placement-test prerequisite, for one, is always a confirm item. */
const errors = (issues: PlanIssue[], kind: PlanIssue["kind"]) => of(issues, kind).filter((i) => i.severity === "error");

describe("prerequisites", () => {
  it("accepts a prerequisite finished in an earlier term", () => {
    const issues = checkPlan(plan({ "Fall 2026": ["MATH140"], "Spring 2027": ["MATH141"] }), catalog);
    expect(errors(issues, "prerequisite")).toEqual([]);
  });

  it("flags a prerequisite planned for a later term, naming where it is", () => {
    const issues = checkPlan(plan({ "Fall 2026": ["MATH141"], "Spring 2027": ["MATH140"] }), catalog);
    expect(errors(issues, "prerequisite")).toEqual([
      {
        kind: "prerequisite",
        severity: "error",
        term: "Fall 2026",
        course: "MATH141",
        message: "MATH141 (Fall 2026) needs MATH140 (C- or better) finished in an earlier term. MATH140 is planned for Spring 2027, which is too late.",
      },
    ]);
  });

  it("flags a prerequisite that isn't in the plan at all", () => {
    const [issue] = of(checkPlan(plan({ "Fall 2026": ["MATH141"] }), catalog), "prerequisite");
    expect(issue?.message).toBe("MATH141 (Fall 2026) needs MATH140 (C- or better) finished in an earlier term. MATH140 isn't in your plan.");
  });

  it("doesn't accept a prerequisite taken in the same term unless concurrent enrollment is allowed", () => {
    const same = checkPlan(plan({ "Fall 2026": ["MATH140", "MATH141"] }), catalog);
    expect(errors(same, "prerequisite").map((i) => i.message)).toEqual([
      "MATH141 (Fall 2026) needs MATH140 (C- or better) finished in an earlier term. MATH140 is in the same term; it has to come first.",
    ]);
    // PHYS161: "Must have completed or be concurrently enrolled in MATH141."
    const concurrent = checkPlan(plan({ "Fall 2026": ["MATH141", "PHYS161"] }, [AP_CALC[0]!]), catalog);
    expect(of(concurrent, "prerequisite")).toEqual([]);
  });

  it("counts prior credit (exam or dual enrollment) as finished before the first term", () => {
    expect(of(checkPlan(plan({ "Fall 2026": ["MATH240"] }, AP_CALC), catalog), "prerequisite")).toEqual([]);
  });

it("accepts any higher course in the department for 'MATH115 or higher' (CMSC125)", () => {
    expect(errors(checkPlan(plan({ "Fall 2026": ["MATH140"], "Spring 2027": ["CMSC125"] }), catalog), "prerequisite")).toEqual([]);
    const [issue] = of(checkPlan(plan({ "Fall 2026": ["CMSC125"] }), catalog), "prerequisite");
    expect(issue?.message).toMatch(/^CMSC125 \(Fall 2026\) needs MATH115 or a higher MATH course/);
  });

  it("accepts any 400-level STAT course for DATA110", () => {
    expect(errors(checkPlan(plan({ "Fall 2026": ["STAT400"], "Spring 2027": ["DATA110"] }), catalog), "prerequisite")).toEqual([]);
    const [issue] = errors(checkPlan(plan({ "Fall 2026": ["DATA110"] }), catalog), "prerequisite");
    expect(issue?.message).toBe(
      "DATA110 (Fall 2026) needs one of DATA100, STAT100, MATH135 or STAT400 or a higher STAT course finished in an earlier term. None of them is in your plan.",
    );
  });

  it("says when a qualifying course in the department is planned too late", () => {
    const [issue] = errors(checkPlan(plan({ "Fall 2026": ["DATA110"], "Spring 2027": ["STAT400"] }), catalog), "prerequisite");
    expect(issue?.message).toContain("STAT400 is planned for Spring 2027, which is too late.");
  });

  it("lists every missing piece and each alternative", () => {
    // CMSC351: minimum grade of C- in CMSC250 and CMSC216.
    const issues = checkPlan(plan({ "Fall 2026": ["CMSC351"], "Spring 2027": ["CMSC216"] }), catalog);
    expect(of(issues, "prerequisite").find((i) => i.course === "CMSC351")?.message).toBe(
      "CMSC351 (Fall 2026) needs CMSC250 (C- or better) and CMSC216 (C- or better) finished in an earlier term. CMSC250 isn't in your plan. CMSC216 is planned for Spring 2027, which is too late.",
    );
    // MATH401: 1 course with a minimum grade of C- from (MATH461, MATH240, MATH341).
    const [alt] = of(checkPlan(plan({ "Fall 2026": ["MATH401"] }), catalog), "prerequisite");
    expect(alt?.message).toBe(
      "MATH401 (Fall 2026) needs one of MATH461, MATH240 or MATH341 (C- or better) finished in an earlier term. None of them is in your plan.",
    );
  });

  it("flags a completed prerequisite whose grade is below the minimum", () => {
    const p: Plan = {
      terms: [
        { name: "Fall 2026", courses: [{ id: "MATH140", status: "completed", grade: "D" }] },
        { name: "Spring 2027", courses: [{ id: "MATH141" }] },
      ],
    };
    const [issue] = of(checkPlan(p, catalog), "prerequisite");
    expect(issue?.severity).toBe("error");
    expect(issue?.message).toBe(
      "MATH141 (Spring 2027) needs MATH140 (C- or better) finished in an earlier term. Your grade in MATH140 was D.",
    );
  });

  it("turns a requirement TurboTerp can't check (permission, placement) into a confirm item", () => {
    // CMSC420: C- in CMSC351 and CMSC330; and permission of CMNS-Computer Science department. Or …program.
    const p = plan({ "Fall 2026": ["CMSC351", "CMSC330"], "Spring 2027": ["CMSC420"] });
    const issues = of(checkPlan({ ...p, terms: p.terms.map((t) => ({ ...t })) }, catalog), "prerequisite").filter(
      (i) => i.course === "CMSC420",
    );
    expect(issues).toEqual([
      {
        kind: "prerequisite",
        severity: "confirm",
        term: "Spring 2027",
        course: "CMSC420",
        message:
          "CMSC420 (Spring 2027) also needs something TurboTerp can't check. Confirm it yourself: permission of CMNS-Computer Science department.",
        short: "Confirm: permission of CMNS-Computer Science department",
      },
    ]);
  });

  it("doesn't re-check courses already completed", () => {
    const p: Plan = { terms: [{ name: "Fall 2025", courses: [{ id: "MATH141", status: "completed", grade: "A" }] }] };
    expect(of(checkPlan(p, catalog), "prerequisite")).toEqual([]);
  });
});

describe("corequisites", () => {
  it("accepts a corequisite in the same term or an earlier one", () => {
    expect(of(checkPlan(plan({ "Fall 2026": ["CHEM131", "CHEM132"] }), catalog), "corequisite")).toEqual([]);
    expect(of(checkPlan(plan({ "Fall 2026": ["MATH140"], "Spring 2027": ["CMSC131"] }), catalog), "corequisite")).toEqual([]);
    expect(of(checkPlan(plan({ "Fall 2026": ["CMSC131"] }, AP_CALC), catalog), "corequisite")).toEqual([]);
  });

  it("flags a corequisite planned for a later term", () => {
    const issues = checkPlan(plan({ "Fall 2026": ["CMSC131"], "Spring 2027": ["MATH140"] }), catalog);
    expect(of(issues, "corequisite")).toEqual([
      {
        kind: "corequisite",
        severity: "error",
        term: "Fall 2026",
        course: "CMSC131",
        message: "CMSC131 (Fall 2026) must be taken with MATH140 in the same term, or after it. MATH140 is planned for Spring 2027, which is too late.",
      },
    ]);
  });

  it("flags a corequisite missing from the plan", () => {
    const [issue] = of(checkPlan(plan({ "Fall 2026": ["CHEM131"] }), catalog), "corequisite");
    expect(issue?.message).toBe("CHEM131 (Fall 2026) must be taken with CHEM132 in the same term, or after it. CHEM132 isn't in your plan.");
  });
});

describe("repeated courses", () => {
  // Owner ruling (PROJECT_MEMORY section 17): a course may be in the plan twice only when the
  // earlier attempt was failed; any other repeat is an error.
  const attempts = (...terms: [string, PlanCourse][]): Plan => ({
    terms: terms.map(([name, course]) => ({ name, courses: [course] })),
  });
  const failed = { id: "CMSC131", status: "completed", grade: "F" } as const;
  const planned = { id: "CMSC131" };

  it("rejects a course planned twice when it isn't repeatable and wasn't failed or withdrawn", () => {
    const issues = checkPlan(plan({ "Fall 2026": ["CMSC131"], "Spring 2027": ["CMSC131"] }), catalog);
    expect(of(issues, "repeat")).toEqual([
      {
        kind: "repeat",
        severity: "error",
        term: "Spring 2027",
        course: "CMSC131",
        message: "CMSC131 is in your plan twice (Fall 2026 and Spring 2027). You can only retake a course you failed or withdrew from.",
      },
    ]);
  });

  it("allows a retake of a course failed (F) in an earlier term", () => {
    const issues = checkPlan(attempts(["Fall 2026", failed], ["Spring 2027", planned]), catalog);
    expect(of(issues, "repeat")).toEqual([]);
  });

  it("allows a third attempt after two failed ones", () => {
    const issues = checkPlan(attempts(["Fall 2026", failed], ["Spring 2027", failed], ["Fall 2027", planned]), catalog);
    expect(of(issues, "repeat")).toEqual([]);
  });

  it("rejects a retake of a course passed in an earlier term", () => {
    const issues = checkPlan(attempts(["Fall 2026", { ...failed, grade: "D" }], ["Spring 2027", planned]), catalog);
    expect(errors(issues, "repeat").map((i) => i.message)).toEqual([
      "CMSC131 is in your plan twice (Fall 2026 and Spring 2027). You can only retake a course you failed or withdrew from.",
    ]);
  });

  // Owner ruling: "a course can be retaken after a W." A withdrawal now excuses a retake the same
  // way a failing grade does.
  it("allows a retake of a course withdrawn from (W) in an earlier term", () => {
    const issues = checkPlan(attempts(["Fall 2026", { ...failed, grade: "W" }], ["Spring 2027", planned]), catalog);
    expect(of(issues, "repeat")).toEqual([]);
  });

  it("allows a third attempt after a failed attempt then a withdrawal", () => {
    const issues = checkPlan(
      attempts(["Fall 2026", failed], ["Spring 2027", { ...failed, grade: "W" }], ["Fall 2027", planned]),
      catalog,
    );
    expect(of(issues, "repeat")).toEqual([]);
  });

  it("rejects a second planned retake after one failed attempt", () => {
    const issues = checkPlan(attempts(["Fall 2026", failed], ["Spring 2027", planned], ["Fall 2027", planned]), catalog);
    expect(errors(issues, "repeat")).toMatchObject([
      {
        term: "Fall 2027",
        message: "CMSC131 is in your plan 3 times (Fall 2026, Spring 2027 and Fall 2027). You can only retake a course you failed or withdrew from.",
      },
    ]);
  });

  it("rejects a second planned retake after one withdrawal, since a later repeat still needs its own failed or withdrawn attempt", () => {
    const issues = checkPlan(
      attempts(["Fall 2026", { ...failed, grade: "W" }], ["Spring 2027", planned], ["Fall 2027", planned]),
      catalog,
    );
    expect(errors(issues, "repeat")).toMatchObject([
      {
        term: "Fall 2027",
        message: "CMSC131 is in your plan 3 times (Fall 2026, Spring 2027 and Fall 2027). You can only retake a course you failed or withdrew from.",
      },
    ]);
  });

  it("never asks the student to check a repeat with the department", () => {
    const issues = checkPlan(plan({ "Fall 2026": ["HIST200"], "Spring 2027": ["HIST200"] }), catalog);
    expect(of(issues, "repeat").map((i) => i.severity)).toEqual(["error"]);
  });

  it("accepts a repeatable course within its credit limit", () => {
    // ENGL388T: 3 credits, repeatable to 12.
    const issues = checkPlan(plan({ "Fall 2026": ["ENGL388T"], "Spring 2027": ["ENGL388T"], "Fall 2027": ["ENGL388T"] }), catalog);
    expect(of(issues, "repeat")).toEqual([]);
  });

  it("flags a repeatable course past its credit limit", () => {
    // ECON418A: 3 credits, a maximum of 6.
    const issues = checkPlan(plan({ "Fall 2026": ["ECON418A"], "Spring 2027": ["ECON418A"], "Fall 2027": ["ECON418A"] }), catalog);
    expect(of(issues, "repeat")).toEqual([
      {
        kind: "repeat",
        severity: "error",
        term: "Fall 2027",
        course: "ECON418A",
        message: "ECON418A can count for at most 6 credits, but your plan has 9 (Fall 2026, Spring 2027 and Fall 2027).",
      },
    ]);
  });

  it("flags a planned course the student already has credit for", () => {
    const issues = checkPlan(plan({ "Fall 2026": ["MATH141"] }, AP_CALC), catalog);
    expect(of(issues, "repeat")).toEqual([
      {
        kind: "repeat",
        severity: "warning",
        term: "Fall 2026",
        course: "MATH141",
        message: "You already have credit for MATH141 (AP Calculus BC (5)). Taking it again counts only once, so these credits won't add to your total.",
      },
    ]);
  });
});

describe("credit load", () => {
  it("flags a term over the credit cap", () => {
    const heavy = plan({ "Fall 2026": ["CMSC131", "CMSC132", "MATH240", "MATH241", "HIST200", "PHIL140"] }, AP_CALC);
    expect(of(checkPlan(heavy, catalog), "credit-load")).toEqual([
      {
        kind: "credit-load",
        severity: "error",
        term: "Fall 2026",
        message: "Fall 2026 has 22 credits, over the 20-credit limit for a fall term. Going over 20 credits needs your dean's approval.",
      },
    ]);
  });

  it("takes the cap as an option, per season", () => {
    const p = plan({ "Fall 2026": ["CMSC131", "CMSC132", "MATH240", "HIST200"], "Winter 2027": ["PHIL140", "ARTH200"] }, AP_CALC);
    expect(of(checkPlan(p, catalog), "credit-load").map((i) => i.term)).toEqual(["Winter 2027"]);
    expect(of(checkPlan(p, catalog, { maxCredits: { Fall: 12, Winter: 6 } }), "credit-load").map((i) => i.term)).toEqual(["Fall 2026"]);
  });

  it("uses a college's own, lower cap and names it in the message", () => {
    const heavy = plan({ "Fall 2026": ["CMSC131", "CMSC132", "MATH240", "MATH241", "HIST200", "PHIL140"] }, AP_CALC); // 22 credits
    expect(of(checkPlan(heavy, catalog, { college: "CMNS" }), "credit-load")).toEqual([
      {
        kind: "credit-load",
        severity: "error",
        term: "Fall 2026",
        message:
          "Fall 2026 has 22 credits, over the 17-credit fall limit for Computer, Mathematical, and Natural Sciences students. Going over 17 credits needs your dean's approval.",
      },
    ]);
  });

  it("an explicit maxCredits override still wins over a college's cap", () => {
    // 19 credits: over CMNS's 17-credit cap, but under the campus default (20).
    const p = plan({ "Fall 2026": ["CMSC131", "CMSC132", "MATH240", "MATH241", "HIST200"] }, AP_CALC);
    expect(of(checkPlan(p, catalog), "credit-load")).toEqual([]);
    expect(of(checkPlan(p, catalog, { college: "CMNS" }), "credit-load").map((i) => i.term)).toEqual(["Fall 2026"]);
    expect(of(checkPlan(p, catalog, { college: "CMNS", maxCredits: { Fall: 25 } }), "credit-load")).toEqual([]);
  });

  it("notes a fall or spring term under 12 credits, as information only", () => {
    const issues = checkPlan(plan({ "Fall 2026": ["CMSC131", "HIST200"], "Summer 2027": ["PHIL140"] }, AP_CALC), catalog);
    expect(of(issues, "light-load")).toEqual([
      {
        kind: "light-load",
        severity: "info",
        term: "Fall 2026",
        message: "Fall 2026 has 7 credits. Full-time students take at least 12 in a fall or spring term; fewer can affect financial aid, housing and your graduation date.",
      },
    ]);
  });

  it("uses a planned course's own credits when given, and completed courses count toward the load", () => {
    const p: Plan = {
      terms: [
        { name: "Fall 2026", courses: [{ id: "HIST200", status: "completed", grade: "A" }, { id: "ENGL388T", credits: 9 }] },
      ],
    };
    expect(of(checkPlan(p, catalog), "light-load")).toEqual([]);
  });
});

describe("unknown courses", () => {
  it("flags a course id the course data doesn't have, and skips its other checks", () => {
    const issues = checkPlan(plan({ "Fall 2026": ["CMSC999", "HIST200", "PHIL140", "ARTH200", "AAAS100"] }), catalog);
    expect(of(issues, "unknown-course")).toEqual([
      {
        kind: "unknown-course",
        severity: "warning",
        term: "Fall 2026",
        course: "CMSC999",
        message:
          "CMSC999 isn't in the course data TurboTerp has. Check the course number; if it's right, TurboTerp can't check its prerequisites or credits yet.",
      },
    ]);
  });

  it("doesn't flag prior credit with no UMD course (e.g. lower-level elective credit)", () => {
    const issues = checkPlan(plan({ "Fall 2026": ["HIST200"] }, [{ id: "L1:AP Computer Science A", credits: 4 }]), catalog);
    expect(of(issues, "unknown-course")).toEqual([]);
  });
});
