import { describe, expect, it } from "vitest";
import { emailProblem, isUmdEmail } from "../auth/email";
import { decideSession } from "../auth/session-state";

describe("isUmdEmail", () => {
  it("accepts umd.edu and terpmail.umd.edu, any case, trimmed", () => {
    expect(isUmdEmail("terry@umd.edu")).toBe(true);
    expect(isUmdEmail("  Terry@TerpMail.UMD.edu ")).toBe(true);
  });
  it("rejects other domains, subdomains and lookalikes", () => {
    for (const e of ["a@gmail.com", "a@umd.edu.evil.com", "x@notumd.edu", "a@cs.umd.edu", "a@evil.com@umd.edu", "umd.edu", "@umd.edu", "a b@umd.edu", ""])
      expect(isUmdEmail(e)).toBe(false);
  });
});

describe("emailProblem", () => {
  it("returns a plain message or null", () => {
    expect(emailProblem("a@gmail.com")).toBe("Use your @umd.edu or @terpmail.umd.edu address.");
    expect(emailProblem("a@umd.edu")).toBeNull();
  });
});

describe("decideSession", () => {
  it("maps loading, signed-out and signed-in", () => {
    expect(decideSession(undefined)).toEqual({ status: "loading", email: null });
    expect(decideSession(null)).toEqual({ status: "signed-out", email: null });
    expect(decideSession({ user: { email: "a@umd.edu" } })).toEqual({ status: "signed-in", email: "a@umd.edu" });
    expect(decideSession({ user: {} })).toEqual({ status: "signed-in", email: null });
  });
});
