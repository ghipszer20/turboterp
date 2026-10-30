import { describe, expect, it, vi } from "vitest";
import { sendPush } from "../seat-alerts/push";

const sub = { endpoint: "https://push/1", p256dh: "k", auth: "a" };
const payload = { title: "t", body: "b" };

describe("sendPush", () => {
  it("returns ok on 201", async () => {
    expect(await sendPush(sub, payload, async () => ({ statusCode: 201 }) as never)).toBe("ok");
  });
  it("returns gone on 404 and 410", async () => {
    for (const statusCode of [404, 410]) {
      expect(await sendPush(sub, payload, async () => { throw Object.assign(new Error("x"), { statusCode }); })).toBe("gone");
    }
  });
  it("returns failed on anything else", async () => {
    expect(await sendPush(sub, payload, async () => { throw Object.assign(new Error("x"), { statusCode: 500 }); })).toBe("failed");
    expect(await sendPush(sub, payload, async () => { throw new Error("network"); })).toBe("failed");
    expect(await sendPush(sub, payload, async () => ({ statusCode: 429 }) as never)).toBe("failed");
  });
  it("logs why a send failed, without the subscription endpoint", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await sendPush(sub, payload, async () => { throw Object.assign(new Error("Received unexpected response code"), { statusCode: 403, body: "invalid JWT" }); });
    await sendPush(sub, payload, async () => { throw new Error("Vapid subject is not a valid URL"); });
    expect(spy.mock.calls.map((c) => c.join(" "))).toEqual([
      "seat alert push failed: 403 invalid JWT",
      "seat alert push failed: - Vapid subject is not a valid URL",
    ]);
    expect(spy.mock.calls.flat().join(" ")).not.toContain(sub.endpoint);
    spy.mockRestore();
  });
  it("sends the JSON payload to the subscription", async () => {
    let seen: unknown[] = [];
    await sendPush(sub, payload, async (...args: unknown[]) => { seen = args; return { statusCode: 201 } as never; });
    expect(seen[0]).toEqual({ endpoint: "https://push/1", keys: { p256dh: "k", auth: "a" } });
    expect(JSON.parse(seen[1] as string)).toEqual(payload);
  });
});
