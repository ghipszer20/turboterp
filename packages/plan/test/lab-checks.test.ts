// Lab and lecture planned apart get a warning (docs/project/lab-pairs.md).

import type { Requirement } from "@turboterp/course-data/prereqs";
import { describe, expect, it } from "vitest";
import type { CatalogCourse, PlanCatalog } from "../src/catalog.ts";
import { checkPlan, type Plan, type PlanCourse, type PlanIssue } from "../src/check.ts";

const c = (id: string, credits: number, extra: Partial<CatalogCourse> = {}): CatalogCourse => ({
  id, title: id, credits: { min: credits, max: credits }, genEd: [], prerequisite: null, corequisite: null, repeat: { kind: "unknown" }, ...extra,
});
const req = (course: string, concurrentOk = false): Requirement => ({ kind: "course", course, ...(concurrentOk ? { concurrentOk } : {}) });
const catalog: PlanCatalog = new Map(
  [
    c("BSCI160", 3, { labs: ["BSCI180", "BSCI161"] }),
    c("BSCI170", 3, { labs: ["BSCI180", "BSCI171"] }), // BSCI161 and BSCI171 aren't in the catalog: former labs
    c("BSCI180", 1),
    c("BSCI180S", 1),
    c("CHEM131", 3, { labs: ["CHEM132", "CHEM177"], corequisite: req("CHEM132") }),
    c("CHEM132", 1, { corequisite: req("CHEM131") }),
    c("CHEM135", 3, { labs: ["CHEM136", "CHEM177"] }),
    c("CHEM136", 1),
    c("CHEM146", 3, { labs: ["CHEM177"] }),
    c("CHEM177", 2),
    c("ANSC101", 3, { labs: ["ANSC103"] }),
    c("ANSC103", 1, { prerequisite: req("ANSC101", true) }),
    c("PHYS999", 3, { labs: ["PHYS998"] }), // its only lab isn't in the catalog
  ].map((x) => [x.id, x]),
);
const term = (name: string, ...courses: (string | PlanCourse)[]) => ({ name, courses: courses.map((x) => (typeof x === "string" ? { id: x } : x)) });
const issues = (p: Plan, kind: PlanIssue["kind"]) => checkPlan(p, catalog).filter((i) => i.kind === kind);
const lab = (p: Plan) => issues(p, "lab-missing");
const lecture = (p: Plan) => issues(p, "lecture-missing");
const done = (id: string, grade = "B"): PlanCourse => ({ id, status: "completed", grade });

describe("lab-missing", () => {
  it("is quiet when the lab is in the same term", () => expect(lab({ terms: [term("Fall 2026", "BSCI170", "BSCI180")] })).toEqual([]));
  it("accepts a section variant of the lab", () => expect(lab({ terms: [term("Fall 2026", "BSCI170", "BSCI180S")] })).toEqual([]));
  it("accepts a former lab", () => expect(lab({ terms: [term("Fall 2026", "BSCI170", "BSCI171")] })).toEqual([]));

  it("warns when the lecture is planned alone, naming only labs in the catalog", () => {
    expect(lab({ terms: [term("Fall 2026", "BSCI170")] })).toEqual([
      { kind: "lab-missing", severity: "warning", term: "Fall 2026", course: "BSCI170", message: "BSCI170 is usually taken with its lab, BSCI180, in the same term.", short: "Usually taken with BSCI180" },
    ]);
  });
  it("names every current lab when there are several", () => {
    const [i] = lab({ terms: [term("Fall 2026", "CHEM135")] });
    expect(i?.message).toBe("CHEM135 is usually taken with one of its labs, CHEM136 or CHEM177, in the same term.");
    expect(i?.short).toBe("Usually taken with CHEM136 or CHEM177");
  });
  it("names the first lab listed when none is in the catalog", () =>
    expect(lab({ terms: [term("Fall 2026", "PHYS999")] })[0]?.message).toBe("PHYS999 is usually taken with its lab, PHYS998, in the same term."));
  it("warns when the lab is planned for a different term", () => expect(lab({ terms: [term("Fall 2026", "BSCI170"), term("Spring 2027", "BSCI180")] })).toHaveLength(1));
  it("is quiet when the lab was completed earlier", () => expect(lab({ terms: [term("Fall 2026", done("BSCI180")), term("Spring 2027", "BSCI170")] })).toEqual([]));
  it("is quiet when the lab is prior credit", () =>
    expect(lab({ priorCredit: [{ id: "BSCI180", credits: 1, source: "AP Biology (5)" }], terms: [term("Fall 2026", "BSCI170")] })).toEqual([]));
  it("warns when the earlier lab was failed or withdrawn", () => {
    for (const g of ["F", "W"]) expect(lab({ terms: [term("Fall 2026", done("BSCI180", g)), term("Spring 2027", "BSCI170")] }), g).toHaveLength(1);
  });
  it("never warns about a completed lecture", () => expect(lab({ terms: [term("Fall 2026", done("BSCI170", "A"))] })).toEqual([]));
  it("leaves it to the corequisite check when UMD lists the lab as a corequisite", () => {
    const p = { terms: [term("Fall 2026", "CHEM131")] };
    expect(lab(p)).toEqual([]);
    expect(issues(p, "corequisite")).toHaveLength(1);
  });
});

