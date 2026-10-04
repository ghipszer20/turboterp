import { describe, expect, it } from "vitest";
import { emptyPrior, newPlan, planReducer, termCourseIds, type AdvisorPlan } from "../advisor/plan-state";

const base = () => newPlan({ programs: ["cmsc-major"], catalogYear: "2026-27", startTerm: "Fall 2026" });
const courses = (plan: AdvisorPlan, term: string) => termCourseIds(plan, term);

describe("newPlan", () => {
  it("starts with eight empty fall and spring terms and no prior credit", () => {
    const plan = base();
    expect(plan.v).toBe(1);
    expect(plan.terms.map((t) => t.name)).toEqual([
      "Fall 2026",
      "Spring 2027",
      "Fall 2027",
      "Spring 2028",
      "Fall 2028",
      "Spring 2029",
      "Fall 2029",
      "Spring 2030",
    ]);
    expect(plan.terms.every((t) => t.courses.length === 0)).toBe(true);
    expect(plan.prior).toEqual(emptyPrior());
    expect(plan).not.toHaveProperty("tracks");
    expect(plan).not.toHaveProperty("examTerms");
  });

  it("accepts tracks and exam terms chosen at first-run setup", () => {
    const plan = newPlan({
      programs: ["cmsc-major"],
      catalogYear: "2026-27",
      startTerm: "Fall 2026",
      tracks: ["pre-med"],
      examTerms: { mcat: "Spring 2030" },
    });
    expect(plan.tracks).toEqual(["pre-med"]);
    expect(plan.examTerms).toEqual({ mcat: "Spring 2030" });
  });

  it("accepts a chosen college; omitted, the plan has none (Advisor derives a default)", () => {
    expect(newPlan({ programs: ["cmsc-major"], catalogYear: "2026-27", startTerm: "Fall 2026", college: "ENGR" }).college).toBe("ENGR");
    expect(base()).not.toHaveProperty("college");
  });
});

