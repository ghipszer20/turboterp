import { describe, expect, it } from "vitest";
import { ALERTS_MANIFEST_PATH, ALERTS_START_URL, buildManifest } from "../app-manifest";

describe("buildManifest", () => {
  it("opens the home page by default", () => {
    expect(buildManifest().start_url).toBe("/");
  });

  it("opens Seat Alerts when saved from the Seat Alerts page", () => {
    expect(buildManifest({ startUrl: ALERTS_START_URL }).start_url).toBe("/alerts");
  });

  it("shares name, colours, display and icons between both", () => {
    const { start_url: a, ...root } = buildManifest();
    const { start_url: b, ...alerts } = buildManifest({ startUrl: ALERTS_START_URL });
    expect(a).not.toBe(b);
    expect(alerts).toEqual(root);
    expect(root.name).toBe("TurboTerp");
    expect(root.display).toBe("standalone");
    expect(root.theme_color).toBe("#ba0c2f");
    expect(root.icons?.length).toBeGreaterThan(0);
  });

  it("keeps the whole site in scope and one app identity, whichever page it was saved from", () => {
    for (const m of [buildManifest(), buildManifest({ startUrl: ALERTS_START_URL })]) {
      expect(m.scope).toBe("/");
      expect(m.id).toBe("/");
    }
  });

  it("serves the Seat Alerts manifest from its own path", () => {
    expect(ALERTS_MANIFEST_PATH).toBe("/alerts/manifest.webmanifest");
  });
});