describe("lecture-missing", () => {
  it("is quiet when a lecture is in the same term", () => expect(lecture({ terms: [term("Fall 2026", "CHEM146", "CHEM177")] })).toEqual([]));
  it("accepts a section variant of the lab", () => expect(lecture({ terms: [term("Fall 2026", "BSCI170", "BSCI180S")] })).toEqual([]));

  it("warns when the lab is planned alone, naming its lectures", () => {
    expect(lecture({ terms: [term("Fall 2026", "BSCI180")] })).toEqual([
      {
        kind: "lecture-missing", severity: "warning", term: "Fall 2026", course: "BSCI180",
        message: "BSCI180 is a lab, usually taken in the same term as one of its lectures, BSCI160 or BSCI170.",
        short: "Usually taken with BSCI160 or BSCI170",
      },
    ]);
  });
  it("lists three lectures as 'A, B or C'", () =>
    expect(lecture({ terms: [term("Fall 2026", "CHEM177")] })[0]?.message).toBe("CHEM177 is a lab, usually taken in the same term as one of its lectures, CHEM131, CHEM135 or CHEM146."));
  it("is quiet with prior credit for a lecture", () =>
    expect(lecture({ priorCredit: [{ id: "BSCI160", credits: 4, source: "AP Biology (5)" }], terms: [term("Fall 2026", "BSCI180")] })).toEqual([]));
  it("is quiet when a lecture was completed earlier", () => expect(lecture({ terms: [term("Fall 2026", done("CHEM146")), term("Spring 2027", "CHEM177")] })).toEqual([]));
  it("warns only once, on the lecture, when the lecture is planned a term before the lab", () => {
    const p = { terms: [term("Fall 2026", "BSCI170"), term("Spring 2027", "BSCI180")] };
    expect(lecture(p)).toEqual([]);
    expect(lab(p)).toHaveLength(1);
  });
  it("warns when the earlier lecture was failed", () => expect(lecture({ terms: [term("Fall 2026", done("CHEM146", "F")), term("Spring 2027", "CHEM177")] })).toHaveLength(1));
  it("never warns about a completed lab", () => expect(lecture({ terms: [term("Fall 2026", done("BSCI180"))] })).toEqual([]));
  it("leaves it to the prerequisite or corequisite check when UMD names the lecture", () => {
    expect(lecture({ terms: [term("Fall 2026", "ANSC103")] })).toEqual([]);
    expect(lecture({ terms: [term("Fall 2026", "CHEM132")] })).toEqual([]);
  });
});
