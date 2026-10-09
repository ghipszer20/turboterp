// Winter and summer courses (docs/project/term-offerings.md).

import { describe, expect, it } from "vitest";
import { seasonOfTerm, withOfferings, type CatalogCourse, type PlanCatalog } from "../src/catalog.ts";
import { decodeCatalogFile, encodeCatalogFile } from "../src/catalog-file.ts";

const c = (id: string, extra: Partial<CatalogCourse> = {}): CatalogCourse => ({
  id, title: id, credits: { min: 3, max: 3 }, genEd: [], prerequisite: null, corequisite: null, repeat: { kind: "unknown" }, ...extra,
});
const cat = (...cs: CatalogCourse[]): PlanCatalog => new Map(cs.map((x) => [x.id, x]));

describe("seasonOfTerm", () => {
  it("reads the season from the term code's month", () => {
    expect(seasonOfTerm("202601")).toBe("Spring");
    expect(seasonOfTerm("202605")).toBe("Summer");
    expect(seasonOfTerm("202608")).toBe("Fall");
    expect(seasonOfTerm("202612")).toBe("Winter");
    expect(seasonOfTerm("202603")).toBeUndefined();
  });
});

describe("withOfferings", () => {
  const base = cat(c("A"), c("B"), c("C"));
  const out = withOfferings(base, [
    { term: "202505", courses: [{ id: "A" }, { id: "B" }] },
    { term: "202512", courses: [{ id: "A" }] },
    { term: "202608", courses: [{ id: "A" }, { id: "A" }] },
    { term: "202601", courses: [{ id: "B" }] },
  ]);
  it("lists seasons in Fall, Winter, Spring, Summer order without duplicates", () => {
    expect(out.get("A")?.offered).toEqual(["Fall", "Winter", "Summer"]);
    expect(out.get("B")?.offered).toEqual(["Spring", "Summer"]);
  });
  it("leaves offered absent for a course in no snapshot", () => expect("offered" in out.get("C")!).toBe(false));
  it("returns a new catalog and leaves the input alone", () => {
    expect(out).not.toBe(base);
    expect(base.get("A")?.offered).toBeUndefined();
  });
});

describe("catalog file key o", () => {
  const meta = { term: "202701", generatedAt: "x" };
  it("round-trips offered as season letters", () => {
    const file = encodeCatalogFile(cat(c("A", { offered: ["Fall", "Winter", "Spring", "Summer"] }), c("B", { offered: ["Summer"] })), meta);
    expect(file.courses.map((x) => x.o)).toEqual(["FWSU", "U"]);
    const back = decodeCatalogFile(JSON.parse(JSON.stringify(file))).catalog;
    expect(back.get("A")?.offered).toEqual(["Fall", "Winter", "Spring", "Summer"]);
    expect(back.get("B")?.offered).toEqual(["Summer"]);
  });
  it("is absent when there is no offered", () => {
    const file = encodeCatalogFile(cat(c("A")), meta);
    expect("o" in file.courses[0]!).toBe(false);
    expect("offered" in decodeCatalogFile(file).catalog.get("A")!).toBe(false);
  });
});

describe("courses not on the current schedules", () => {
  const base = cat(c("A"), c("B"), c("C"));
  const snapshots = [
    { term: "202505", courses: [{ id: "A" }, { id: "B" }] },
    { term: "202608", courses: [{ id: "A" }] },
  ];
  it("marks notScheduled when the course is on none of the current terms' schedules", () => {
    const out = withOfferings(base, snapshots, ["202608", "202701"]);
    expect(out.get("A")?.notScheduled).toBeUndefined();
    expect(out.get("B")?.notScheduled).toBe(true);
    expect(out.get("C")?.notScheduled).toBeUndefined();
  });
  it("marks nothing when no current terms are given", () => expect(withOfferings(base, snapshots).get("B")?.notScheduled).toBeUndefined());
  it("round-trips through the catalog file as ns", () => {
    const file = encodeCatalogFile(cat(c("B", { notScheduled: true }), c("A")), { term: "202701", generatedAt: "x" });
    expect(file.courses.map((x) => x.ns)).toEqual([1, undefined]);
    const back = decodeCatalogFile(JSON.parse(JSON.stringify(file))).catalog;
    expect(back.get("B")?.notScheduled).toBe(true);
    expect("notScheduled" in back.get("A")!).toBe(false);
  });
});
