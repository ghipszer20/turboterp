import { describe, expect, it } from "vitest";
import { feedExpiryNotice } from "../feed-expiry";

describe("feedExpiryNotice", () => {
  it("says nothing without an end date or more than 30 days before it", () => {
    expect(feedExpiryNotice(null, "2026-12-20")).toBeNull();
    expect(feedExpiryNotice("2026-12-24", "2026-11-23")).toBeNull();
  });

  it("gives a heads-up in the last 30 days, through the end date itself", () => {
    expect(feedExpiryNotice("2026-12-24", "2026-11-24")).toBe(
      "Shuttle-UM's published schedule runs through Dec 24, 2026. TurboTerp switches to the next one once it's out.",
    );
    expect(feedExpiryNotice("2026-12-24", "2026-12-24")).toMatch(/^Shuttle-UM's published schedule runs through Dec 24, 2026\./);
  });

  it("warns once the schedule has ended", () => {
    expect(feedExpiryNotice("2026-12-24", "2026-12-25")).toBe(
      "Shuttle-UM's published schedule ended Dec 24, 2026, so these times may be wrong or missing. Check Transit for live buses.",
    );
  });
});