describe("planReducer: courses", () => {
  it("adds a course to a term, upper-casing and trimming the id", () => {
    const plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: " cmsc131 " });
    expect(courses(plan, "Fall 2026")).toEqual(["CMSC131"]);
  });

  it("doesn't add the same course twice to one term", () => {
    let plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC131" });
    plan = planReducer(plan, { type: "add-course", term: "Fall 2026", id: "CMSC131" });
    expect(courses(plan, "Fall 2026")).toEqual(["CMSC131"]);
  });

  it("ignores a term that isn't in the plan", () => {
    const plan = base();
    expect(planReducer(plan, { type: "add-course", term: "Fall 2040", id: "CMSC131" })).toBe(plan);
  });

  it("removes a course from one term only", () => {
    let plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC131" });
    plan = planReducer(plan, { type: "add-course", term: "Spring 2027", id: "CMSC131" });
    plan = planReducer(plan, { type: "remove-course", term: "Fall 2026", id: "CMSC131" });
    expect(courses(plan, "Fall 2026")).toEqual([]);
    expect(courses(plan, "Spring 2027")).toEqual(["CMSC131"]);
  });

  it("moves a course to another term, at an index or at the end", () => {
    let plan = base();
    for (const id of ["CMSC131", "MATH140"]) plan = planReducer(plan, { type: "add-course", term: "Fall 2026", id });
    plan = planReducer(plan, { type: "add-course", term: "Spring 2027", id: "CMSC132" });
    plan = planReducer(plan, { type: "move-course", id: "MATH140", from: "Fall 2026", to: "Spring 2027", index: 0 });
    expect(courses(plan, "Fall 2026")).toEqual(["CMSC131"]);
    expect(courses(plan, "Spring 2027")).toEqual(["MATH140", "CMSC132"]);
    plan = planReducer(plan, { type: "move-course", id: "CMSC131", from: "Fall 2026", to: "Spring 2027" });
    expect(courses(plan, "Spring 2027")).toEqual(["MATH140", "CMSC132", "CMSC131"]);
  });

  it("reorders within a term", () => {
    let plan = base();
    for (const id of ["A", "B", "C"].map((x) => `CMSC13${x.charCodeAt(0) - 64}`))
      plan = planReducer(plan, { type: "add-course", term: "Fall 2026", id });
    plan = planReducer(plan, { type: "move-course", id: "CMSC133", from: "Fall 2026", to: "Fall 2026", index: 0 });
    expect(courses(plan, "Fall 2026")).toEqual(["CMSC133", "CMSC131", "CMSC132"]);
  });

  it("won't move a course onto a term that already has it", () => {
    let plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC131" });
    plan = planReducer(plan, { type: "add-course", term: "Spring 2027", id: "CMSC131" });
    const next = planReducer(plan, { type: "move-course", id: "CMSC131", from: "Fall 2026", to: "Spring 2027" });
    expect(next).toBe(plan);
  });

  it("keeps a course's own fields (credits) when it moves", () => {
    let plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC498", credits: 2 });
    plan = planReducer(plan, { type: "move-course", id: "CMSC498", from: "Fall 2026", to: "Fall 2027" });
    expect(plan.terms.find((t) => t.name === "Fall 2027")!.courses).toEqual([{ id: "CMSC498", credits: 2 }]);
  });

  it("sets a course's completion status and grade", () => {
    let plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC131" });
    plan = planReducer(plan, { type: "set-course", term: "Fall 2026", id: "CMSC131", status: "completed", grade: "B+" });
    expect(plan.terms[0]!.courses).toEqual([{ id: "CMSC131", status: "completed", grade: "B+" }]);
  });

  it("clears a course's status and grade when set back to undefined", () => {
    let plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC131" });
    plan = planReducer(plan, { type: "set-course", term: "Fall 2026", id: "CMSC131", status: "completed", grade: "F" });
    plan = planReducer(plan, { type: "set-course", term: "Fall 2026", id: "CMSC131", status: undefined, grade: undefined });
    expect(plan.terms[0]!.courses).toEqual([{ id: "CMSC131" }]);
  });

  it("leaves other courses and terms alone", () => {
    let plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC131", credits: 4 });
    plan = planReducer(plan, { type: "add-course", term: "Fall 2026", id: "MATH140" });
    plan = planReducer(plan, { type: "set-course", term: "Fall 2026", id: "CMSC131", status: "completed", grade: "A" });
    expect(plan.terms[0]!.courses).toEqual([
      { id: "CMSC131", credits: 4, status: "completed", grade: "A" },
      { id: "MATH140" },
    ]);
  });

  it("ignores a course or term that isn't in the plan", () => {
    const plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC131" });
    expect(planReducer(plan, { type: "set-course", term: "Fall 2026", id: "MATH140", status: "completed" })).toBe(plan);
    expect(planReducer(plan, { type: "set-course", term: "Fall 2040", id: "CMSC131", status: "completed" })).toBe(plan);
  });

  it("sets and clears a graduate course's credit tag", () => {
    let plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC616" });
    plan = planReducer(plan, { type: "set-grad-tag", term: "Fall 2026", id: "CMSC616", gradTag: "graduate-only" });
    expect(plan.terms[0]!.courses).toEqual([{ id: "CMSC616", gradTag: "graduate-only" }]);
    plan = planReducer(plan, { type: "set-grad-tag", term: "Fall 2026", id: "CMSC616", gradTag: undefined });
    expect(plan.terms[0]!.courses).toEqual([{ id: "CMSC616" }]);
  });

  it("ignores set-grad-tag for a course or term that isn't in the plan", () => {
    const plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC616" });
    expect(planReducer(plan, { type: "set-grad-tag", term: "Fall 2026", id: "MATH140", gradTag: "bs-ms" })).toBe(plan);
    expect(planReducer(plan, { type: "set-grad-tag", term: "Fall 2040", id: "CMSC616", gradTag: "bs-ms" })).toBe(plan);
  });
});

describe("planReducer: terms", () => {
  it("adds a winter or summer term in order", () => {
    let plan = planReducer(base(), { type: "add-term", name: "Summer 2027" });
    plan = planReducer(plan, { type: "add-term", name: "Winter 2027" });
    expect(plan.terms.slice(0, 4).map((t) => t.name)).toEqual(["Fall 2026", "Winter 2027", "Spring 2027", "Summer 2027"]);
  });

  it("adds an extra term after the last one", () => {
    const plan = planReducer(base(), { type: "add-term", name: "Fall 2030" });
    expect(plan.terms.at(-1)!.name).toBe("Fall 2030");
  });

  it("ignores a duplicate or malformed term", () => {
    const plan = base();
    expect(planReducer(plan, { type: "add-term", name: "Fall 2026" })).toBe(plan);
    expect(planReducer(plan, { type: "add-term", name: "Autumn 2026" })).toBe(plan);
  });

  it("removes a term with its courses", () => {
    let plan = planReducer(base(), { type: "add-term", name: "Summer 2027" });
    plan = planReducer(plan, { type: "add-course", term: "Summer 2027", id: "STAT400" });
    plan = planReducer(plan, { type: "remove-term", name: "Summer 2027" });
    expect(plan.terms.map((t) => t.name)).not.toContain("Summer 2027");
  });
});

