// planCourses tells the audit which codes are the same course (owner, 2026-10-07): cross-listed
// codes count everywhere, renumbered ("Formerly") codes only where a requirement names them, and
// credit-only twins never.

import { describe, expect, it } from "vitest";
import type { CatalogCourse, PlanCatalog } from "../src/catalog.ts";
import type { Plan } from "../src/check.ts";
import { planCourses } from "../src/notices.ts";
import type { Twins } from "../src/twins.ts";

const c = (id: string, twins?: Twins): CatalogCourse => ({
  id,
  title: id,
  credits: { min: 3, max: 3 },
  genEd: [],
  prerequisite: null,
  corequisite: null,
  repeat: { kind: "unknown" },
  ...(twins ? { twins } : {}),
});
const catalog: PlanCatalog = new Map(
  [
    c("MATH456", { crossListed: ["CMSC456", "ENEE456"] }),
    c("CMSC456"),
    c("ENEE456"),
    c("CMSC460", { creditOnly: ["CMSC466"] }),
    c("CMSC466"),
    c("HIST201", { renumbered: ["HIST157"] }),
    c("HIST157"),
    c("PLAIN100"),
  ].map((x) => [x.id, x]),
);
const plan = (ids: string[], prior: string[] = []): Plan => ({
  priorCredit: prior.map((id) => ({ id, credits: 3 })),
  terms: [{ name: "Fall 2026", courses: ids.map((id) => ({ id })) }],
});
const byId = (courses: ReturnType<typeof planCourses>, id: string) => courses.find((x) => x.id === id)!;

describe("planCourses: twin aliases for the audit", () => {
  it("8. attaches cross-listed and renumbered codes from the catalog, on term and prior-credit courses", () => {
    const out = planCourses(plan(["MATH456", "HIST201"], ["CMSC466"]), catalog);
    expect(byId(out, "MATH456").crossListed?.sort()).toEqual(["CMSC456", "ENEE456"]);
    expect(byId(out, "MATH456").renumbered).toBeUndefined();
    expect(byId(out, "HIST201").renumbered).toEqual(["HIST157"]);
    expect(byId(out, "HIST201").crossListed).toBeUndefined();
    const prior = planCourses(plan([], ["MATH456"]), catalog);
    expect(byId(prior, "MATH456").crossListed?.sort()).toEqual(["CMSC456", "ENEE456"]);
  });

  it("attaches the alias to the other side of a one-sided line", () => {
    expect(byId(planCourses(plan(["CMSC456"]), catalog), "CMSC456").crossListed?.sort()).toEqual(["MATH456"]);
  });

  it("6. a credit-only twin is not an alias: CMSC460 gets no CMSC466", () => {
    const out = planCourses(plan(["CMSC460"]), catalog);
    expect(byId(out, "CMSC460").crossListed).toBeUndefined();
    expect(byId(out, "CMSC460").renumbered).toBeUndefined();
  });

  it("leaves the fields off a course with no twins", () => {
    const out = planCourses(plan(["PLAIN100"]), catalog);
    expect("crossListed" in out[0]!).toBe(false);
    expect("renumbered" in out[0]!).toBe(false);
  });
});
