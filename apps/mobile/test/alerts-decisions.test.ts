import { describe, expect, it } from "vitest";
import { availability, notificationTarget, permissionPlan } from "../src/alerts/decisions";

describe("availability", () => {
  it("is ready on a real iPhone with an EAS project id", () => {
    expect(availability({ platform: "ios", isDevice: true, projectId: "p" })).toBe("ready");
  });
  it("reports a missing project id, and unsupported on web or simulator", () => {
    expect(availability({ platform: "ios", isDevice: true, projectId: undefined })).toBe("no-project");
    expect(availability({ platform: "web", isDevice: true, projectId: "p" })).toBe("unsupported");
    expect(availability({ platform: "ios", isDevice: false, projectId: "p" })).toBe("unsupported");
  });
});

describe("permissionPlan", () => {
  it("goes ahead when granted, asks when undetermined, sends to Settings when denied for good", () => {
    expect(permissionPlan({ status: "granted", canAskAgain: true })).toBe("go");
    expect(permissionPlan({ status: "undetermined", canAskAgain: true })).toBe("ask");
    expect(permissionPlan({ status: "denied", canAskAgain: true })).toBe("ask");
    expect(permissionPlan({ status: "denied", canAskAgain: false })).toBe("settings");
  });
});

describe("notificationTarget", () => {
  it("reads the Drop/Add url and watch id", () => {
    expect(notificationTarget({ url: "https://app.testudo.umd.edu/x", watchId: "w1" })).toEqual({ url: "https://app.testudo.umd.edu/x", watchId: "w1" });
  });
  it("ignores non-https links and junk", () => {
    expect(notificationTarget({ url: "javascript:alert(1)" })).toEqual({ url: null, watchId: null });
    expect(notificationTarget(null)).toEqual({ url: null, watchId: null });
  });
});