describe("planReducer: setup", () => {
  it("changes programs and catalog year without touching the terms", () => {
    let plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC131" });
    plan = planReducer(plan, {
      type: "setup",
      programs: ["math-major-applied"],
      catalogYear: "2026-27",
      startTerm: "Fall 2026",
      tracks: [],
      examTerms: {},
      expectedGrades: {},
    });
    expect(plan.programs).toEqual(["math-major-applied"]);
    expect(courses(plan, "Fall 2026")).toEqual(["CMSC131"]);
  });

  it("sets the college when the setup action gives one; leaves it alone when it doesn't", () => {
    let plan = planReducer(base(), {
      type: "setup",
      programs: ["cmsc-major"],
      catalogYear: "2026-27",
      startTerm: "Fall 2026",
      tracks: [],
      examTerms: {},
      expectedGrades: {},
      college: "CMNS",
    });
    expect(plan.college).toBe("CMNS");
    plan = planReducer(plan, {
      type: "setup",
      programs: ["cmsc-major"],
      catalogYear: "2026-27",
      startTerm: "Fall 2026",
      tracks: [],
      examTerms: {},
      expectedGrades: {},
    });
    expect(plan.college).toBe("CMNS"); // untouched: no college in this action
  });

  it("stores a transfer entry from setup; freshman (or omitted) leaves the plan without one", () => {
    const setup = { type: "setup" as const, programs: ["cmsc-major"], catalogYear: "2026-27", startTerm: "Fall 2026", tracks: [], examTerms: {}, expectedGrades: {} };
    let plan = planReducer(base(), { ...setup, entry: "transfer" });
    expect(plan.entry).toBe("transfer");
    plan = planReducer(plan, { ...setup, entry: "freshman" });
    expect(plan).not.toHaveProperty("entry");
  });

  it("stores double major vs double degree from setup; omitted, the plan has none", () => {
    const setup = { type: "setup" as const, programs: ["math-major-applied", "cmsc-major"], catalogYear: "2026-27", startTerm: "Fall 2026", tracks: [], examTerms: {}, expectedGrades: {} };
    expect(base()).not.toHaveProperty("degreeMode");
    const plan = planReducer(base(), { ...setup, degreeMode: "double-degree" });
    expect(plan.degreeMode).toBe("double-degree");
    expect(planReducer(plan, setup).degreeMode).toBe("double-degree");
    expect(newPlan({ programs: ["cmsc-major"], catalogYear: "2026-27", startTerm: "Fall 2026", degreeMode: "double-major" }).degreeMode).toBe("double-major");
  });

  it("shifts every course with a new start term, keeping each course's position in the sequence", () => {
    let plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC131" });
    plan = planReducer(plan, { type: "add-course", term: "Spring 2027", id: "CMSC132" });
    plan = planReducer(plan, {
      type: "setup",
      programs: ["cmsc-major"],
      catalogYear: "2026-27",
      startTerm: "Fall 2027",
      tracks: [],
      examTerms: {},
      expectedGrades: {},
    });
    expect(plan.startTerm).toBe("Fall 2027");
    expect(courses(plan, "Fall 2027")).toEqual(["CMSC131"]);
    expect(courses(plan, "Spring 2028")).toEqual(["CMSC132"]);
    expect(plan.terms).toHaveLength(8);
  });

  it("moves a winter or summer term's courses into the term before it when the start changes", () => {
    let plan = planReducer(base(), { type: "add-term", name: "Winter 2027" });
    plan = planReducer(plan, { type: "add-course", term: "Winter 2027", id: "MATH241" });
    plan = planReducer(plan, {
      type: "setup",
      programs: ["cmsc-major"],
      catalogYear: "2026-27",
      startTerm: "Spring 2027",
      tracks: [],
      examTerms: {},
      expectedGrades: {},
    });
    expect(courses(plan, "Spring 2027")).toEqual(["MATH241"]);
  });
});

