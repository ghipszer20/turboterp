// P1 (and/or precedence): "or" binds tighter than "and" at each level (sentence, ";" clause, comma list).
// Inputs are real Testudo sentences; expected trees are written by hand from docs/project/prereq-audit-verdicts.md.

import { describe, expect, it } from "vitest";
import { parsePrerequisite, type Requirement } from "../src/prereqs.ts";

const course = (code: string, extra: object = {}): Requirement => ({
  kind: "course",
  course: code,
  ...extra,
});
const n = (code: string) => course(code);
const c = (code: string) => course(code, { minGrade: "C-" });
const b = (code: string) => course(code, { minGrade: "B-" });
const a = (code: string) => course(code, { minGrade: "A-" });
const k = (code: string) => course(code, { concurrentOk: true });
const man = (text: string): Requirement => ({ kind: "manual", text });
const all = (...of: Requirement[]): Requirement => ({ kind: "all", of });
const any = (...of: Requirement[]): Requirement => ({ kind: "any", of });

describe("and/or precedence (P1)", () => {
  it("PHYS131 prerequisite", () => {
    expect(
      parsePrerequisite(
        "CHEM131; and (MATH136 or MATH140); and BSCI160, BSCI170, and either BSCI180 or (BSCI161 and BSCI171).",
      ),
    ).toEqual(
      all(
        n("CHEM131"),
        any(n("MATH136"), n("MATH140")),
        all(
          n("BSCI160"),
          n("BSCI170"),
          any(n("BSCI180"), all(n("BSCI161"), n("BSCI171"))),
        ),
      ),
    );
  });

  it("PHYS400 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Grades of A- or higher in PHYS272, PHYS273, MATH241, and MATH243 or MATH246, and permission of CMNS-Physics Department.",
      ),
    ).toEqual(
      all(
        all(
          a("PHYS272"),
          a("PHYS273"),
          a("MATH241"),
          any(a("MATH243"), a("MATH246")),
        ),
        man("permission of CMNS-Physics Department"),
      ),
    );
  });

  it("BSCI222 prerequisite", () => {
    expect(
      parsePrerequisite(
        "BSCI170 and (BSCI180 or BSCI171); or (BIOE120 and BIOE121); and CHEM131 and CHEM132; and either (CHEM231 and CHEM232) or (BSCI160 and BSCI161 or BSCI180) .",
      ),
    ).toEqual(
      all(
        any(
          all(n("BSCI170"), any(n("BSCI180"), n("BSCI171"))),
          all(n("BIOE120"), n("BIOE121")),
        ),
        all(n("CHEM131"), n("CHEM132")),
        any(
          all(n("CHEM231"), n("CHEM232")),
          all(n("BSCI160"), any(n("BSCI161"), n("BSCI180"))),
        ),
      ),
    );
  });

  it("BSCI401 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in BSCI160 and (BSCI180 or BSCI161) and CHEM237 or both CHEM231 and CHEM232.",
      ),
    ).toEqual(
      all(
        c("BSCI160"),
        any(c("BSCI180"), c("BSCI161")),
        any(c("CHEM237"), all(c("CHEM231"), c("CHEM232"))),
      ),
    );
  });

  it("BSCI410 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in (BSCI222 or HLSC322) and either CHEM237 or both CHEM231 and CHEM232.",
      ),
    ).toEqual(
      all(
        any(c("BSCI222"), c("HLSC322")),
        any(c("CHEM237"), all(c("CHEM231"), c("CHEM232"))),
      ),
    );
  });

  it("BSCI420 prerequisite", () => {
    expect(
      parsePrerequisite(
        "(BSCI331 or BSCI330) and (BSCI222 or HLSC322) and CHEM237 or (CHEM231 and CHEM232).",
      ),
    ).toEqual(
      all(
        any(n("BSCI331"), n("BSCI330")),
        any(n("BSCI222"), n("HLSC322")),
        any(n("CHEM237"), all(n("CHEM231"), n("CHEM232"))),
      ),
    );
  });

  it("BSCI436 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in BSCI330 OR (BSCI331 and BSCI332) and minimum grade of C- (BSCI222 or HLSC322).",
      ),
    ).toEqual(
      all(
        any(c("BSCI330"), all(c("BSCI331"), c("BSCI332"))),
        any(c("BSCI222"), c("HLSC322")),
      ),
    );
  });

  it("BSCI442 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in BSCI170 and (BSCI180 or BSCI171); or minimum grade of C- in PLSC201 and PLSC206; and minimum grade of C- in CHEM231 and CHEM232; or minimum grade of C- in CHEM237.",
      ),
    ).toEqual(
      all(
        any(
          all(c("BSCI170"), any(c("BSCI180"), c("BSCI171"))),
          all(c("PLSC201"), c("PLSC206")),
        ),
        any(all(c("CHEM231"), c("CHEM232")), c("CHEM237")),
      ),
    );
  });

  it("BCHM461 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in CHEM271 and CHEM272; or minimum grade of C- in CHEM276 and CHEM277; and minimum grade of C- in (CHEM241 and CHEM242) or CHEM247.",
      ),
    ).toEqual(
      all(
        any(all(c("CHEM271"), c("CHEM272")), all(c("CHEM276"), c("CHEM277"))),
        any(all(c("CHEM241"), c("CHEM242")), c("CHEM247")),
      ),
    );
  });

  it("BCHM485 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in CHEM135; or minimum grade of C- in (CHEM271 or CHEM276) and in (CHEM272 or CHEM277); and minimum grade of C- in MATH141; and minimum grade of C- in (PHYS260 and PHYS261) or C- in PHYS142.",
      ),
    ).toEqual(
      all(
        any(
          c("CHEM135"),
          all(any(c("CHEM271"), c("CHEM276")), any(c("CHEM272"), c("CHEM277"))),
        ),
        c("MATH141"),
        any(all(c("PHYS260"), c("PHYS261")), c("PHYS142")),
      ),
    );
  });

  it("BIOE411 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in BIOE120 and either BSCI330 or (BSCI331 and BSCI332); and must have earned a minimum of 60 credits.",
      ),
    ).toEqual(
      all(
        all(c("BIOE120"), any(c("BSCI330"), all(c("BSCI331"), c("BSCI332")))),
        man("must have earned a minimum of 60 credits"),
      ),
    );
  });

  it("AGST275 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in CHEM131 and CHEM132; and minimum grade of C- in (PLSC110 and PLSC11) or (PLSC112 and PLSC113) or (BSCI160 and BSCI180 or BSCI161) or (BSCI170 and BSCI180 or BSCI171).",
      ),
    ).toEqual(
      all(
        all(c("CHEM131"), c("CHEM132")),
        any(
          c("PLSC110"),
          all(c("PLSC112"), c("PLSC113")),
          all(c("BSCI160"), any(c("BSCI180"), c("BSCI161"))),
          all(c("BSCI170"), any(c("BSCI180"), c("BSCI171"))),
        ),
      ),
    );
  });

  it("AGST400 prerequisite", () => {
    expect(
      parsePrerequisite(
        "(PLSC110 and PLSC111) OR (PLSC112 and PLSC113), BSCI160 and (BSCI180 or BSCI161), and MATH113 or higher.",
      ),
    ).toEqual(
      all(
        any(all(n("PLSC110"), n("PLSC111")), all(n("PLSC112"), n("PLSC113"))),
        n("BSCI160"),
        any(n("BSCI180"), n("BSCI161")),
        { kind: "dept-level", dept: "MATH", minNumber: 113 },
      ),
    );
  });

  it("HLSC322 prerequisite", () => {
    expect(
      parsePrerequisite(
        "CHEM131, CHEM132, BSCI160, BSCI170, and either BSCI180 or (BSCI161 and BSCI171); or must have completed BSCI170, (BSCI180 or BSCI171), and two semesters of Chemistry.",
      ),
    ).toEqual(
      any(
        all(
          n("CHEM131"),
          n("CHEM132"),
          n("BSCI160"),
          n("BSCI170"),
          any(n("BSCI180"), all(n("BSCI161"), n("BSCI171"))),
        ),
        // P3: "two semesters of Chemistry" is kept as a manual item (was dropped when P1 was written).
        all(n("BSCI170"), any(n("BSCI180"), n("BSCI171")), man("two semesters of Chemistry")),
      ),
    );
  });

  it("CMSC132 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in CMSC131 or CMSC133; or must have earned a score of 5 on the A Java AP exam; or must have earned a satisfactory score on the departmental placement exam; and minimum grade of C- in MATH140.",
      ),
    ).toEqual(
      all(
        any(
          any(c("CMSC131"), c("CMSC133")),
          man("must have earned a score of 5 on the A Java AP exam"),
          man(
            "must have earned a satisfactory score on the departmental placement exam",
          ),
        ),
        c("MATH140"),
      ),
    );
  });

  it("EPIB684 prerequisite", () => {
    expect(
      parsePrerequisite(
        "A minimum grade of B- in EPIB610; or equivalent; and a minimum grade of B- in EPIB697; or previous programming experience in SAS through other courses and/or activities with permission from the instructor.",
      ),
    ).toEqual(
      all(
        any(b("EPIB610"), man("equivalent")),
        any(
          b("EPIB697"),
          man(
            "previous programming experience in SAS through other courses and/or activities with permission from the instructor",
          ),
        ),
      ),
    );
  });

  it("EDHD431 corequisite", () => {
    expect(
      parsePrerequisite(
        "EDSP423 and EDSP315; and TRACK I: Must be concurrently enrolled in EDSP430, EDSP433; or TRACK 2: Must be concurrently enrolled in EDHD415, EDHD424.",
      ),
    ).toEqual(
      all(
        all(n("EDSP423"), n("EDSP315")),
        any(all(k("EDSP430"), k("EDSP433")), all(k("EDHD415"), k("EDHD424"))),
      ),
    );
  });

  it("EDSP315 corequisite", () => {
    expect(
      parsePrerequisite(
        "EDSP423 and EDHD431; and track 1: Must be concurrently enrolled in EDSP430 and EDSP433; OR Track 2: Must be concurrently enrolled in EDHD415 and EDHD424.",
      ),
    ).toEqual(
      all(
        all(n("EDSP423"), n("EDHD431")),
        any(all(k("EDSP430"), k("EDSP433")), all(k("EDHD415"), k("EDHD424"))),
      ),
    );
  });

  it("EDHD322 prerequisite", () => {
    expect(
      parsePrerequisite(
        "EDSP423, EDHD431, and EDSP315; and track 1: Must have completed EDSP 430, EDSP 433; OR Track 2: Must have completed EDHD415, EDHD 424.",
      ),
    ).toEqual(
      all(
        all(n("EDSP423"), n("EDHD431"), n("EDSP315")),
        any(all(n("EDSP430"), n("EDSP433")), all(n("EDHD415"), n("EDHD424"))),
      ),
    );
  });

  it("EDHD441 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in EDSP423, EDHD431, and EDSP315; and TRACK I: Must have completed EDSP430 and EDSP433 or TRACK 2: Must have completed EDHD415 and EDHD424.",
      ),
    ).toEqual(
      all(
        all(c("EDSP423"), c("EDHD431"), c("EDSP315")),
        any(all(n("EDSP430"), n("EDSP433")), all(n("EDHD415"), n("EDHD424"))),
      ),
    );
  });

  it("EDHD442 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in EDSP423, EDHD431, and EDSP315; and TRACK I: Must have completed EDSP430 and EDSP 433; or TRACK 2: Must have completed EDHD415 and EDHD 424.",
      ),
    ).toEqual(
      all(
        all(c("EDSP423"), c("EDHD431"), c("EDSP315")),
        any(all(n("EDSP430"), n("EDSP433")), all(n("EDHD415"), n("EDHD424"))),
      ),
    );
  });

  it("EDHD444 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in EDSP423, EDHD431, and EDSP315; and track 1: Must have completed EDSP430 and EDSP433; OR Track 2: Must have completed EDHD415 and EDHD424.",
      ),
    ).toEqual(
      all(
        all(c("EDSP423"), c("EDHD431"), c("EDSP315")),
        any(all(n("EDSP430"), n("EDSP433")), all(n("EDHD415"), n("EDHD424"))),
      ),
    );
  });

  it("EDSP321 prerequisite", () => {
    expect(
      parsePrerequisite(
        "EDSP423, EDHD431, and EDSP315; and track 1: Must have completed EDSP430 and EDSP433; OR Track 2: Must have completed EDHD415 and EDHD424.",
      ),
    ).toEqual(
      all(
        all(n("EDSP423"), n("EDHD431"), n("EDSP315")),
        any(all(n("EDSP430"), n("EDSP433")), all(n("EDHD415"), n("EDHD424"))),
      ),
    );
  });

  it("SDSI492 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in BSOS326 or SDSB326, INST327, INST366, SURV400, INST462, and INST414 or SDSI414.",
      ),
    ).toEqual(
      all(
        any(c("BSOS326"), c("SDSB326")),
        c("INST327"),
        c("INST366"),
        c("SURV400"),
        c("INST462"),
        any(c("INST414"), c("SDSI414")),
      ),
    );
  });

  it("SDSI496 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in BSOS326 or SDSB326, INST327, INST366, SURV400 or SDSB340, and INST414 or SDSI414.",
      ),
    ).toEqual(
      all(
        any(c("BSOS326"), c("SDSB326")),
        c("INST327"),
        c("INST366"),
        any(c("SURV400"), c("SDSB340")),
        any(c("INST414"), c("SDSI414")),
      ),
    );
  });

  it("INST427 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in INST327, INST326, and INST201 or INST301.",
      ),
    ).toEqual(all(c("INST327"), c("INST326"), any(c("INST201"), c("INST301"))));
  });

  it("GEOL460 prerequisite", () => {
    expect(
      parsePrerequisite(
        "GEOL100 or GEOL120, MATH141, and (PHYS141, PHYS161, or PHYS171).",
      ),
    ).toEqual(
      all(
        any(n("GEOL100"), n("GEOL120")),
        n("MATH141"),
        any(n("PHYS141"), n("PHYS161"), n("PHYS171")),
      ),
    );
  });

  it("COMM363 prerequisite", () => {
    expect(
      parsePrerequisite("COMM107 or COMM200, COMM130, and COMM250."),
    ).toEqual(all(any(n("COMM107"), n("COMM200")), n("COMM130"), n("COMM250")));
  });

  it("ENST453 prerequisite", () => {
    expect(
      parsePrerequisite("MATH120 or MATH140, ENST200, GEOG306 or BIOM301."),
    ).toEqual(
      all(
        any(n("MATH120"), n("MATH140")),
        n("ENST200"),
        any(n("GEOG306"), n("BIOM301")),
      ),
    );
  });

  it("JWST427 prerequisite", () => {
    expect(
      parsePrerequisite(
        "JWST225, RELS225, HIST219I, or permission of the instructor.",
      ),
    ).toEqual(
      any(
        n("JWST225"),
        n("RELS225"),
        n("HIST219I"),
        man("permission of the instructor"),
      ),
    );
  });

  it("TLPL425 prerequisite", () => {
    expect(
      parsePrerequisite(
        "TLPL401, TLPL420, or permission of EDUC-Teaching and Learning, Policy and Leadership department.",
      ),
    ).toEqual(
      any(
        n("TLPL401"),
        n("TLPL420"),
        man(
          "permission of EDUC-Teaching and Learning, Policy and Leadership department",
        ),
      ),
    );
  });

  it("ENMA437 prerequisite", () => {
    expect(
      parsePrerequisite("MATH461, ENMA300, and ENMA165 or equivalent."),
    ).toEqual(
      all(n("MATH461"), n("ENMA300"), any(n("ENMA165"), man("equivalent"))),
    );
  });

  it("MATH140 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in MATH115; or must have math eligibility of MATH140; and math eligibility is based on the Math Placement Test.",
      ),
    ).toEqual(
      any(
        c("MATH115"),
        man(
          "must have math eligibility of MATH140; and math eligibility is based on the Math Placement Test",
        ),
      ),
    );
  });
});

