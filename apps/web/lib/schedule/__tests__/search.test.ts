import { describe, expect, it } from "vitest";
import type { IndexedCourse } from "@turboterp/course-data/schedule-files";
import { searchCourses } from "../search";

const c = (id: string, title: string): IndexedCourse => ({ id, title, credits: { min: 3, max: 3 }, sections: 1 });
const index = [
  c("CMSC131", "Object-Oriented Programming I"),
  c("CMSC132", "Object-Oriented Programming II"),
  c("CMSC351", "Algorithms"),
  c("CMSC451", "Design and Analysis of Computer Algorithms"),
  c("STAT400", "Applied Probability and Statistics I"),
  c("ENGL394", "Business Writing"),
  c("MATH140", "Calculus I"),
];
const ids = (q: string, limit?: number) => searchCourses(index, q, limit).map((x) => x.id);

describe("searchCourses", () => {
  it("finds courses by code prefix, in any case and with a space", () => {
    expect(ids("cmsc 13")).toEqual(["CMSC131", "CMSC132"]);
    expect(ids("CMSC351")).toEqual(["CMSC351"]);
  });

  it("finds courses by title words (each word a prefix of a title word)", () => {
    expect(ids("business writ")).toEqual(["ENGL394"]);
    expect(ids("calc")).toEqual(["MATH140"]);
  });

  it("puts code matches before title matches", () => {
    expect(ids("algorithms")).toEqual(["CMSC351", "CMSC451"]);
    expect(ids("stat")).toEqual(["STAT400"]);
  });

  it("ranks a title that starts with the query above one that only contains it", () => {
    expect(ids("algo")).toEqual(["CMSC351", "CMSC451"]);
  });

  it("returns nothing for an empty query and respects the limit", () => {
    expect(ids("  ")).toEqual([]);
    expect(ids("cmsc", 2)).toHaveLength(2);
  });
});
