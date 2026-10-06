import { describe, expect, it } from "vitest";
import { auditProgram, type Program } from "@turboterp/audit";
import {
  creditForAp,
  creditForIb,
  CreditError,
  dualEnrollmentToStudentCourses,
  mergeCreditCourses,
  toStudentCourses,
} from "../src/index.ts";

describe("toStudentCourses", () => {
  it("turns AP Calculus BC 5 into two completed courses with no grade", () => {
    expect(toStudentCourses([creditForAp("Calculus BC", 5)])).toEqual({
      courses: [
        { id: "MATH140", credits: 4, status: "completed", genEd: ["FSMA", "FSAR"], source: "AP Calculus BC (5)", exam: true },
        { id: "MATH141", credits: 4, status: "completed", genEd: [], source: "AP Calculus BC (5)", exam: true },
      ],
      needsChoice: [],
      notCounted: [],
    });
  });

  it("gives credit with no UMD course a placeholder id no course requirement can match", () => {
    const { courses } = toStudentCourses([creditForAp("Computer Science A", 4), creditForAp("Biology", 3), creditForIb("Psychology", "HL", 5)]);
    expect(courses).toEqual([
      { id: "L1:AP Computer Science A", credits: 3, status: "completed", genEd: [], source: "AP Computer Science A (4)", exam: true },
      { id: "DSNL:AP Biology", credits: 4, status: "completed", genEd: ["DSNL"], source: "AP Biology (3)", exam: true },
      { id: "DSHS:IB Psychology HL", credits: 3, status: "completed", genEd: ["DSHS"], source: "IB Psychology HL (5)", exam: true },
    ]);
  });

  it("numbers two placeholders from the same award", () => {
    const { courses } = toStudentCourses([creditForAp("English Literature and Composition", 5)]);
    expect(courses.map((c) => c.id)).toEqual(["ENGL278", "L1:AP English Literature and Composition"]);
    const twoElectives = toStudentCourses([
      { ...creditForAp("Seminar", 4), parts: [...creditForAp("Seminar", 4).parts, ...creditForAp("Seminar", 4).parts] },
    ]);
    expect(twoElectives.courses.map((c) => c.id)).toEqual(["L1:AP Seminar", "L1:AP Seminar #2"]);
  });

  it("skips awards that earn nothing", () => {
    expect(toStudentCourses([creditForAp("Calculus BC", 2)]).courses).toEqual([]);
  });

  it("holds back a choice until the student picks a course", () => {
    const history = creditForAp("United States History", 4);
    expect(toStudentCourses([history])).toEqual({
      courses: [],
      needsChoice: [{ source: "AP United States History (4)", credits: 3, options: ["HIST200", "HIST201"] }],
      notCounted: [],
    });
    expect(toStudentCourses([history], { "AP United States History (4)": "HIST201" }).courses).toEqual([
      { id: "HIST201", credits: 3, status: "completed", genEd: ["DSHS", "DSHU", "DVUP"], source: "AP United States History (4)", exam: true },
    ]);
  });

  it("rejects a pick the chart doesn't offer", () => {
    expect(() => toStudentCourses([creditForAp("United States History", 4)], { "AP United States History (4)": "HIST110" })).toThrow(CreditError);
  });

  it("counts a course once when two exams award it", () => {
    const { courses } = toStudentCourses([creditForAp("Calculus AB", 5), creditForAp("Calculus BC", 5)]);
    expect(courses.map((c) => c.id)).toEqual(["MATH140", "MATH141"]);
  });
});

