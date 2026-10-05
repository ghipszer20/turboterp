import { describe, expect, it } from "vitest";
import { accessToken, gateDecision } from "../access";

describe("accessToken", () => {
  it("is a stable hash that isn't the code itself", async () => {
    const token = await accessToken("open-sesame");
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(token).not.toContain("open-sesame");
    expect(await accessToken("open-sesame")).toBe(token);
    expect(await accessToken("open-sesame2")).not.toBe(token);
  });
});

describe("gateDecision", () => {
  const token = "t".repeat(64);
  const visit = (pathname: string, cookie?: string) => gateDecision({ pathname, cookie, token });

  it("lets everyone in when no access code is set", () => {
    expect(gateDecision({ pathname: "/advisor", cookie: undefined, token: null })).toBe("allow");
  });
  it("sends visitors without the cookie to Coming Soon", () => {
    expect(visit("/")).toBe("coming-soon");
    expect(visit("/advisor")).toBe("coming-soon");
    expect(visit("/campus/dining", "wrong")).toBe("coming-soon");
  });
  it("lets the holder of the right cookie in", () => {
    expect(visit("/", token)).toBe("allow");
    expect(visit("/api/dining", token)).toBe("allow");
  });
  it("refuses data requests from visitors instead of redirecting them", () => {
    expect(visit("/api/dining")).toBe("deny");
    expect(visit("/api/schedule/202701/index.json")).toBe("deny");
    expect(visit("/data/advisor/index.json")).toBe("deny");
  });
  it("keeps the Coming Soon page, the code check, the scheduled jobs and the icons reachable", () => {
    for (const p of ["/coming-soon", "/api/access", "/api/cron/fast", "/icon.svg", "/apple-icon", "/manifest.webmanifest", "/robots.txt", "/_next/static/x.js"]) {
      expect(visit(p)).toBe("allow");
    }
  });
  it("doesn't open look-alike paths", () => {
    expect(visit("/api/cronjob")).toBe("deny");
    expect(visit("/coming-soon-not")).toBe("coming-soon");
  });
});
