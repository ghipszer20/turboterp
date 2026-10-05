import { describe, expect, it } from "vitest";
import { emailProblem, isUmdEmail, sendProblem } from "../auth/email";
import { decideSession } from "../auth/session-state";

describe("isUmdEmail", () => {
  it("accepts terpmail.umd.edu, any case, trimmed", () => {
    expect(isUmdEmail("terry@terpmail.umd.edu")).toBe(true);
    expect(isUmdEmail("  Terry@TerpMail.UMD.edu ")).toBe(true);
  });
  it("rejects plain umd.edu: students' mailboxes are terpmail (owner, 2026-10-04)", () => {
    expect(isUmdEmail("terry@umd.edu")).toBe(false);
  });
  it("rejects other domains, subdomains and lookalikes", () => {
    for (const e of ["a@gmail.com", "a@terpmail.umd.edu.evil.com", "x@notterpmail.umd.edu", "a@cs.umd.edu", "a@evil.com@terpmail.umd.edu", "terpmail.umd.edu", "@terpmail.umd.edu", "a b@terpmail.umd.edu", ""])
      expect(isUmdEmail(e)).toBe(false);
  });
});

describe("emailProblem", () => {
  it("returns a plain message or null", () => {
    expect(emailProblem("a@gmail.com")).toBe("Use your @terpmail.umd.edu address.");
    expect(emailProblem("a@umd.edu")).toBe("Use your @terpmail.umd.edu address.");
    expect(emailProblem("a@terpmail.umd.edu")).toBeNull();
  });
});

describe("sendProblem", () => {
  it("explains the email rate limit", () => {
    expect(sendProblem({ status: 429 })).toBe("Too many sign-in emails were just sent. Wait a few minutes, then try again.");
    expect(sendProblem({ code: "over_email_send_rate_limit" })).toBe("Too many sign-in emails were just sent. Wait a few minutes, then try again.");
  });
  it("is general otherwise", () => {
    expect(sendProblem({ status: 500 })).toBe("We couldn't send the link. Try again in a moment.");
    expect(sendProblem(undefined)).toBe("We couldn't send the link. Try again in a moment.");
  });
});

describe("decideSession", () => {
  it("maps loading, signed-out and signed-in", () => {
    expect(decideSession(undefined)).toEqual({ status: "loading", email: null });
    expect(decideSession(null)).toEqual({ status: "signed-out", email: null });
    expect(decideSession({ user: { email: "a@terpmail.umd.edu" } })).toEqual({ status: "signed-in", email: "a@terpmail.umd.edu" });
    expect(decideSession({ user: {} })).toEqual({ status: "signed-in", email: null });
  });
});
