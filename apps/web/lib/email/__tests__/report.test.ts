import { describe, expect, it, vi } from "vitest";
import { handleReport, validateReport, type ReportDeps } from "../report";
import type { SendStore } from "../rate-limit";

const req = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://x/api/report", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.9, 10.0.0.1", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

function deps(over: Partial<ReportDeps> = {}) {
  const send = vi.fn(async () => ({ ok: true as const }));
  const store: SendStore = { count: async () => 0, record: async () => {} };
  return { send, store, to: "owner@example.test", now: () => new Date("2026-10-06T12:00:00Z"), ...over } as unknown as ReportDeps & {
    send: ReturnType<typeof vi.fn>;
  };
}

describe("validateReport", () => {
  it("trims and accepts a good report", () => {
    expect(validateReport({ what: "  broke  ", page: " /x ", replyTo: "a@b.co" })).toEqual({
      ok: true,
      value: { what: "broke", page: "/x", replyTo: "a@b.co" },
    });
  });
  it("rejects bad input", () => {
    for (const body of [null, "x", {}, { what: "   " }, { what: "a".repeat(5001) }, { what: "a", page: "p".repeat(201) }, { what: "a", replyTo: "nope" }, { what: 5 }]) {
      expect(validateReport(body).ok).toBe(false);
    }
  });
  it("accepts the 5000 and 200 limits", () => {
    expect(validateReport({ what: "a".repeat(5000), page: "p".repeat(200) }).ok).toBe(true);
  });
});

describe("handleReport", () => {
  it("sends to the recipient with subject, body and Reply-To", async () => {
    const d = deps();
    const res = await handleReport(req({ what: "x".repeat(80), page: "/advisor", replyTo: "me@example.test" }), d);
    expect(res.status).toBe(200);
    const msg = d.send.mock.calls[0][0];
    expect(msg.to).toBe("owner@example.test");
    expect(msg.subject).toBe(`TurboTerp report: ${"x".repeat(60)}`);
    expect(msg.replyTo).toBe("me@example.test");
    expect(msg.text).toContain("/advisor");
    expect(msg.text).toContain("me@example.test");
    expect(msg.text).toContain("2026-10-06T12:00:00.000Z");
  });

  it("answers 400 for a bad request and for bad JSON", async () => {
    const d = deps();
    expect((await handleReport(req({ what: "" }), d)).status).toBe(400);
    expect((await handleReport(req("{nope"), d)).status).toBe(400);
    expect(d.send).not.toHaveBeenCalled();
  });

  it("answers 200 and sends nothing when the trap field is filled", async () => {
    const d = deps();
    const res = await handleReport(req({ what: "spam", website: "http://spam" }), d);
    expect(res.status).toBe(200);
    expect(d.send).not.toHaveBeenCalled();
  });

  it("answers 503 not-configured with no recipient, or when the sender is not configured", async () => {
    const d = deps({ to: undefined });
    const res = await handleReport(req({ what: "x" }), d);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "not-configured" });
    expect(d.send).not.toHaveBeenCalled();

    const d2 = deps({ send: vi.fn(async () => ({ ok: false as const, reason: "not-configured" as const })) });
    expect((await handleReport(req({ what: "x" }), d2)).status).toBe(503);
  });

  it("answers 429 when rate limited, keyed by a hash of the IP", async () => {
    const count = vi.fn(async () => 5);
    const d = deps({ store: { count, record: async () => {} } });
    const res = await handleReport(req({ what: "x" }), d);
    expect(res.status).toBe(429);
    expect((await res.json()).error).toBe("rate-limited");
    expect(d.send).not.toHaveBeenCalled();
    expect(count.mock.calls[0][1]).toMatch(/^[0-9a-f]{64}$/);
  });

  it("fails closed with 503 when the store errors", async () => {
    const d = deps({
      store: {
        count: async () => {
          throw new Error("down");
        },
        record: async () => {},
      },
    });
    const res = await handleReport(req({ what: "x" }), d);
    expect(res.status).toBe(503);
    expect(d.send).not.toHaveBeenCalled();
  });

  it("answers 502 when Brevo rejects", async () => {
    const d = deps({ send: vi.fn(async () => ({ ok: false as const, reason: "rejected" as const })) });
    expect((await handleReport(req({ what: "x" }), d)).status).toBe(502);
  });
});
