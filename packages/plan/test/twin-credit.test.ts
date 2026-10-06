// Credit once for Twins (program-sources/course-equivalence.md): UMD grants credit for only one
// of a set of Twins, so planCourses leaves later Twins out, checkPlan warns, and a Renumbered or
// Cross-listed Twin meets a prerequisite that names its partner.

import { describe, expect, it } from "vitest";
import { checkPlan, type Plan } from "../src/check.ts";
import type { CatalogCourse, PlanCatalog } from "../src/catalog.ts";
import { planCourses } from "../src/notices.ts";
import type { Twins } from "../src/twins.ts";

const c = (id: string, twins?: Twins, extra: Partial<CatalogCourse> = {}): CatalogCourse => ({
  id,
  title: id,
  credits: { min: 3, max: 3 },
  genEd: [],
  prerequisite: null,
  corequisite: null,
  repeat: { kind: "unknown" },
  ...(twins ? { twins } : {}),
  ...extra,
});
const catalogOf = (...cs: CatalogCourse[]): PlanCatalog => new Map(cs.map((x) => [x.id, x]));

// STAT426 lists CMSC320 (Credit-only); HIST201 lists HIST157 (Formerly); ARHU275 lists ENGL275 (Cross-listed).
const catalog = catalogOf(
  c("STAT426", { creditOnly: ["CMSC320"] }),
  c("CMSC320"),
  c("HIST201", { renumbered: ["HIST157"] }),
  c("HIST157"),
  c("ARHU275", { crossListed: ["ENGL275"] }),
  c("ENGL275"),
  c("HIST300", undefined, { prerequisite: { kind: "course", course: "HIST201" } }),
  c("HIST301", undefined, { prerequisite: { kind: "course", course: "HIST201", minGrade: "C" } }),
  c("CMSC400", undefined, { prerequisite: { kind: "course", course: "CMSC320" } }),
);
const plan = (lines: Record<string, ({ id: string; status?: "completed"; grade?: string } | string)[]>, priorCredit: Plan["priorCredit"] = []): Plan => ({
  priorCredit,
  terms: Object.entries(lines).map(([name, cs]) => ({
    name,
    courses: cs.map((x) => (typeof x === "string" ? { id: x } : x)),
  })),
});

describe("planCourses: credit once for Twins", () => {
  it("gives the audit one course for STAT426 then CMSC320", () => {
    const out = planCourses(plan({ "Fall 2026": ["STAT426"], "Spring 2027": ["CMSC320"] }), catalog);
    expect(out.map((x) => x.id)).toEqual(["STAT426"]);
    expect(out.reduce((t, x) => t + x.credits, 0)).toBe(3);
  });

  it("works for Renumbered and Cross-listed pairs, in either direction", () => {
    expect(planCourses(plan({ A: ["HIST157", "HIST201"] }), catalog).map((x) => x.id)).toEqual(["HIST157"]);
    expect(planCourses(plan({ A: ["ARHU275"], B: ["ENGL275"] }), catalog).map((x) => x.id)).toEqual(["ARHU275"]);
  });

  it("counts prior credit first", () => {
    const out = planCourses(plan({ A: ["HIST201"] }, [{ id: "HIST157", credits: 3 }]), catalog);
    expect(out.map((x) => x.id)).toEqual(["HIST157"]);
  });

  it("keeps the later Twin when the earlier one was a completed F or W", () => {
    const f = planCourses(plan({ A: [{ id: "STAT426", status: "completed", grade: "F" }], B: ["CMSC320"] }), catalog);
    expect(f.map((x) => x.id)).toEqual(["STAT426", "CMSC320"]);
    const w = planCourses(plan({ A: [{ id: "STAT426", status: "completed", grade: "W" }], B: ["CMSC320"] }), catalog);
    expect(w.map((x) => x.id)).toEqual(["STAT426", "CMSC320"]);
  });
});

describe("checkPlan: twin-repeat warning", () => {
  const warns = (p: Plan) => checkPlan(p, catalog).filter((i) => i.kind === "twin-repeat");

  it("warns on the later course, naming the Credit-only Twin", () => {
    expect(warns(plan({ "Fall 2026": ["CMSC320"], "Spring 2027": ["STAT426"] }))).toEqual([
      {
        kind: "twin-repeat",
        severity: "warning",
        term: "Spring 2027",
        course: "STAT426",
        message: "You already have credit for CMSC320, and UMD grants credit for only one of CMSC320 and STAT426, so STAT426's credits won't add to your total.",
      },
    ]);
  });

  it("says 'is the same course as' for Renumbered and Cross-listed Twins", () => {
    expect(warns(plan({ A: ["HIST157"], B: ["HIST201"] }))[0]!.message).toBe(
      "You already have credit for HIST157. HIST201 is the same course as HIST157, so HIST201's credits won't add to your total.",
    );
    expect(warns(plan({ A: ["ENGL275"], B: ["ARHU275"] }))[0]!.message).toContain("ARHU275 is the same course as ENGL275");
  });

  it("warns for a Twin in prior credit", () => {
    const i = warns(plan({ A: ["HIST201"] }, [{ id: "HIST157", credits: 3 }]));
    expect(i).toHaveLength(1);
  });

  it("does not warn when the earlier Twin was a failed or withdrawn attempt", () => {
    expect(warns(plan({ A: [{ id: "STAT426", status: "completed", grade: "F" }], B: ["CMSC320"] }))).toEqual([]);
  });
});

describe("checkPlan: Twins and prerequisites", () => {
  const prereq = (p: Plan, course: string) => checkPlan(p, catalog).filter((i) => i.kind === "prerequisite" && i.course === course && i.severity === "error");

  it("a Renumbered Twin meets a prerequisite naming its partner", () => {
    expect(prereq(plan({ A: ["HIST157"], B: ["HIST300"] }), "HIST300")).toEqual([]);
    expect(prereq(plan({ B: ["HIST300"] }, [{ id: "HIST157", credits: 3 }]), "HIST300")).toEqual([]);
  });

  it("a Cross-listed Twin meets one too, in either direction", () => {
    const cat = catalogOf(c("ARHU275", { crossListed: ["ENGL275"] }), c("ENGL275"), c("ENGL400", undefined, { prerequisite: { kind: "course", course: "ARHU275" } }));
    const p = plan({ A: ["ENGL275"], B: ["ENGL400"] });
    expect(checkPlan(p, cat).filter((i) => i.severity === "error")).toEqual([]);
  });

  it("a Credit-only Twin never meets it", () => {
    expect(prereq(plan({ A: ["STAT426"], B: ["CMSC400"] }), "CMSC400")).toHaveLength(1);
  });

  it("keeps the grade, so a minimum-grade prerequisite still applies", () => {
    expect(prereq(plan({ A: [{ id: "HIST157", status: "completed", grade: "D" }], B: ["HIST301"] }), "HIST301")).toHaveLength(1);
    expect(prereq(plan({ A: [{ id: "HIST157", status: "completed", grade: "B" }], B: ["HIST301"] }), "HIST301")).toEqual([]);
  });
});
