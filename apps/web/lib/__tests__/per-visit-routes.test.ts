import { describe, expect, it } from "vitest";
import { PER_VISIT_ALLOWED, unexpectedPerVisit } from "../per-visit-routes";

describe("unexpectedPerVisit", () => {
  it("passes when every route is prerendered or an allowed API route", () => {
    expect(unexpectedPerVisit(["/", "/schedule", "/api/consent"], ["/", "/schedule"])).toEqual([]);
  });
  it("names a page that would render on every visit", () => {
    expect(unexpectedPerVisit(["/", "/campus/dining"], ["/"])).toEqual(["/campus/dining"]);
  });
  it("names a new API route until it's added to the allow-list on purpose", () => {
    expect(unexpectedPerVisit(["/api/new-thing", "/api/consent"], [])).toEqual(["/api/new-thing"]);
  });
  it("allows only per-request API routes, never pages", () => {
    expect(PER_VISIT_ALLOWED.every((r) => r.startsWith("/api/"))).toBe(true);
  });
});
