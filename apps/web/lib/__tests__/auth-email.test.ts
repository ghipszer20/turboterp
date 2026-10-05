import { describe, expect, it } from "vitest";
import { emailProblem, isEmail, sendProblem } from "../auth/email";
import { accountControl, decideSession } from "../auth/session-state";

describe("isEmail", () => {
  it("accepts any normal address, trimmed", () => {
    expect(isEmail("terry@terpmail.umd.edu")).toBe(true);
    expect(isEmail("  Terry@Example.COM ")).toBe(true);
    expect(isEmail("a@gmail.com")).toBe(true);
  });
  it("rejects malformed addresses", () => {
    for (const e of ["", "a", "a@", "@b.com", "a@b", "a b@c.com", "a@b@c.com", "a@b..", "a@.com"]) expect(isEmail(e)).toBe(false);
  });
});

describe("emailProblem", () => {
  it("returns a plain message or null", () => {
    expect(emailProblem("nope")).toBe("Enter a valid email address.");
    expect(emailProblem("a@gmail.com")).toBeNull();
  });
});

describe("accountControl", () => {
  it("shows nothing without auth config or while loading", () => {
    expect(accountControl(false, "signed-out")).toBe("none");
    expect(accountControl(true, "loading")).toBe("none");
  });
  it("offers sign-in when signed out and the account when signed in", () => {
    expect(accountControl(true, "signed-out")).toBe("sign-in");
    expect(accountControl(true, "signed-in")).toBe("account");
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
