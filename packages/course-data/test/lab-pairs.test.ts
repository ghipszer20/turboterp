import { describe, expect, it } from "vitest";
import { isLabCourse, labsByLecture, ruleFor, sameOrVariant, unclassifiedLabs, type LabPair, type LabSourceCourse } from "../src/lab-pairs.ts";

const c = (id: string, title: string, extra: { coreq?: string; genEdText?: string; labOnly?: boolean } = {}): LabSourceCourse => ({
  id,
  department: id.slice(0, 4),
  title,
  credits: { min: 1, max: 1 },
  genEd: [],
  genEdText: extra.genEdText ?? "",
  permissionRequired: false,
  texts: { prerequisite: null, corequisite: extra.coreq ?? null, restriction: null, creditOnlyGrantedFor: null, other: {} },
  description: "",
  ...(extra.labOnly ? { labOnly: true } : {}),
});

describe("isLabCourse", () => {
  it("matches Lab or Laboratory as a word, or lab-only meetings", () => {
    expect(isLabCourse({ title: "General Chemistry I Laboratory" })).toBe(true);
    expect(isLabCourse({ title: "Optoelectronics Lab" })).toBe(true);
    expect(isLabCourse({ title: "Labor Economics" })).toBe(false);
    expect(isLabCourse({ title: "Experimental Physics I: Mechanics and Waves", labOnly: true })).toBe(true);
  });
});

describe("sameOrVariant", () => {
  it("accepts the lab or a one-letter section variant", () => {
    expect(sameOrVariant("CHEM132", "CHEM132")).toBe(true);
    expect(sameOrVariant("CHEM132S", "CHEM132")).toBe(true);
    expect(sameOrVariant("CHEM133", "CHEM132")).toBe(false);
    expect(sameOrVariant("CHEM1320", "CHEM132")).toBe(false);
  });
});

describe("ruleFor", () => {
  const rules = [{ prefix: "KNES1", reason: "activity class", source: "test" }];
  it("applies to lab-only courses whose title doesn't say lab", () => {
    expect(ruleFor({ id: "KNES156", title: "Pickleball", labOnly: true }, rules)?.reason).toBe("activity class");
  });
  it("never applies to a lab-titled course or a course outside the prefix", () => {
    expect(ruleFor({ id: "KNES155", title: "Exercise Laboratory", labOnly: true }, rules)).toBeUndefined();
    expect(ruleFor({ id: "KNES360", title: "Physiology", labOnly: true }, rules)).toBeUndefined();
  });
});

describe("labsByLecture", () => {
  it("links a lab that names its lecture as a corequisite", () => {
    expect(labsByLecture([c("CHEM131", "Chemistry I"), c("CHEM132", "General Chemistry I Laboratory", { coreq: "CHEM131." })]).get("CHEM131")).toEqual(["CHEM132"]);
  });
  it("links a lecture that names its lab as a corequisite", () => {
    expect(labsByLecture([c("BSCI124", "Plant Biology", { coreq: "BSCI125." }), c("BSCI125", "Plant Biology Laboratory")]).get("BSCI124")).toEqual(["BSCI125"]);
  });
  it("links a lab-only course found by meeting type", () => {
    expect(labsByLecture([c("PHYS161", "Physics", { coreq: "PHYS275." }), c("PHYS275", "Experimental Physics I", { labOnly: true })]).get("PHYS161")).toEqual(["PHYS275"]);
  });
  it("ignores a corequisite between two lectures", () => {
    expect(labsByLecture([c("MATH001", "Calculus", { coreq: "MATH002." }), c("MATH002", "Calculus Workshop")]).size).toBe(0);
  });
  it("links a DSNL lab-science lecture to its lab", () => {
    expect(labsByLecture([c("BSCI170", "Molecular Biology", { genEdText: "DSNL (if taken with BSCI180), DSNS" }), c("BSCI180", "Principles of Biology Laboratory")]).get("BSCI170")).toEqual(["BSCI180"]);
  });
  it("adds given pairs, de-duplicates, and puts labs in the course list first", () => {
    const pairs: LabPair[] = [{ lecture: "BSCI170", labs: ["BSCI171", "BSCI180"], source: "test" }];
    const courses = [c("BSCI170", "Molecular Biology", { genEdText: "DSNL (if taken with BSCI180)" }), c("BSCI180", "Principles of Biology Laboratory"), c("BSCI180", "Principles of Biology Laboratory")];
    expect(labsByLecture(courses, pairs).get("BSCI170")).toEqual(["BSCI180", "BSCI171"]);
  });
});

describe("unclassifiedLabs", () => {
  it("lists labs that are neither paired, standalone, nor covered by a rule, once each", () => {
    const courses = [
      c("CHEM131", "Chemistry I"),
      c("CHEM132", "General Chemistry I Laboratory", { coreq: "CHEM131." }),
      c("CHEM132S", "General Chemistry I Laboratory"),
      c("ENEE445", "Computer Laboratory"),
      c("ENEE445", "Computer Laboratory"),
      c("NAVY108", "Naval Science Leadership Lab"),
      c("KNES156", "Pickleball", { labOnly: true }),
      c("PHYS276", "Experimental Physics II", { labOnly: true }),
    ];
    const opts = {
      pairs: [],
      standalone: [{ id: "NAVY108", reason: "leadership lab", source: "test" }],
      rules: [{ prefix: "KNES1", reason: "activity class", source: "test" }],
    };
    expect(unclassifiedLabs(courses, opts).map((x) => x.id)).toEqual(["ENEE445", "PHYS276"]);
  });
});
