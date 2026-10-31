import { describe, expect, it, vi } from "vitest";
import { CONSENT_STORAGE_KEY, CONSENT_VERSION, hasConsent } from "@turboterp/app-core/consent";
import type { KeyValueStore } from "@turboterp/app-core/key-value-store";
import { createConsentStore, sendConsentRecord } from "../src/advisor/consent-core";

function memoryKv(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, get: (k) => data.get(k) ?? null, set: (k, v) => void data.set(k, v), remove: (k) => void data.delete(k) };
}
const record = { name: "Ada Lovelace", acceptedAt: "2026-10-31T00:00:00.000Z", version: CONSENT_VERSION };

describe("consent store", () => {
  it("has no consent until signed", () => {
    const store = createConsentStore({ kv: memoryKv(), onSaved: vi.fn() });
    expect(hasConsent(store.get())).toBe(false);
  });

  it("saving writes the web's key, assigns a device id, notifies", () => {
    const kv = memoryKv();
    const onSaved = vi.fn();
    const store = createConsentStore({ kv, onSaved, newId: () => "dev-1" });
    const l = vi.fn();
    store.subscribe(l);
    store.save(record);
    expect(JSON.parse(kv.data.get(CONSENT_STORAGE_KEY)!)).toMatchObject({ name: "Ada Lovelace", deviceId: "dev-1" });
    expect(hasConsent(store.get())).toBe(true);
    expect(onSaved).toHaveBeenCalledOnce();
    expect(l).toHaveBeenCalled();
  });

  it("reads a record the web wrote", () => {
    const kv = memoryKv();
    kv.data.set(CONSENT_STORAGE_KEY, JSON.stringify(record));
    expect(hasConsent(createConsentStore({ kv, onSaved: vi.fn() }).get())).toBe(true);
  });

  it("a changed wording version asks again", () => {
    const kv = memoryKv();
    kv.data.set(CONSENT_STORAGE_KEY, JSON.stringify({ ...record, version: "2020-01-01" }));
    expect(hasConsent(createConsentStore({ kv, onSaved: vi.fn() }).get())).toBe(false);
  });

  it("update stores a record as is without notifying", () => {
    const onSaved = vi.fn();
    const store = createConsentStore({ kv: memoryKv(), onSaved });
    store.update({ ...record, recorded: true });
    expect(store.get()?.recorded).toBe(true);
    expect(onSaved).not.toHaveBeenCalled();
  });
});

describe("sendConsentRecord", () => {
  it("posts to the API base with the lock header", async () => {
    const fetchFn = vi.fn(async () => ({ status: 200 }) as Response);
    const next = await sendConsentRecord(record, { userId: null, token: null }, fetchFn as unknown as typeof fetch, {
      apiBaseUrl: "https://api.test",
      accessToken: "lock",
      sentryDsn: null,
      supabaseUrl: null,
      supabaseAnonKey: null,
    });
    expect(next?.recorded).toBe(true);
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.test/api/consent");
    expect((init.headers as Record<string, string>)["x-turboterp-access"]).toBe("lock");
  });
});
