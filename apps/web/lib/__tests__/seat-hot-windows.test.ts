import { describe, expect, it } from "vitest";
import { syncSeatHotWindows } from "../seat-hot-windows";

const env = { url: "https://p.supabase.co", serviceKey: "k" };
const events = [
  { term: "Spring 2027", kind: "priority-registration", label: "x", start: "2026-11-09", end: "2026-11-13" },
  { term: "Spring 2027", kind: "schedule-adjustment", label: "x", start: "2027-01-27", end: "2027-02-09" },
];

describe("syncSeatHotWindows", () => {
  it("replaces all windows with one RPC call carrying the computed windows", async () => {
    const calls: { url: string; body: unknown; auth: string }[] = [];
    const fake = (async (url: string, init: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init.body)), auth: String((init.headers as Record<string, string>).Authorization) });
      return new Response(null, { status: 204 });
    }) as unknown as typeof fetch;
    const result = await syncSeatHotWindows(env, events as never, fake);
    expect(result).toBe("written");
    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe("https://p.supabase.co/rest/v1/rpc/replace_seat_hot_windows");
    expect(calls[0]!.auth).toBe("Bearer k");
    expect(calls[0]!.body).toEqual({
      p_windows: [
        { starts_at: "2026-11-09T05:00:00.000Z", ends_at: "2026-11-28T04:59:59.000Z" },
        { starts_at: "2027-01-27T05:00:00.000Z", ends_at: "2027-02-10T04:59:59.000Z" },
      ],
    });
  });

  it("leaves the table alone when there are no events (a failed calendar must not erase the windows)", async () => {
    const fake = (async () => { throw new Error("should not be called"); }) as unknown as typeof fetch;
    expect(await syncSeatHotWindows(env, [], fake)).toBe("skipped");
  });

  it("reports a failed request", async () => {
    const fake = (async () => new Response("no", { status: 500 })) as unknown as typeof fetch;
    expect(await syncSeatHotWindows(env, events as never, fake)).toBe("failed");
  });
});
