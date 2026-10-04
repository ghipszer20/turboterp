import { describe, expect, it } from "vitest";
import { newPlan, planReducer } from "../advisor/plan-state";
import { parsePlan, serializePlan } from "../advisor/storage";

const plan = () => {
  let p = newPlan({ programs: ["math-major-applied", "cmsc-major"], catalogYear: "2026-27", startTerm: "Fall 2026" });
  p = planReducer(p, { type: "add-course", term: "Fall 2026", id: "CMSC131" });
  p = planReducer(p, { type: "add-term", name: "Winter 2027" });
  p = planReducer(p, {
    type: "set-prior",
    prior: {
      ap: [{ key: "a", exam: "Calculus BC", score: 5 }],
      ib: [{ key: "b", exam: "Psychology", level: "HL", score: 6 }],
      dual: [{ key: "c", institution: "Montgomery College", course: "ENGL101", credits: 3, umd: "ENGL101", elective: false }],
      choices: { "AP Art History (5)": "ARTH200" },
    },
  });
  p = planReducer(p, {
    type: "setup",
    programs: p.programs,
    catalogYear: p.catalogYear,
    startTerm: p.startTerm,
    tracks: ["pre-med"],
    examTerms: { mcat: "Spring 2027" },
    expectedGrades: { "Fall 2026": { CMSC131: "B" } },
  });
  return planReducer(p, { type: "set-gpa", gpa: 3.5 });
};

