import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS } from "../filters";
import { affectsPlan, emptySaved, lastSavedPlan, parseSaved, removePlan, savePlan, serializeSaved, setOwnSection, withCourses } from "../saved";

describe("removing saved plans (last one only)", () => {
  const base = withCourses(emptySaved("202701"), ["CMSC131"]);
  const abc = savePlan(savePlan(savePlan(base, "A", { CMSC131: "0101" }), "B", { CMSC131: "0201" }), "C", { CMSC131: "0301" });

  it("finds the highest lettered plan that has picks", () => {
    expect(lastSavedPlan(emptySaved("202701"))).toBeNull();
    expect(lastSavedPlan(savePlan(base, "A", { CMSC131: "0101" }))).toBe("A");
    expect(lastSavedPlan(abc)).toBe("C");
    expect(lastSavedPlan(savePlan(base, "B", {}))).toBeNull();
  });

  it("honours a caller's own notion of 'has picks'", () => {
    expect(lastSavedPlan(abc, (p) => p !== "C")).toBe("B");
  });

  it("removes the last plan and nothing else", () => {
    const next = removePlan(abc, "C");
    expect(next.plans).toEqual({ A: { CMSC131: "0101" }, B: { CMSC131: "0201" } });
    expect(next.own).toEqual(abc.own);
  });

  it("uses the caller's notion of 'has picks', so the plan the x is on can be removed", () => {
    // Plan C only has picks for a dropped course: the page shows B as last, so B must be removable.
    const next = removePlan(abc, "B", (p) => p !== "C");
    expect(Object.keys(next.plans).sort()).toEqual(["A", "C"]);
  });

  it("refuses to remove an earlier plan or an empty one", () => {
    expect(removePlan(abc, "B")).toBe(abc);
    expect(removePlan(abc, "A")).toBe(abc);
    expect(removePlan(emptySaved("202701"), "A").plans).toEqual({});
  });
});

describe("saved schedule (per device)", () => {
  it("starts empty for the term, following the plan (no local course list yet)", () => {
    expect(emptySaved("202701")).toEqual({
      v: 1,
      term: "202701",
      courses: null,
      filters: DEFAULT_FILTERS,
      plans: {},
      own: {},
    });
  });

  it("round-trips through storage", () => {
    const s = savePlan(withCourses(emptySaved("202701"), ["CMSC351", "STAT400"]), "A", {
      CMSC351: "0101",
      STAT400: "0111",
    });
    expect(parseSaved(serializeSaved(s), "202701")).toEqual(s);
  });

  it("starts fresh when storage is empty, corrupt, from another version or another term", () => {
    expect(parseSaved(null, "202701")).toEqual(emptySaved("202701"));
    expect(parseSaved("{not json", "202701")).toEqual(emptySaved("202701"));
    expect(parseSaved(JSON.stringify({ ...emptySaved("202701"), v: 99 }), "202701")).toEqual(emptySaved("202701"));
    const old = withCourses(emptySaved("202608"), ["CMSC131"]);
    expect(parseSaved(serializeSaved(old), "202701")).toEqual(emptySaved("202701"));
  });

  it("round-trips a builder that's still following the plan (courses: null)", () => {
    expect(parseSaved(serializeSaved(emptySaved("202701")), "202701")).toEqual(emptySaved("202701"));
  });

  it("treats a course list once it's set as the student's own override, even an emptied one", () => {
    const overridden = withCourses(emptySaved("202701"), []);
    expect(overridden.courses).toEqual([]);
    expect(parseSaved(serializeSaved(overridden), "202701")).toEqual(overridden);
  });

  it("drops a removed course's sections from every plan and from Build my own", () => {
    let s = withCourses(emptySaved("202701"), ["CMSC351", "STAT400"]);
    s = savePlan(s, "A", { CMSC351: "0101", STAT400: "0111" });
    s = setOwnSection(s, "STAT400", "0211");
    s = withCourses(s, ["CMSC351"]);
    expect(s.plans.A).toEqual({ CMSC351: "0101" });
    expect(s.own).toEqual({});
  });

  it("removes a course from Build my own when its section is cleared", () => {
    const s = setOwnSection(setOwnSection(emptySaved("202701"), "STAT400", "0211"), "STAT400", null);
    expect(s.own).toEqual({});
  });
});

describe("affectsPlan (only course changes reach the 4-year plan)", () => {
  const base = withCourses(emptySaved("202701"), ["CMSC351", "STAT400"]);

  it("is false while both are still following the plan (courses: null)", () => {
    expect(affectsPlan(emptySaved("202701"), emptySaved("202701"))).toBe(false);
  });

  it("is true when the student sets a first override", () => {
    expect(affectsPlan(emptySaved("202701"), base)).toBe(true);
  });

  it("is true when a course is added or removed", () => {
    expect(affectsPlan(base, withCourses(base, ["CMSC351", "STAT400", "ENGL394"]))).toBe(true);
    expect(affectsPlan(base, withCourses(base, ["CMSC351"]))).toBe(true);
  });

  it("is false for section changes, reordering and filter changes", () => {
    expect(affectsPlan(base, savePlan(base, "A", { CMSC351: "0201" }))).toBe(false);
    expect(affectsPlan(base, setOwnSection(base, "CMSC351", "0101"))).toBe(false);
    expect(affectsPlan(base, withCourses(base, ["STAT400", "CMSC351"]))).toBe(false);
    expect(affectsPlan(base, { ...base, filters: { ...DEFAULT_FILTERS, sort: "fewestGaps" } })).toBe(false);
  });
});