describe("planReducer: setup (tracks)", () => {
  it("stores chosen tracks, exam terms and expected grades", () => {
    const plan = planReducer(base(), {
      type: "setup",
      programs: ["cmsc-major"],
      catalogYear: "2026-27",
      startTerm: "Fall 2026",
      tracks: ["pre-med"],
      examTerms: { mcat: "Spring 2030" },
      expectedGrades: { "Fall 2026": { CHEM131: "B" } },
    });
    expect(plan.tracks).toEqual(["pre-med"]);
    expect(plan.examTerms).toEqual({ mcat: "Spring 2030" });
    expect(plan.expectedGrades).toEqual({ "Fall 2026": { CHEM131: "B" } });
  });

  it("omits tracks, examTerms and expectedGrades when empty, and clears them if previously set", () => {
    let plan = planReducer(base(), {
      type: "setup",
      programs: ["cmsc-major"],
      catalogYear: "2026-27",
      startTerm: "Fall 2026",
      tracks: ["pre-med"],
      examTerms: { mcat: "Spring 2030" },
      expectedGrades: { "Fall 2026": { CHEM131: "B" } },
    });
    plan = planReducer(plan, {
      type: "setup",
      programs: ["cmsc-major"],
      catalogYear: "2026-27",
      startTerm: "Fall 2026",
      tracks: [],
      examTerms: {},
      expectedGrades: {},
    });
    expect(plan).not.toHaveProperty("tracks");
    expect(plan).not.toHaveProperty("examTerms");
    expect(plan).not.toHaveProperty("expectedGrades");
  });

  it("remaps exam terms and expected grades to the new term names when the start term changes", () => {
    let plan = planReducer(base(), {
      type: "setup",
      programs: ["cmsc-major"],
      catalogYear: "2026-27",
      startTerm: "Fall 2026",
      tracks: ["pre-med"],
      examTerms: { mcat: "Spring 2027" },
      expectedGrades: { "Fall 2026": { CMSC131: "B" } },
    });
    plan = planReducer(plan, {
      type: "setup",
      programs: ["cmsc-major"],
      catalogYear: "2026-27",
      startTerm: "Fall 2027",
      tracks: ["pre-med"],
      examTerms: { mcat: "Spring 2027" },
      expectedGrades: { "Fall 2026": { CMSC131: "B" } },
    });
    expect(plan.examTerms).toEqual({ mcat: "Spring 2028" });
    expect(plan.expectedGrades).toEqual({ "Fall 2027": { CMSC131: "B" } });
  });

  it("merges a winter or summer term's expected grades into the term before it when the start changes", () => {
    let plan = planReducer(base(), { type: "add-term", name: "Winter 2027" });
    plan = planReducer(plan, {
      type: "setup",
      programs: ["cmsc-major"],
      catalogYear: "2026-27",
      startTerm: "Fall 2026",
      tracks: [],
      examTerms: {},
      expectedGrades: { "Fall 2026": { CMSC131: "B" }, "Winter 2027": { CMSC132: "A" } },
    });
    plan = planReducer(plan, {
      type: "setup",
      programs: ["cmsc-major"],
      catalogYear: "2026-27",
      startTerm: "Spring 2027",
      tracks: [],
      examTerms: {},
      expectedGrades: plan.expectedGrades ?? {},
    });
    expect(plan.expectedGrades).toEqual({ "Spring 2027": { CMSC131: "B", CMSC132: "A" } });
  });
});

describe("planReducer: removing a term prunes its expected grades", () => {
  it("drops the removed term's expected grades but keeps other terms'", () => {
    let plan = planReducer(base(), { type: "add-term", name: "Summer 2027" });
    plan = planReducer(plan, {
      type: "setup",
      programs: ["cmsc-major"],
      catalogYear: "2026-27",
      startTerm: "Fall 2026",
      tracks: [],
      examTerms: {},
      expectedGrades: { "Fall 2026": { CMSC131: "B" }, "Summer 2027": { STAT400: "A" } },
    });
    plan = planReducer(plan, { type: "remove-term", name: "Summer 2027" });
    expect(plan.expectedGrades).toEqual({ "Fall 2026": { CMSC131: "B" } });
  });

  it("drops the field entirely when it becomes empty", () => {
    let plan = planReducer(base(), { type: "add-term", name: "Summer 2027" });
    plan = planReducer(plan, {
      type: "setup",
      programs: ["cmsc-major"],
      catalogYear: "2026-27",
      startTerm: "Fall 2026",
      tracks: [],
      examTerms: {},
      expectedGrades: { "Summer 2027": { STAT400: "A" } },
    });
    plan = planReducer(plan, { type: "remove-term", name: "Summer 2027" });
    expect(plan).not.toHaveProperty("expectedGrades");
  });
});

