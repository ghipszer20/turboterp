// Inputs are real Testudo prerequisite sentences (Spring 2027); expected
// trees are written by hand.

import { describe, expect, it } from "vitest";
import { parsePrerequisite } from "../src/prereqs.ts";

describe("parsePrerequisite", () => {
  it("reads a bare course code", () => {
    expect(parsePrerequisite("MATH212.")).toEqual({ kind: "course", course: "MATH212" });
  });

  it("keeps the minimum grade", () => {
    expect(parsePrerequisite("Minimum grade of C- in MATH141.")).toEqual({
      kind: "course",
      course: "MATH141",
      minGrade: "C-",
    });
  });

  it("requires every course joined by 'and', each with the grade", () => {
    expect(parsePrerequisite("Minimum grade of C- in CMSC250 and CMSC216.")).toEqual({
      kind: "all",
      of: [
        { kind: "course", course: "CMSC250", minGrade: "C-" },
        { kind: "course", course: "CMSC216", minGrade: "C-" },
      ],
    });
  });

  it("accepts any course joined by 'or'", () => {
    expect(parsePrerequisite("Minimum grade of C- in STAT400 or STAT410.")).toEqual({
      kind: "any",
      of: [
        { kind: "course", course: "STAT400", minGrade: "C-" },
        { kind: "course", course: "STAT410", minGrade: "C-" },
      ],
    });
  });

  it("gives commas in a list the meaning of the list's final connector", () => {
    expect(parsePrerequisite("Minimum grade of C- in MATH240, MATH461 or MATH341.")).toEqual({
      kind: "any",
      of: [
        { kind: "course", course: "MATH240", minGrade: "C-" },
        { kind: "course", course: "MATH461", minGrade: "C-" },
        { kind: "course", course: "MATH341", minGrade: "C-" },
      ],
    });
  });

  it("keeps parenthesized groups together", () => {
    expect(parsePrerequisite("Minimum grade of C- in PHYS161, MATH141, CHEM135, and (ENES102 or ENAE222).")).toEqual({
      kind: "all",
      of: [
        { kind: "course", course: "PHYS161", minGrade: "C-" },
        { kind: "course", course: "MATH141", minGrade: "C-" },
        { kind: "course", course: "CHEM135", minGrade: "C-" },
        {
          kind: "any",
          of: [
            { kind: "course", course: "ENES102", minGrade: "C-" },
            { kind: "course", course: "ENAE222", minGrade: "C-" },
          ],
        },
      ],
    });
  });

  it("reads '1 course … from (list)' as a choice of one", () => {
    expect(parsePrerequisite("1 course with a minimum grade of C- from (MATH240, MATH341, MATH461, ENEE290).")).toEqual({
      kind: "any",
      of: [
        { kind: "course", course: "MATH240", minGrade: "C-" },
        { kind: "course", course: "MATH341", minGrade: "C-" },
        { kind: "course", course: "MATH461", minGrade: "C-" },
        { kind: "course", course: "ENEE290", minGrade: "C-" },
      ],
    });
  });

  it("keeps a requirement with no course as something to confirm by hand", () => {
    expect(parsePrerequisite("Permission of CMNS-Mathematics department.")).toEqual({
      kind: "manual",
      text: "Permission of CMNS-Mathematics department",
    });
  });

  it("joins semicolon clauses by their leading connector, keeping manual alternatives", () => {
    expect(parsePrerequisite("Minimum grade of C- in CMSC330 and CMSC351; or permission of instructor.")).toEqual({
      kind: "any",
      of: [
        {
          kind: "all",
          of: [
            { kind: "course", course: "CMSC330", minGrade: "C-" },
            { kind: "course", course: "CMSC351", minGrade: "C-" },
          ],
        },
        { kind: "manual", text: "permission of instructor" },
      ],
    });
  });

  it("treats a sentence starting with 'Or' as an alternative to everything before it", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in CMSC351; and permission of CMNS-Computer Science department. Or must be in the (Computer Science (Doctoral), Computer Science (Master's)) program.",
      ),
    ).toEqual({
      kind: "any",
      of: [
        {
          kind: "all",
          of: [
            { kind: "course", course: "CMSC351", minGrade: "C-" },
            { kind: "manual", text: "permission of CMNS-Computer Science department" },
          ],
        },
        {
          kind: "manual",
          text: "must be in the (Computer Science (Doctoral), Computer Science (Master's)) program",
        },
      ],
    });
  });

  it("doesn't mistake an ordinary word and a number for a course", () => {
    expect(parsePrerequisite("Must have completed more than 300 hours of clinical work.")).toEqual({
      kind: "manual",
      text: "Must have completed more than 300 hours of clinical work",
    });
  });

  it("allows taking a course at the same time when the text says 'concurrently enrolled'", () => {
    expect(parsePrerequisite("Must have completed or be concurrently enrolled in CHEM481.")).toEqual({
      kind: "course",
      course: "CHEM481",
      concurrentOk: true,
    });
  });

  it("treats math eligibility as a placement to confirm, not a course to have taken", () => {
    expect(parsePrerequisite("Must have math eligibility of MATH120 or higher.")).toEqual({
      kind: "manual",
      text: "Must have math eligibility of MATH120 or higher",
    });
  });

  it("requires every sentence when a new sentence has no connector, and keeps semicolons inside parentheses together", () => {
    expect(
      parsePrerequisite(
        "Must have completed the Communication gateway requirements (COMM250; and one of STAT100 or BMGT230). Must have completed or be concurrently enrolled in COMM130.",
      ),
    ).toEqual({
      kind: "all",
      of: [
        {
          kind: "all",
          of: [
            { kind: "course", course: "COMM250" },
            {
              kind: "any",
              of: [
                { kind: "course", course: "STAT100" },
                { kind: "course", course: "BMGT230" },
              ],
            },
          ],
        },
        { kind: "course", course: "COMM130", concurrentOk: true },
      ],
    });
  });

  it("keeps 'or equivalent' as a route the student confirms", () => {
    expect(parsePrerequisite("MATH140 or equivalent.")).toEqual({
      kind: "any",
      of: [
        { kind: "course", course: "MATH140" },
        { kind: "manual", text: "equivalent" },
      ],
    });
  });

  it("keeps a permission requirement that shares a clause with a course", () => {
    expect(parsePrerequisite("Minimum grade of C- in MATH340 and permission of CMNS-Mathematics department.")).toEqual({
      kind: "all",
      of: [
        { kind: "course", course: "MATH340", minGrade: "C-" },
        { kind: "manual", text: "permission of CMNS-Mathematics department" },
      ],
    });
  });

  describe("without inventing requirements", () => {
    const course = (code: string, extra: object = {}) => ({ kind: "course", course: code, ...extra });
    const all = (...of: object[]) => ({ kind: "all", of });
    const any = (...of: object[]) => ({ kind: "any", of });
    const manual = (text: string) => ({ kind: "manual", text });
    const g = (grade: string, ...codes: string[]) => codes.map((code) => course(code, { minGrade: grade }));

    it("treats a waiver clause as an alternative, not as course requirements (STAT426)", () => {
      expect(
        parsePrerequisite(
          "Minimum grade of C- in MATH241 or MATH340; and minimum grade of C- in MATH240, MATH461 or MATH341; and minimum grade of C- in STAT400 or STAT410; students who have taken courses with content comparable to STAT400/410 may request permission of the instructor.",
        ),
      ).toEqual(
        any(
          all(any(...g("C-", "MATH241", "MATH340")), any(...g("C-", "MATH240", "MATH461", "MATH341")), any(...g("C-", "STAT400", "STAT410"))),
          manual("students who have taken courses with content comparable to STAT400/410 may request permission of the instructor"),
        ),
      );
    });

    it("treats a waiver sentence with no connector as an alternative (RUSS406)", () => {
      expect(
        parsePrerequisite(
          "Must have completed RUSS301 or be concurrently enrolled in RUSS302. Students who have taken courses with comparable content may contact the department.",
        ),
      ).toEqual(
        any(
          any(course("RUSS301", { concurrentOk: true }), course("RUSS302", { concurrentOk: true })),
          manual("Students who have taken courses with comparable content may contact the department"),
        ),
      );
    });

    it("does not require a course named in a 'not to include' parenthetical (MATH470)", () => {
      expect(
        parsePrerequisite("MATH141 and MATH140; and must have completed one 400-level MATH course (not to include MATH461, 478, and 480's)."),
      ).toEqual(
        all(all(course("MATH141"), course("MATH140")), manual("must have completed one 400-level MATH course (not to include MATH461, 478, and 480's)")),
      );
    });

    it("does not require a course named in a 'not including' parenthetical (MATH436)", () => {
      expect(
        parsePrerequisite(
          "1 course with a minimum grade of C- from (MATH241, MATH340); and 1 course with a minimum grade of C- from (MATH461, MATH240, MATH341); and must have completed two 400-level MATH courses with a minimum grade of C- (not including MATH461, and 480's).",
        ),
      ).toEqual(
        all(
          any(...g("C-", "MATH241", "MATH340")),
          any(...g("C-", "MATH461", "MATH240", "MATH341")),
          manual("must have completed two 400-level MATH courses with a minimum grade of C- (not including MATH461, and 480's)"),
        ),
      );
    });

    it("reads 'BSCI 331 and 332' as two courses in one department", () => {
      expect(parsePrerequisite("Minimum grade of C- in [BSCI330 or (BSCI 331 and 332)].")).toEqual(
        any(course("BSCI330", { minGrade: "C-" }), all(...g("C-", "BSCI331", "BSCI332"))),
      );
    });

    it("carries the department over a comma list of bare numbers (EPIB644)", () => {
      expect(parsePrerequisite("Students must have completed EPIB610, 611 and EPIB 650 with a grade of B or better.")).toEqual(
        all(...g("B", "EPIB610", "EPIB611", "EPIB650")),
      );
    });

    it("reads 'MATH461, 478' as two courses", () => {
      expect(parsePrerequisite("MATH461, 478.")).toEqual(all(course("MATH461"), course("MATH478")));
    });

    it("reads a slash between courses as 'or' (NFSC641)", () => {
      expect(parsePrerequisite("AGST130; CHEM131/271; or by Permission.")).toEqual(
        any(all(course("AGST130"), any(course("CHEM131"), course("CHEM271"))), manual("by Permission")),
      );
    });

    it("reads a slash between full course codes as 'or'", () => {
      expect(parsePrerequisite("ENAE202/ENME202.")).toEqual(any(course("ENAE202"), course("ENME202")));
    });

    it("reads 'A grade of C- or higher in' (ENME447)", () => {
      expect(parsePrerequisite("A grade of C- or higher in ENME202 and ENME331.")).toEqual(all(...g("C-", "ENME202", "ENME331")));
    });

    it("reads 'completed with C- or higher' (ENVH426)", () => {
      expect(parsePrerequisite("SPHL100 and EPIB301 completed with C- or higher; or permission of instructor.")).toEqual(
        any(all(...g("C-", "SPHL100", "EPIB301")), manual("permission of instructor")),
      );
    });

    it("reads 'Minimum of C- or better in' (ENEE382)", () => {
      expect(
        parsePrerequisite(
          "Minimum of C- or better in ENEE205, MATH241, PHYS270, and PHYS271; and permission of ENGR-Electrical & Computer Engineering department.",
        ),
      ).toEqual(
        all(all(...g("C-", "ENEE205", "MATH241", "PHYS270", "PHYS271")), manual("permission of ENGR-Electrical & Computer Engineering department")),
      );
    });

    it("reads 'Grades of A- or higher in' (PHYS400)", () => {
      expect(parsePrerequisite("Grades of A- or higher in PHYS272, PHYS273, MATH241, and MATH243 or MATH246, and permission of CMNS-Physics Department.")).toEqual(
        all(
          any(all(...g("A-", "PHYS272", "PHYS273", "MATH241", "MATH243")), course("MATH246", { minGrade: "A-" })),
          manual("permission of CMNS-Physics Department"),
        ),
      );
    });

    it("reads 'minimum grade C-' without 'of' (AMSC420)", () => {
      expect(
        parsePrerequisite(
          "1 course with a minimum grade of C- from (MATH240, MATH461, MATH341, ENEE290, MATH243); and 1 course with a minimum grade of C- from (MATH241, MATH340); and 1 course with a minimum grade of C- from (MATH246, MATH341, ENEE290, MATH243); and 1 course with a minimum grade of C- from (STAT400, STAT410); and 1 course with a minimum grade C- from (CMSC106, CMSC131).",
        ),
      ).toEqual(
        all(
          any(...g("C-", "MATH240", "MATH461", "MATH341", "ENEE290", "MATH243")),
          any(...g("C-", "MATH241", "MATH340")),
          any(...g("C-", "MATH246", "MATH341", "ENEE290", "MATH243")),
          any(...g("C-", "STAT400", "STAT410")),
          any(...g("C-", "CMSC106", "CMSC131")),
        ),
      );
    });

    it("reads 'must receive a B- or better' (ENES440)", () => {
      expect(parsePrerequisite("Students must receive a B- or better in ENES240 and take 2 courses from the STEP minor elective list.")).toEqual(
        course("ENES240", { minGrade: "B-" }),
      );
    });

    it("keeps 'or comparable experience' as a route the student confirms (JOUR635)", () => {
      expect(parsePrerequisite("JOUR620 or comparable experience.")).toEqual(any(course("JOUR620"), manual("comparable experience")));
    });

    it("keeps 'or other ecology equivalent' as a route the student confirms (ENST650)", () => {
      expect(parsePrerequisite("ENST360 or other ecology equivalent.")).toEqual(any(course("ENST360"), manual("other ecology equivalent")));
    });

    it("keeps 'or equivalent courses' inside an unparenthesized 'one of the following' list (PHYS313)", () => {
      expect(
        parsePrerequisite("MATH241, PHYS273, and one of the following: PHYS274, MATH240, MATH243, MATH246, or equivalent courses."),
      ).toEqual(
        all(
          course("MATH241"),
          course("PHYS273"),
          any(course("PHYS274"), course("MATH240"), course("MATH243"), course("MATH246"), manual("equivalent courses")),
        ),
      );
    });

    it("treats a waiver after a comma as an alternative to the course (JOUR772)", () => {
      expect(
        parsePrerequisite("Must have completed JOUR502, or students who have taken courses with comparable content may contact the department."),
      ).toEqual(any(course("JOUR502"), manual("students who have taken courses with comparable content may contact the department")));
    });

    it("treats a waiver inside parentheses as an alternative (PSYC732)", () => {
      expect(
        parsePrerequisite(
          "PSYC603; and (PSYC602; or students who have taken courses with comparable content may contact the department). Or permission of instructor.",
        ),
      ).toEqual(
        any(
          all(course("PSYC603"), any(course("PSYC602"), manual("students who have taken courses with comparable content may contact the department"))),
          manual("permission of instructor"),
        ),
      );
    });

    it("keeps 'or equivalent' in the middle of a list of alternatives (ENME485)", () => {
      expect(parsePrerequisite("ENME202 or equivalent, experience using Python, or permission of the instructor.")).toEqual(
        any(any(course("ENME202"), manual("equivalent")), manual("permission of the instructor")),
      );
    });

    it("keeps 'or equivalent programming experience' inside a parenthesized list (CMSC456)", () => {
      expect(parsePrerequisite("(CMSC106, CMSC131, or ENEE150; or equivalent programming experience).")).toEqual(
        any(any(course("CMSC106"), course("CMSC131"), course("ENEE150")), manual("equivalent programming experience")),
      );
    });

    it("reads a grade phrase that stands alone: 'C- or better in' (JAPN320)", () => {
      expect(parsePrerequisite("C- or better in JAPN 202.")).toEqual(course("JAPN202", { minGrade: "C-" }));
    });

    it("reads semicolon clauses after 'one of the following' with the list's final connector (GFPL492)", () => {
      expect(
        parsePrerequisite(
          "Must have taken one of the following two-course physics sequences: PHYS131 and 132; PHYS141 and PHYS142; PHYS161 and PHYS260; or PHYS171 and PHYS272.",
        ),
      ).toEqual(
        any(
          all(course("PHYS131"), course("PHYS132")),
          all(course("PHYS141"), course("PHYS142")),
          all(course("PHYS161"), course("PHYS260")),
          all(course("PHYS171"), course("PHYS272")),
        ),
      );
    });
  });
});
