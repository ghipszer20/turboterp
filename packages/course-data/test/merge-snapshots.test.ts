import { describe, expect, it } from "vitest";
import { mergeSnapshots } from "../src/merge-snapshots.ts";
import type { Course } from "../src/soc.ts";

const course = (id: string, title: string): Course => ({ id, title }) as Course;

describe("mergeSnapshots", () => {
  it("keeps courses from every term", () => {
    const merged = mergeSnapshots([
      { term: "202608", courses: [course("CMNS100", "Intro")] },
      { term: "202701", courses: [course("MATH140", "Calc")] },
    ]);
    expect(merged.map((c) => c.id).sort()).toEqual(["CMNS100", "MATH140"]);
  });

  it("newest term wins regardless of input order", () => {
    const snaps = [
      { term: "202701", courses: [course("MATH140", "New title")] },
      { term: "202608", courses: [course("MATH140", "Old title")] },
    ];
    expect(mergeSnapshots(snaps).find((c) => c.id === "MATH140")!.title).toBe("New title");
    expect(mergeSnapshots([...snaps].reverse()).find((c) => c.id === "MATH140")!.title).toBe("New title");
  });

  it("returns nothing for no snapshots", () => {
    expect(mergeSnapshots([])).toEqual([]);
  });
});
