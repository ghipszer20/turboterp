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

describe("P3: dropped requirements", () => {
  const ECON =
    "Minimum grade of C- in ECON200 and ECON201; and minimum grade of C- in ECON300 or (MATH241 and any statistics course).";
  const econ = all(all(c("ECON200"), c("ECON201")), any(c("ECON300"), all(c("MATH241"), man("any statistics course"))));
  for (const id of ["ECON321", "ECON325", "ECON326"]) {
    it(id, () => expect(parsePrerequisite(ECON)).toEqual(econ));
  }
  it("KNES386", () => {
    expect(
      parsePrerequisite("Must have completed at least one KNES core class with a C- or better and must have completed SPHL100 with a C- or better."),
    ).toEqual(all(man("at least one KNES core class"), c("SPHL100")));
  });
  it("ENES440", () => {
    expect(parsePrerequisite("Students must receive a B- or better in ENES240 and take 2 courses from the STEP minor elective list.")).toEqual(
      all(b("ENES240"), man("take 2 courses from the STEP minor elective list")),
    );
  });
  it("HLSC322", () => {
    expect(
      parsePrerequisite(
        "CHEM131, CHEM132, BSCI160, BSCI170, and either BSCI180 or (BSCI161 and BSCI171); or must have completed BSCI170, (BSCI180 or BSCI171), and two semesters of Chemistry.",
      ),
    ).toEqual(
      any(
        all(n("CHEM131"), n("CHEM132"), n("BSCI160"), n("BSCI170"), any(n("BSCI180"), all(n("BSCI161"), n("BSCI171")))),
        all(n("BSCI170"), any(n("BSCI180"), n("BSCI171")), man("two semesters of Chemistry")),
      ),
    );
  });
  it("BIOE461", () => {
    expect(parsePrerequisite("Minimum grade of C- in BIOE120, must have earned a minimum of 60 credits.")).toEqual(
      all(c("BIOE120"), man("must have earned a minimum of 60 credits")),
    );
  });
  it("ENPM631", () => {
    expect(
      parsePrerequisite(
        "ENPM694 or ENPM818O and ability to write code in one programming language and/or Undergraduate coursework in a programming language; or permission of instructor.",
      ),
    ).toEqual(
      any(
        all(any(n("ENPM694"), n("ENPM818O")), man("ability to write code in one programming language and/or Undergraduate coursework in a programming language")),
        man("permission of instructor"),
      ),
    );
  });
});

describe("P4: counted lists are manual, not one-of", () => {
  const TEXT =
    "(CMSC106, CMSC131, or ENEE150; or equivalent programming experience); and (2 courses from (CMSC330, CMSC351, ENEE324, or ENEE382); or any one of these courses and a 400-level MATH course, or two 400-level MATH courses); and Permission of CMNS-Mathematics department or permission of instructor.";
  const expected = all(
    any(any(n("CMSC106"), n("CMSC131"), n("ENEE150")), man("equivalent programming experience")),
    man("2 courses from (CMSC330, CMSC351, ENEE324, or ENEE382); or any one of these courses and a 400-level MATH course, or two 400-level MATH courses"),
    man("Permission of CMNS-Mathematics department or permission of instructor"),
  );
  for (const id of ["CMSC456", "MATH456", "ENEE456"]) {
    it(id, () => expect(parsePrerequisite(TEXT)).toEqual(expected));
  }
});

describe("P5: no sentence split after an initial or abbreviation", () => {
  const PERM = "permission of BMGT-Robert H. Smith School of Business";
  it("BMGT302", () => {
    expect(parsePrerequisite(`BMGT301; or ${PERM}.`)).toEqual(any(n("BMGT301"), man(PERM)));
  });
  it("BUFN710", () => {
    expect(parsePrerequisite(`BUFN610; or ${PERM}.`)).toEqual(any(n("BUFN610"), man(PERM)));
  });
  it("BULM701", () => {
    expect(parsePrerequisite(`BULM700; or ${PERM}.`)).toEqual(any(n("BULM700"), man(PERM)));
  });
  for (const id of ["BMGT843", "BMSO600", "BUMO790"]) {
    it(id, () => expect(parsePrerequisite(`Permission of BMGT-Robert H. Smith School of Business.`)).toEqual(man("Permission of BMGT-Robert H. Smith School of Business")));
  }
  it("does not split after e.g. / ex.", () => {
    expect(parsePrerequisite("Programming course, e.g. Python; and BSCI105.")).toEqual(
      all(man("Programming course, e.g. Python"), n("BSCI105")),
    );
  });
});

