import { describe, expect, it } from "vitest";
import type { Section } from "@turboterp/course-data/schedules";
import { columnsFor, decodeLayout, encodeLayouts, visibleRows } from "../gallery";

describe("columnsFor", () => {
  it("fits as many cards of at least the minimum width as the row allows", () => {
    expect(columnsFor(1000, 250, 40)).toBe(3); // 3×250 + 2×40 = 830 ≤ 1000; 4 would need 1120
    expect(columnsFor(361, 250, 40)).toBe(1);
    expect(columnsFor(100, 250, 40)).toBe(1);
  });
});

describe("visibleRows", () => {
  const base = { rowHeight: 300, rowCount: 1000, overscan: 2, listTop: 400 };

  it("renders only the rows on screen plus an overscan margin", () => {
    expect(visibleRows({ ...base, scrollTop: 0, viewportHeight: 800 })).toEqual({ first: 0, last: 3 });
    // Rows 10–12 are on screen when the list's top is 400 px down and we've scrolled 3,400 px.
    expect(visibleRows({ ...base, scrollTop: 3400, viewportHeight: 800 })).toEqual({ first: 8, last: 14 });
  });

  it("clamps to the list", () => {
    expect(visibleRows({ ...base, scrollTop: 10_000_000, viewportHeight: 800 })).toEqual({ first: 999, last: 999 });
    expect(visibleRows({ ...base, rowCount: 0, scrollTop: 0, viewportHeight: 800 })).toEqual({ first: 0, last: -1 });
  });
});

describe("layout transfer from the worker", () => {
  const s = (courseId: string, id: string): Section => ({
    id,
    courseId,
    instructors: [],
    seats: { total: 1, open: 1, waitlist: 0, holdfile: 0 },
    delivery: "f2f",
    meetings: [],
  });
  const a1 = [s("A", "01"), s("A", "02")];
  const a2 = [s("A", "03")];
  const b1 = [s("B", "01")];
  const layouts = [
    [a1, b1],
    [a2, b1],
  ];

  it("sends each group once and each layout as numbers", () => {
    const enc = encodeLayouts(["A", "B"], layouts);
    expect(enc.count).toBe(2);
    expect(enc.groups).toEqual([["01", "02"], ["01"], ["03"]]);
    expect([...enc.table]).toEqual([0, 1, 2, 1]);
  });

  it("rebuilds any layout by index from the loaded sections", () => {
    const enc = encodeLayouts(["A", "B"], layouts);
    const byKey = new Map([...a1, ...a2, ...b1].map((x) => [`${x.courseId}/${x.id}`, x]));
    expect(decodeLayout(enc, 1, byKey)).toEqual(layouts[1]);
  });
});
