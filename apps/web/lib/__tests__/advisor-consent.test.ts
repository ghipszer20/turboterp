import { describe, expect, it } from "vitest";
import { acceptConsent, CONSENT_VERSION, hasConsent, parseConsent } from "../advisor/consent";

const now = new Date("2026-09-25T22:10:00.000Z");

describe("acceptConsent", () => {
  it("records the typed name (trimmed, spaces collapsed), the date and the agreement version", () => {
    expect(acceptConsent("  Terry   Terrapin ", true, now)).toEqual({
      ok: true,
      record: { name: "Terry Terrapin", acceptedAt: "2026-09-25T22:10:00.000Z", version: CONSENT_VERSION },
    });
  });

  it("needs the box ticked", () => {
    expect(acceptConsent("Terry Terrapin", false, now)).toEqual({ ok: false, error: "Tick the box to confirm you've read it." });
  });

  it("needs a name", () => {
    expect(acceptConsent("   ", true, now)).toEqual({ ok: false, error: "Type your full name to sign." });
    expect(acceptConsent("T", true, now)).toEqual({ ok: false, error: "Type your full name to sign." });
  });
});

describe("hasConsent", () => {
  const record = { name: "Terry Terrapin", acceptedAt: now.toISOString(), version: CONSENT_VERSION };

  it("accepts a stored agreement to the current wording", () => {
    expect(hasConsent(parseConsent(JSON.stringify(record)))).toBe(true);
  });

  it("asks again after the wording changes", () => {
    expect(hasConsent(parseConsent(JSON.stringify({ ...record, version: "2000-01-01" })))).toBe(false);
  });

  it("treats missing or junk storage as no agreement", () => {
    expect(hasConsent(parseConsent(null))).toBe(false);
    expect(hasConsent(parseConsent("{"))).toBe(false);
    expect(hasConsent(parseConsent(JSON.stringify({ ...record, name: "" })))).toBe(false);
  });
});

describe("parseConsent extra fields", () => {
  it("keeps deviceId and recorded and still accepts old records", () => {
    const base = { name: "Ada Lovelace", acceptedAt: "2026-10-08T00:00:00Z", version: CONSENT_VERSION };
    expect(parseConsent(JSON.stringify({ ...base, deviceId: "d", recorded: true }))).toEqual({ ...base, deviceId: "d", recorded: true });
    expect(parseConsent(JSON.stringify(base))).toEqual(base);
  });
});
