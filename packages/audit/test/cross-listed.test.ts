// Cross-listed courses count as each of their codes (owner, 2026-10-07): MATH456 is CMSC456,
// AMSC460 is CMSC460. A renumbered ("Formerly") code counts only where a requirement names it.

import { describe, expect, it } from "vitest";
import { auditProgram, matchesFilter, inArea, type Program, type Requirement, type StudentCourse } from "../src/audit.ts";
import { AREAS } from "../programs/cmsc-major-2026-27.ts";
import { cmscMachineLearning } from "../programs/cmsc-specializations-2026-27.ts";

const c = (id: string, extra: Partial<StudentCourse> = {}, credits = 3): StudentCourse => ({ id, credits, status: "completed", grade: "B", ...extra });
const math456 = () => c("MATH456", { crossListed: ["CMSC456", "ENEE456"] });
const amsc460 = () => c("AMSC460", { crossListed: ["CMSC460"] });
const program = (...requirements: Requirement[]): Program => ({ id: "t", name: "t", requirements });
const statusOf = async (p: Program, courses: StudentCourse[]) => Object.fromEntries((await auditProgram(p, courses)).requirements.map((r) => [r.id, r.status]));

describe("cross-listed aliases in matching", () => {
  it("1. MATH456 counts toward a CMSC 300-499 choose and toward an area listing CMSC456", () => {
    const filter = { departments: ["CMSC"], minNumber: 300, maxNumber: 499 };
    expect(matchesFilter(filter, math456())).toBe(true);
    expect(matchesFilter(filter, c("MATH456"))).toBe(false);
    const theory = AREAS.find((a) => a.name.startsWith("Area 4"))!;
    expect(inArea(theory, math456())).toBe(true);
    expect(inArea(theory, c("MATH456"))).toBe(false);
  });

  it("2. AMSC460 counts toward an area listing CMSC460", () => {
    const numerical = AREAS.find((a) => a.name.startsWith("Area 5"))!;
    expect(inArea(numerical, amsc460())).toBe(true);
    expect(inArea(numerical, c("AMSC460"))).toBe(false);
  });

  it("3. the ULC concentration rejects MATH456 once it is CMSC456, but takes plain MATH410", async () => {
    const ulc: Requirement = { kind: "concentration", id: "ulc", name: "ulc", credits: 6, minNumber: 300, maxNumber: 499, excludeDepartments: ["CMSC"] };
    expect(await statusOf(program(ulc), [math456(), c("MATH410")])).toEqual({ ulc: "partial" });
    expect(await statusOf(program(ulc), [c("MATH456"), c("MATH410")])).toEqual({ ulc: "satisfied" });
    expect(await statusOf(program(ulc), [c("MATH411"), c("MATH410")])).toEqual({ ulc: "satisfied" });
  });

  it("4. an exclude of AMSC460 also rejects CMSC460 carrying the AMSC460 alias", () => {
    const filter = { departments: ["CMSC", "MATH"], minNumber: 240, maxNumber: 499, exclude: ["AMSC460"] };
    expect(matchesFilter(filter, c("CMSC460", { crossListed: ["AMSC460"] }))).toBe(false);
    expect(matchesFilter(filter, c("CMSC460"))).toBe(true);
  });

  it("5. a renumbered alias matches a named course but not a department/number range", () => {
    const old = c("CMSC426", { renumbered: ["CMSC427"] });
    expect(matchesFilter({ courses: ["CMSC427"] }, old)).toBe(true);
    expect(matchesFilter({ departments: ["CMSC"], minNumber: 427, maxNumber: 427 }, old)).toBe(false);
    const renum = c("DATA320", { renumbered: ["CMSC498A"] });
    expect(matchesFilter({ departments: ["CMSC"], minNumber: 400, maxNumber: 499 }, renum)).toBe(false);
    expect(inArea({ name: "a", courses: ["CMSC498A"] }, renum)).toBe(true);
  });

  it("5b. named lists work in the audit: course options and sets", async () => {
    const old = c("XXXX100", { renumbered: ["CMSC131"] });
    expect(await statusOf(program({ kind: "course", id: "a", name: "a", options: ["CMSC131"] }), [old])).toEqual({ a: "satisfied" });
    expect(await statusOf(program({ kind: "sets", id: "s", name: "s", options: [["CMSC131", "CMSC132"]] }), [old, c("CMSC132")])).toEqual({ s: "satisfied" });
  });
});