describe("planReducer: term course list from the schedule builder", () => {
  it("replaces a term's courses, keeping fields of courses that stay (course level only)", () => {
    let plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC498", credits: 2 });
    plan = planReducer(plan, { type: "add-course", term: "Fall 2026", id: "ENGL101" });
    plan = planReducer(plan, { type: "set-term-courses", term: "Fall 2026", ids: ["CMSC498", "MATH140"] });
    expect(plan.terms[0]!.courses).toEqual([{ id: "CMSC498", credits: 2 }, { id: "MATH140" }]);
  });

  it("creates the term, in sorted order, when the schedule builder's term isn't in the plan yet", () => {
    const plan = planReducer(base(), { type: "set-term-courses", term: "Fall 2030", ids: ["STAT400"] });
    expect(plan.terms.map((t) => t.name)).toEqual([
      "Fall 2026",
      "Spring 2027",
      "Fall 2027",
      "Spring 2028",
      "Fall 2028",
      "Spring 2029",
      "Fall 2029",
      "Spring 2030",
      "Fall 2030",
    ]);
    expect(plan.terms.at(-1)!.courses).toEqual([{ id: "STAT400" }]);
  });

  it("ignores a malformed term name it would otherwise have to create", () => {
    const plan = base();
    expect(planReducer(plan, { type: "set-term-courses", term: "Not A Term", ids: ["STAT400"] })).toBe(plan);
  });

  it("returns the same plan when the course ids are already what's asked for", () => {
    const plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC131" });
    const next = planReducer(plan, { type: "set-term-courses", term: "Fall 2026", ids: ["CMSC131"] });
    expect(next).toBe(plan);
  });
});

describe("planReducer: prior credit and GPA", () => {
  it("stores the prior-credit inputs as entered", () => {
    const prior = { ...emptyPrior(), ap: [{ key: "a1", exam: "Calculus BC", score: 5 }] };
    const plan = planReducer(base(), { type: "set-prior", prior });
    expect(plan.prior).toEqual(prior);
  });

  it("stores a GPA and clears it", () => {
    let plan = planReducer(base(), { type: "set-gpa", gpa: 3.4 });
    expect(plan.gpa).toBe(3.4);
    plan = planReducer(plan, { type: "set-gpa", gpa: undefined });
    expect(plan).not.toHaveProperty("gpa");
  });

  it("stores master's credits (for the BS/MS double-count cap) and clears it", () => {
    let plan = planReducer(base(), { type: "set-masters-credits", mastersCredits: 30 });
    expect(plan.mastersCredits).toBe(30);
    plan = planReducer(plan, { type: "set-masters-credits", mastersCredits: undefined });
    expect(plan).not.toHaveProperty("mastersCredits");
  });
});

describe("planReducer: set-programs (Apply from the what-if comparison)", () => {
  it("replaces the plan's majors and nothing else", () => {
    const plan = planReducer(base(), { type: "add-course", term: "Fall 2026", id: "CMSC131" });
    const next = planReducer(plan, { type: "set-programs", programs: ["math-major-applied", "cmsc-major"] });
    expect(next.programs).toEqual(["math-major-applied", "cmsc-major"]);
    expect(next.catalogYear).toBe(plan.catalogYear);
    expect(next.terms).toEqual(plan.terms);
  });

  it("never touches tracks or exam terms", () => {
    const plan = planReducer(base(), {
      type: "setup",
      programs: ["cmsc-major"],
      catalogYear: "2026-27",
      startTerm: "Fall 2026",
      tracks: ["pre-med"],
      examTerms: { mcat: "Spring 2030" },
      expectedGrades: {},
    });
    const next = planReducer(plan, { type: "set-programs", programs: ["math-major-applied"] });
    expect(next.tracks).toEqual(["pre-med"]);
    expect(next.examTerms).toEqual({ mcat: "Spring 2030" });
  });
});
