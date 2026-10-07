import { describe, expect, it } from "vitest";
import { ABOUT, isPlaceholder, resolveAbout, type AboutConfig } from "../about";

const FILLED: AboutConfig = {
  githubUrl: "https://github.com/example/turboterp",
  donationUrl: "https://venmo.com/u/example",
  venmoHandle: "@example",
  contactEmail: "hello@example.com",
};

const PLACEHOLDER_CONFIG: AboutConfig = {
  githubUrl: "__OWNER_FILL_IN__",
  donationUrl: "__OWNER_FILL_IN__",
  venmoHandle: "__OWNER_FILL_IN__",
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

describe("ABOUT", () => {
  it("points donations at the TurboTerp Venmo account", () => {
    const resolved = resolveAbout(ABOUT);
    expect(resolved.donationUrl).toBe("https://venmo.com/u/turboterp");
    expect(resolved.venmoHandle).toBe("@turboterp");
  });
});

describe("resolveAbout", () => {
  it("resolves every field to null when the config is all placeholders", () => {
    const resolved = resolveAbout(PLACEHOLDER_CONFIG);
    expect(resolved).toEqual({
      githubUrl: null,
      issuesUrl: null,
      donationUrl: null,
      venmoHandle: null,
      contactEmail: null,
    });
  });

  it("passes through a real donation link and contact email unchanged", () => {
    const resolved = resolveAbout(FILLED);
    expect(resolved.donationUrl).toBe(FILLED.donationUrl);
    expect(resolved.venmoHandle).toBe(FILLED.venmoHandle);
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
