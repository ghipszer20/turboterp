import { describe, expect, it, vi } from "vitest";
import { fetchV1 } from "../api-v1/client";
import { isV1Envelope, v1Envelope } from "../api-v1/envelope";
import { v1Response } from "../api-v1/respond";

const reply = (body: unknown, status = 200) => vi.fn(async (..._args: unknown[]) => new Response(JSON.stringify(body), { status }));
const isNum = (d: unknown): d is number => typeof d === "number";
const asFetch = (f: unknown) => f as typeof fetch;

describe("envelope", () => {
  it("wraps and recognises v1", () => {
    expect(v1Envelope(5)).toEqual({ v: 1, data: 5 });
    expect(isV1Envelope({ v: 1, data: null })).toBe(true);
    expect(isV1Envelope({ v: 2, data: 1 })).toBe(false);
    expect(isV1Envelope({ v: 1 })).toBe(false);
    expect(isV1Envelope(null)).toBe(false);
  });
});

describe("fetchV1", () => {
  it("returns data and builds the url", async () => {
    const f = reply({ v: 1, data: 7 });
    expect(await fetchV1("/api/v1/x", { baseUrl: "https://t.test/", fetch: asFetch(f), check: isNum })).toEqual({ ok: true, data: 7 });
    expect(f.mock.calls[0]![0]).toBe("https://t.test/api/v1/x");
  });
  it("sends the access header only when given a token", async () => {
    const f = reply({ v: 1, data: 1 });
    await fetchV1("/p", { baseUrl: "https://t.test", fetch: asFetch(f), accessToken: "abc" });
    expect(f.mock.calls[0]![1]).toMatchObject({ headers: { "x-turboterp-access": "abc" } });
    const g = reply({ v: 1, data: 1 });
    await fetchV1("/p", { baseUrl: "https://t.test", fetch: asFetch(g) });
    const headers = (g.mock.calls[0]![1] as { headers: Record<string, string> }).headers;
    expect(headers["x-turboterp-access"]).toBeUndefined();
  });
  it("returns errors instead of throwing", async () => {
    const base = { baseUrl: "https://t.test" };
    expect((await fetchV1("/p", { ...base, fetch: asFetch(reply({}, 500)) })).ok).toBe(false);
    expect((await fetchV1("/p", { ...base, fetch: asFetch(reply({ v: 2, data: 1 })) })).ok).toBe(false);
    expect((await fetchV1("/p", { ...base, fetch: asFetch(reply({ v: 1, data: "x" })), check: isNum })).ok).toBe(false);
    const offline = vi.fn(async () => {
      throw new Error("offline");
    });
    expect((await fetchV1("/p", { ...base, fetch: asFetch(offline) })).ok).toBe(false);
    expect((await fetchV1("/p", { ...base, fetch: asFetch(vi.fn(async () => new Response("<html>"))) })).ok).toBe(false);
  });
});

describe("v1Response", () => {
  it("wraps loader data with cache headers", async () => {
    const res = await v1Response(async () => ({ a: 1 }));
    expect(await res.json()).toEqual({ v: 1, data: { a: 1 } });
    expect(res.headers.get("Cache-Control")).toContain("s-maxage");
  });
  it("answers 500 when the loader throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await v1Response(async () => {
      throw new Error("x");
    });
    expect(res.status).toBe(500);
  });
});
