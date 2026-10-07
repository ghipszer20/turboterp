import type { Requirement, RequirementResult, StudentCourse } from "@turboterp/audit";
import { cmscMajor } from "@turboterp/audit/programs/cmsc-major-2026-27.ts";
import { genEd } from "@turboterp/audit/programs/gen-ed-2026-27.ts";
import { mathMajorApplied } from "@turboterp/audit/programs/math-major-applied-2026-27.ts";
import { describe, expect, it } from "vitest";
import { emptyPrior, type PriorInputs } from "../advisor/plan-state";
import { choiceAwardsOf, computePriorCredit } from "../advisor/prior-credit";
import { describeGap, filterText, genEdName, prerequisiteText } from "../advisor/requirements";

describe("describeGap: exam credit that offers a choice", () => {
  // The Gen Ed row for Understanding Plural Societies, found by its code so a row rename can't break this.
  const plural =
    genEd.requirements.find((r) => r.kind === "choose" && r.from.genEd?.length === 1 && r.from.genEd[0] === "DVUP") ??
    genEd.requirements.find((r) => /plural/i.test(r.name))!;
  const inputs = (pick?: string): PriorInputs => ({
    ...emptyPrior(),
    ap: [{ key: "a", exam: "United States History", score: 4 }],
    choices: pick ? { "AP United States History (4)": pick } : {},
  });
  const gapFor = (pick?: string) => {
    const credit = computePriorCredit(inputs(pick), () => []);
    return describeGap(plural, { id: plural.id, name: plural.name, status: "missing", assigned: [] }, { courses: credit.courses, catalog: [], choiceAwards: choiceAwardsOf(credit.entries) });
  };

  it("points to the other option when the picked course lacks the code", () => {
    const text = JSON.stringify(gapFor("HIST200"));
    expect(text).toContain("HIST201");
    expect(text).toContain("AP United States History (4)");
  });

  it("says the same while the choice is unpicked", () => {
    expect(JSON.stringify(gapFor())).toContain("HIST201");
  });

  it("has no hint when the pick already carries the code", () => {
    expect(JSON.stringify(gapFor("HIST201"))).not.toContain("HIST20");
  });
});

const req = (program: { requirements: Requirement[] }, id: string) => program.requirements.find((r) => r.id === id)!;
const result = (r: Requirement, status: RequirementResult["status"], assigned: string[] = []): RequirementResult => ({
  id: r.id,
  name: r.name,
  status,
  assigned,
});
const taken = (...ids: string[]): StudentCourse[] => ids.map((id) => ({ id, credits: 3, status: "planned", genEd: [] }));
const CATALOG = [
  "STAT400",
  "STAT401",
  "STAT410",
  "STAT420",
  "STAT464",
  "MATH411",
  "MATH463",
  "CMSC420",
  "CMSC421",
  "CMSC451",
  "CMSC412",
  "CMSC433",
  "CMSC460",
].map((id) => ({ id, genEd: [] as string[] }));
const ctx = (courses: StudentCourse[] = []) => ({ courses, catalog: CATALOG });

