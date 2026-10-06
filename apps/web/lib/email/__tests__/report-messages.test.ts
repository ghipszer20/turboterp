import { describe, expect, it } from "vitest";
import { reportOutcome } from "../report-messages";

describe("reportOutcome", () => {
  it("says sent on 200", () => {
    expect(reportOutcome(200, null)).toEqual({ ok: true, message: "Sent. Thanks!" });
  });
  it("uses the spec's text for a rate limit", () => {
    expect(reportOutcome(429, "rate-limited")).toEqual({ ok: false, message: "Too many reports from here just now. Try again later." });
  });
  it("says sending isn't available when not configured", () => {
    const r = reportOutcome(503, "not-configured");
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/isn't available yet/);
  });
  it("tells the student to check the form on 400", () => {
    expect(reportOutcome(400, "bad-request").message).toMatch(/Check/);
  });
  it("falls back to a retry message, and keeps the text", () => {
    for (const status of [502, 503, 0]) {
      const r = reportOutcome(status, status === 503 ? "unavailable" : null);
      expect(r.ok).toBe(false);
      expect(r.message).toMatch(/Try again/);
    }
  });
});
