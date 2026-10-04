import { describe, expect, it } from "vitest";
import { buildReportMailto, isPlaceholder, resolveAbout, type AboutConfig } from "../about";

const FILLED: AboutConfig = {
  creatorBio: "I'm a UMD student who built this.",
  githubUrl: "https://github.com/example/turboterp",
  donationUrl: "https://buymeacoffee.com/example",
  contactEmail: "hello@example.com",
};

const PLACEHOLDER_CONFIG: AboutConfig = {
  creatorBio: "__OWNER_FILL_IN__",
  githubUrl: "__OWNER_FILL_IN__",
  donationUrl: "__OWNER_FILL_IN__",
  contactEmail: "__OWNER_FILL_IN__",
};

describe("isPlaceholder", () => {
  it("recognizes the sentinel value", () => {
    expect(isPlaceholder("__OWNER_FILL_IN__")).toBe(true);
  });

  it("does not flag a real value", () => {
    expect(isPlaceholder("hello@example.com")).toBe(false);
  });
});

describe("resolveAbout", () => {
  it("resolves every field to null when the config is all placeholders", () => {
    const resolved = resolveAbout(PLACEHOLDER_CONFIG);
    expect(resolved).toEqual({
      bio: null,
      githubUrl: null,
      issuesUrl: null,
      donationUrl: null,
      contactEmail: null,
    });
  });

  it("passes through a real bio, donation link and contact email unchanged", () => {
    const resolved = resolveAbout(FILLED);
    expect(resolved.bio).toBe(FILLED.creatorBio);
    expect(resolved.donationUrl).toBe(FILLED.donationUrl);
    expect(resolved.contactEmail).toBe(FILLED.contactEmail);
  });

  it("derives the GitHub issues URL from a real GitHub URL", () => {
    const resolved = resolveAbout(FILLED);
    expect(resolved.githubUrl).toBe("https://github.com/example/turboterp");
    expect(resolved.issuesUrl).toBe("https://github.com/example/turboterp/issues/new");
  });

  it("strips a trailing slash from the GitHub URL before deriving the issues URL", () => {
    const resolved = resolveAbout({ ...FILLED, githubUrl: "https://github.com/example/turboterp/" });
    expect(resolved.issuesUrl).toBe("https://github.com/example/turboterp/issues/new");
  });

  it("never lets the placeholder sentinel escape as a resolved value", () => {
    const resolved = resolveAbout(PLACEHOLDER_CONFIG);
    for (const value of Object.values(resolved)) {
      expect(value).not.toBe("__OWNER_FILL_IN__");
    }
  });

  it("leaves the issues URL null when the GitHub URL is a placeholder, even if other fields are filled", () => {
    const resolved = resolveAbout({ ...PLACEHOLDER_CONFIG, contactEmail: FILLED.contactEmail });
    expect(resolved.githubUrl).toBeNull();
    expect(resolved.issuesUrl).toBeNull();
    expect(resolved.contactEmail).toBe(FILLED.contactEmail);
  });
});

describe("buildReportMailto", () => {
  it("builds a mailto link addressed to the given email", () => {
    const href = buildReportMailto("hello@example.com", { what: "It broke", page: "Schedule" });
    expect(href.startsWith("mailto:hello@example.com?")).toBe(true);
  });

  it("percent-encodes spaces in the subject and body instead of using '+'", () => {
    const href = buildReportMailto("hello@example.com", { what: "the calendar is blank", page: "Schedule builder" });
    expect(href).not.toContain("+");
    expect(href).toContain("Schedule%20builder");
  });

  it("encodes newlines, ampersands and question marks in the report text", () => {
    const href = buildReportMailto("hello@example.com", { what: "line one\nline two & three?", page: "Advisor" });
    const [, query] = href.split("?", 2);
    expect(query).toBeDefined();
    // The raw characters must not appear unescaped in the query string.
    expect(query).not.toMatch(/\n/);
    const bodyParam = new URLSearchParams(query).get("body");
    expect(bodyParam).toContain("line one\nline two & three?");
  });

  it("omits the reply-to line when no reply email is given", () => {
    const href = buildReportMailto("hello@example.com", { what: "It broke", page: "Schedule" });
    const body = new URLSearchParams(href.split("?", 2)[1]).get("body") ?? "";
    expect(body).not.toContain("Reply to:");
  });

  it("includes the reply-to line when a reply email is given", () => {
    const href = buildReportMailto("hello@example.com", { what: "It broke", page: "Schedule", replyTo: "me@terpmail.umd.edu" });
    const body = new URLSearchParams(href.split("?", 2)[1]).get("body") ?? "";
    expect(body).toContain("Reply to: me@terpmail.umd.edu");
  });

  it("says which page had the issue in the body", () => {
    const href = buildReportMailto("hello@example.com", { what: "It broke", page: "Advisor" });
    const body = new URLSearchParams(href.split("?", 2)[1]).get("body") ?? "";
    expect(body).toContain("Page: Advisor");
  });
});
