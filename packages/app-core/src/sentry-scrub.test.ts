import { describe, expect, it } from "vitest";
import { scrubEvent, scrubText } from "./sentry-scrub";

describe("scrubText", () => {
  it("removes email addresses", () => {
    expect(scrubText("failed for jane.doe@terpmail.umd.edu today")).toBe("failed for [email] today");
  });
  it("drops query strings and fragments from URLs", () => {
    expect(scrubText("https://x.test/a?token=abc&e=1#h")).toBe("https://x.test/a");
  });
});

describe("scrubEvent", () => {
  it("drops user, cookies, headers and query strings", () => {
    const out = scrubEvent({
      type: undefined,
      user: { id: "1", email: "a@b.co" },
      message: "oops a@b.co",
      request: { url: "https://x.test/p?email=a@b.co", query_string: "email=a@b.co", cookies: { a: "b" }, headers: { cookie: "x" }, data: "secret" },
      exception: { values: [{ type: "Error", value: "bad a@b.co" }] },
      breadcrumbs: [{ message: "nav https://x.test/q?z=1" }],
    });
    expect(out.user).toBeUndefined();
    expect(out.message).toBe("oops [email]");
    expect(out.request).toEqual({ url: "https://x.test/p" });
    expect(out.exception?.values?.[0].value).toBe("bad [email]");
    expect(out.breadcrumbs?.[0].message).toBe("nav https://x.test/q");
  });

  it("drops query strings from network and navigation breadcrumb URLs", () => {
    const out = scrubEvent({
      type: undefined,
      breadcrumbs: [
        { category: "fetch", data: { url: "https://x.test/auth/callback?code=abc", method: "GET" } },
        { category: "navigation", data: { from: "/a?e=a@b.co", to: "/b?code=1" } },
      ],
    });
    expect(out.breadcrumbs?.[0].data).toEqual({ url: "https://x.test/auth/callback", method: "GET" });
    expect(out.breadcrumbs?.[1].data).toEqual({ from: "/a", to: "/b" });
  });
});
