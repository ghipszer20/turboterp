import { describe, expect, it, vi } from "vitest";
import { parseConsent, type ConsentRecord } from "../consent";
import { syncConsent } from "../consent-send";

const rec = (extra: Partial<ConsentRecord> = {}): ConsentRecord => ({ name: "Ada Lovelace", acceptedAt: "2026-10-08T00:00:00Z", version: "2026-09-26", deviceId: "dev-1", ...extra });
const res = (status: number) => ({ ok: status === 200, status }) as Response;
const signedOut = { userId: null, token: null };

describe("syncConsent", () => {
  it("sends an unrecorded consent and marks it recorded", async () => {
    const fetchFn = vi.fn(async () => res(200));
    const out = await syncConsent(rec(), signedOut, fetchFn);
    expect(out).toMatchObject({ recorded: true });
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/consent");
    expect(JSON.parse(init.body as string)).toEqual({ name: "Ada Lovelace", version: "2026-09-26", acceptedAt: "2026-10-08T00:00:00Z", deviceId: "dev-1" });
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });
  it("does nothing for a recorded consent when signed out", async () => {
    const fetchFn = vi.fn();
    expect(await syncConsent(rec({ recorded: true }), signedOut, fetchFn)).toBeNull();
    expect(fetchFn).not.toHaveBeenCalled();
  });
  it("links once after sign-in, with the token", async () => {
    const fetchFn = vi.fn(async () => res(200));
    const out = await syncConsent(rec({ recorded: true }), { userId: "u1", token: "tok" }, fetchFn);
    expect(out).toMatchObject({ recorded: true, linkedTo: "u1" });
    expect((fetchFn.mock.calls[0] as unknown as [string, RequestInit])[1].headers).toMatchObject({ Authorization: "Bearer tok" });
    expect(await syncConsent(out!, { userId: "u1", token: "tok" }, fetchFn)).toBeNull();
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
  it("400 and 429 and network errors change nothing and are not retried", async () => {
    for (const status of [400, 429]) {
      const fetchFn = vi.fn(async () => res(status));
      expect(await syncConsent(rec(), signedOut, fetchFn)).toBeNull();
      expect(fetchFn).toHaveBeenCalledTimes(1);
    }
    expect(await syncConsent(rec(), signedOut, vi.fn(async () => Promise.reject(new Error("x"))))).toBeNull();
  });
  it("a record without deviceId gets one", async () => {
    const fetchFn = vi.fn(async () => res(200));
    const out = await syncConsent(rec({ deviceId: undefined }), signedOut, fetchFn);
    expect(out?.deviceId).toMatch(/.+/);
  });
  it("parseConsent keeps linkedTo and still reads old records", () => {
    expect(parseConsent(JSON.stringify(rec({ linkedTo: "u1" })))?.linkedTo).toBe("u1");
    expect(parseConsent(JSON.stringify({ name: "Ada L", acceptedAt: "x", version: "y" }))).toEqual({ name: "Ada L", acceptedAt: "x", version: "y" });
  });
});
