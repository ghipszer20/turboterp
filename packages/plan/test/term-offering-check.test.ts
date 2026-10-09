// Planning a course in a season it isn't offered in (docs/project/term-offerings.md).

import { describe, expect, it } from "vitest";
import type { CatalogCourse, PlanCatalog } from "../src/catalog.ts";
import { checkPlan, type PlanCourse } from "../src/check.ts";

const c = (id: string, extra: Partial<CatalogCourse> = {}): CatalogCourse => ({
  id, title: id, credits: { min: 1, max: 1 }, genEd: [], prerequisite: null, corequisite: null, repeat: { kind: "unknown" }, ...extra,
});
const catalog: PlanCatalog = new Map(
  [
    c("ANTH221", { offered: ["Summer"] }),
    c("WINT101", { offered: ["Winter"] }),
    c("HLTH432", { offered: ["Winter", "Summer"] }),
    c("CMSC131", { offered: ["Fall", "Spring", "Summer"] }),
    c("FALL101", { offered: ["Fall"] }),
    c("NONE101"),
  ].map((x) => [x.id, x]),
);
const warn = (termName: string, course: string | PlanCourse) =>
  checkPlan({ terms: [{ name: termName, courses: [typeof course === "string" ? { id: course } : course] }] }, catalog).filter((i) => i.kind === "term-offering");
const msg = (termName: string, id: string) => warn(termName, id).map((i) => [i.severity, i.message, i.short]);

describe("term-offering", () => {
  it("warns when a summer-only course is planned in Fall", () =>
    expect(msg("Fall 2026", "ANTH221")).toEqual([["warning", "ANTH221 is only offered in summer, based on UMD's recent schedules.", "Only offered in summer"]]));
  it("warns for a winter-only course in Spring", () =>
    expect(msg("Spring 2027", "WINT101")).toEqual([["warning", "WINT101 is only offered in winter, based on UMD's recent schedules.", "Only offered in winter"]]));
  it("is quiet for a summer-only course in Summer", () => expect(warn("Summer 2027", "ANTH221")).toEqual([]));
  it("warns HLTH432 in Fall with winter and summer wording", () =>
    expect(msg("Fall 2026", "HLTH432")).toEqual([["warning", "HLTH432 is only offered in winter and summer, based on UMD's recent schedules.", "Only offered in winter and summer"]]));
  it("is quiet for HLTH432 in Winter and Summer", () => {
    expect(warn("Winter 2027", "HLTH432")).toEqual([]);
    expect(warn("Summer 2027", "HLTH432")).toEqual([]);
  });
  it("warns when a regular course is planned in a Winter it wasn't offered in", () =>
    expect(msg("Winter 2027", "CMSC131")).toEqual([["warning", "CMSC131 isn't offered in winter, based on UMD's recent schedules.", "Not offered in winter"]]));
  it("warns when a course is planned in a Summer it wasn't offered in", () =>
    expect(msg("Summer 2027", "FALL101")).toEqual([["warning", "FALL101 isn't offered in summer, based on UMD's recent schedules.", "Not offered in summer"]]));
  it("is quiet for a winter course planned in Winter", () => expect(warn("Winter 2027", "WINT101")).toEqual([]));
  it("does not check fall against spring", () => expect(warn("Spring 2027", "FALL101")).toEqual([]));
  it("is quiet when offered is unknown", () => expect(warn("Winter 2027", "NONE101")).toEqual([]));
  it("is quiet for a completed course", () => expect(warn("Fall 2026", { id: "ANTH221", status: "completed", grade: "A" })).toEqual([]));
});
