import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => vi.unstubAllGlobals());

describe("consent on signing", () => {
  it("saveConsent adds a device id and asks for the record to be sent", async () => {
    const m = new Map<string, string>();
    const ls = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
    vi.stubGlobal("window", { localStorage: ls });
    vi.stubGlobal("localStorage", ls);
    vi.stubGlobal("location", { search: "" });
    const hooks = await import("../hooks");
    const sent = vi.fn();
    hooks.setConsentSavedListener(sent);
    const { saveConsent } = await import("../../../app/advisor/store");
    saveConsent({ name: "Ada Lovelace", acceptedAt: "2026-10-08T00:00:00Z", version: "2026-09-26" });
    const stored = JSON.parse(m.get("turboterp-advisor-consent")!);
    expect(stored.deviceId).toMatch(/.+/);
    expect(stored.recorded).toBeUndefined();
    expect(sent).toHaveBeenCalledTimes(1);
  });
});
