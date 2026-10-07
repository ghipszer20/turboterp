import { describe, expect, it } from "vitest";
import { checkerPlan } from "../advisor/checker";
import { termEnded, ungradedPastTermQuestions } from "../advisor/past-terms";
import { planReducer, type AdvisorPlan } from "../advisor/plan-state";
import { displayStatus } from "../advisor/req-status";

const TODAY = new Date(2026, 9, 7); // 2026-10-07, mid Fall 2026

const plan = (terms: AdvisorPlan["terms"]) => ({ terms }) as unknown as AdvisorPlan;
const courseOf = (p: ReturnType<typeof checkerPlan>, term: string, id: string) => p.terms.find((t) => t.name === term)!.courses.find((c) => c.id === id)!;

describe("termEnded", () => {
  it("uses fixed end dates", () => {
    expect(termEnded("Spring 2025", TODAY)).toBe(true);
    expect(termEnded("Summer 2026", TODAY)).toBe(true);
    expect(termEnded("Fall 2026", TODAY)).toBe(false);
    expect(termEnded("Spring 2027", TODAY)).toBe(false);
    expect(termEnded("Winter 2026", TODAY)).toBe(true);
  });
});

describe("checkerPlan past terms", () => {
  const p = plan([
    { name: "Spring 2025", courses: [{ id: "SOCY100" }, { id: "ENGL101", status: "planned" }, { id: "MATH140", grade: "W" }] },
    { name: "Fall 2026", courses: [{ id: "CMSC131" }] },
    { name: "Spring 2027", courses: [{ id: "CMSC132" }] },
  ]);
  const out = checkerPlan(p, [], TODAY);
  it("counts ungraded and explicitly planned past courses as completed", () => {
    expect(courseOf(out, "Spring 2025", "SOCY100").status).toBe("completed");
    expect(courseOf(out, "Spring 2025", "ENGL101").status).toBe("completed");
  });
  it("keeps a W as completed with the W", () => {
    const c = courseOf(out, "Spring 2025", "MATH140");
    expect(c.status).toBe("completed");
    expect(c.grade).toBe("W");
  });
  it("leaves current and future terms planned", () => {
    expect(courseOf(out, "Fall 2026", "CMSC131").status).not.toBe("completed");
    expect(courseOf(out, "Spring 2027", "CMSC132").status).not.toBe("completed");
  });
});

describe("ungradedPastTermQuestions", () => {
  const withCourses = (courses: AdvisorPlan["terms"][number]["courses"]) =>
    plan([
      { name: "Spring 2025", courses },
      { name: "Fall 2026", courses: [{ id: "CMSC131" }] },
    ]);
  it("asks once per ungraded past course, as confirm", () => {
    const q = ungradedPastTermQuestions(withCourses([{ id: "SOCY100" }, { id: "ENGL101", status: "planned" }]), TODAY);
    expect(q.map((x) => x.course)).toEqual(["SOCY100", "ENGL101"]);
    expect(q[0]).toMatchObject({ severity: "confirm", term: "Spring 2025", message: "No grade for SOCY100 (Spring 2025). Did you finish it?" });
  });
  it("stops asking once finished, graded, or W", () => {
    expect(ungradedPastTermQuestions(withCourses([{ id: "A100", status: "completed" }, { id: "B100", grade: "B" }, { id: "C100", grade: "W" }]), TODAY)).toEqual([]);
  });
  it("the Finished and Dropped actions settle the question", () => {
    const p0 = withCourses([{ id: "SOCY100" }]);
    const finished = planReducer(p0, { type: "set-course", term: "Spring 2025", id: "SOCY100", status: "completed" });
    const dropped = planReducer(p0, { type: "set-course", term: "Spring 2025", id: "SOCY100", status: "completed", grade: "W" });
    expect(ungradedPastTermQuestions(finished, TODAY)).toEqual([]);
    expect(ungradedPastTermQuestions(dropped, TODAY)).toEqual([]);
  });
});

describe("displayStatus", () => {
  it("a row met by a past ungraded course is satisfied, not in progress", () => {
    const c = checkerPlan(plan([{ name: "Spring 2025", courses: [{ id: "SOCY100" }] }]), [], TODAY);
    const courses = [{ id: "SOCY100", credits: 3, status: courseOf(c, "Spring 2025", "SOCY100").status }] as never;
    expect(displayStatus({ status: "satisfied", assigned: ["SOCY100"] }, courses)).toBe("satisfied");
  });
  it("a row met only by a W keeps the audit's partial or missing", () => {
    const courses = [{ id: "MATH140", credits: 4, status: "completed", grade: "W" }] as never;
    expect(displayStatus({ status: "partial", assigned: [] }, courses)).toBe("partial");
    expect(displayStatus({ status: "missing", assigned: [] }, courses)).toBe("missing");
  });
});
