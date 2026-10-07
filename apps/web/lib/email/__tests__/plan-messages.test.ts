import { describe, expect, it } from "vitest";
import { emailErrorText } from "../plan-messages";

describe("emailErrorText", () => {
  it("words each outcome in plain language", () => {
    expect(emailErrorText(429)).toBe("You've emailed your plan 5 times today. Try again tomorrow.");
    expect(emailErrorText(503, "not-configured")).toBe("Emailing isn't available yet.");
    expect(emailErrorText(401)).toMatch(/Sign in/);
    expect(emailErrorText(502)).toBe("Couldn't email your plan. Try again.");
    expect(emailErrorText(503, "unavailable")).toBe("Couldn't email your plan. Try again.");
  });
});