// Trees that already match the P1 rules: pinned exactly as the parser produced them before the change.
describe("and/or precedence: unchanged trees", () => {
  it("STAT426", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in MATH241 or MATH340; and minimum grade of C- in MATH240, MATH461 or MATH341; and minimum grade of C- in STAT400 or STAT410; students who have taken courses with content comparable to STAT400/410 may request permission of the instructor.",
      ),
    ).toEqual({
      kind: "any",
      of: [
        {
          kind: "all",
          of: [
            {
              kind: "any",
              of: [
                { kind: "course", course: "MATH241", minGrade: "C-" },
                { kind: "course", course: "MATH340", minGrade: "C-" },
              ],
            },
            {
              kind: "any",
              of: [
                { kind: "course", course: "MATH240", minGrade: "C-" },
                { kind: "course", course: "MATH461", minGrade: "C-" },
                { kind: "course", course: "MATH341", minGrade: "C-" },
              ],
            },
            {
              kind: "any",
              of: [
                { kind: "course", course: "STAT400", minGrade: "C-" },
                { kind: "course", course: "STAT410", minGrade: "C-" },
              ],
            },
          ],
        },
        {
          kind: "manual",
          text: "students who have taken courses with content comparable to STAT400/410 may request permission of the instructor",
        },
      ],
    });
  });

  it("STAT430", () => {
    expect(
      parsePrerequisite(
        "1 course with a minimum grade of C- from (STAT400, STAT410); and must have completed or be concurrently enrolled in STAT401 or STAT420; students who do not meet the STAT401 or STAT420 requirement but who have taken a statistics course may contact the math department to confirm eligibility.",
      ),
    ).toEqual({
      kind: "any",
      of: [
        {
          kind: "all",
          of: [
            {
              kind: "any",
              of: [
                { kind: "course", course: "STAT400", minGrade: "C-" },
                { kind: "course", course: "STAT410", minGrade: "C-" },
              ],
            },
            {
              kind: "any",
              of: [
                { kind: "course", course: "STAT401", concurrentOk: true },
                { kind: "course", course: "STAT420", concurrentOk: true },
              ],
            },
          ],
        },
        {
          kind: "manual",
          text: "students who do not meet the STAT401 or STAT420 requirement but who have taken a statistics course may contact the math department to confirm eligibility",
        },
      ],
    });
  });

  it("CMSC417", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in CMSC351 and CMSC330; and permission of CMNS-Computer Science department. Or must be in the (Computer Science (Doctoral), Computer Science (Master's)) program.",
      ),
    ).toEqual({
      kind: "any",
      of: [
        {
          kind: "all",
          of: [
            {
              kind: "all",
              of: [
                { kind: "course", course: "CMSC351", minGrade: "C-" },
                { kind: "course", course: "CMSC330", minGrade: "C-" },
              ],
            },
            {
              kind: "manual",
              text: "permission of CMNS-Computer Science department",
            },
          ],
        },
        {
          kind: "manual",
          text: "must be in the (Computer Science (Doctoral), Computer Science (Master's)) program",
        },
      ],
    });
  });

  it("CMSC451", () => {
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
            {
              kind: "manual",
              text: "permission of CMNS-Computer Science department",
            },
          ],
        },
        {
          kind: "manual",
          text: "must be in the (Computer Science (Doctoral), Computer Science (Master's)) program",
        },
      ],
    });
  });

  it("ENAE631", () => {
    expect(
      parsePrerequisite(
        "ENAE414 and ENAE311. Or permission of ENGR-Aerospace Engineering department; and permission of instructor.",
      ),
    ).toEqual({
      kind: "any",
      of: [
        {
          kind: "all",
          of: [
            { kind: "course", course: "ENAE414" },
            { kind: "course", course: "ENAE311" },
          ],
        },
        {
          kind: "all",
          of: [
            {
              kind: "manual",
              text: "permission of ENGR-Aerospace Engineering department",
            },
            { kind: "manual", text: "permission of instructor" },
          ],
        },
      ],
    });
  });

  it("ENMA464", () => {
    expect(
      parsePrerequisite(
        "ENMA300. Or permission of ENGR-Materials Science & Engineering department; and permission of instructor.",
      ),
    ).toEqual({
      kind: "any",
      of: [
        { kind: "course", course: "ENMA300" },
        {
          kind: "all",
          of: [
            {
              kind: "manual",
              text: "permission of ENGR-Materials Science & Engineering department",
            },
            { kind: "manual", text: "permission of instructor" },
          ],
        },
      ],
    });
  });

  it("MUSC454", () => {
    expect(
      parsePrerequisite(
        "MUSC453; or students who have taken courses with comparable content may contact the department. And permission of ARHU-School of Music department.",
      ),
    ).toEqual({
      kind: "all",
      of: [
        {
          kind: "any",
          of: [
            { kind: "course", course: "MUSC453" },
            {
              kind: "manual",
              text: "students who have taken courses with comparable content may contact the department",
            },
          ],
        },
        {
          kind: "manual",
          text: "permission of ARHU-School of Music department",
        },
      ],
    });
  });

  it("THET440", () => {
    expect(
      parsePrerequisite(
        "THET240 or THET340; or permission of instructor. And permission of ARHU-School of Theatre, Dance & Performance Studies department.",
      ),
    ).toEqual({
      kind: "all",
      of: [
        {
          kind: "any",
          of: [
            {
              kind: "any",
              of: [
                { kind: "course", course: "THET240" },
                { kind: "course", course: "THET340" },
              ],
            },
            { kind: "manual", text: "permission of instructor" },
          ],
        },
        {
          kind: "manual",
          text: "permission of ARHU-School of Theatre, Dance & Performance Studies department",
        },
      ],
    });
  });

  it("CHIN302", () => {
    expect(
      parsePrerequisite(
        "CHIN301; or students who have taken courses with comparable content may contact the department. And must have taken a placement interview offered by the department for Non-majors.",
      ),
    ).toEqual({
      kind: "all",
      of: [
        {
          kind: "any",
          of: [
            { kind: "course", course: "CHIN301" },
            {
              kind: "manual",
              text: "students who have taken courses with comparable content may contact the department",
            },
          ],
        },
        {
          kind: "manual",
          text: "must have taken a placement interview offered by the department for Non-majors",
        },
      ],
    });
  });

  it("GFPL492", () => {
    expect(
      parsePrerequisite(
        "Must have taken one of the following two-course physics sequences: PHYS131 and 132; PHYS141 and PHYS142; PHYS161 and PHYS260; or PHYS171 and PHYS272.",
      ),
    ).toEqual({
      kind: "any",
      of: [
        {
          kind: "all",
          of: [
            { kind: "course", course: "PHYS131" },
            { kind: "course", course: "PHYS132" },
          ],
        },
        {
          kind: "all",
          of: [
            { kind: "course", course: "PHYS141" },
            { kind: "course", course: "PHYS142" },
          ],
        },
        {
          kind: "all",
          of: [
            { kind: "course", course: "PHYS161" },
            { kind: "course", course: "PHYS260" },
          ],
        },
        {
          kind: "all",
          of: [
            { kind: "course", course: "PHYS171" },
            { kind: "course", course: "PHYS272" },
          ],
        },
      ],
    });
  });

  it("CHEM481", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in CHEM135; or minimum grade of C- in CHEM271 and CHEM272; or minimum grade of C- in CHEM276 and CHEM277. And minimum grade of C- in MATH141. And minimum grade of C- in PHYS260 and PHYS261; or minimum grade of C- in PHYS142.",
      ),
    ).toEqual({
      kind: "all",
      of: [
        {
          kind: "all",
          of: [
            {
              kind: "any",
              of: [
                { kind: "course", course: "CHEM135", minGrade: "C-" },
                {
                  kind: "all",
                  of: [
                    { kind: "course", course: "CHEM271", minGrade: "C-" },
                    { kind: "course", course: "CHEM272", minGrade: "C-" },
                  ],
                },
                {
                  kind: "all",
                  of: [
                    { kind: "course", course: "CHEM276", minGrade: "C-" },
                    { kind: "course", course: "CHEM277", minGrade: "C-" },
                  ],
                },
              ],
            },
            { kind: "course", course: "MATH141", minGrade: "C-" },
          ],
        },
        {
          kind: "any",
          of: [
            {
              kind: "all",
              of: [
                { kind: "course", course: "PHYS260", minGrade: "C-" },
                { kind: "course", course: "PHYS261", minGrade: "C-" },
              ],
            },
            { kind: "course", course: "PHYS142", minGrade: "C-" },
          ],
        },
      ],
    });
  });

  it("ENEE245", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in ENEE244. And minimum grade of C- in ENEE150; or minimum grade of C- in CMSC132. And permission of ENGR-Electrical & Computer Engineering department.",
      ),
    ).toEqual({
      kind: "all",
      of: [
        {
          kind: "all",
          of: [
            { kind: "course", course: "ENEE244", minGrade: "C-" },
            {
              kind: "any",
              of: [
                { kind: "course", course: "ENEE150", minGrade: "C-" },
                { kind: "course", course: "CMSC132", minGrade: "C-" },
              ],
            },
          ],
        },
        {
          kind: "manual",
          text: "permission of ENGR-Electrical & Computer Engineering department",
        },
      ],
    });
  });

  it("AREC454", () => {
    expect(
      parsePrerequisite(
        "1 course with a minimum grade of C- from (AREC326, ECON306, ECON326); and 1 course with a minimum grade of C- from (ECON230, ECON321, BMGT230, STAT401).",
      ),
    ).toEqual({
      kind: "all",
      of: [
        {
          kind: "any",
          of: [
            { kind: "course", course: "AREC326", minGrade: "C-" },
            { kind: "course", course: "ECON306", minGrade: "C-" },
            { kind: "course", course: "ECON326", minGrade: "C-" },
          ],
        },
        {
          kind: "any",
          of: [
            { kind: "course", course: "ECON230", minGrade: "C-" },
            { kind: "course", course: "ECON321", minGrade: "C-" },
            { kind: "course", course: "BMGT230", minGrade: "C-" },
            { kind: "course", course: "STAT401", minGrade: "C-" },
          ],
        },
      ],
    });
  });

  it("ANSC103", () => {
    expect(
      parsePrerequisite(
        "Must have completed or be concurrently enrolled in ANSC101.",
      ),
    ).toEqual({ kind: "course", course: "ANSC101", concurrentOk: true });
  });

  it("ENME447", () => {
    expect(
      parsePrerequisite("A grade of C- or higher in ENME202 and ENME331."),
    ).toEqual({
      kind: "all",
      of: [
        { kind: "course", course: "ENME202", minGrade: "C-" },
        { kind: "course", course: "ENME331", minGrade: "C-" },
      ],
    });
  });

  it("ENAE633", () => {
    expect(
      parsePrerequisite(
        "ENAE631. Or permission of ENGR-Aerospace Engineering department; and permission of instructor.",
      ),
    ).toEqual({
      kind: "any",
      of: [
        { kind: "course", course: "ENAE631" },
        {
          kind: "all",
          of: [
            {
              kind: "manual",
              text: "permission of ENGR-Aerospace Engineering department",
            },
            { kind: "manual", text: "permission of instructor" },
          ],
        },
      ],
    });
  });

  it("THET325", () => {
    expect(
      parsePrerequisite(
        "Must have completed or be concurrently enrolled in THET310; or permission of Instructor. And must audition; and permission of ARHU-School of Theatre, Dance & Performance Studies department.",
      ),
    ).toEqual({
      kind: "all",
      of: [
        {
          kind: "any",
          of: [
            { kind: "course", course: "THET310", concurrentOk: true },
            { kind: "manual", text: "permission of Instructor" },
          ],
        },
        {
          kind: "all",
          of: [
            { kind: "manual", text: "must audition" },
            {
              kind: "manual",
              text: "permission of ARHU-School of Theatre, Dance & Performance Studies department",
            },
          ],
        },
      ],
    });
  });

  it("CHIN411", () => {
    expect(
      parsePrerequisite(
        "CHIN402; or permission of ARHU-School of Languages, Literatures, and Cultures department. And must have taken a placement interview offered by the department for Non-majors.",
      ),
    ).toEqual({
      kind: "all",
      of: [
        {
          kind: "any",
          of: [
            { kind: "course", course: "CHIN402" },
            {
              kind: "manual",
              text: "permission of ARHU-School of Languages, Literatures, and Cultures department",
            },
          ],
        },
        {
          kind: "manual",
          text: "must have taken a placement interview offered by the department for Non-majors",
        },
      ],
    });
  });
});

