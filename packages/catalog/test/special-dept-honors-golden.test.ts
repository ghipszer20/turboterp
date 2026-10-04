// Golden tests for two representative departmental honors programs: History (a fixed
// four-course sequence) and Mathematics (a "choose" breadth list plus a credits-based
// thesis requirement). Each has a plan that completes the program and plans broken on
// purpose that must fail a named requirement.

import { describe, expect, it } from "vitest";
import { auditProgram, type Program, type StudentCourse } from "@turboterp/audit";
import { deptHist } from "../special-programs/dept-hist-2026-27.ts";
import { deptMath } from "../special-programs/dept-math-2026-27.ts";
import { deptCcjs } from "../special-programs/dept-ccjs-2026-27.ts";
import { deptHesp } from "../special-programs/dept-hesp-2026-27.ts";
import { deptNeur } from "../special-programs/dept-neur-2026-27.ts";

const c = (id: string, credits = 3, grade = "A"): StudentCourse => ({ id, credits, status: "completed", grade });

const statuses = async (program: Program, courses: StudentCourse[]) =>
  Object.fromEntries((await auditProgram(program, courses)).requirements.map((r) => [r.id, r.status]));

async function expectAllSatisfied(program: Program, courses: StudentCourse[]) {
  for (const [id, status] of Object.entries(await statuses(program, courses))) expect(`${id}: ${status}`).toBe(`${id}: satisfied`);
}

const replace = (plan: StudentCourse[], id: string, by: StudentCourse | null) =>
  plan.flatMap((x) => (x.id === id ? (by ? [by] : []) : [x]));

describe("Departmental Honors: History (2026-27)", () => {
  const plan = [c("HIST395"), c("HIST396"), c("HIST398"), c("HIST399")];

  it("passes a complete plan", async () => expectAllSatisfied(deptHist, plan));

  it("misses Honors Colloquium I when HIST395 is dropped", async () => {
    expect((await statuses(deptHist, replace(plan, "HIST395", null))).hist395).toBe("missing");
  });

  it("doesn't count a regular seminar in place of the senior thesis-writing course", async () => {
    expect((await statuses(deptHist, replace(plan, "HIST399", c("HIST409")))).hist399).toBe("missing");
  });
});

describe("Departmental Honors: Mathematics (2026-27)", () => {
  const plan = [c("MATH403"), c("MATH432"), c("MATH498", 3), c("MATH498", 3)];

  it("passes a complete plan (thesis option)", async () => expectAllSatisfied(deptMath, plan));

  it("needs two breadth courses, not one", async () => {
    expect((await statuses(deptMath, replace(plan, "MATH432", null))).breadth).toBe("partial");
  });

  it("doesn't count a course outside the breadth list", async () => {
    expect((await statuses(deptMath, replace(plan, "MATH432", c("MATH410")))).breadth).toBe("partial");
  });

  it("needs 6 credits (two courses) of MATH498 for the thesis option, not one", async () => {
    const short = [c("MATH403"), c("MATH432"), c("MATH498", 3)];
    expect((await statuses(deptMath, short)).depth).toBe("partial");
  });

  it("counts a 600-level MATH/AMSC/STAT course as a breadth substitute", async () => {
    const plan2 = [c("MATH630"), c("AMSC660"), c("MATH498", 3), c("MATH498", 3)];
    expect((await statuses(deptMath, plan2)).breadth).toBe("satisfied");
  });

  it("doesn't accept a 600-level course outside MATH/AMSC/STAT as a breadth substitute", async () => {
    const plan2 = [c("CMSC650"), c("MATH432"), c("MATH498", 3), c("MATH498", 3)];
    expect((await statuses(deptMath, plan2)).breadth).toBe("partial");
  });

  it("accepts the non-thesis option: breadth, one 600-level course, and one MATH498 reading course", async () => {
    const nonThesis = [c("MATH403"), c("MATH432"), c("STAT620"), c("MATH498", 3)];
    expect((await statuses(deptMath, nonThesis)).depth).toBe("satisfied");
  });

  it("accepts the non-thesis option's other alternative: a 600-level course plus a listed course", async () => {
    const nonThesis = [c("MATH403"), c("MATH432"), c("AMSC698"), c("MATH446")];
    expect((await statuses(deptMath, nonThesis)).depth).toBe("satisfied");
  });

  it("doesn't accept two ordinary breadth-list courses as the non-thesis depth (needs a 600-level course)", async () => {
    const notDepth = [c("MATH403"), c("MATH432"), c("MATH446"), c("MATH407")];
    expect((await statuses(deptMath, notDepth)).depth).not.toBe("satisfied");
  });
});

describe("Departmental Honors: Criminology & Criminal Justice (2026-27)", () => {
  const plan = [c("CCJS388H"), c("CCJS389H"), c("CCJS489H", 3), c("CCJS489H", 3)];

  it("passes a complete plan", async () => expectAllSatisfied(deptCcjs, plan));

  it("needs both semesters of CCJS489H (6 credits), not one", async () => {
    const short = [c("CCJS388H"), c("CCJS389H"), c("CCJS489H", 3)];
    expect((await statuses(deptCcjs, short)).ccjs489h).toBe("partial");
  });

  it("doesn't count a grade below the program's B minimum", async () => {
    const lowGrade = [c("CCJS388H", 3, "C"), c("CCJS389H"), c("CCJS489H", 3), c("CCJS489H", 3)];
    expect((await statuses(deptCcjs, lowGrade)).ccjs388h).toBe("missing");
  });
});

describe("Departmental Honors: Hearing & Speech Sciences (2026-27)", () => {
  const plan = [c("HESP468H", 3), c("HESP499H", 3), c("HESP469A", 3), c("HESP469B", 3), c("PSYC200")];

  it("passes a complete plan", async () => expectAllSatisfied(deptHesp, plan));

  it("misses the thesis writing course when HESP469B is dropped", async () => {
    expect((await statuses(deptHesp, replace(plan, "HESP469B", null))).hesp469b).toBe("missing");
  });

  it("accepts any of the three approved statistics courses", async () => {
    const withEdms = replace(plan, "PSYC200", c("EDMS451"));
    await expectAllSatisfied(deptHesp, withEdms);
  });

  it("needs 3 credits of the honors seminar, not 1", async () => {
    const short = replace(plan, "HESP468H", c("HESP468H", 1));
    expect((await statuses(deptHesp, short)).hesp468h).toBe("partial");
  });
});

describe("Departmental Honors: Neuroscience (2026-27)", () => {
  const plan = [c("NEUR379H", 3), c("NEUR379H", 3), c("NEUR479H", 3), c("NEUR398H")];

  it("passes a complete plan", async () => expectAllSatisfied(deptNeur, plan));

  it("needs 9 total research credits, not 6", async () => {
    const short = [c("NEUR379H", 3), c("NEUR479H", 3), c("NEUR398H")];
    expect((await statuses(deptNeur, short)).neurResearch).toBe("partial");
  });

  it("doesn't count non-honors NEUR379/479 research credits", async () => {
    const wrong = [c("NEUR379", 3), c("NEUR379", 3), c("NEUR479", 3), c("NEUR398H")];
    expect((await statuses(deptNeur, wrong)).neurResearch).toBe("missing");
  });
});
