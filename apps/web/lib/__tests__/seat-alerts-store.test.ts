import { describe, expect, it } from "vitest";
import { seatAlertStore } from "../seat-alerts/store";

const env = { url: "https://x.supabase.co", serviceKey: "svc" };

function fake(responses: unknown[]) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchFn = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const body = responses.shift() ?? [];
    return new Response(JSON.stringify(body), { status: 200 });
  }) as unknown as typeof fetch;
  return { calls, store: seatAlertStore(env, fetchFn) };
}

describe("seatAlertStore", () => {
  it("lists active watches for a term with service-role headers", async () => {
    const { calls, store } = fake([[{ id: "w1", user_id: "u1", term: "202701", course_id: "CMSC351", section_id: null, last_alert_at: null, done_at: null }]]);
    const watches = await store.listActiveWatches("202701");
    expect(watches).toEqual([{ id: "w1", userId: "u1", term: "202701", courseId: "CMSC351", sectionId: null, lastAlertAt: null, doneAt: null }]);
    expect(calls[0]!.url).toContain("/rest/v1/seat_watches?");
    expect(calls[0]!.url).toContain("term=eq.202701");
    expect(calls[0]!.url).toContain("done_at=is.null");
    const h = calls[0]!.init.headers as Record<string, string>;
    expect(h.apikey).toBe("svc");
    expect(h.Authorization).toBe("Bearer svc");
  });

  it("reads seat states into a map keyed course-section", async () => {
    const { calls, store } = fake([[{ course_id: "CMSC351", section_id: "0201", open: 0, waitlist: 2, holdfile: 1, checked_at: "2026-10-09T17:59:00Z" }]]);
    const m = await store.getStates("202701", ["CMSC351"]);
    expect(m.get("CMSC351-0201")).toEqual({ courseId: "CMSC351", sectionId: "0201", open: 0, waitlist: 2, holdfile: 1, checkedAt: "2026-10-09T17:59:00Z" });
    expect(calls[0]!.url).toContain("seat_state?");
    expect(calls[0]!.url).toContain("term=eq.202701");
    expect(calls[0]!.url).toContain("course_id=in.(CMSC351)");
  });

  it("upserts states", async () => {
    const { calls, store } = fake([[]]);
    await store.saveStates("202701", [{ courseId: "CMSC351", sectionId: "0201", open: 1, waitlist: 0, holdfile: 0, checkedAt: "t" }]);
    expect(calls[0]!.init.method).toBe("POST");
    expect(calls[0]!.url).toContain("on_conflict=term,course_id,section_id");
    expect((calls[0]!.init.headers as Record<string, string>).Prefer).toContain("resolution=merge-duplicates");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual([{ term: "202701", course_id: "CMSC351", section_id: "0201", open: 1, waitlist: 0, holdfile: 0, checked_at: "t" }]);
  });

  it("marks watches alerted", async () => {
    const { calls, store } = fake([[]]);
    await store.markAlerted(["a", "b"], new Date("2026-10-09T18:00:00Z"));
    expect(calls[0]!.init.method).toBe("PATCH");
    expect(calls[0]!.url).toContain("id=in.(a,b)");
    expect(JSON.parse(calls[0]!.init.body as string)).toEqual({ last_alert_at: "2026-10-09T18:00:00.000Z" });
  });

  it("skips the request when there is nothing to mark or look up", async () => {
    const { calls, store } = fake([]);
    await store.markAlerted([], new Date());
    expect(await store.subscriptionsFor([])).toEqual([]);
    expect(calls).toHaveLength(0);
  });

  it("loads subscriptions and deletes by endpoint", async () => {
    const { calls, store } = fake([[{ user_id: "u1", endpoint: "https://push/1", p256dh: "k", auth: "a" }], []]);
    expect(await store.subscriptionsFor(["u1"])).toEqual([{ userId: "u1", endpoint: "https://push/1", p256dh: "k", auth: "a" }]);
    await store.deleteSubscription("https://push/1");
    expect(calls[1]!.init.method).toBe("DELETE");
    expect(calls[1]!.url).toContain("endpoint=eq.https%3A%2F%2Fpush%2F1");
  });

  it("reads and writes the cursor", async () => {
    const { calls, store } = fake([[{ next_course: "CMSC400" }], []]);
    expect(await store.getCursor()).toBe("CMSC400");
    await store.setCursor(null);
    expect(calls[1]!.url).toContain("on_conflict=id");
    expect(JSON.parse(calls[1]!.init.body as string)).toMatchObject({ id: 1, next_course: null });
  });

  it("throws on a failed request", async () => {
    const store = seatAlertStore(env, (async () => new Response("no", { status: 500 })) as unknown as typeof fetch);
    await expect(store.listActiveWatches("202701")).rejects.toThrow(/500/);
  });
});
