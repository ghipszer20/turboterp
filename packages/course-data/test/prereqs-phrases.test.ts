// P2-P10 phrase classes from docs/project/prereq-audit-verdicts.md. Inputs are real Testudo sentences
// (soc-202608 / soc-202701); expected trees are written by hand from the verdicts.

import { describe, expect, it } from "vitest";
import { parsePrerequisite, type Requirement } from "../src/prereqs.ts";

const course = (code: string, extra: object = {}): Requirement => ({ kind: "course", course: code, ...extra });
const n = (code: string) => course(code);
const c = (code: string) => course(code, { minGrade: "C-" });
const b = (code: string) => course(code, { minGrade: "B-" });
const k = (code: string) => course(code, { concurrentOk: true });
const man = (text: string): Requirement => ({ kind: "manual", text });
const all = (...of: Requirement[]): Requirement => ({ kind: "all", of });
const any = (...of: Requirement[]): Requirement => ({ kind: "any", of });

const PERM_CEE = "permission of the ENGR-Civil and Environmental Engineering department";

describe("P2: dropped 'or <prose>' alternatives", () => {
  it("BIOE221", () => {
    expect(parsePrerequisite("Minimum grade of C- in BIOE120 and (BIOE121 or a minimum of 60 credits).")).toEqual(
      all(c("BIOE120"), any(c("BIOE121"), man("a minimum of 60 credits"))),
    );
  });
  it("ENBC311", () => {
    expect(
      parsePrerequisite("Minimum grade of C- in MATH241; and minimum grade of C- in BIOE241 or approved prior study in Matlab."),
    ).toEqual(all(c("MATH241"), any(c("BIOE241"), man("approved prior study in Matlab"))));
  });
  it("ENBC331", () => {
    expect(parsePrerequisite("Minimum grade of C- in BIOE241 or approved prior study in Matlab.")).toEqual(
      any(c("BIOE241"), man("approved prior study in Matlab")),
    );
  });
  it("ENBC342", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in ENBC341; and minimum grade of C- in BIOE241 or approved prior study in Matlab; and must have earned a minimum grade of C- or be concurrently enrolled in ENBC331.",
      ),
    ).toEqual(
      all(c("ENBC341"), any(c("BIOE241"), man("approved prior study in Matlab")), course("ENBC331", { minGrade: "C-", concurrentOk: true })),
    );
  });
  it("RDEV450", () => {
    expect(
      parsePrerequisite(
        "Must have completed RDEV270 or an approved accounting course with a grade of C- or better; and minimum grade of C- in RDEV350.",
      ),
    ).toEqual(all(any(c("RDEV270"), man("an approved accounting course")), c("RDEV350")));
  });
  it("ENCE401", () => {
    expect(
      parsePrerequisite(
        "ENCE203 or experience with a programming language (e.g., Python, R, MATLAB); ENCE303 or another course that provides the relevant probability/statistics required content; and permission of the ENGR-Civil and Environmental Engineering department.",
      ),
    ).toEqual(
      all(
        any(n("ENCE203"), man("experience with a programming language (e.g., Python, R, MATLAB)")),
        any(n("ENCE303"), man("another course that provides the relevant probability/statistics required content")),
        man(PERM_CEE),
      ),
    );
  });
  it("ENCE451", () => {
    expect(
      parsePrerequisite(
        "ENCE353 or another course that provides the relevant structure analysis required content; and permission of the ENGR-Civil and Environmental Engineering department.",
      ),
    ).toEqual(all(any(n("ENCE353"), man("another course that provides the relevant structure analysis required content")), man(PERM_CEE)));
  });
  it("ENAE472", () => {
    expect(parsePrerequisite("ENAE311 or enrolled in hypersonics graduate certificate program.")).toEqual(
      any(n("ENAE311"), man("enrolled in hypersonics graduate certificate program")),
    );
  });
  it("SURV750", () => {
    expect(parsePrerequisite("SURV626, or course in applied sampling.")).toEqual(any(n("SURV626"), man("course in applied sampling")));
  });
  it("PHYS375", () => {
    expect(
      parsePrerequisite(
        "PHYS273, PHYS276, and (PHYS265, CMSC106, CMSC131, or another acceptable computer programming course with approval from the Physics Department).",
      ),
    ).toEqual(
      all(
        n("PHYS273"),
        n("PHYS276"),
        any(n("PHYS265"), n("CMSC106"), n("CMSC131"), man("another acceptable computer programming course with approval from the Physics Department")),
      ),
    );
  });
  it("INST751", () => {
    expect(
      parsePrerequisite("INFM603, INST733, or other programming and database courses, or Permission of the instructor."),
    ).toEqual(any(any(n("INFM603"), n("INST733"), man("other programming and database courses")), man("Permission of the instructor")));
  });
  it("MUSC240", () => {
    expect(parsePrerequisite("MUSC 140, or by permission of instructor.")).toEqual(any(n("MUSC140"), man("by permission of instructor")));
  });
  it("MLAW325", () => {
    expect(parsePrerequisite("MLAW315 or by permission of the department.")).toEqual(
      any(n("MLAW315"), man("by permission of the department")),
    );
  });
});
