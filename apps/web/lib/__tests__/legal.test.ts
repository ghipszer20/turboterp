import { describe, expect, it } from "vitest";
import { ACCESS_COOKIE } from "../access";
import { CONSENT_STORAGE_KEY } from "../advisor/consent";
import { PLAN_STORAGE_KEY } from "../advisor/storage";
import { PRIVACY, PRIVACY_VERSION, STORAGE_KEYS, TERMS, TERMS_VERSION, formatVersion } from "../legal";
import { PREP_KEY } from "../schedule/registration";
import { SAVED_KEY } from "../schedule/saved";
import { THEME_STORAGE_KEY } from "../theme";

const text = (s: typeof TERMS) => s.map((x) => [x.heading, ...x.paragraphs.flat()].join("\n")).join("\n");
const headings = (s: typeof TERMS) => s.map((x) => x.heading.toLowerCase());

describe("legal pages", () => {
  it("have dated versions", () => {
    expect(TERMS_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(PRIVACY_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(formatVersion("2026-10-04")).toBe("October 4, 2026");
  });

  it("terms cover every required topic", () => {
    const h = headings(TERMS).join("|");
    for (const t of [
      "introduction", "what turboterp is", "unofficial", "not academic advising", "wrong or out of date", "responsibility",
      "accounts", "no warranty", "limitation of liability", "acceptable use", "intellectual property", "third-party data",
      "donations", "changes", "governing law", "contact",
    ]) expect(h).toContain(t);
    expect(text(TERMS)).toMatch(/Apache-2\.0/);
    expect(text(TERMS)).toMatch(/Interline/);
    expect(text(TERMS)).toMatch(/PlanetTerp/);
    expect(text(TERMS)).toMatch(/typing your name/);
    expect(text(TERMS)).toMatch(/laws of Maryland/);
  });

  it("privacy covers its topics", () => {
    const h = headings(PRIVACY).join("|");
    for (const t of [
      "introduction", "what we collect", "browser", "transcripts", "cookies", "location", "used and shared", "other services",
      "donations", "planned", "deleting", "security", "changes", "contact",
    ]) expect(h).toContain(t);
    for (const service of ["Supabase", "Vercel", "OpenFreeMap", "Venmo"]) expect(text(PRIVACY)).toContain(service);
  });

  it("privacy names every storage key and cookie the app writes", () => {
    expect([...STORAGE_KEYS].sort()).toEqual(
      [PLAN_STORAGE_KEY, CONSENT_STORAGE_KEY, SAVED_KEY, PREP_KEY, "turboterp-leave-origin", THEME_STORAGE_KEY].sort(),
    );
    for (const k of STORAGE_KEYS) expect(text(PRIVACY)).toContain(k);
    expect(text(PRIVACY)).toContain(ACCESS_COOKIE);
  });

  it("never shows an unfilled placeholder", () => {
    expect(text(TERMS) + text(PRIVACY)).not.toMatch(/__|TODO|\[.*\]/);
  });
});
