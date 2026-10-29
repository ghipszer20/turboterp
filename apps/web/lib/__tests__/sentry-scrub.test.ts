import { describe, expect, it } from "vitest";
import { scrubEvent, scrubText } from "../sentry-scrub";

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
});
