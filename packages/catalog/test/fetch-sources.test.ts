// Unit tests for fetch-sources.ts's pure OCR-decision helper. Importing the
// module must not run its CLI body (network fetches, file writes) -- that's
// guarded by an isMainModule check at the bottom of the file, so this import
// is side-effect-free under vitest.
import { describe, expect, it } from "vitest";
import { isPdfTextUnreadable, OCR_NOTE } from "../scripts/fetch-sources.ts";

// A short excerpt of what pdfjs actually extracts from one of the obfuscated-font
// ARHU sample-plan PDFs (Chinese four-year plan): every letter is run through a
// substitution cipher baked into the PDF's font, so there are no real course
// codes and essentially no real English words left.
const GARBLED_SAMPLE = [
  "!\"#$",
  "()** +,-./01234565 74895:5;<=>?@ABCD8EFGHI1JK",
  "4FLMEFNOPBHCPHQ;4O>??1234566 AFLR;A<>? <CFNSTPUHFQVCBCW;<U>2BQLVESXOVPBFNOPBHCPHQ;2O>??",
  "mnopqrstuvwrprxqypzrr{xt|p}toruropr~o mnopruvpqys~",
];

// A short excerpt of a real, readable sample plan (English major), as pdfjs
// extracts it from a normal (non-obfuscated) PDF.
const CLEAN_SAMPLE = [
  "English Four Year Academic Plan",
  "Fall Spring",
  "Year 1",
  "ENGL 101 (AW)* {Min. Grade: C-} Natural Sciences (NS)**",
  "ENGL 1xx-2xx course Math (MA)* Analytic Reasoning (AR)",
  "ARHU 158 ENGL 1xx-4xx (Historical Course #1 & Methods)",
  "ENGL 301 Natural Science Lab (NL)** ENGL 301",
  "Complete the following requirements to earn your degree.",
];

// A real department overview page has ordinary prose but may mention no
// course codes at all -- it must not be mistaken for garbage.
const PROSE_NO_COURSE_CODES = [
  "The Department of Chinese offers a major and a minor.",
  "Students must complete at least 30 credits total, including a capstone.",
  "This program is also available with a minor in a related language.",
];

describe("isPdfTextUnreadable", () => {
  it("is false when the text has real course-code-like tokens", () => {
    expect(isPdfTextUnreadable(CLEAN_SAMPLE)).toBe(false);
  });

  it("is true for font-substitution garbage (no course codes, no common words)", () => {
    expect(isPdfTextUnreadable(GARBLED_SAMPLE)).toBe(true);
  });

  it("is false for real prose with common English words even with no course codes", () => {
    expect(isPdfTextUnreadable(PROSE_NO_COURSE_CODES)).toBe(false);
  });

  it("is true for no text at all", () => {
    expect(isPdfTextUnreadable([])).toBe(true);
  });

  it("is false once at least two course codes appear, even amid otherwise sparse text", () => {
    expect(isPdfTextUnreadable(["CHIN301", "CHIN302"])).toBe(false);
  });

  it("is true for a single course-code-like token with no other signal", () => {
    // One token could be coincidental; the function wants either >=2 course
    // codes or a real-word ratio, not a single lucky match.
    expect(isPdfTextUnreadable(["XKCD123 qzjv wobf trpl"])).toBe(true);
  });
});

describe("OCR_NOTE", () => {
  it("flags OCR'd text so readers know it may contain recognition errors", () => {
    expect(OCR_NOTE).toMatch(/OCR/);
    expect(OCR_NOTE).toMatch(/recognition errors/);
  });
});
