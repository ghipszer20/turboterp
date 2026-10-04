// Audit behavior on small, hand-built programs. Expected results are worked
// out by hand.

import { describe, expect, it } from "vitest";
import { auditProgram, auditPrograms, type Program, type Requirement, type StudentCourse } from "../src/audit.ts";

const took = (...ids: string[]): StudentCourse[] => ids.map((id) => ({ id, credits: 3, status: "completed" }));

describe("auditProgram", () => {
  it("satisfies a required course the student completed", async () => {
    const program: Program = {
      id: "p",
      name: "Test",
      requirements: [{ kind: "course", id: "calc2", name: "Calculus II", options: ["MATH141"] }],
    };
    const result = await auditProgram(program, took("MATH141"));
    expect(result.requirements).toEqual([
      { id: "calc2", name: "Calculus II", status: "satisfied", assigned: ["MATH141"] },
    ]);
  });

  it("assigns each course once, choosing the assignment that satisfies the most requirements", async () => {
    const program: Program = {
      id: "p",
      name: "Test",
      requirements: [
        { kind: "course", id: "linalg", name: "Linear algebra", options: ["MATH461", "MATH240"] },
        { kind: "course", id: "adv", name: "Advanced linear algebra", options: ["MATH461"] },
      ],
    };
    const result = await auditProgram(program, took("MATH240", "MATH461"));
    expect(result.requirements).toEqual([
      { id: "linalg", name: "Linear algebra", status: "satisfied", assigned: ["MATH240"] },
      { id: "adv", name: "Advanced linear algebra", status: "satisfied", assigned: ["MATH461"] },
    ]);
  });

  it("fills 'choose N courses' from a department and level range, and reports leftovers as overshoot", async () => {
    const program: Program = {
      id: "p",
      name: "Test",
      requirements: [
        {
          kind: "choose",
          id: "upper",
          name: "Three 400-level MATH courses",
          count: 3,
          from: { departments: ["MATH"], minNumber: 400, maxNumber: 499 },
        },
      ],
    };
    const result = await auditProgram(program, took("MATH401", "MATH310", "MATH410", "MATH411", "MATH452", "HIST200"));
    expect(result.requirements[0]).toMatchObject({ status: "satisfied" });
    expect(result.requirements[0]!.assigned).toHaveLength(3);
    for (const c of result.requirements[0]!.assigned) expect(["MATH401", "MATH410", "MATH411", "MATH452"]).toContain(c);
    // MATH310 (300-level) and HIST200 don't qualify; one 400-level course is extra.
    expect(result.unused).toHaveLength(3);
    expect(result.unused).toEqual(expect.arrayContaining(["MATH310", "HIST200"]));
  });

  it("reports partial progress on a choose requirement", async () => {
    const program: Program = {
      id: "p",
      name: "Test",
      requirements: [
        { kind: "choose", id: "upper", name: "Three 400-level MATH", count: 3, from: { departments: ["MATH"], minNumber: 400, maxNumber: 499 } },
      ],
    };
    const result = await auditProgram(program, took("MATH410"));
    expect(result.requirements[0]).toMatchObject({ status: "partial", assigned: ["MATH410"] });
  });

  it("counts credits, not courses, for a credit requirement", async () => {
    const program: Program = {
      id: "p",
      name: "Test",
      requirements: [
        { kind: "choose", id: "cs400", name: "12 credits of 400-level CMSC", credits: 12, from: { departments: ["CMSC"], minNumber: 400, maxNumber: 499 } },
      ],
    };
    const fourCredit = (id: string): StudentCourse => ({ id, credits: 4, status: "completed" });
    const three = await auditProgram(program, [fourCredit("CMSC420"), fourCredit("CMSC421"), fourCredit("CMSC422")]);
    expect(three.requirements[0]).toMatchObject({ status: "satisfied" });
    expect(three.requirements[0]!.assigned).toHaveLength(3);

    const short = await auditProgram(program, took("CMSC420", "CMSC421", "CMSC422"));
    expect(short.requirements[0]).toMatchObject({ status: "partial" });
    expect(short.requirements[0]!.assigned).toHaveLength(3);
  });

  it("doesn't count a completed course below the program's minimum grade, but counts planned courses", async () => {
    const program: Program = {
      id: "p",
      name: "Test",
      minGrade: "C-",
      requirements: [
        { kind: "course", id: "pl", name: "Programming Languages", options: ["CMSC330"] },
        { kind: "course", id: "algo", name: "Algorithms", options: ["CMSC351"] },
      ],
    };
    const result = await auditProgram(program, [
      { id: "CMSC330", credits: 3, status: "completed", grade: "D" },
      { id: "CMSC351", credits: 3, status: "planned" },
    ]);
    expect(result.requirements.map((r) => r.status)).toEqual(["missing", "satisfied"]);
    expect(result.unused).toEqual(["CMSC330"]);
  });

  describe("concentration (CS: 12 credits of 300–400 level courses from one discipline outside CMSC)", () => {
    const program: Program = {
      id: "cs",
      name: "CS",
      requirements: [
        {
          kind: "concentration",
          id: "conc",
          name: "Upper-level concentration",
          credits: 12,
          minNumber: 300,
          maxNumber: 499,
          excludeDepartments: ["CMSC"],
        },
      ],
    };

    it("is satisfied by 12 credits in one department", async () => {
      const r = await auditProgram(program, took("MATH401", "MATH403", "MATH410", "MATH411"));
      expect(r.requirements[0]).toMatchObject({ status: "satisfied" });
    });

    it("isn't satisfied by 12 credits split across two departments", async () => {
      const r = await auditProgram(program, took("MATH401", "MATH403", "STAT400", "STAT401"));
      expect(r.requirements[0]).toMatchObject({ status: "partial" });
      expect(r.requirements[0]!.assigned).toHaveLength(2);
    });

    it("ignores the excluded department and lower-level courses", async () => {
      const r = await auditProgram(program, took("CMSC420", "CMSC421", "CMSC422", "CMSC423", "MATH141"));
      expect(r.requirements[0]).toMatchObject({ status: "missing" });
    });

    it("ignores an individually excluded course even when its department is otherwise eligible", async () => {
      const excludingProgram: Program = {
        id: "cs",
        name: "CS",
        requirements: [
          {
            kind: "concentration",
            id: "conc",
            name: "Upper-level concentration",
            credits: 12,
            minNumber: 300,
            maxNumber: 499,
            excludeDepartments: ["CMSC"],
            exclude: ["MATH410"],
          } satisfies Requirement,
        ],
      };
      const r = await auditProgram(excludingProgram, took("MATH401", "MATH403", "MATH410", "MATH411"));
      expect(r.requirements[0]).toMatchObject({ status: "partial" });
      expect(r.requirements[0]!.assigned).not.toContain("MATH410");
    });
  });

  describe("pick one set (Math: a depth sequence, or a supporting sequence)", () => {
    const program: Program = {
      id: "math",
      name: "Math",
      requirements: [
        {
          kind: "sets",
          id: "depth",
          name: "Depth sequence",
          options: [
            ["MATH410", "MATH411"],
            ["MATH403", "MATH404"],
          ],
        },
      ],
    };

    it("is satisfied when every course in one set is done", async () => {
      const r = await auditProgram(program, took("MATH403", "MATH404"));
      expect(r.requirements[0]).toMatchObject({ status: "satisfied", assigned: ["MATH403", "MATH404"] });
    });

    it("is partial with half of a set, and doesn't mix courses from two sets", async () => {
      const r = await auditProgram(program, took("MATH410", "MATH404"));
      expect(r.requirements[0]!.status).toBe("partial");
      expect(r.requirements[0]!.assigned).toHaveLength(1);
    });
  });

  it("lets an overlay requirement count courses that other requirements also use", async () => {
    // Math: "eight 400-level courses; must include MATH410" — MATH410 counts toward both.
    const program: Program = {
      id: "math",
      name: "Math",
      requirements: [
        { kind: "course", id: "math410", name: "Advanced Calculus I", options: ["MATH410"] },
        {
          kind: "choose",
          id: "eight",
          name: "Two 400-level MATH courses",
          count: 2,
          overlay: true,
          from: { departments: ["MATH"], minNumber: 400, maxNumber: 499 },
        },
      ],
    };
    const r = await auditProgram(program, took("MATH410", "MATH401"));
    expect(r.requirements.map((x) => [x.id, x.status, x.assigned])).toEqual([
      ["math410", "satisfied", ["MATH410"]],
      ["eight", "satisfied", ["MATH410", "MATH401"]],
    ]);
  });

  it("matches courses by their Gen Ed codes", async () => {
    const program: Program = {
      id: "gened",
      name: "Gen Ed",
      requirements: [{ kind: "choose", id: "dshu", name: "Humanities", count: 2, from: { genEd: ["DSHU"] } }],
    };
    const courses: StudentCourse[] = [
      { id: "HIST110", credits: 3, status: "completed", genEd: ["DSHU"] },
      { id: "HIST111", credits: 3, status: "completed", genEd: ["DSHS", "DVUP"] },
      { id: "PHIL100", credits: 3, status: "planned", genEd: ["DSHU"] },
    ];
    const r = await auditProgram(program, courses);
    expect(r.requirements[0]).toMatchObject({ status: "satisfied", assigned: ["HIST110", "PHIL100"] });
  });

  it("counts every course's credits toward a university total, alongside other requirements", async () => {
    const program: Program = {
      id: "university",
      name: "University",
      requirements: [
        { kind: "course", id: "engl101", name: "Academic Writing", options: ["ENGL101"] },
        { kind: "choose", id: "total", name: "120 credits", credits: 12, overlay: true, from: { anyCourse: true } },
      ],
    };
    const r = await auditProgram(program, took("ENGL101", "HIST110", "CMSC131", "MATH140"));
    expect(r.requirements.map((x) => x.status)).toEqual(["satisfied", "satisfied"]);
    expect(r.requirements[1]!.assigned).toHaveLength(4);
  });

  it("applies a minimum grade set on one requirement only", async () => {
    const program: Program = {
      id: "gened",
      name: "Gen Ed",
      requirements: [
        { kind: "choose", id: "fsaw", name: "Academic Writing", count: 1, minGrade: "C-", from: { genEd: ["FSAW"] } },
        { kind: "choose", id: "dshu", name: "Humanities", count: 1, from: { genEd: ["DSHU"] } },
      ],
    };
    const r = await auditProgram(program, [
      { id: "ENGL101", credits: 3, status: "completed", grade: "D", genEd: ["FSAW"] },
      { id: "HIST110", credits: 3, status: "completed", grade: "D", genEd: ["DSHU"] },
    ]);
    expect(r.requirements.map((x) => x.status)).toEqual(["missing", "satisfied"]);
  });

  describe("a completed course graded F or W earns no credit (UMD grading; owner ruling: a course may be retaken only after an F or a W)", () => {
    const university: Program = {
      id: "university",
      name: "University",
      requirements: [{ kind: "choose", id: "total", name: "6 credits", credits: 6, overlay: true, from: { anyCourse: true } }],
    };

    it("doesn't let a failed course count toward a credit requirement with no minimum grade", async () => {
      const r = await auditProgram(university, [{ id: "CMSC131", credits: 3, status: "completed", grade: "F" }]);
      expect(r.requirements[0]).toMatchObject({ status: "missing", assigned: [] });
      expect(r.unused).toEqual(["CMSC131"]);
    });

    it("doesn't let a withdrawn course count either, case- and whitespace-insensitively", async () => {
      const r = await auditProgram(university, [{ id: "CMSC131", credits: 3, status: "completed", grade: " w " }]);
      expect(r.requirements[0]).toMatchObject({ status: "missing", assigned: [] });
      expect(r.unused).toEqual(["CMSC131"]);
    });

    it("still counts a planned course, a completed course with no grade (transfer/AP/IB), and a passing grade including P/S", async () => {
      // 12 credits so the cap allows all four 3-credit courses (see the "counts credits" test above).
      const twelveCredits: Program = { ...university, requirements: [{ ...university.requirements[0]!, credits: 12 } as Requirement] };
      const courses: StudentCourse[] = [
        { id: "CMSC131", credits: 3, status: "planned" },
        { id: "CMSC132", credits: 3, status: "completed" },
        { id: "CMSC216", credits: 3, status: "completed", grade: "P" },
        { id: "CMSC250", credits: 3, status: "completed", grade: "S" },
      ];
      const r = await auditProgram(twelveCredits, courses);
      expect(r.requirements[0]).toMatchObject({ status: "satisfied" });
      expect(r.requirements[0]!.assigned).toHaveLength(4);
      expect(r.unused).toEqual([]);
    });

    it("lets a passing retake count while the failed attempt it followed shows as unused (owner ruling: retake only after F/W)", async () => {
      const courses: StudentCourse[] = [
        { id: "CMSC131", credits: 3, status: "completed", grade: "F" },
        { id: "CMSC131", credits: 3, status: "completed", grade: "B" },
      ];
      const r = await auditProgram(university, courses);
      expect(r.requirements[0]).toMatchObject({ status: "partial" });
      expect(r.requirements[0]!.assigned).toEqual(["CMSC131"]);
      expect(r.unused).toEqual(["CMSC131"]);
    });
  });

  describe("several programs at once (double major)", () => {
    const math: Program = {
      id: "math",
      name: "Math",
      requirements: [
        { kind: "course", id: "calc2", name: "Calculus II", options: ["MATH141"] },
        { kind: "course", id: "proofs", name: "Proofs", options: ["MATH310"] },
      ],
    };
    const cs: Program = {
      id: "cs",
      name: "CS",
      requirements: [
        { kind: "course", id: "calc2", name: "Calculus II", options: ["MATH141"] },
        { kind: "course", id: "algo", name: "Algorithms", options: ["CMSC351"] },
      ],
    };
    const courses = took("MATH141", "MATH310", "CMSC351");

    it("lets one course count toward both programs by default", async () => {
      const [m, c] = await auditPrograms([math, cs], courses);
      expect(m!.requirements.map((r) => r.status)).toEqual(["satisfied", "satisfied"]);
      expect(c!.requirements.map((r) => r.status)).toEqual(["satisfied", "satisfied"]);
    });

    it("respects a limit on how many courses may count toward two programs", async () => {
      const [m, c] = await auditPrograms([math, cs], courses, { maxSharedCourses: 0 });
      const calc2 = [m!.requirements[0]!.status, c!.requirements[0]!.status].sort();
      expect(calc2).toEqual(["missing", "satisfied"]);
    });
  });

  describe("complete N of several sets (Anthropology: 'Select three of: …, BSCI160 & BSCI180, BSCI170 & BSCI180, …')", () => {
    const program: Program = {
      id: "anth",
      name: "Anthropology",
      requirements: [
        {
          kind: "sets",
          id: "science",
          name: "Two science courses or pairs",
          count: 2,
          options: [["AGNR301"], ["BSCI160", "BSCI180"], ["BSCI170", "BSCI180"], ["GEOL100", "GEOL110"]],
        },
      ],
    };

    it("is satisfied by two complete sets", async () => {
      const r = await auditProgram(program, took("AGNR301", "GEOL100", "GEOL110"));
      expect(r.requirements[0]).toMatchObject({ status: "satisfied" });
      expect([...r.requirements[0]!.assigned].sort()).toEqual(["AGNR301", "GEOL100", "GEOL110"]);
    });

    it("is partial with only one complete set", async () => {
      const r = await auditProgram(program, took("GEOL100", "GEOL110", "BSCI160"));
      expect(r.requirements[0]!.status).toBe("partial");
    });

    it("doesn't use one course for two sets (BSCI180 in both BSCI pairs)", async () => {
      const r = await auditProgram(program, took("BSCI160", "BSCI170", "BSCI180"));
      expect(r.requirements[0]!.status).toBe("partial");
    });

    it("doesn't use one course for two sets even as an overlay", async () => {
      const overlay: Program = { ...program, requirements: [{ ...program.requirements[0]!, overlay: true }] };
      const r = await auditProgram(overlay, took("BSCI160", "BSCI170", "BSCI180"));
      expect(r.requirements[0]!.status).toBe("partial");
    });

    it("respects a sharing limit across programs", async () => {
      const other: Program = { id: "geol", name: "Geology", requirements: [{ kind: "course", id: "geol100", name: "Physical Geology", options: ["GEOL100"] }] };
      const plan = took("AGNR301", "GEOL100", "GEOL110");
      const [shared] = await auditPrograms([program, other], plan);
      expect(shared!.requirements[0]!.status).toBe("satisfied");
      const [anth, geol] = await auditPrograms([program, other], plan, { maxSharedCourses: 0 });
      expect([anth!.requirements[0]!.status, geol!.requirements[0]!.status].sort()).toEqual(["partial", "satisfied"]);
    });
  });

  describe("a set with a filter part (Math Applied Sequence Twelve: AOSC200, AOSC201 and two 400-level AOSC)", () => {
    const AOSC_400 = { count: 2, from: { departments: ["AOSC"], minNumber: 400, maxNumber: 499 } };
    const program: Program = {
      id: "math",
      name: "Math",
      requirements: [
        {
          kind: "sets",
          id: "supporting",
          name: "Supporting sequence",
          options: [
            ["PHYS171", "PHYS272", "PHYS273"],
            ["AOSC200", "AOSC201", AOSC_400],
          ],
        },
      ],
    };

    it("is satisfied by the fixed courses plus two courses from the filter", async () => {
      const r = await auditProgram(program, took("AOSC200", "AOSC201", "AOSC431", "AOSC432"));
      expect(r.requirements[0]).toMatchObject({ status: "satisfied" });
      expect([...r.requirements[0]!.assigned].sort()).toEqual(["AOSC200", "AOSC201", "AOSC431", "AOSC432"]);
    });

    it("isn't satisfied with only one course from the filter", async () => {
      const r = await auditProgram(program, took("AOSC200", "AOSC201", "AOSC431", "AOSC301"));
      expect(r.requirements[0]!.status).toBe("partial");
    });

    it("isn't satisfied by extra filter courses standing in for a missing fixed course", async () => {
      const r = await auditProgram(program, took("AOSC200", "AOSC431", "AOSC432", "AOSC433", "AOSC434"));
      expect(r.requirements[0]!.status).toBe("partial");
    });

    it("counts only as many filter courses as the part needs, leaving the rest unused", async () => {
      const r = await auditProgram(program, took("AOSC200", "AOSC201", "AOSC431", "AOSC432", "AOSC433"));
      expect(r.requirements[0]!.assigned).toHaveLength(4);
      expect(r.unused).toHaveLength(1);
    });

    describe("when one course is eligible for both a fixed part and the filter part", () => {
      // AOSC401 is fixed and also a 400-level AOSC course: it may fill only one of them.
      const both = (overlay: boolean): Program => ({
        id: "x",
        name: "X",
        requirements: [
          { kind: "sets", id: "seq", name: "Sequence", overlay, options: [["AOSC200", "AOSC401", AOSC_400]] },
        ],
      });

      it.each([false, true])("isn't satisfied by it plus one more filter course (overlay: %s)", async (overlay) => {
        const r = await auditProgram(both(overlay), took("AOSC200", "AOSC401", "AOSC431"));
        expect(r.requirements[0]!.status).toBe("partial");
      });

      it.each([false, true])("is satisfied when two other filter courses fill the filter part (overlay: %s)", async (overlay) => {
        const r = await auditProgram(both(overlay), took("AOSC200", "AOSC401", "AOSC431", "AOSC432"));
        expect(r.requirements[0]!.status).toBe("satisfied");
      });
    });

    it("applies the requirement's minimum grade to the filter part", async () => {
      const graded: Program = { ...program, requirements: [{ ...program.requirements[0]!, minGrade: "C-" }] };
      const r = await auditProgram(graded, [
        ...took("AOSC200", "AOSC201", "AOSC431"),
        { id: "AOSC432", credits: 3, status: "completed", grade: "D" },
      ]);
      expect(r.requirements[0]!.status).toBe("partial");
    });

    it("combines with a count: two of several sets, one with a filter part", async () => {
      const two: Program = { ...program, requirements: [{ ...program.requirements[0]!, count: 2 } as Requirement] };
      const r = await auditProgram(two, took("PHYS171", "PHYS272", "PHYS273", "AOSC200", "AOSC201", "AOSC431", "AOSC432"));
      expect(r.requirements[0]).toMatchObject({ status: "satisfied" });
      expect(r.requirements[0]!.assigned).toHaveLength(7);
    });
  });

  describe("alternatives inside a choice (CS ML: 'Select two of: CMSC426, CMSC460 or CMSC466, CMSC470')", () => {
    const program: Program = {
      id: "cs",
      name: "CS",
      requirements: [
        {
          kind: "choose",
          id: "ml",
          name: "Two ML courses",
          count: 2,
          from: { courses: ["CMSC426", "CMSC460", "CMSC466", "CMSC470"] },
          alternatives: [["CMSC460", "CMSC466"]],
        },
      ],
    };

    it("counts at most one course of an 'or' group", async () => {
      const r = await auditProgram(program, took("CMSC460", "CMSC466"));
      expect(r.requirements[0]).toMatchObject({ status: "partial" });
      expect(r.requirements[0]!.assigned).toHaveLength(1);
      expect(r.unused).toHaveLength(1);
    });

    it("is satisfied by one course of the group plus another listed course", async () => {
      const r = await auditProgram(program, took("CMSC460", "CMSC466", "CMSC470"));
      expect(r.requirements[0]).toMatchObject({ status: "satisfied" });
      expect(r.requirements[0]!.assigned).toContain("CMSC470");
    });

    it("limits a group in a credit requirement too", async () => {
      const credits: Program = {
        id: "cs",
        name: "CS",
        requirements: [{ kind: "choose", id: "ml", name: "6 credits", credits: 6, from: { courses: ["CMSC460", "CMSC466", "CMSC470"] }, alternatives: [["CMSC460", "CMSC466"]] }],
      };
      expect((await auditProgram(credits, took("CMSC460", "CMSC466"))).requirements[0]).toMatchObject({ status: "partial" });
      expect((await auditProgram(credits, took("CMSC460", "CMSC470"))).requirements[0]).toMatchObject({ status: "satisfied" });
    });

    it("limits the group within its own requirement only: the other alternative may count elsewhere", async () => {
      const two: Program = {
        id: "cs",
        name: "CS",
        requirements: [
          ...program.requirements,
          { kind: "choose", id: "numerical", name: "A numerical course", count: 1, from: { courses: ["CMSC460", "CMSC466"] } },
        ],
      };
      const r = await auditProgram(two, took("CMSC426", "CMSC460", "CMSC466"));
      expect(r.requirements.map((x) => x.status)).toEqual(["satisfied", "satisfied"]);
    });

    it("lets the other alternative count when one fails the minimum grade", async () => {
      const graded: Program = { ...program, minGrade: "C-" };
      const r = await auditProgram(graded, [
        { id: "CMSC460", credits: 3, status: "completed", grade: "D" },
        { id: "CMSC466", credits: 3, status: "completed", grade: "B" },
        { id: "CMSC426", credits: 3, status: "completed", grade: "B" },
      ]);
      expect(r.requirements[0]).toMatchObject({ status: "satisfied" });
      expect([...r.requirements[0]!.assigned].sort()).toEqual(["CMSC426", "CMSC466"]);
    });
  });

  describe("area distribution (CS: five 400-level courses from at least three areas, at most three per area)", () => {
    const program: Program = {
      id: "cs",
      name: "CS",
      requirements: [
        {
          kind: "distribution",
          id: "areas",
          name: "Upper-level areas",
          count: 5,
          minAreas: 3,
          maxPerArea: 3,
          areas: [
            { name: "Systems", courses: ["CMSC411", "CMSC412", "CMSC414", "CMSC416", "CMSC417"] },
            { name: "Information Processing", courses: ["CMSC420", "CMSC421", "CMSC422", "CMSC471"] },
            { name: "Software Engineering", courses: ["CMSC430", "CMSC433", "CMSC435", "CMSC471"] },
            { name: "Theory", courses: ["CMSC451", "CMSC452", "CMSC456"] },
          ],
        },
      ],
    };

    it("is satisfied by five courses across three areas", async () => {
      const r = await auditProgram(program, took("CMSC411", "CMSC412", "CMSC414", "CMSC420", "CMSC451"));
      expect(r.requirements[0]).toMatchObject({ status: "satisfied" });
      expect(r.requirements[0]!.assigned).toHaveLength(5);
    });

    it("counts at most three courses from one area", async () => {
      const r = await auditProgram(program, took("CMSC411", "CMSC412", "CMSC414", "CMSC416", "CMSC420"));
      expect(r.requirements[0]).toMatchObject({ status: "partial" });
      expect(r.requirements[0]!.assigned).toHaveLength(4);
    });

    it("isn't satisfied with five courses from only two areas", async () => {
      const r = await auditProgram(program, took("CMSC411", "CMSC412", "CMSC414", "CMSC420", "CMSC421"));
      expect(r.requirements[0]).toMatchObject({ status: "partial" });
    });

    it("uses a course listed in two areas for whichever area completes the rule", async () => {
      // CMSC471 must count as Software Engineering to reach three areas.
      const r = await auditProgram(program, took("CMSC411", "CMSC412", "CMSC420", "CMSC421", "CMSC471"));
      expect(r.requirements[0]).toMatchObject({ status: "satisfied" });
    });
  });

  describe("distribution areas defined by a course filter", () => {
    type A = { name: string; courses?: string[]; from?: { departments: string[]; minNumber?: number } };
    const mk = (areas: A[], count = 3, minAreas = 2, maxPerArea = 2): Program => ({
      id: "d",
      name: "D",
      requirements: [{ kind: "distribution", id: "spread", name: "Spread", count, minAreas, maxPerArea, areas }],
    });
    const depts = mk([
      { name: "SPAN", from: { departments: ["SPAN"] } },
      { name: "HIST", from: { departments: ["HIST"] } },
    ]);

    it("is satisfied by courses from two departments", async () => {
      const r = await auditProgram(depts, took("SPAN301", "SPAN302", "HIST301"));
      expect(r.requirements[0]).toMatchObject({ status: "satisfied" });
    });

    it("is not satisfied by courses from one department only", async () => {
      const r = await auditProgram(depts, took("SPAN301", "SPAN302", "SPAN303"));
      expect(r.requirements[0]).toMatchObject({ status: "partial" });
    });

    it("counts a course matching two areas toward only one", async () => {
      const twins = mk([
        { name: "A", from: { departments: ["HIST"] } },
        { name: "B", from: { departments: ["HIST"] } },
      ], 1, 2, 2);
      const r = await auditProgram(twins, took("HIST301"));
      expect(r.requirements[0]).toMatchObject({ status: "partial" });
      expect(r.requirements[0]!.assigned).toHaveLength(1);
    });

    it("mixes course-list and filter areas", async () => {
      const p = mk([
        { name: "Listed", courses: ["ANTH210"] },
        { name: "History", from: { departments: ["HIST"] } },
      ], 2, 2, 1);
      expect((await auditProgram(p, took("ANTH210", "HIST301"))).requirements[0]).toMatchObject({ status: "satisfied" });
      expect((await auditProgram(p, took("HIST301", "HIST302"))).requirements[0]).toMatchObject({ status: "partial" });
    });
  });
});

