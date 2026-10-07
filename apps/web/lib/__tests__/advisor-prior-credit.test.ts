import { describe, expect, it } from "vitest";
import { emptyPrior, type PriorInputs } from "../advisor/plan-state";
import { computePriorCredit, creditLabel, ibLevelsFor, removePriorEntry } from "../advisor/prior-credit";

const prior = (p: Partial<PriorInputs>): PriorInputs => ({ ...emptyPrior(), ...p });
const noGenEd = () => [];

describe("computePriorCredit: AP", () => {
  it("shows what AP Calculus BC 5 earns and counts it", () => {
    const r = computePriorCredit(prior({ ap: [{ key: "a", exam: "Calculus BC", score: 5 }] }), noGenEd);
    expect(r.entries).toEqual([
      expect.objectContaining({
        key: "a",
        source: "AP Calculus BC (5)",
        status: "counted",
        credits: 8,
        earns: [
          { kind: "course", id: "MATH140", credits: 4, genEd: ["FSMA", "FSAR"] },
          { kind: "course", id: "MATH141", credits: 4, genEd: [] },
        ],
      }),
    ]);
    expect(r.courses.map((c) => c.id)).toEqual(["MATH140", "MATH141"]);
    expect(r.totalCredits).toBe(8);
    expect(r.notCounted).toEqual([]);
  });

  it("says when a score earns no credit", () => {
    const r = computePriorCredit(prior({ ap: [{ key: "a", exam: "Calculus BC", score: 2 }] }), noGenEd);
    expect(r.entries[0]).toMatchObject({ status: "no-credit", credits: 0, earns: [] });
    expect(r.courses).toEqual([]);
  });

  it("marks a lower calculus award as not counted, with UMD's reason", () => {
    const r = computePriorCredit(
      prior({
        ap: [
          { key: "a", exam: "Calculus AB", score: 5 },
          { key: "b", exam: "Calculus BC", score: 5 },
        ],
      }),
      noGenEd,
    );
    expect(r.notCounted).toEqual([
      {
        source: "AP Calculus AB (5)",
        kind: "not-counted",
        reason: "UMD grants credit for Calculus AB or BC, not both; AP Calculus BC (5) counts instead.",
      },
    ]);
    expect(r.entries.find((e) => e.key === "a")!.status).toBe("not-counted");
    expect(r.totalCredits).toBe(8);
  });

  it("waits for a pick when an award offers a choice, then counts the pick", () => {
    const inputs = prior({ ap: [{ key: "a", exam: "Art History", score: 5 }] });
    const before = computePriorCredit(inputs, noGenEd);
    expect(before.needsChoice).toEqual([{ source: "AP Art History (5)", credits: 3, options: ["ARTH200", "ARTH201"] }]);
    const options = [
      { id: "ARTH200", genEd: expect.any(Array) },
      { id: "ARTH201", genEd: expect.any(Array) },
    ];
    expect(before.entries[0]!.earns).toEqual([{ kind: "choice", credits: 3, options, picked: null }]);
    const after = computePriorCredit({ ...inputs, choices: { "AP Art History (5)": "ARTH201" } }, noGenEd);
    expect(after.needsChoice).toEqual([]);
    expect(after.courses.map((c) => c.id)).toEqual(["ARTH201"]);
    expect(after.entries[0]!.earns).toEqual([{ kind: "choice", credits: 3, options, picked: "ARTH201" }]);
  });

  it("keeps a row's error to that row", () => {
    const r = computePriorCredit(
      prior({
        ap: [
          { key: "a", exam: "Underwater Basketry", score: 5 },
          { key: "b", exam: "Calculus BC", score: 5 },
        ],
      }),
      noGenEd,
    );
    expect(r.entries[0]).toMatchObject({ status: "error", error: expect.stringContaining("Underwater Basketry") });
    expect(r.entries[1]!.status).toBe("counted");
  });
});

