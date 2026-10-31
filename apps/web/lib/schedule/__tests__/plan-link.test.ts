import { describe, expect, it } from "vitest";
import { newPlan, planReducer, type AdvisorPlan } from "@turboterp/app-core/plan-state";
import {
  applyQueryCourses,
  builderCourses,
  describePlanDiff,
  otherPlannedTerms,
  planCourseDiff,
  planCourseIds,
  planTermName,
} from "../plan-link";

const base = (): AdvisorPlan => newPlan({ programs: ["cmsc-major"], catalogYear: "2026-27", startTerm: "Fall 2026" });

describe("planTermName", () => {
  it("maps the schedule builder's Testudo term id to the plan's term name", () => {
    expect(planTermName("202701")).toBe("Spring 2027");
  });

  it("is null for an id the plan's term names can't express", () => {
    expect(planTermName("not-a-term")).toBeNull();
  });
});

describe("planCourseIds", () => {
  it("gives the plan term's course ids", () => {
    const plan = planReducer(base(), { type: "add-course", term: "Spring 2027", id: "CMSC132" });
    expect(planCourseIds(plan, "Spring 2027")).toEqual(["CMSC132"]);
  });

  it("is empty when the plan has no such term yet", () => {
    expect(planCourseIds(base(), "Fall 2040")).toEqual([]);
  });
});

describe("otherPlannedTerms", () => {
  it("lists the other terms (sorted) that also have the course", () => {
    let plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC216" });
    plan = planReducer(plan, { type: "add-course", term: "Fall 2027", id: "CMSC216" });
    plan = planReducer(plan, { type: "add-course", term: "Spring 2027", id: "CMSC216" });
    expect(otherPlannedTerms(plan, "Spring 2027", "CMSC216")).toEqual(["Fall 2026", "Fall 2027"]);
  });

  it("excludes the term being asked about, even if it has the course", () => {
    const plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC216" });
    expect(otherPlannedTerms(plan, "Fall 2026", "CMSC216")).toEqual([]);
  });

  it("is empty when no other term has the course", () => {
    const plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC216" });
    expect(otherPlannedTerms(plan, "Spring 2027", "MATH140")).toEqual([]);
  });
});

describe("applyQueryCourses", () => {
  it("replaces the list for a standalone builder (no plan)", () => {
    expect(applyQueryCourses(["CMSC131"], ["STAT400"], false)).toEqual(["STAT400"]);
  });

  it("only adds to a plan-linked term, so a stale link can never delete a plan's courses", () => {
    expect(applyQueryCourses(["CMSC131", "MATH140"], ["STAT400"], true)).toEqual(["CMSC131", "MATH140", "STAT400"]);
  });

  it("doesn't duplicate a course the link already asks for", () => {
    expect(applyQueryCourses(["CMSC131"], ["CMSC131"], true)).toEqual(["CMSC131"]);
  });
});

// Owner ruling: the schedule builder "should give you the option to update the plan, but you'd
// have to confirm that. shouldn't be automatic." The builder keeps its own course list (`own`,
// null until the student first diverges from the plan); it "follows" the plan -- so the plan's
// own edits show up here for free -- whenever there's no override yet, or the override happens
// to match the plan's courses again (same set, any order).
describe("builderCourses", () => {
  it("follows the plan when there's no local override yet", () => {
    expect(builderCourses(null, ["CMSC131", "MATH140"])).toEqual(["CMSC131", "MATH140"]);
  });

  it("follows an empty plan term when there's no override", () => {
    expect(builderCourses(null, [])).toEqual([]);
  });

  it("uses the override once it differs from the plan", () => {
    expect(builderCourses(["CMSC131", "CMSC216"], ["CMSC131", "MATH140"])).toEqual(["CMSC131", "CMSC216"]);
  });

  it("resumes following once the override matches the plan again, regardless of order", () => {
    expect(builderCourses(["MATH140", "CMSC131"], ["CMSC131", "MATH140"])).toEqual(["CMSC131", "MATH140"]);
  });
});

describe("planCourseDiff", () => {
  it("is null while following (no override yet)", () => {
    expect(planCourseDiff(null, ["CMSC131"])).toBeNull();
  });

  it("is null when there's no plan term and no override", () => {
    expect(planCourseDiff(null, [])).toBeNull();
  });

  it("is null when the override matches the plan as a set, regardless of order", () => {
    expect(planCourseDiff(["MATH140", "CMSC131"], ["CMSC131", "MATH140"])).toBeNull();
  });

  it("lists an added course", () => {
    expect(planCourseDiff(["CMSC131", "CMSC216"], ["CMSC131"])).toEqual({ adds: ["CMSC216"], removes: [] });
  });

  it("lists a removed course", () => {
    expect(planCourseDiff(["CMSC131"], ["CMSC131", "PHIL140"])).toEqual({ adds: [], removes: ["PHIL140"] });
  });

  it("lists both an add and a remove", () => {
    expect(planCourseDiff(["CMSC131", "CMSC216"], ["CMSC131", "PHIL140"])).toEqual({
      adds: ["CMSC216"],
      removes: ["PHIL140"],
    });
  });

  it("treats emptying the override as removing everything the plan has", () => {
    expect(planCourseDiff([], ["CMSC131", "PHIL140"])).toEqual({ adds: [], removes: ["CMSC131", "PHIL140"] });
  });
});

describe("describePlanDiff", () => {
  it("describes only an add", () => {
    expect(describePlanDiff({ adds: ["CMSC216"], removes: [] })).toBe("Adds CMSC216");
  });

  it("describes only a remove", () => {
    expect(describePlanDiff({ adds: [], removes: ["PHIL140"] })).toBe("Removes PHIL140");
  });

  it("describes both, adds before removes", () => {
    expect(describePlanDiff({ adds: ["CMSC216"], removes: ["PHIL140"] })).toBe("Adds CMSC216 · Removes PHIL140");
  });

  it("lists multiple ids with commas", () => {
    expect(describePlanDiff({ adds: ["CMSC216", "STAT400"], removes: [] })).toBe("Adds CMSC216, STAT400");
  });
});