describe("plan storage", () => {
  it("round-trips a plan", () => {
    const p = plan();
    expect(parsePlan(serializePlan(p))).toEqual(p);
  });

  it("round-trips a chosen college, and drops an unknown one", () => {
    const p = { ...plan(), college: "ENGR" as const };
    expect(parsePlan(serializePlan(p))!.college).toBe("ENGR");
    const raw = JSON.parse(serializePlan(p));
    raw.college = "NOPE";
    expect(parsePlan(JSON.stringify(raw))).not.toHaveProperty("college");
  });

  it("round-trips a transfer entry, and ignores anything else", () => {
    const p = { ...plan(), entry: "transfer" as const };
    expect(parsePlan(serializePlan(p))!.entry).toBe("transfer");
    const raw = JSON.parse(serializePlan(p));
    raw.entry = "nope";
    expect(parsePlan(JSON.stringify(raw))).not.toHaveProperty("entry");
  });

  it("round-trips double major vs double degree, and drops an unknown value", () => {
    const p = { ...plan(), degreeMode: "double-degree" as const };
    expect(parsePlan(serializePlan(p))!.degreeMode).toBe("double-degree");
    const raw = JSON.parse(serializePlan(p));
    raw.degreeMode = "triple";
    expect(parsePlan(JSON.stringify(raw))).not.toHaveProperty("degreeMode");
  });

  it("returns null for nothing, junk, or another version", () => {
    expect(parsePlan(null)).toBeNull();
    expect(parsePlan("{not json")).toBeNull();
    expect(parsePlan(JSON.stringify({ ...plan(), v: 2 }))).toBeNull();
    expect(parsePlan(JSON.stringify({ v: 1 }))).toBeNull();
  });

  it("drops malformed pieces and keeps the rest", () => {
    const raw = JSON.parse(serializePlan(plan()));
    raw.terms[0].courses.push({ id: 42 }, null, { id: "MATH140", credits: "four" });
    raw.terms.push({ name: "Autumn 2027", courses: [] });
    raw.prior.ap.push({ key: "x", exam: "Calculus AB", score: 9 });
    raw.prior.ib.push({ key: "y", exam: "Physics", level: "XL", score: 5 });
    raw.programs.push(7);
    raw.gpa = "high";
    const back = parsePlan(JSON.stringify(raw))!;
    expect(back.terms[0]!.courses).toEqual([{ id: "CMSC131" }, { id: "MATH140" }]);
    expect(back.terms.map((t) => t.name)).not.toContain("Autumn 2027");
    expect(back.prior.ap).toHaveLength(1);
    expect(back.prior.ib).toHaveLength(1);
    expect(back.programs).toEqual(["math-major-applied", "cmsc-major"]);
    expect(back).not.toHaveProperty("gpa");
  });

  it("drops an unknown track id, keeps a known one, and drops a malformed exam term or expected grade", () => {
    const raw = JSON.parse(serializePlan(plan()));
    raw.tracks.push("not-a-real-track", 7);
    raw.examTerms.gre = "Not A Term";
    raw.examTerms.dat = "Spring 2028";
    raw.expectedGrades["Fall 2026"]["not a course"] = "A";
    raw.expectedGrades["Not A Term"] = { CMSC131: "A" };
    const back = parsePlan(JSON.stringify(raw))!;
    expect(back.tracks).toEqual(["pre-med"]);
    expect(back.examTerms).toEqual({ mcat: "Spring 2027", dat: "Spring 2028" });
    expect(back.expectedGrades).toEqual({ "Fall 2026": { CMSC131: "B" } });
  });

  it("omits tracks, examTerms and expectedGrades entirely when none are well-formed", () => {
    const raw = JSON.parse(serializePlan(plan()));
    raw.tracks = ["nonsense"];
    raw.examTerms = { gre: "nonsense" };
    raw.expectedGrades = { nonsense: { CMSC131: "A" } };
    const back = parsePlan(JSON.stringify(raw))!;
    expect(back).not.toHaveProperty("tracks");
    expect(back).not.toHaveProperty("examTerms");
    expect(back).not.toHaveProperty("expectedGrades");
  });

  it("round-trips a course's grad credit tag, and drops an unknown one", () => {
    let p = plan();
    p = planReducer(p, { type: "set-grad-tag", term: "Fall 2026", id: "CMSC131", gradTag: "graduate-only" });
    expect(parsePlan(serializePlan(p))!.terms[0]!.courses[0]).toMatchObject({ gradTag: "graduate-only" });
    const raw = JSON.parse(serializePlan(p));
    raw.terms[0].courses[0].gradTag = "not-a-tag";
    expect(parsePlan(JSON.stringify(raw))!.terms[0]!.courses[0]).not.toHaveProperty("gradTag");
  });

  it("round-trips master's credits, and drops a non-positive or non-numeric value", () => {
    const p = { ...plan(), mastersCredits: 30 };
    expect(parsePlan(serializePlan(p))!.mastersCredits).toBe(30);
    const raw = JSON.parse(serializePlan(p));
    raw.mastersCredits = 0;
    expect(parsePlan(JSON.stringify(raw))).not.toHaveProperty("mastersCredits");
    raw.mastersCredits = "thirty";
    expect(parsePlan(JSON.stringify(raw))).not.toHaveProperty("mastersCredits");
  });
});

describe("confirmed open slots", () => {
  it("round-trips confirmedSlots and drops non-string entries", () => {
    const p = { ...plan(), confirmedSlots: ["pwrt-minor/approved"] };
    expect(parsePlan(serializePlan(p))?.confirmedSlots).toEqual(["pwrt-minor/approved"]);
    const raw = JSON.parse(serializePlan(p));
    raw.confirmedSlots = ["a/b", 3, null];
    expect(parsePlan(JSON.stringify(raw))?.confirmedSlots).toEqual(["a/b"]);
  });

  it("toggles a slot on and off", () => {
    const on = planReducer(plan(), { type: "toggle-slot", key: "pwrt-minor/approved" });
    expect(on.confirmedSlots).toEqual(["pwrt-minor/approved"]);
    expect(planReducer(on, { type: "toggle-slot", key: "pwrt-minor/approved" })).not.toHaveProperty("confirmedSlots");
  });

  it("leaves confirmedSlots out when there are none", () => {
    expect(parsePlan(serializePlan(plan()))).not.toHaveProperty("confirmedSlots");
  });
});
