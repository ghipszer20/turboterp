import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS, readQuery, writeQuery } from "../filters";

const q = (s: string) => new URLSearchParams(s);

describe("shared schedule in the URL", () => {
  const share = { term: "202608", picks: { CMSC351: "0101", STAT400: "0201" } };

  it("round-trips the term and the chosen sections", () => {
    const query = writeQuery([], DEFAULT_FILTERS, share);
    expect(query).toBe("term=202608&share=CMSC351.0101~STAT400.0201");
    expect(readQuery(q(query)).share).toEqual(share);
  });

  it("keeps section ids with letters and leaves other params alone", () => {
    const s = { term: "202608", picks: { ENGL394: "FC01" } };
    const query = writeQuery(["ENGL394"], DEFAULT_FILTERS, s);
    expect(readQuery(q(query))).toEqual({ courses: ["ENGL394"], share: s });
  });

  it("old links without the params read exactly as before", () => {
    expect(readQuery(q("c=CMSC351&off=F"))).toEqual({
      courses: ["CMSC351"],
      filters: { days: { F: "off" }, sort: "best" },
    });
    expect(writeQuery(["CMSC351"], DEFAULT_FILTERS)).toBe("c=CMSC351");
  });

  it.each([
    "term=202608",
    "share=CMSC351.0101",
    "term=fall&share=CMSC351.0101",
    "term=202608&share=CMSC351",
    "term=202608&share=cmsc.01~~",
    "term=202608&share=CMSC351.0101~CMSC351.0102",
    "term=202608&share=",
    "term=202608&share=CMSC351.0101~junk",
  ])("ignores malformed share params: %s", (s) => {
    expect(readQuery(q(s)).share).toBeUndefined();
  });
});
