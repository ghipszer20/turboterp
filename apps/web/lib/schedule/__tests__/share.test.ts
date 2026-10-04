import { describe, expect, it } from "vitest";
import type { Section } from "@turboterp/course-data/schedules";
import { resolveShared, saveShared } from "../share";
import { emptySaved, savePlan, serializeSaved, parseSaved } from "../saved";

const sec = (courseId: string, id: string) => ({ courseId, id }) as Section;
const byKey = new Map([
  ["CMSC351/0101", sec("CMSC351", "0101")],
  ["STAT400/0201", sec("STAT400", "0201")],
]);

describe("resolveShared", () => {
  it("finds the sections that exist and lists the rest as no longer offered", () => {
    const r = resolveShared({ CMSC351: "0101", STAT400: "9999", MATH140: "0101" }, byKey);
    expect(r.found.map((s) => `${s.courseId}/${s.id}`)).toEqual(["CMSC351/0101"]);
    expect(r.missing).toEqual(["STAT400 9999", "MATH140 0101"]);
  });
});

describe("saveShared", () => {
  it("writes only the chosen plan and adds the shared courses", () => {
    let s = emptySaved("202608");
    s = { ...s, courses: ["MATH140"] };
    s = savePlan(s, "A", { MATH140: "0301" });
    s = savePlan(s, "C", { MATH140: "0302" });
    const next = saveShared(s, "B", { CMSC351: "0101", STAT400: "0201" }, ["MATH140"]);
    expect(next.plans.B).toEqual({ CMSC351: "0101", STAT400: "0201" });
    expect(next.plans.A).toEqual(s.plans.A);
    expect(next.plans.C).toEqual(s.plans.C);
    expect(next.courses).toEqual(["MATH140", "CMSC351", "STAT400"]);
    expect(next.own).toEqual(s.own);
    expect(next.filters).toEqual(s.filters);
  });

  it("does not duplicate courses already in the builder and survives serialization", () => {
    const next = saveShared(emptySaved("202608"), "A", { CMSC351: "0101" }, ["CMSC351"]);
    expect(next.courses).toEqual(["CMSC351"]);
    expect(parseSaved(serializeSaved(next), "202608").plans.A).toEqual({ CMSC351: "0101" });
  });
});
