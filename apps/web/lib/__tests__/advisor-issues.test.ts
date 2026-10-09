import type { PlanIssue } from "@turboterp/plan/check";
import { describe, expect, it } from "vitest";
import { cardNote, courseKey, groupIssues, planTips, SEVERITY } from "../advisor/issues";

const issue = (p: Partial<PlanIssue>): PlanIssue => ({ kind: "prerequisite", severity: "error", term: "Fall 2026", message: "m", ...p });

describe("groupIssues", () => {
  const issues = [
    issue({ severity: "info", kind: "light-load", term: "Spring 2027", message: "light" }),
    issue({ severity: "confirm", course: "ENGL394", term: "Spring 2029", message: "fsaw" }),
    issue({ severity: "error", course: "CMSC351", term: "Fall 2026", message: "needs 216" }),
    issue({ severity: "warning", kind: "repeat", course: "MATH140", term: "Fall 2026", message: "already have" }),
    issue({ severity: "error", kind: "credit-load", term: "Fall 2026", message: "too many" }),
    issue({ severity: "error", course: "CMSC351", term: "Fall 2026", kind: "corequisite", message: "coreq" }),
  ];
  const g = groupIssues(issues, ["Fall 2026", "Spring 2027", "Spring 2029"]);

  it("puts course issues on the course in its term", () => {
    expect(g.byCourse.get(courseKey("Fall 2026", "CMSC351"))!.map((i) => i.message)).toEqual(["needs 216", "coreq"]);
    expect(g.byCourse.get(courseKey("Fall 2026", "MATH140"))!.map((i) => i.message)).toEqual(["already have"]);
  });

  it("puts whole-term issues (credit load) on the term", () => {
    expect(g.byTerm.get("Fall 2026")!.map((i) => i.message)).toEqual(["too many"]);
    expect(g.byTerm.get("Spring 2027")!.map((i) => i.message)).toEqual(["light"]);
  });

  it("lists everything by severity, then by term order", () => {
    expect(g.summary.map((i) => i.message)).toEqual(["needs 216", "too many", "coreq", "already have", "fsaw", "light"]);
  });

  it("keeps only what needs action (errors and warnings) for the Checks list", () => {
    expect(g.checks.map((i) => i.message)).toEqual(["needs 216", "too many", "coreq", "already have"]);
  });

  it("counts each severity", () => {
    expect(g.counts).toEqual({ error: 3, warning: 1, confirm: 1, info: 1 });
  });

  it("gives the worst severity per course and per term", () => {
    expect(g.worstByCourse.get(courseKey("Fall 2026", "CMSC351"))).toBe("error");
    expect(g.worstByTerm.get("Spring 2027")).toBe("info");
    expect(g.worstByTerm.get("Fall 2026")).toBe("error");
  });
});

describe("SEVERITY", () => {
  it("names each severity in plain words", () => {
    expect(SEVERITY.error.label).toBe("Must fix");
    expect(SEVERITY.warning.label).toBe("Check");
    expect(SEVERITY.confirm.label).toBe("Confirm yourself");
    expect(SEVERITY.info.label).toBe("Good to know");
  });
});

describe("cardNote", () => {
  it("uses an issue's short form on the course card", () => {
    expect(cardNote([issue({ severity: "confirm", message: "long sentence", short: "Confirm: permission of the department" })])).toBe(
      "Confirm: permission of the department",
    );
  });

  it("falls back to the message, and counts the rest", () => {
    expect(cardNote([issue({ message: "needs 216" }), issue({ message: "coreq" })])).toBe("needs 216 (+1 more)");
  });

  it("shows the most severe issue first, matching the card's color", () => {
    const confirm = issue({ severity: "confirm", message: "long", short: "Confirm: math eligibility" });
    const warning = issue({ severity: "warning", kind: "lab-missing", message: "lab", short: "Usually taken with BSCI180" });
    expect(cardNote([confirm, warning])).toBe("Usually taken with BSCI180 (+1 more)");
  });
});

describe("planTips", () => {
  const light = (term: string) => issue({ severity: "info", kind: "light-load", term, message: `${term} is light` });

  it("gives the full-time rule once, however many terms are light", () => {
    expect(planTips([light("Fall 2027"), light("Spring 2028")], [])).toEqual([
      "Full-time is at least 12 credits in a fall or spring term. Fewer can affect financial aid, housing and your graduation date.",
    ]);
  });

  it("adds other notes (double major, dual degree) after it, without repeats", () => {
    expect(planTips([light("Fall 2027")], ["Declare your double major by Spring 2029.", "Declare your double major by Spring 2029."])).toEqual([
      "Full-time is at least 12 credits in a fall or spring term. Fewer can affect financial aid, housing and your graduation date.",
      "Declare your double major by Spring 2029.",
    ]);
  });

  it("has nothing to say about a plan with no light term and no notes", () => {
    expect(planTips([issue({})], [])).toEqual([]);
  });
});
