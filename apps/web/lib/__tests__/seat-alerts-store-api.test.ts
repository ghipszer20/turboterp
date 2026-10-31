import { describe, expect, it } from "vitest";
import { seatAlertStore } from "../seat-alerts/store";

const env = { url: "https://x.supabase.co", serviceKey: "svc" };

function fake(responses: unknown[]) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchFn = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(responses.shift() ?? []), { status: 200 });
  }) as unknown as typeof fetch;
  return { calls, store: seatAlertStore(env, fetchFn) };
}

describe("seatAlertStore: student API", () => {
  const row = { id: "i1", device_id: "u1", term: "202701", course_id: "CMSC351", section_id: null, last_alert_at: null, done_at: null };
  const w = { id: "i1", deviceId: "u1", term: "202701", courseId: "CMSC351", sectionId: null, lastAlertAt: null, doneAt: null };
  it("listWatches reads one user's rows", async () => {
    const { calls, store } = fake([[row]]);
    expect(await store.listWatches("u1")).toEqual([w]);
    expect(calls[0]!.url).toContain("seat_watches?device_id=eq.u1");
  });
  it("getWatch returns null when absent", async () => {
    expect(await fake([[]]).store.getWatch("i1")).toBeNull();
    expect(await fake([[row]]).store.getWatch("i1")).toEqual(w);
  });
  it("createWatch inserts and returns the row", async () => {
    const { calls, store } = fake([[row]]);
    expect(await store.createWatch("u1", "202701", "CMSC351", null)).toEqual(w);
    expect(calls[0]!.init.method).toBe("POST");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ device_id: "u1", term: "202701", course_id: "CMSC351", section_id: null });
    expect((calls[0]!.init.headers as Record<string, string>).Prefer).toContain("return=representation");
  });
  it("markDone and deleteWatch target the id", async () => {
    const { calls, store } = fake([[], []]);
    await store.markDone("i1", new Date("2026-10-09T00:00:00Z"));
    await store.deleteWatch("i1");
    expect(calls[0]!.url).toContain("seat_watches?id=eq.i1");
    expect(calls[0]!.init.method).toBe("PATCH");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ done_at: "2026-10-09T00:00:00.000Z" });
    expect(calls[1]!.init.method).toBe("DELETE");
  });
  it("createDevice inserts into alert_devices and returns the id", async () => {
    const { calls, store } = fake([[{ id: "d1" }]]);
    expect(await store.createDevice({ secretHash: "h", sub: { endpoint: "https://p/1", p256dh: "k", auth: "a" } })).toBe("d1");
    expect(calls[0]!.url).toContain("/rest/v1/alert_devices");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ secret_hash: "h", platform: "web", endpoint: "https://p/1", p256dh: "k", auth: "a" });
  });
  it("createDevice with an Expo token inserts an ios row without web columns", async () => {
    const { calls, store } = fake([[{ id: "d2" }]]);
    expect(await store.createDevice({ secretHash: "h", expoToken: "ExponentPushToken[abcdefgh]" })).toBe("d2");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ secret_hash: "h", platform: "ios", expo_token: "ExponentPushToken[abcdefgh]" });
  });
  it("updateDeviceExpo switches a device to ios and clears the web subscription; deleteDeviceByExpoToken spares an id", async () => {
    const { calls, store } = fake([[], [], []]);
    await store.updateDeviceExpo("d1", "ExponentPushToken[abcdefgh]");
    expect(calls[0]!.url).toContain("alert_devices?id=eq.d1");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ platform: "ios", expo_token: "ExponentPushToken[abcdefgh]", endpoint: null, p256dh: null, auth: null });
    await store.deleteDeviceByExpoToken("ExponentPushToken[abcdefgh]");
    await store.deleteDeviceByExpoToken("ExponentPushToken[abcdefgh]", "d1");
    expect(calls[1]!.url).toContain("alert_devices?expo_token=eq.ExponentPushToken");
    expect(calls[1]!.url).not.toContain("neq");
    expect(calls[2]!.url).toContain("&id=neq.d1");
  });
  it("getDevice returns the hash or null", async () => {
    expect(await fake([[{ id: "d1", secret_hash: "h" }]]).store.getDevice("d1")).toEqual({ id: "d1", secretHash: "h" });
    expect(await fake([[]]).store.getDevice("d1")).toBeNull();
  });
  it("updateDeviceSub patches the endpoint and keys and clears any Expo token", async () => {
    const { calls, store } = fake([[]]);
    await store.updateDeviceSub("d1", { endpoint: "https://p/2", p256dh: "k", auth: "a" });
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ platform: "web", endpoint: "https://p/2", p256dh: "k", auth: "a", expo_token: null });
    expect(calls[0]!.url).toContain("alert_devices?id=eq.d1");
    expect(calls[0]!.init.method).toBe("PATCH");
  });
  it("deleteDevice and deleteDeviceByEndpoint (optionally sparing one id)", async () => {
    const { calls, store } = fake([[], [], []]);
    await store.deleteDevice("d1");
    await store.deleteDeviceByEndpoint("https://p/1");
    await store.deleteDeviceByEndpoint("https://p/1", "d2");
    expect(calls[0]!.url).toContain("alert_devices?id=eq.d1");
    expect(calls[1]!.url).toContain("alert_devices?endpoint=eq.https%3A%2F%2Fp%2F1");
    expect(calls[1]!.url).not.toContain("neq");
    expect(calls[2]!.url).toContain("id=neq.d2");
    expect(calls.every((c) => c.init.method === "DELETE")).toBe(true);
  });
});
