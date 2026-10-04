// Golden tests for the Math major, Applied Mathematics Track (2026–27 catalog).
// The plan is hand-built from the catalog's rules; the owner verifies it.

import { describe, expect, it } from "vitest";
import { auditProgram, type StudentCourse } from "../src/audit.ts";
import { mathMajorApplied } from "../programs/math-major-applied-2026-27.ts";

const c = (id: string, credits = 3): StudentCourse => ({ id, credits, status: "completed", grade: "B" });

const completePlan: StudentCourse[] = [
  // Introductory sequence
  c("MATH140", 4), c("MATH141", 4), c("MATH240", 4), c("MATH241", 4), c("MATH310"), c("MATH246"),
  // Eight 400-level MATH/AMSC/STAT: MATH410, STAT410, a STAT4xx (STAT420), MATH401/405/423 (MATH401),
  // AMSC460/466 (AMSC460), one from the applied list (MATH420), depth (MATH410–MATH411, also STAT410–STAT420),
  // and an elective off every list (MATH403)
  c("MATH410"), c("STAT410"), c("STAT420"), c("MATH401"), c("AMSC460"), c("MATH420"), c("MATH411"), c("MATH403"),
  // Programming
  c("CMSC131", 4),
  // Supporting sequence (Sequence Four: CMSC131, CMSC132, CMSC216)
  c("CMSC132", 4), c("CMSC216", 4),
];

const audit = (courses: StudentCourse[]) => auditProgram(mathMajorApplied, courses);
const statusOf = async (courses: StudentCourse[]) =>
  Object.fromEntries((await audit(courses)).requirements.map((r) => [r.id, r.status]));
const without = (...ids: string[]) => completePlan.filter((x) => !ids.includes(x.id));
const withSupporting = (...ids: string[]) => [...without("CMSC132", "CMSC216"), ...ids.map((id) => c(id))];