// Parallel pairs: "A and B or (C and D)" with a bare "and" run as long as the parenthesized group
// is (A and B) or (C and D). UMD's catalog writes the same PLSC alternatives elsewhere as
// "PLSC110 and PLSC111; or (PLSC112 and PLSC113)" (lecture + lab pairs).
describe("parallel and-pairs around a parenthesized or", () => {
  it("PLSC201 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in PLSC110 and PLSC111 or (PLSC112 and PLSC113); and minimum grade of C- in CHEM131 and CHEM132.",
      ),
    ).toEqual(all(any(all(c("PLSC110"), c("PLSC111")), all(c("PLSC112"), c("PLSC113"))), all(c("CHEM131"), c("CHEM132"))));
  });
  it("PLSC271 prerequisite", () => {
    expect(
      parsePrerequisite(
        "Minimum grade of C- in PLSC110 and PLSC111 or (PLSC112 and PLSC113); or minimum grade of C- in BSCI170 and (BSCI180 or BSCI171).",
      ),
    ).toEqual(
      any(any(all(c("PLSC110"), c("PLSC111")), all(c("PLSC112"), c("PLSC113"))), all(c("BSCI170"), any(c("BSCI180"), c("BSCI171")))),
    );
  });
  it("leaves an unequal run strict (BSCI420)", () => {
    expect(parsePrerequisite("(BSCI331 or BSCI330) and (BSCI222 or HLSC322) and CHEM237 or (CHEM231 and CHEM232).")).toEqual(
      all(any(n("BSCI331"), n("BSCI330")), any(n("BSCI222"), n("HLSC322")), any(n("CHEM237"), all(n("CHEM231"), n("CHEM232")))),
    );
  });
});
