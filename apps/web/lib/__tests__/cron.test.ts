import { describe, expect, it } from "vitest";
import { authorizeCron, cronJob } from "../cron";

describe("authorizeCron", () => {
  it("is not-configured when the secret is unset or empty", () => {
    expect(authorizeCron("Bearer x", undefined)).toBe("not-configured");
    expect(authorizeCron("Bearer ", "")).toBe("not-configured");
  });
  it("accepts exactly Bearer <secret>", () => {
    expect(authorizeCron("Bearer s3cret", "s3cret")).toBe("ok");
  });
  it("rejects anything else", () => {
    expect(authorizeCron(null, "s3cret")).toBe("unauthorized");
    expect(authorizeCron("", "s3cret")).toBe("unauthorized");
    expect(authorizeCron("s3cret", "s3cret")).toBe("unauthorized");
    expect(authorizeCron("Bearer s3cre", "s3cret")).toBe("unauthorized");
    expect(authorizeCron("Bearer s3crets", "s3cret")).toBe("unauthorized");
    expect(authorizeCron("bearer s3cret", "s3cret")).toBe("unauthorized");
  });
});

describe("cronJob", () => {
  it("knows fast and daily only", () => {
    expect(cronJob("fast")).toBe("fast");
    expect(cronJob("daily")).toBe("daily");
    expect(cronJob("prune")).toBeNull();
    expect(cronJob("")).toBeNull();
    expect(cronJob("constructor")).toBeNull();
  });
});
