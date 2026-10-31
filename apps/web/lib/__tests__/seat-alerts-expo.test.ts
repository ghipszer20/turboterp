import { describe, expect, it } from "vitest";
import { isExpoToken, sendExpoBatch, sendExpoPush } from "../seat-alerts/expo";

const P = { title: "t", body: "b", url: "https://app.testudo.umd.edu/#/main/dropAdd?termId=202701", watchId: "w1", token: "sig" };
const reply = (data: unknown, status = 200) => (async () => new Response(JSON.stringify({ data }), { status })) as unknown as typeof fetch;

describe("isExpoToken", () => {
  it("accepts ExponentPushToken[...] only", () => {
    expect(isExpoToken("ExponentPushToken[abc123_DEF-456]")).toBe(true);
    for (const bad of ["", "abc", "ExponentPushToken[]", "ExponentPushToken[a b c d e f g h]", "https://x", 5, null]) expect(isExpoToken(bad)).toBe(false);
  });
});

describe("sendExpoBatch", () => {
  it("sends 100 per request to the Expo endpoint with the URL in data", async () => {
    const calls: { url: string; body: { to: string; data: { url: string } }[] }[] = [];
    const f = (async (url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      calls.push({ url, body });
      return new Response(JSON.stringify({ data: body.map(() => ({ status: "ok" })) }));
    }) as unknown as typeof fetch;
    const msgs = Array.from({ length: 250 }, (_, i) => ({ token: `ExponentPushToken[tok${i}xxxx]`, payload: P }));
    const res = await sendExpoBatch(msgs, f);
    expect(calls.map((c) => c.body.length)).toEqual([100, 100, 50]);
    expect(calls[0]!.url).toBe("https://exp.host/--/api/v2/push/send");
    expect(calls[0]!.body[0]).toMatchObject({ to: "ExponentPushToken[tok0xxxx]", data: { url: P.url, watchId: "w1", token: "sig" } });
    expect(res).toHaveLength(250);
    expect(res.every((r) => r === "ok")).toBe(true);
  });
  it("maps DeviceNotRegistered to gone and other errors to failed, in order", async () => {
    const r = await sendExpoBatch(
      [1, 2, 3].map((i) => ({ token: `ExponentPushToken[tok${i}xxxx]`, payload: P })),
      reply([{ status: "ok" }, { status: "error", details: { error: "DeviceNotRegistered" } }, { status: "error", details: { error: "MessageRateExceeded" } }]),
    );
    expect(r).toEqual(["ok", "gone", "failed"]);
  });
  it("a failed or malformed request fails only that batch and never throws", async () => {
    expect(await sendExpoPush("ExponentPushToken[abcdefgh]", P, reply([], 500))).toBe("failed");
    expect(await sendExpoPush("ExponentPushToken[abcdefgh]", P, reply([]))).toBe("failed");
    expect(await sendExpoPush("ExponentPushToken[abcdefgh]", P, (async () => { throw new Error("net"); }) as unknown as typeof fetch)).toBe("failed");
  });
  it("no messages, no request", async () => {
    let n = 0;
    await sendExpoBatch([], (async () => { n++; return new Response("{}"); }) as unknown as typeof fetch);
    expect(n).toBe(0);
  });
});
