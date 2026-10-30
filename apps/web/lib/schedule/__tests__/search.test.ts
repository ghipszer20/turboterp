import { describe, expect, it } from "vitest";
import type { IndexedCourse } from "@turboterp/course-data/schedule-files";
import { searchCourses, searchWithCatalog, usuallyOffered } from "../search";

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

describe("searchWithCatalog (courses not offered this term)", () => {
  const term = [c("FIRE198", "Selected Topics in Fire Protection"), c("FIRE398", "Professional Development in Fire Protection")];
  const catalog = [
    { id: "FIRE120", title: "Introduction to Fire Protection", offered: ["Fall"] as const },
    { id: "FIRE198", title: "Selected Topics in Fire Protection", offered: ["Spring"] as const },
    { id: "FIRE298", title: "Fire Protection Problems", offered: ["Fall"] as const },
    { id: "FIRE398", title: "Professional Development in Fire Protection" },
    { id: "FIRE310", title: "Fire Dynamics" },
  ];

  it("shows a course with no sections this term as not offered, usually fall", () => {
    const r = searchWithCatalog(term, catalog, "FIRE120");
    expect(r).toEqual([{ offered: false, id: "FIRE120", title: "Introduction to Fire Protection", usually: "usually fall" }]);
  });

  it("returns a course with sections as a normal result, even when the catalog has it", () => {
    expect(searchWithCatalog(term, catalog, "FIRE198")).toEqual([{ offered: true, course: term[0] }]);
  });

  it("says nothing about seasons when the catalog has none", () => {
    expect(searchWithCatalog(term, catalog, "FIRE310")).toEqual([{ offered: false, id: "FIRE310", title: "Fire Dynamics", usually: null }]);
  });

  it("ranks offered courses first, then not-offered ones", () => {
    expect(searchWithCatalog(term, catalog, "fire").map((x) => (x.offered ? x.course.id : x.id))).toEqual([
      "FIRE198",
      "FIRE398",
      "FIRE120",
      "FIRE298",
      "FIRE310",
    ]);
  });

  it("works without a catalog and respects the limit", () => {
    expect(searchWithCatalog(term, null, "FIRE120")).toEqual([]);
    expect(searchWithCatalog(term, catalog, "fire", 3)).toHaveLength(3);
  });
});

describe("usuallyOffered", () => {
  it("names the seasons from the catalog", () => {
    expect(usuallyOffered(["Fall"])).toBe("usually fall");
    expect(usuallyOffered(["Spring"])).toBe("usually spring");
    expect(usuallyOffered(["Fall", "Spring"])).toBe("usually fall and spring");
    expect(usuallyOffered(["Fall", "Spring", "Summer"])).toBe("usually fall, spring and summer");
    expect(usuallyOffered(undefined)).toBeNull();
    expect(usuallyOffered([])).toBeNull();
  });
});