describe("Math major, Applied Mathematics Track, 2026–27", () => {
  it("passes a complete plan", async () => {
    const statuses = await statusOf(completePlan);
    expect(Object.keys(statuses)).toEqual([
      "math140", "math141", "math240", "math241", "math310", "intro3",
      "math410", "stat410", "stat4xx", "algebra", "numerical", "applied", "depth", "eight",
      "programming", "supporting", "program-gpa",
    ]);
    for (const [id, status] of Object.entries(statuses)) expect(`${id}: ${status}`).toBe(`${id}: satisfied`);
  });

  it("is unverified until the owner signs off", () => {
    expect(mathMajorApplied.verified).toBe(false);
    expect(mathMajorApplied.minGrade).toBe("C-");
  });

  it("flags a missing MATH410", async () => {
    expect((await statusOf(without("MATH410"))).math410).toBe("missing");
  });

  it("flags a missing STAT410", async () => {
    expect((await statusOf(without("STAT410"))).stat410).toBe("missing");
  });

  it("flags a missing second STAT course (STAT410 doesn't count as the STAT4xx)", async () => {
    expect((await statusOf(without("STAT420"))).stat4xx).toBe("missing");
  });

  it("flags a missing MATH401/MATH405/MATH423", async () => {
    expect((await statusOf(without("MATH401"))).algebra).toBe("missing");
  });

  it("flags a missing AMSC460/AMSC466", async () => {
    expect((await statusOf(without("AMSC460"))).numerical).toBe("missing");
  });

  it("flags a missing applied-list course (MATH416, 420, 424, …)", async () => {
    // MATH403 is not on the list, so it can't stand in for MATH420.
    expect((await statusOf(without("MATH420"))).applied).toBe("missing");
  });

  it("flags fewer than eight 400-level courses", async () => {
    expect((await statusOf(without("MATH403"))).eight).toBe("partial");
  });

  it("doesn't count excluded courses (footnote 3: MATH461, STAT464) toward the eight", async () => {
    const plan = [...without("MATH403"), c("MATH461")];
    expect((await statusOf(plan)).eight).toBe("partial");
  });

  it("flags a missing depth sequence", async () => {
    // Without MATH411 and STAT420 neither MATH410–MATH411 nor STAT410–STAT420 is complete;
    // MATH405 and MATH452 keep the count at eight, but pair with nothing.
    const statuses = await statusOf([...without("MATH411", "STAT420"), c("MATH405"), c("MATH452")]);
    expect(statuses.depth).not.toBe("satisfied");
  });

  it("accepts the applied depth pairs MATH416–MATH464 and MATH462–MATH463", async () => {
    const base = without("MATH411", "STAT420");
    expect((await statusOf([...base, c("MATH416"), c("MATH464")])).depth).toBe("satisfied");
    expect((await statusOf([...base, c("MATH462"), c("MATH463")])).depth).toBe("satisfied");
  });

  it("flags an incomplete supporting sequence", async () => {
    expect((await statusOf(without("CMSC216"))).supporting).not.toBe("satisfied");
  });

  it("counts CMSC131 toward both the programming requirement and Sequence Four", async () => {
    const result = await audit(completePlan);
    const assigned = (id: string) => result.requirements.find((r) => r.id === id)!.assigned;
    // CMSC131 and CMSC132 tie for programming; whichever it takes also counts for Sequence Four.
    expect(assigned("supporting")).toEqual(["CMSC131", "CMSC132", "CMSC216"]);
    expect(assigned("programming")).toHaveLength(1);
    expect(assigned("supporting")).toContain(assigned("programming")[0]);
  });

  it("accepts CMSC141/CMSC142 for CMSC131/CMSC132 in the programming requirement and Sequence Four", async () => {
    const plan = [...without("CMSC131", "CMSC132"), c("CMSC141", 4), c("CMSC142", 4)];
    const statuses = await statusOf(plan);
    expect([statuses.programming, statuses.supporting]).toEqual(["satisfied", "satisfied"]);
  });

  it("accepts the Applied track's extra supporting sequences (Nine, Ten, Eleven)", async () => {
    expect((await statusOf(withSupporting("BSCI170", "BSCI160", "BSCI171", "BSCI161", "CHEM146", "CHEM177"))).supporting).toBe("satisfied");
    expect((await statusOf(withSupporting("ASTR130", "ASTR131", "ASTR232"))).supporting).toBe("satisfied");
    expect((await statusOf(withSupporting("GEOL100", "GEOL110", "GEOL340", "GEOL375"))).supporting).toBe("satisfied");
  });

  it("accepts Sequence Twelve: AOSC200, AOSC201 and two 400-level AOSC courses", async () => {
    const plan = withSupporting("AOSC200", "AOSC201", "AOSC431", "AOSC432");
    const result = await audit(plan);
    const supporting = result.requirements.find((r) => r.id === "supporting")!;
    expect(supporting.status).toBe("satisfied");
    expect([...supporting.assigned].sort()).toEqual(["AOSC200", "AOSC201", "AOSC431", "AOSC432"]);
    for (const r of result.requirements) expect(`${r.id}: ${r.status}`).toBe(`${r.id}: satisfied`);
  });

  it("flags Sequence Twelve with one 400-level AOSC course (a 300-level one doesn't count)", async () => {
    expect((await statusOf(withSupporting("AOSC200", "AOSC201", "AOSC431", "AOSC375"))).supporting).not.toBe("satisfied");
  });

  it("flags Sequence Twelve without AOSC201, even with extra 400-level AOSC courses", async () => {
    expect((await statusOf(withSupporting("AOSC200", "AOSC431", "AOSC432", "AOSC433"))).supporting).not.toBe("satisfied");
  });

  it("requires two GEOL courses from the list for Sequence Eleven", async () => {
    expect((await statusOf(withSupporting("GEOL100", "GEOL110", "GEOL340"))).supporting).not.toBe("satisfied");
  });

  it("accepts the honors sequence MATH340–MATH341 in place of MATH240, MATH241 and MATH246", async () => {
    const plan = [...without("MATH240", "MATH241", "MATH246"), c("MATH340", 4), c("MATH341", 4)];
    const statuses = await statusOf(plan);
    expect([statuses.math240, statuses.math241, statuses.intro3]).toEqual(["satisfied", "satisfied", "satisfied"]);
  });

  it("doesn't count a D+ toward the major (C- minimum)", async () => {
    const plan = [...without("MATH410"), { ...c("MATH410"), grade: "D+" }];
    expect((await statusOf(plan)).math410).toBe("missing");
  });

  it("doesn't count STAT400 as the STAT4xx course (department page: 'other than STAT400, STAT410, STAT464')", async () => {
    const plan = [...without("STAT420"), c("STAT400")];
    expect((await statusOf(plan)).stat4xx).toBe("missing");
  });

  it("accepts MATH461 in place of MATH240 (department page)", async () => {
    const plan = [...without("MATH240"), c("MATH461")];
    expect((await statusOf(plan)).math240).toBe("satisfied");
  });

  it("accepts the department page's expanded programming list (e.g. AOSC247)", async () => {
    const plan = [...without("CMSC131", "CMSC132"), c("AOSC247")];
    expect((await statusOf(plan)).programming).toBe("satisfied");
  });

  it("no longer accepts MATH436 for the introductory MATH246 slot (department page lists only MATH462 for Applied)", async () => {
    const plan = [...without("MATH246"), c("MATH436")];
    expect((await statusOf(plan)).intro3).toBe("missing");
  });

  it("allows MATH462 used for the MATH246 slot to also satisfy the upper-level applied-list requirement (department page (3)(f))", async () => {
    const plan = [...without("MATH246", "MATH420"), c("MATH462")];
    const statuses = await statusOf(plan);
    expect([statuses.intro3, statuses.applied, statuses.eight]).toEqual(["satisfied", "satisfied", "satisfied"]);
  });

  it("documents the unencoded major-GPA requirement", () => {
    expect(mathMajorApplied.reviewNotes!.some((n) => n.includes("2.000"))).toBe(true);
  });
});
