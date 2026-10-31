import { describe, expect, it } from "vitest";
import { apiHeaders, apiUrl, readConfig } from "../src/config";

describe("readConfig", () => {
  it("defaults to turboterp.com with no lock header and no Sentry", () => {
    const c = readConfig({});
    expect(c).toEqual({ apiBaseUrl: "https://turboterp.com", accessToken: null, sentryDsn: null });
    expect(apiHeaders(c)).toEqual({});
  });

  it("treats blank values as unset and trims trailing slashes", () => {
    const c = readConfig({ EXPO_PUBLIC_API_BASE_URL: "http://localhost:3000/", EXPO_PUBLIC_TURBOTERP_ACCESS: "  ", EXPO_PUBLIC_SENTRY_DSN: "" });
    expect(c.apiBaseUrl).toBe("http://localhost:3000");
    expect(c.accessToken).toBeNull();
    expect(apiUrl("/api/v1/x", c)).toBe("http://localhost:3000/api/v1/x");
  });

  it("sends the site-lock value as x-turboterp-access", () => {
    expect(apiHeaders(readConfig({ EXPO_PUBLIC_TURBOTERP_ACCESS: "abc" }))).toEqual({ "x-turboterp-access": "abc" });
  });
});