describe("open slots (from an approved list that isn't published)", () => {
  const program: Program = {
    id: "pw",
    name: "Writing Minor",
    requirements: [
      { kind: "course", id: "core", name: "Core", options: ["ENGL101"] },
      { kind: "openSlot", id: "approved", name: "Approved courses", credits: 12, note: "From the department's approved list." },
    ],
  };
  const other: Program = { ...program, id: "other" };

  it("is missing until the student confirms it, and takes no courses", async () => {
    const result = await auditProgram(program, took("ENGL101", "ENGL391"));
    expect(result.requirements[1]).toEqual({ id: "approved", name: "Approved courses", status: "missing", assigned: [] });
    expect(result.unused).toEqual(["ENGL391"]);
  });

  it("is satisfied once confirmed by its programId/requirementId key", async () => {
    const result = await auditProgram(program, took("ENGL101"), { confirmed: ["pw/approved"] });
    expect(result.requirements[1]).toEqual({ id: "approved", name: "Approved courses", status: "satisfied", assigned: [] });
  });

  it("keeps the program incomplete until ticked, keyed per program", async () => {
    const [a, b] = await auditPrograms([program, other], took("ENGL101"), { confirmed: ["pw/approved"] });
    expect(a!.requirements.every((r) => r.status === "satisfied")).toBe(true);
    expect(b!.requirements.every((r) => r.status === "satisfied")).toBe(false);
    expect(b!.requirements[1]!.status).toBe("missing");
  });
});
