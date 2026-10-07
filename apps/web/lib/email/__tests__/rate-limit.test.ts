import { describe, expect, it, vi } from "vitest";
import { LIMITS, checkAndRecord, hashKey, supabaseSendStore, type SendStore } from "../rate-limit";

const NOW = new Date("2026-10-06T12:00:00Z");

describe("hashKey", () => {
  it("is a SHA-256 hex digest, never the raw value", () => {
    const h = hashKey("203.0.113.9");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).not.toContain("203");
    expect(hashKey("203.0.113.9")).toBe(h);
  });
});

describe("checkAndRecord", () => {
  const store = (count: number): SendStore => ({ count: vi.fn(async () => count), record: vi.fn(async () => {}) });

  it("allows and records while under the limit", async () => {
    const s = store(LIMITS.report.max - 1);
    expect(await checkAndRecord(s, "report", "k", NOW)).toBe("ok");
    expect(s.record).toHaveBeenCalledWith("report", "k", NOW);
  });

  it("limits at the max without recording", async () => {
    const s = store(LIMITS.report.max);
    expect(await checkAndRecord(s, "report", "k", NOW)).toBe("limited");
    expect(s.record).not.toHaveBeenCalled();
  });

  it("uses an hour window for reports and a day window for plans", async () => {
    const s = store(0);
    await checkAndRecord(s, "report", "k", NOW);
    await checkAndRecord(s, "plan", "k", NOW);
    const calls = (s.count as ReturnType<typeof vi.fn>).mock.calls;
    expect(NOW.getTime() - (calls[0][2] as Date).getTime()).toBe(3600_000);
    expect(NOW.getTime() - (calls[1][2] as Date).getTime()).toBe(86_400_000);
    expect(LIMITS.plan.max).toBe(5);
    expect(LIMITS.report.max).toBe(5);
  });

  it("fails closed when the store throws", async () => {
    const s: SendStore = {
      count: async () => {
        throw new Error("db down");
      },
      record: async () => {},
    };
    expect(await checkAndRecord(s, "report", "k", NOW)).toBe("error");
    const s2: SendStore = {
      count: async () => 0,
      record: async () => {
        throw new Error("db down");
      },
    };
    expect(await checkAndRecord(s2, "report", "k", NOW)).toBe("error");
  });
});

describe("supabaseSendStore", () => {
  const env = { url: "https://x.supabase.co", serviceKey: "svc" };

  it("counts rows through the REST API with the service key", async () => {
    const fetchFn = vi.fn(async () => new Response(JSON.stringify([{ at: "a" }, { at: "b" }]), { status: 200 }));
    const n = await supabaseSendStore(env, fetchFn as never).count("report", "abc", new Date("2026-10-06T11:00:00Z"));
    expect(n).toBe(2);
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain("https://x.supabase.co/rest/v1/email_sends?");
    expect(url).toContain("kind=eq.report");
    expect(url).toContain("key=eq.abc");
    expect((init.headers as Record<string, string>).apikey).toBe("svc");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer svc");
  });

  it("inserts a row and deletes rows older than a day", async () => {
    const fetchFn = vi.fn(async () => new Response("", { status: 201 }));
    await supabaseSendStore(env, fetchFn as never).record("plan", "abc", NOW);
    const calls = fetchFn.mock.calls as unknown as [string, RequestInit][];
    expect(calls.some(([, i]) => i.method === "POST" && String(i.body).includes('"kind":"plan"'))).toBe(true);
    expect(calls.some(([u, i]) => i.method === "DELETE" && u.includes("at=lt."))).toBe(true);
  });

  it("throws on a non-2xx answer", async () => {
    const fetchFn = vi.fn(async () => new Response("no", { status: 500 }));
    await expect(supabaseSendStore(env, fetchFn as never).count("report", "a", NOW)).rejects.toThrow();
  });
});