describe("describeGap", () => {
  it("says nothing about a satisfied requirement", () => {
    const r = req(cmscMajor, "cmsc351");
    expect(describeGap(r, result(r, "satisfied", ["CMSC351"]), ctx())).toBeNull();
  });

  it("names the course, or its short list of options", () => {
    const r = req(cmscMajor, "cmsc351");
    expect(describeGap(r, result(r, "missing"), ctx())).toEqual({ need: "Take CMSC351.", suggestions: ["CMSC351"] });
    const r2 = req(cmscMajor, "cmsc131");
    // Department page (undergrad.cs.umd.edu/degree-requirements-cs-major): CMSC133 is an
    // accelerated alternative to CMSC131, alongside the owner-confirmed CMSC141.
    expect(describeGap(r2, result(r2, "missing"), ctx())).toEqual({
      need: "Take CMSC131, CMSC141 or CMSC133.",
      suggestions: ["CMSC131", "CMSC141", "CMSC133"],
    });
  });

  it("lists a long option list as 'one of'", () => {
    const r = req(mathMajorApplied, "applied");
    const gap = describeGap(r, result(r, "missing"), ctx())!;
    expect(gap.need).toBe("Take one of the listed courses.");
    expect(gap.suggestions).toHaveLength(10);
  });

  it("describes a filter and suggests catalog courses that fit and aren't in the plan", () => {
    const r = req(cmscMajor, "stat4xx");
    // Owner ruling (CS department-page answers, 2026-09-27): STAT426 is NOT cross-listed with
    // CMSC, so stat4xx no longer excludes it (see CONCENTRATION_CREDIT_ONLY_FOR_CMSC in
    // cmsc-major-2026-27.ts -- it's excluded only from the Upper Level Concentration now).
    expect(describeGap(r, result(r, "missing"), ctx(taken("STAT400")))).toEqual({
      need: "1 more STAT course numbered 400–499 (grad courses count too).",
      suggestions: ["STAT401", "STAT410", "STAT420", "STAT464"],
    });
  });

  it("describes Gen Ed categories by name", () => {
    const r = req(genEd, "dshu");
    expect(describeGap(r, result(r, "partial", ["ARTH200"]), ctx())!.need).toBe("1 more Humanities (DSHU) course.");
  });

  it("counts credits still needed", () => {
    const r = req(cmscMajor, "electives");
    const gap = describeGap(r, result(r, "partial", ["CMSC433"]), ctx(taken("CMSC433")))!;
    expect(gap.need).toBe("3 more credits: CMSC courses numbered 300–499 (grad courses count too) (not CMSC330 or CMSC351).");
    expect(gap.suggestions).toEqual(["CMSC420", "CMSC421", "CMSC451", "CMSC412", "CMSC460"]);
  });

  it("explains area distributions and suggests courses from areas not yet used", () => {
    const r = req(cmscMajor, "areas");
    const gap = describeGap(r, result(r, "partial", ["CMSC420", "CMSC421", "CMSC451"]), ctx(taken("CMSC420", "CMSC421", "CMSC451")))!;
    expect(gap.need).toBe("2 more courses from the listed areas, using at least 3 areas and at most 3 from any one.");
    expect(gap.suggestions.slice(0, 2)).toEqual(["CMSC412", "CMSC433"]);
  });

  it("still suggests a required course whose only completed attempt was graded F (it earns no credit)", () => {
    const r = req(cmscMajor, "cmsc351");
    const failed: StudentCourse[] = [{ id: "CMSC351", credits: 3, status: "completed", grade: "F" }];
    expect(describeGap(r, result(r, "missing"), ctx(failed))).toEqual({ need: "Take CMSC351.", suggestions: ["CMSC351"] });
  });

  it("still names a fixed set course missing, and doesn't let a failed filter-member attempt fill the count, when only F/W attempts exist", () => {
    const r: Requirement = {
      kind: "sets",
      id: "twelve",
      name: "Sequence Twelve",
      options: [["AOSC200", "AOSC201", { count: 2, from: { departments: ["AOSC"], minNumber: 400, maxNumber: 499 } }]],
    };
    const courses: StudentCourse[] = [
      { id: "AOSC200", credits: 3, status: "completed", grade: "F" },
      { id: "AOSC201", credits: 3, status: "completed", grade: "B" },
      { id: "AOSC431", credits: 3, status: "completed", grade: "B" },
      { id: "AOSC432", credits: 3, status: "completed", grade: "W" },
    ];
    const gap = describeGap(r, result(r, "missing"), ctx(courses))!;
    expect(gap.suggestions).toEqual(["AOSC200"]);
  });

  it("explains a concentration in one department", () => {
    const r = req(cmscMajor, "concentration");
    // Department page ("Upper Level Concentration", "Not Eligible for ULC"): Data Science,
    // Honors, Information Science and College Park Scholars are also never the ULC discipline.
    expect(describeGap(r, result(r, "partial", ["ECON305"]), ctx(taken("ECON305")))).toEqual({
      need: "9 more credits of courses numbered 300–499 (grad courses count too), all in one department (not CMSC, DATA, HONR, HNUH, INST or CPSP).",
      suggestions: [],
    });
  });

  it("points at the course set closest to done", () => {
    const r = req(mathMajorApplied, "depth");
    expect(describeGap(r, result(r, "partial", ["STAT410"]), ctx(taken("STAT410")))).toEqual({
      need: "Finish a set: STAT410 and STAT420 (or another listed set).",
      suggestions: ["STAT420"],
    });
  });

  it("describes a filter member of a set", () => {
    const r = req(mathMajorApplied, "supporting");
    const courses = taken("AOSC200", "AOSC201");
    const gap = describeGap(r, result(r, "partial", ["AOSC200", "AOSC201"]), ctx(courses))!;
    expect(gap.need).toBe("Finish a set: AOSC200, AOSC201 and 2 AOSC courses numbered 400–499 (grad courses count too) (or another listed set).");
  });
});

