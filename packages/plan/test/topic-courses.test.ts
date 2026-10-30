// Topic codes with a letter suffix (BIOE489G) that program files name get catalog entries from their base course.

import { describe, expect, it } from "vitest";
import { buildCatalog, topicCodeParts, withCatalogFallback, withTopicCourses } from "../src/catalog.ts";
import { SPRING_2027 } from "./helpers.ts";

const base = SPRING_2027.find((c) => c.id === "CMSC131")!;
const baseOnly = {
  ...base,
  id: "CMSC489",
  title: "Special Topics",
  credits: { min: 3, max: 3 },
  genEd: ["DSSP"],
  texts: { ...base.texts, creditOnlyGrantedFor: null, other: { Formerly: "CMSC488." } },
};
const cat = withCatalogFallback(buildCatalog(SPRING_2027), [baseOnly]);
const baseCourse = cat.get("CMSC489")!;

describe("withTopicCourses", () => {
  it("builds a suffix code from its base: credits, no Gen Eds, topic title, notScheduled, nothing else copied", () => {
    const c = withTopicCourses(cat, ["CMSC489G"]).get("CMSC489G")!;
    expect(c.title).toBe("Special Topics (topic G)");
    expect(c.credits).toEqual(baseCourse.credits);
    expect(c.genEd).toEqual([]);
    expect(c.notScheduled).toBe(true);
    expect(c.offered).toBeUndefined();
    expect(c.twins).toBeUndefined();
    expect(c.prerequisite).toBeNull();
    expect(c.corequisite).toBeNull();
  });

  it("leaves a suffix code already in the catalog exactly as is", () => {
    const withG = new Map(cat).set("CMSC489G", { ...baseCourse, id: "CMSC489G", title: "Snapshot G" });
    expect(withTopicCourses(withG, ["CMSC489G"]).get("CMSC489G")).toBe(withG.get("CMSC489G"));
  });

  it("adds only the named codes, and nothing when the base is unknown", () => {
    const out = withTopicCourses(cat, ["CMSC489G", "ZZZZ489G", "CMSC131"]);
    expect(out.size).toBe(cat.size + 1);
    expect(out.has("CMSC489H")).toBe(false);
    expect(out.has("ZZZZ489G")).toBe(false);
  });

  it("splits department, digits and trailing letters", () => {
    expect(topicCodeParts("BIOE489G")).toEqual({ base: "BIOE489", suffix: "G" });
    expect(topicCodeParts("CMSC131")).toBeUndefined();
  });
});
