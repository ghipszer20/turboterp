import { describe, expect, it } from "vitest";
import { groupItemsIntoLines, looksLikeTextLayer } from "@turboterp/app-core/transcript-lines";

// pdfjs text items: only `str` and `transform` (a 6-number matrix; transform[4]/[5] are x/y) matter
// to the line-reconstruction helper.
const item = (str: string, x: number, y: number) => ({ str, transform: [1, 0, 0, 1, x, y] });

describe("groupItemsIntoLines", () => {
  it("joins items on the same line, left to right, in reading order (top to bottom)", () => {
    const items = [
      item("World", 60, 700),
      item("Hello ", 0, 700),
      item("Bye", 0, 680),
    ];
    expect(groupItemsIntoLines(items)).toEqual(["Hello World", "Bye"]);
  });

  it("tolerates tiny sub-pixel y jitter between items on the same visual row", () => {
    const items = [item("A", 0, 700.2), item("B", 10, 699.9), item("C", 20, 700.4)];
    expect(groupItemsIntoLines(items)).toEqual(["ABC"]);
  });

  it("treats a clearly different y as a new line, even if close", () => {
    const items = [item("A", 0, 700), item("B", 0, 695)];
    expect(groupItemsIntoLines(items)).toEqual(["A", "B"]);
  });

  it("drops blank lines", () => {
    const items = [item("Hi", 0, 700), item("   ", 0, 690), item("Bye", 0, 680)];
    expect(groupItemsIntoLines(items)).toEqual(["Hi", "Bye"]);
  });

  it("returns an empty array for no items", () => {
    expect(groupItemsIntoLines([])).toEqual([]);
  });
});

describe("looksLikeTextLayer", () => {
  it("says yes for a page with a normal amount of extracted text", () => {
    const items = Array.from({ length: 40 }, (_, i) => item("word", i * 10, 700));
    expect(looksLikeTextLayer(items)).toBe(true);
  });

  it("says no for a page with no text items (a vector-outline PDF)", () => {
    expect(looksLikeTextLayer([])).toBe(false);
  });

  it("says no for a page with only a handful of stray characters", () => {
    expect(looksLikeTextLayer([item(".", 0, 700), item(".", 10, 700)])).toBe(false);
  });
});