describe("P6: concurrent phrasing", () => {
  it("NFSC380", () => {
    expect(parsePrerequisite("Minimum of C- in NFSC315; and BCHM461 must be completed or in progress.")).toEqual(
      all(c("NFSC315"), k("BCHM461")),
    );
  });
  it("ENST415", () => {
    expect(
      parsePrerequisite("CHEM131; and PHYS121 must be completed or in progress; or permission of AGNR-Environmental Science & Technology department."),
    ).toEqual(any(all(n("CHEM131"), k("PHYS121")), man("permission of AGNR-Environmental Science & Technology department")));
  });
  it("ENST462", () => {
    expect(
      parsePrerequisite(
        "(BSCI160 and BSCI161) and (BSCI170 and BSCI171); and ENST460 must be completed or in progress; or permission of instructor.",
      ),
    ).toEqual(
      any(all(all(all(n("BSCI160"), n("BSCI161")), all(n("BSCI170"), n("BSCI171"))), k("ENST460")), man("permission of instructor")),
    );
  });
  it("ENVH414", () => {
    expect(parsePrerequisite("SPHL100 and EPIB301 enrolled or completed.")).toEqual(all(k("SPHL100"), k("EPIB301")));
  });
  it("ENFP440", () => {
    expect(parsePrerequisite("Must have completed with a C- or better or concurrently be enrolled in ENFP300.")).toEqual(
      course("ENFP300", { minGrade: "C-", concurrentOk: true }),
    );
  });
});

describe("P7: conditional corequisite", () => {
  it("ARSC100", () => {
    expect(parsePrerequisite("AFROTC cadets must also register for ARSC059.")).toEqual(
      man("AFROTC cadets must also register for ARSC059"),
    );
  });
  it("ARSC300", () => {
    expect(parsePrerequisite("AFROTC cadets must also register for ARSC059; or permission of UGST-AFROTC-Air Science.")).toEqual(
      any(man("AFROTC cadets must also register for ARSC059"), man("permission of UGST-AFROTC-Air Science")),
    );
  });
});

describe("P8: examples are not requirements", () => {
  it("ENTM797", () => {
    expect(parsePrerequisite("Introductory entomology course (ex. BSCI337); a college level understanding of biology is required.")).toEqual(
      all(man("Introductory entomology course (ex. BSCI337)"), man("a college level understanding of biology is required")),
    );
  });
});

describe("P9: course ranges", () => {
  it("FMSC485", () => {
    expect(parsePrerequisite("FMSC330; or 1 course from PSYC300-499 course range.")).toEqual(
      any(n("FMSC330"), { kind: "dept-level", dept: "PSYC", minNumber: 300 }),
    );
  });
});

describe("P10: non-requirement sentences", () => {
  it("ENGL388P", () => {
    expect(parsePrerequisite("Permission of ARHU-English department. Repeatable to 12 credits if content differs.")).toEqual(
      man("Permission of ARHU-English department"),
    );
  });
  it("ENGL388V", () => {
    expect(parsePrerequisite("Permission of the ARHU-English department. Repeatable to 12 credits.")).toEqual(
      man("Permission of the ARHU-English department"),
    );
  });
  it("ENGL388W / SPAN388W", () => {
    expect(parsePrerequisite("Permission of the Writing Center (1205 Tawes Hall). Repeatable to 12 credits.")).toEqual(
      man("Permission of the Writing Center (1205 Tawes Hall)"),
    );
  });
});
