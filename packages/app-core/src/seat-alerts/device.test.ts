import { describe, expect, it } from "vitest";
import { createSeatAlertsApi, type FetchLike } from "./client";
import { registerIosDevice, type TokenStore } from "./device";

function setup(reply: { ok: boolean; status: number; body: unknown }, saved: string | null) {
  const calls: { url: string; init: Parameters<FetchLike>[1] }[] = [];
  let token = saved;
  const store: TokenStore = { get: async () => token, set: async (t) => void (token = t) };
  const api = createSeatAlertsApi({
    baseUrl: "https://api.test",
    getToken: () => token,
    fetch: async (url, init) => {
      calls.push({ url, init });
      return { ok: reply.ok, status: reply.status, json: async () => reply.body };
    },
  });
  return { calls, store, api, token: () => token };
}

describe("registerIosDevice", () => {
  it("registers a new device and keeps the returned credential", async () => {
    const s = setup({ ok: true, status: 201, body: { token: "id.secret", test: true } }, null);
    const r = await registerIosDevice(s.api, s.store, "ExponentPushToken[abc]");
    expect(r).toEqual({ ok: true, token: "id.secret", isNew: true });
    expect(s.token()).toBe("id.secret");
    expect(s.calls[0].url).toBe("https://api.test/api/seat-alerts/device");
    expect(JSON.parse(s.calls[0].init.body!)).toEqual({ platform: "ios", expoToken: "ExponentPushToken[abc]" });
    expect(s.calls[0].init.headers.authorization).toBeUndefined();
  });

  it("re-registers a known device with its credential", async () => {
    const s = setup({ ok: true, status: 200, body: { token: "id.secret" } }, "id.secret");
    const r = await registerIosDevice(s.api, s.store, "ExponentPushToken[new]");
    expect(r).toEqual({ ok: true, token: "id.secret", isNew: false });
    expect(s.calls[0].init.headers.authorization).toBe("Device id.secret");
  });

  it("reports a server failure without saving anything", async () => {
    const s = setup({ ok: false, status: 429, body: { error: "rate-limited" } }, null);
    const r = await registerIosDevice(s.api, s.store, "ExponentPushToken[abc]");
    expect(r).toEqual({ ok: false, error: "rate-limited" });
    expect(s.token()).toBeNull();
  });
});

describe("watch calls", () => {
  it("answer 401 no-device without a request when not registered", async () => {
    const s = setup({ ok: true, status: 200, body: {} }, null);
    expect(await s.api.listWatches()).toEqual({ ok: false, status: 401, error: "no-device" });
    expect(s.calls).toHaveLength(0);
  });
});
