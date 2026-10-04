import { describe, expect, it } from "vitest";
import { PRIVACY, PRIVACY_VERSION, STORAGE_KEYS, TERMS, TERMS_VERSION } from "../legal";

const text = (s: typeof TERMS) => s.map((x) => [x.heading, ...x.paragraphs].join("\n")).join("\n");
const headings = (s: typeof TERMS) => s.map((x) => x.heading.toLowerCase());

describe("legal pages", () => {
  it("have dated versions", () => {
    expect(TERMS_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(PRIVACY_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("terms cover every required topic", () => {
    const h = headings(TERMS).join("|");
    for (const t of [
      "what turboterp is", "unofficial", "not academic advising", "wrong or out of date", "responsibility",
      "no warranty", "limitation of liability", "acceptable use", "third-party data", "changes",
    ]) expect(h).toContain(t);
    expect(text(TERMS)).toMatch(/Apache-2\.0/);
    expect(text(TERMS)).toMatch(/Interline/);
    expect(text(TERMS)).toMatch(/typing your name/);
  });

  it("privacy covers its topics and names every storage key", () => {
    const h = headings(PRIVACY).join("|");
    for (const t of ["browser", "transcripts", "tracking", "location", "planned", "contact"]) expect(h).toContain(t);
    for (const k of STORAGE_KEYS) expect(text(PRIVACY)).toContain(k);
    expect(STORAGE_KEYS).toHaveLength(5);
  });
});