describe("computePriorCredit: overlapping credit counts once", () => {
  it("shows a course two exams both award as overkill for the second", () => {
    const r = computePriorCredit(
      prior({
        ap: [{ key: "a", exam: "Calculus BC", score: 5 }],
        ib: [{ key: "b", exam: "Mathematics: Analysis and Approaches", level: "HL", score: 6 }],
      }),
      noGenEd,
    );
    expect(r.courses.map((c) => c.id)).toEqual(["MATH140", "MATH141", "STAT100"]);
    expect(r.notCounted).toEqual([
      {
        source: "IB Mathematics: Analysis and Approaches HL (6)",
        kind: "overkill",
        reason: "MATH140 already comes from AP Calculus BC (5).",
      },
    ]);
    expect(r.entries[1]!.status).toBe("counted");
    expect(r.totalCredits).toBe(8 + 3);
  });

  it("shows dual enrollment for a course an exam already gives as overkill", () => {
    const r = computePriorCredit(
      prior({
        ap: [{ key: "a", exam: "Calculus BC", score: 5 }],
        dual: [{ key: "d", institution: "Montgomery College", course: "MATH181", credits: 4, umd: "MATH140", elective: false }],
      }),
      noGenEd,
    );
    expect(r.notCounted).toEqual([
      { source: "Montgomery College MATH181", kind: "overkill", reason: "MATH140 already comes from AP Calculus BC (5)." },
    ]);
    expect(r.entries.find((e) => e.key === "d")!.status).toBe("overkill");
  });
});

describe("computePriorCredit: dual enrollment", () => {
  it("counts a course with a UMD equivalent, taking its Gen Ed from the catalog", () => {
    const genEdOf = (id: string) => (id === "ENGL101" ? ["FSAW"] : []);
    const r = computePriorCredit(
      prior({ dual: [{ key: "d", institution: "Montgomery College", course: "ENGL 101", credits: 3, umd: "engl101", elective: false }] }),
      genEdOf,
    );
    expect(r.courses).toEqual([{ id: "ENGL101", credits: 3, status: "completed", genEd: ["FSAW"], source: "Montgomery College ENGL 101" }]);
    expect(r.entries[0]).toMatchObject({ status: "counted", credits: 3, earns: [{ kind: "course", id: "ENGL101", credits: 3, genEd: ["FSAW"] }] });
  });

  it("counts elective credit toward the total only", () => {
    const r = computePriorCredit(
      prior({ dual: [{ key: "d", institution: "Howard CC", course: "PSY 101", credits: 3, umd: "", elective: true }] }),
      noGenEd,
    );
    expect(r.entries[0]!.earns).toEqual([{ kind: "generic", label: "Elective credit", credits: 3, genEd: [] }]);
    expect(r.totalCredits).toBe(3);
  });

  it("reports a bad UMD course id on its row", () => {
    const r = computePriorCredit(
      prior({ dual: [{ key: "d", institution: "Howard CC", course: "PSY 101", credits: 3, umd: "PSYCH", elective: false }] }),
      noGenEd,
    );
    expect(r.entries[0]).toMatchObject({ status: "error", error: expect.stringContaining("isn't a UMD course id") });
  });
});

describe("ibLevelsFor", () => {
  it("lists the levels UMD's chart has for an exam", () => {
    expect(ibLevelsFor("Mathematics: Analysis and Approaches")).toEqual(["SL", "HL"]);
  });
});

describe("creditLabel", () => {
  it("names placeholder credit in words, not as a course code", () => {
    expect(creditLabel("MATH140")).toBe("MATH140");
    expect(creditLabel("L1:AP Computer Science A")).toBe("Elective credit");
    expect(creditLabel("DSNL:AP Biology")).toBe("Gen Ed credit (DSNL)");
  });
});

describe("removePriorEntry", () => {
  it("removes an AP entry by key, leaving the others", () => {
    const p = prior({
      ap: [
        { key: "a", exam: "Calculus BC", score: 5 },
        { key: "b", exam: "Physics 1", score: 4 },
      ],
    });
    expect(removePriorEntry(p, "ap", "a").ap).toEqual([{ key: "b", exam: "Physics 1", score: 4 }]);
  });

  it("removes an IB entry by key", () => {
    const p = prior({ ib: [{ key: "a", exam: "Psychology", level: "HL", score: 6 }] });
    expect(removePriorEntry(p, "ib", "a").ib).toEqual([]);
  });

  it("removes a dual-enrollment entry by key", () => {
    const p = prior({ dual: [{ key: "a", institution: "Montgomery College", course: "MATH181", credits: 4, umd: "MATH141", elective: false }] });
    expect(removePriorEntry(p, "dual", "a").dual).toEqual([]);
  });

  it("leaves choices untouched", () => {
    const p = prior({ ap: [{ key: "a", exam: "Calculus BC", score: 5 }], choices: { "AP History": "HIST200" } });
    expect(removePriorEntry(p, "ap", "a").choices).toEqual({ "AP History": "HIST200" });
  });
});
