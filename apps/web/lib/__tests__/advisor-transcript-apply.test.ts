import { describe, expect, it } from "vitest";
import { emptyPrior, newPlan, type AdvisorPlan } from "../advisor/plan-state";
import { applyTranscriptImport, type SelectedAp, type SelectedCourse } from "../advisor/transcript-apply";

const basePlan = (): AdvisorPlan => newPlan({ programs: ["cs"], catalogYear: "2026-2027", startTerm: "Fall 2024" });

describe("applyTranscriptImport: completed courses", () => {
  it("adds a completed course to its term with grade and credits", () => {
    const plan = basePlan();
    const courses: SelectedCourse[] = [{ term: "Fall 2024", code: "CMSC131", grade: "A", credits: 4, status: "completed" }];
    const next = applyTranscriptImport(plan, { courses, ap: [] });
    const term = next.terms.find((t) => t.name === "Fall 2024")!;
    expect(term.courses).toEqual([{ id: "CMSC131", credits: 4, status: "completed", grade: "A" }]);
  });

  it("adds an in-progress course with no status/grade", () => {
    const plan = basePlan();
    const courses: SelectedCourse[] = [{ term: "Fall 2024", code: "CMSC330", grade: null, credits: 3, status: "in-progress" }];
    const next = applyTranscriptImport(plan, { courses, ap: [] });
    const term = next.terms.find((t) => t.name === "Fall 2024")!;
    expect(term.courses).toEqual([{ id: "CMSC330", credits: 3 }]);
  });

  it("creates a term that isn't already in the plan (e.g. a transfer term before the plan's start)", () => {
    const plan = basePlan(); // starts Fall 2024, no Fall 2023
    const courses: SelectedCourse[] = [{ term: "Fall 2023", code: "MATH140", grade: "A", credits: 4, status: "completed" }];
    const next = applyTranscriptImport(plan, { courses, ap: [] });
    expect(next.terms.map((t) => t.name)).toContain("Fall 2023");
    const term = next.terms.find((t) => t.name === "Fall 2023")!;
    expect(term.courses).toEqual([{ id: "MATH140", credits: 4, status: "completed", grade: "A" }]);
  });

  it("is idempotent: applying the same import twice doesn't duplicate the course", () => {
    const plan = basePlan();
    const courses: SelectedCourse[] = [{ term: "Fall 2024", code: "CMSC131", grade: "A", credits: 4, status: "completed" }];
    const once = applyTranscriptImport(plan, { courses, ap: [] });
    const twice = applyTranscriptImport(once, { courses, ap: [] });
    const term = twice.terms.find((t) => t.name === "Fall 2024")!;
    expect(term.courses).toHaveLength(1);
  });

  it("leaves every other term and the rest of the plan untouched", () => {
    const plan = basePlan();
    const courses: SelectedCourse[] = [{ term: "Fall 2024", code: "CMSC131", grade: "A", credits: 4, status: "completed" }];
    const next = applyTranscriptImport(plan, { courses, ap: [] });
    expect(next.programs).toEqual(plan.programs);
    expect(next.catalogYear).toBe(plan.catalogYear);
    const untouched = next.terms.find((t) => t.name === "Spring 2025")!;
    expect(untouched.courses).toEqual([]);
  });
});

describe("applyTranscriptImport: AP exams", () => {
  it("appends matched AP exams to prior.ap", () => {
    const plan = { ...basePlan(), prior: emptyPrior() };
    const ap: SelectedAp[] = [{ exam: "Calculus BC", score: 5 }];
    const next = applyTranscriptImport(plan, { courses: [], ap });
    expect(next.prior.ap).toEqual([expect.objectContaining({ exam: "Calculus BC", score: 5 })]);
    expect(next.prior.ap[0]!.key).toBeTruthy();
  });

  it("keeps any existing prior entries and appends rather than replacing", () => {
    const plan = { ...basePlan(), prior: { ...emptyPrior(), ap: [{ key: "existing", exam: "Biology", score: 4 }] } };
    const next = applyTranscriptImport(plan, { courses: [], ap: [{ exam: "Chemistry", score: 5 }] });
    expect(next.prior.ap.map((a) => a.exam)).toEqual(["Biology", "Chemistry"]);
  });

  it("gives each imported AP entry a distinct key", () => {
    const plan = basePlan();
    const next = applyTranscriptImport(plan, {
      courses: [],
      ap: [
        { exam: "Calculus BC", score: 5 },
        { exam: "Chemistry", score: 4 },
      ],
    });
    expect(new Set(next.prior.ap.map((a) => a.key)).size).toBe(2);
  });

  it("skips an AP exam already present in prior.ap, so re-importing doesn't duplicate it", () => {
    const plan = { ...basePlan(), prior: { ...emptyPrior(), ap: [{ key: "existing", exam: "Calculus BC", score: 5 }] } };
    const next = applyTranscriptImport(plan, { courses: [], ap: [{ exam: "Calculus BC", score: 5 }] });
    expect(next.prior.ap).toHaveLength(1);
    expect(next.prior.ap[0]!.key).toBe("existing");
  });

  it("still adds AP exams not already present, alongside ones that are skipped", () => {
    const plan = { ...basePlan(), prior: { ...emptyPrior(), ap: [{ key: "existing", exam: "Calculus BC", score: 5 }] } };
    const next = applyTranscriptImport(plan, {
      courses: [],
      ap: [
        { exam: "Calculus BC", score: 5 },
        { exam: "Chemistry", score: 4 },
      ],
    });
    expect(next.prior.ap.map((a) => a.exam)).toEqual(["Calculus BC", "Chemistry"]);
  });
});

