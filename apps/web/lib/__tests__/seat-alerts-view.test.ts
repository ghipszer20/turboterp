import { describe, expect, it } from "vitest";
import { setupSteps } from "../seat-alerts/view";

describe("setupSteps", () => {
  it("tells an iPhone Safari tab only to add to the Home Screen", () => {
    expect(setupSteps("ios-needs-home-screen")).toEqual([
      "In Safari's own toolbar (not on this page), tap Share, then Add to Home Screen. On newer iPhones, Share is under the ••• button.",
      "Open TurboTerp from your Home Screen.",
      "Turn on alerts there and add your classes.",
    ]);
  });

  it("gives a device that can get notifications the three-step flow", () => {
    expect(setupSteps("supported")).toEqual([
      "Turn on alerts for this device.",
      "Add a full class, or any section of it.",
      "When a seat opens, tap the alert to go to Testudo.",
    ]);
  });

  it("gives an unsupported browser no steps", () => {
    expect(setupSteps("unsupported")).toEqual([]);
  });
});