// The chart: "Credit is granted for Calculus AB or BC, not both", and a BC score of 3 or below
// has its AB subscore processed as the AB exam.
describe("Calculus AB or BC, not both", () => {
  it("counts only the AB subscore when the BC score is 3", () => {
    const result = toStudentCourses([creditForAp("Calculus BC", 3), creditForAp("Calculus BC AB Subscore", 5)]);
    expect(result.courses.map((c) => [c.id, c.credits])).toEqual([["MATH140", 4]]);
    expect(result.notCounted).toEqual([
      { source: "AP Calculus BC (3)", reason: "UMD grants credit for Calculus AB or BC, not both; AP Calculus BC AB Subscore (5) counts instead." },
    ]);
  });

  it("counts only BC when BC earns more than AB", () => {
    const result = toStudentCourses([creditForAp("Calculus AB", 5), creditForAp("Calculus BC", 4)]);
    expect(result.courses.map((c) => c.id)).toEqual(["MATH140", "MATH141"]);
    expect(result.courses.every((c) => c.source === "AP Calculus BC (4)")).toBe(true);
    expect(result.notCounted.map((n) => n.source)).toEqual(["AP Calculus AB (5)"]);
  });

  it("gives one elective, not two, for AB 3 and BC 3", () => {
    const { courses } = toStudentCourses([creditForAp("Calculus AB", 3), creditForAp("Calculus BC", 3)]);
    expect(courses.map((c) => c.id)).toEqual(["L1:AP Calculus BC"]);
  });

  it("leaves a lone calculus award alone", () => {
    expect(toStudentCourses([creditForAp("Calculus AB", 3)]).notCounted).toEqual([]);
  });
});

describe("mergeCreditCourses", () => {
  const ap = toStudentCourses([creditForAp("Calculus AB", 5)]).courses;
  const mc = dualEnrollmentToStudentCourses([
    { institution: "Montgomery College", course: "MATH181", credits: 4, umdEquivalent: [{ id: "MATH140" }] },
    { institution: "Montgomery College", course: "ENGL101", credits: 3, umdEquivalent: [{ id: "ENGL101", genEd: ["FSAW"] }] },
  ]);

  it("keeps the first copy of a course that AP and dual enrollment both award", () => {
    const { courses, notCounted } = mergeCreditCourses(ap, mc);
    expect(courses.map((c) => [c.id, c.source])).toEqual([
      ["MATH140", "AP Calculus AB (5)"],
      ["ENGL101", "Montgomery College ENGL101"],
    ]);
    expect(notCounted).toEqual([{ source: "Montgomery College MATH181", reason: "MATH140 already comes from AP Calculus AB (5)." }]);
  });

  it("keeps every placeholder, since each is its own credit", () => {
    const electives = dualEnrollmentToStudentCourses([
      { institution: "Montgomery College", course: "ART100", credits: 3, umdEquivalent: "elective credit" },
    ]);
    const exam = toStudentCourses([creditForAp("Computer Science A", 4)]).courses;
    expect(mergeCreditCourses(exam, electives).courses.map((c) => c.id)).toEqual(["L1:AP Computer Science A", "L1:Montgomery College ART100"]);
  });
});

describe("in the degree audit", () => {
  const program: Program = {
    id: "demo",
    name: "Demo",
    requirements: [
      { kind: "course", id: "calc1", name: "Calculus I", options: ["MATH140"] },
      { kind: "choose", id: "lab", name: "Lab science", count: 1, from: { genEd: ["DSNL"] } },
      { kind: "choose", id: "cs", name: "A CMSC course", count: 1, from: { departments: ["CMSC"] } },
      { kind: "choose", id: "total", name: "Credits", credits: 15, from: { anyCourse: true }, overlay: true },
    ],
  };

  it("counts exam credit toward courses, Gen Ed and total credits, but not department requirements", async () => {
    const { courses } = toStudentCourses([creditForAp("Calculus BC", 5), creditForAp("Biology", 3), creditForAp("Computer Science A", 4)]);
    const status = Object.fromEntries((await auditProgram(program, courses)).requirements.map((r) => [r.id, r.status]));
    expect(status).toEqual({ calc1: "satisfied", lab: "satisfied", cs: "missing", total: "satisfied" });
  });
});

describe("exam credit flag", () => {
  it("marks AP and IB courses, generic awards included, as exam credit", () => {
    const { courses } = toStudentCourses([creditForAp("Calculus BC", 5), creditForAp("Biology", 3), creditForIb("Psychology", "HL", 5)]);
    expect(courses.length).toBeGreaterThan(2);
    for (const c of courses) expect(c.exam).toBe(true);
  });

  it("doesn't mark dual enrollment as exam credit", () => {
    const entry = { institution: "PGCC", course: "MATH 140", credits: 4, umdEquivalent: [{ id: "MATH140", genEd: ["FSMA", "FSAR"] }] };
    const courses = dualEnrollmentToStudentCourses([entry]);
    expect(courses.length).toBe(1);
    for (const c of courses) expect(c.exam).toBeUndefined();
  });
});
