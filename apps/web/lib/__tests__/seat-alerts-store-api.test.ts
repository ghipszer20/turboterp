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
  const row = { id: "i1", user_id: "u1", term: "202701", course_id: "CMSC351", section_id: null, last_alert_at: null, done_at: null };
  const w = { id: "i1", userId: "u1", term: "202701", courseId: "CMSC351", sectionId: null, lastAlertAt: null, doneAt: null };
  it("listWatches reads one user's rows", async () => {
    const { calls, store } = fake([[row]]);
    expect(await store.listWatches("u1")).toEqual([w]);
    expect(calls[0]!.url).toContain("seat_watches?user_id=eq.u1");
  });
  it("getWatch returns null when absent", async () => {
    expect(await fake([[]]).store.getWatch("i1")).toBeNull();
    expect(await fake([[row]]).store.getWatch("i1")).toEqual(w);
  });
  it("createWatch inserts and returns the row", async () => {
    const { calls, store } = fake([[row]]);
    expect(await store.createWatch("u1", "202701", "CMSC351", null)).toEqual(w);
    expect(calls[0]!.init.method).toBe("POST");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ user_id: "u1", term: "202701", course_id: "CMSC351", section_id: null });
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
  it("upsertSubscription merges on endpoint and reassigns the user", async () => {
    const { calls, store } = fake([[]]);
    await store.upsertSubscription("u1", { endpoint: "https://p/1", p256dh: "k", auth: "a" });
    expect(calls[0]!.url).toContain("push_subscriptions?on_conflict=endpoint");
    expect((calls[0]!.init.headers as Record<string, string>).Prefer).toContain("merge-duplicates");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ user_id: "u1", endpoint: "https://p/1", p256dh: "k", auth: "a" });
  });
  it("deleteSubscriptionFor only deletes that user's endpoint", async () => {
    const { calls, store } = fake([[]]);
    await store.deleteSubscriptionFor("u1", "https://p/1");
    expect(calls[0]!.url).toContain("endpoint=eq.https%3A%2F%2Fp%2F1");
    expect(calls[0]!.url).toContain("user_id=eq.u1");
  });
});