describe("overlay distributions count a course once", () => {
  it("7. CMSC471 (in Area 2 and Area 3) counts as one course, not two areas", async () => {
    const overlay: Requirement = { kind: "distribution", id: "areas", name: "areas", count: 2, minAreas: 2, maxPerArea: 1, areas: AREAS, overlay: true };
    expect(await statusOf(program(overlay), [c("CMSC471")])).toEqual({ areas: "partial" });
    expect(await statusOf(program(overlay), [c("CMSC471"), c("CMSC411")])).toEqual({ areas: "satisfied" });
  });

  it("an overlay with `within` ignores an area course no listed requirement uses", async () => {
    const used: Requirement = { kind: "choose", id: "used", name: "used", count: 1, from: { courses: ["CMSC421"] } };
    const areas = (within?: string[]): Requirement => ({ kind: "distribution", id: "areas", name: "areas", count: 2, minAreas: 2, maxPerArea: 1, areas: AREAS, overlay: true, ...(within ? { within } : {}) });
    const courses = [c("CMSC421"), c("CMSC411")];
    expect((await statusOf(program(used, areas()), courses)).areas).toBe("satisfied");
    expect((await statusOf(program(used, areas(["used"])), courses)).areas).toBe("partial");
  });
});

describe("Machine Learning specialization", () => {
  const base: StudentCourse[] = [
    c("MATH140", {}, 4), c("MATH141", {}, 4), c("CMSC131", {}, 4), c("CMSC132", {}, 4), c("CMSC216", {}, 4), c("CMSC250", {}, 4), c("CMSC330"), c("CMSC351"),
    c("STAT400"), c("MATH240", {}, 4), c("CMSC320"), c("CMSC421"), c("CMSC422"),
    c("ECON300"), c("ECON305"), c("ECON310"), c("ECON410"),
  ];
  const owner = [...base, c("MATH401"), amsc460(), c("CMSC473"), math456()];

  it("9. the owner's plan satisfies everything, and loses areas and electives without MATH456", async () => {
    const statuses = await statusOf(cmscMachineLearning, owner);
    expect(Object.entries(statuses).filter(([, s]) => s !== "satisfied")).toEqual([]);
    const without = await statusOf(cmscMachineLearning, owner.filter((x) => x.id !== "MATH456"));
    expect(without["areas-check"]).not.toBe("satisfied");
    expect(without.electives).not.toBe("satisfied");
  });

  it("9b. the ULC never takes MATH456 (it is CMSC456)", async () => {
    const result = await auditProgram(cmscMachineLearning, [...owner, c("MATH410")]);
    expect(result.requirements.find((r) => r.id === "concentration")!.assigned).not.toContain("MATH456");
  });

  it("11. ml-choose2 takes at most one of CMSC460/AMSC460/CMSC466/AMSC466", async () => {
    // Alone, so the electives can't absorb the second course.
    const choose2 = program(cmscMachineLearning.requirements.find((r) => r.id === "ml-choose2")!);
    expect(await statusOf(choose2, [c("CMSC460"), c("CMSC466")])).toEqual({ "ml-choose2": "partial" });
    expect(await statusOf(choose2, [amsc460(), c("CMSC466", { crossListed: ["AMSC466"] })])).toEqual({ "ml-choose2": "partial" });
    expect(await statusOf(choose2, [c("CMSC460"), c("CMSC426")])).toEqual({ "ml-choose2": "satisfied" });
    expect(await statusOf(choose2, [c("CMSC498F"), c("CMSC426")])).toEqual({ "ml-choose2": "satisfied" });
  });

  it("11b. the area overlay counts only courses a CS upper-level requirement uses", () => {
    const areas = cmscMachineLearning.requirements.find((r) => r.id === "areas-check")!;
    expect(areas).toMatchObject({ kind: "distribution", count: 3, minAreas: 3, maxPerArea: 1, overlay: true });
    expect(areas.within).toEqual(expect.arrayContaining(["cmsc421", "cmsc422", "ml-choose2", "electives"]));
    expect(areas.within).not.toContain("cmsc216");
  });
});