describe("filterText", () => {
  it("writes filters in words", () => {
    expect(filterText({ anyCourse: true })).toBe("any course");
    expect(filterText({ genEd: ["DSNS", "DSNL"] })).toBe("Natural Sciences (DSNS) or Natural Science Lab (DSNL) course");
    expect(filterText({ departments: ["MATH", "AMSC", "STAT"], minNumber: 240, maxNumber: 499 })).toBe("MATH, AMSC or STAT course numbered 240–499 (grad courses count too)");
    expect(filterText({ departments: ["MATH"], minNumber: 300, maxNumber: 399 })).toBe("MATH course numbered 300–399");
    expect(filterText({ departments: ["HEBR"], minNumber: 200, maxNumber: 499, noGraduateCourses: true })).toBe("HEBR course numbered 200–499");
  });
});

describe("genEdName", () => {
  it("names a code, and passes unknown codes through", () => {
    expect(genEdName("FSAW")).toBe("Academic Writing (FSAW)");
    expect(genEdName("ZZZZ")).toBe("ZZZZ");
  });
});

describe("prerequisiteText", () => {
  it("writes a parsed prerequisite in words", () => {
    expect(prerequisiteText({ kind: "course", course: "MATH140", minGrade: "C-" })).toBe("MATH140 (C- or better)");
    expect(
      prerequisiteText({
        kind: "all",
        of: [
          { kind: "course", course: "CMSC250", minGrade: "C-" },
          { kind: "any", of: [{ kind: "course", course: "CMSC132" }, { kind: "course", course: "CMSC142" }] },
        ],
      }),
    ).toBe("CMSC250 (C- or better) and (CMSC132 or CMSC142)");
    expect(prerequisiteText({ kind: "course", course: "MATH140", concurrentOk: true })).toBe("MATH140 (or in the same term)");
    expect(prerequisiteText({ kind: "manual", text: "Permission of CMNS-Mathematics department." })).toBe(
      "Permission of CMNS-Mathematics department.",
    );
  });
});

describe("describeGap: advisor approval", () => {
  const listed: Requirement = { kind: "course", id: "leadership-elective", name: "Leadership Elective", options: ["ENES317", "ENES472"] };
  const ctx = { courses: taken(), catalog: CATALOG };

  it("says other courses may count when the requirement's list isn't closed", () => {
    const open: Requirement = { ...listed, advisorMayApprove: true };
    expect(describeGap(open, result(open, "missing"), ctx)!.note).toBe("Other courses may count with advisor approval.");
  });

  it("says nothing extra for a closed list", () => {
    expect(describeGap(listed, result(listed, "missing"), ctx)!.note).toBeUndefined();
  });
});