describe("applyTranscriptImport: re-importing the same transcript", () => {
  it("leaves the plan unchanged the second time (courses and AP exams both)", () => {
    const plan = basePlan();
    const selection = {
      courses: [{ term: "Fall 2024", code: "CMSC131", grade: "A" as const, credits: 4, status: "completed" as const }],
      ap: [{ exam: "Calculus BC", score: 5 }],
    };
    const once = applyTranscriptImport(plan, selection);
    const twice = applyTranscriptImport(once, selection);
    expect(twice).toEqual(once);
  });
});

describe("applyTranscriptImport: cumulative GPA", () => {
  it("sets plan.gpa from the transcript, overwriting an earlier value", () => {
    const plan = { ...basePlan(), gpa: 2.9 };
    expect(applyTranscriptImport(plan, { courses: [], ap: [], gpa: 3.55 }).gpa).toBe(3.55);
  });

  it("leaves plan.gpa alone when the transcript printed none", () => {
    const plan = { ...basePlan(), gpa: 2.9 };
    expect(applyTranscriptImport(plan, { courses: [], ap: [] }).gpa).toBe(2.9);
    expect(applyTranscriptImport(basePlan(), { courses: [], ap: [], gpa: null }).gpa).toBeUndefined();
  });
});

describe("applyTranscriptImport: plan length", () => {
  const mainTerms = (plan: AdvisorPlan) => plan.terms.map((t) => t.name).filter((n) => /^(Fall|Spring)/.test(n));

  it("stays a four-year plan when the transcript starts before the plan did", () => {
    const plan = basePlan(); // Fall 2024 to Spring 2028
    const courses: SelectedCourse[] = [
      { term: "Fall 2022", code: "MATH140", grade: "A", credits: 4, status: "completed" },
      { term: "Spring 2023", code: "MATH141", grade: "A", credits: 4, status: "completed" },
      { term: "Fall 2023", code: "MATH241", grade: "A", credits: 4, status: "completed" },
      { term: "Spring 2024", code: "MATH240", grade: "A", credits: 4, status: "completed" },
    ];
    const next = applyTranscriptImport(plan, { courses, ap: [] });
    expect(mainTerms(next)).toEqual(["Fall 2022", "Spring 2023", "Fall 2023", "Spring 2024", "Fall 2024", "Spring 2025", "Fall 2025", "Spring 2026"]);
  });

  it("keeps a later term that already has courses, even past four years", () => {
    let plan = basePlan();
    plan = { ...plan, terms: plan.terms.map((t) => (t.name === "Spring 2028" ? { ...t, courses: [{ id: "CMSC351" }] } : t)) };
    const courses: SelectedCourse[] = [{ term: "Fall 2023", code: "MATH140", grade: "A", credits: 4, status: "completed" }];
    const next = applyTranscriptImport(plan, { courses, ap: [] });
    expect(mainTerms(next).at(-1)).toBe("Spring 2028");
    expect(mainTerms(next)).toHaveLength(9);
  });

  it("doesn't shorten a plan the transcript didn't lengthen", () => {
    const plan = basePlan();
    const courses: SelectedCourse[] = [{ term: "Fall 2024", code: "CMSC131", grade: "A", credits: 4, status: "completed" }];
    expect(mainTerms(applyTranscriptImport(plan, { courses, ap: [] }))).toHaveLength(8);
  });

  it("drops an empty summer or winter left after the new last term", () => {
    let plan = basePlan();
    plan = { ...plan, terms: [...plan.terms, { name: "Summer 2028", courses: [] }] };
    const courses: SelectedCourse[] = [{ term: "Fall 2023", code: "MATH140", grade: "A", credits: 4, status: "completed" }];
    const next = applyTranscriptImport(plan, { courses, ap: [] });
    expect(next.terms.at(-1)!.name).toBe("Fall 2027");
  });
});
