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
    const { calls, store } = fake([[{ id: "w1", device_id: "u1", term: "202701", course_id: "CMSC351", section_id: null, last_alert_at: null, done_at: null }]]);
    const watches = await store.listActiveWatches("202701");
    expect(watches).toEqual([{ id: "w1", deviceId: "u1", term: "202701", courseId: "CMSC351", sectionId: null, lastAlertAt: null, doneAt: null }]);
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

  it("loads subscriptions from alert_devices by device id", async () => {
    const { calls, store } = fake([[{ id: "d1", endpoint: "https://push/1", p256dh: "k", auth: "a" }]]);
    expect(await store.subscriptionsFor(["d1"])).toEqual([{ deviceId: "d1", endpoint: "https://push/1", p256dh: "k", auth: "a" }]);
    expect(calls[0]!.url).toContain("alert_devices?id=in.(d1)");
  });


  it("loads iOS devices as expoToken subs, skipping rows with neither kind", async () => {
    const { calls, store } = fake([[
      { id: "d1", endpoint: null, p256dh: null, auth: null, expo_token: "ExponentPushToken[abcdefgh]" },
      { id: "d2", endpoint: "https://push/2", p256dh: "k", auth: "a", expo_token: null },
      { id: "d3", endpoint: null, p256dh: null, auth: null, expo_token: null },
    ]]);
    expect(await store.subscriptionsFor(["d1", "d2", "d3"])).toEqual([
      { deviceId: "d1", expoToken: "ExponentPushToken[abcdefgh]" },
      { deviceId: "d2", endpoint: "https://push/2", p256dh: "k", auth: "a" },
    ]);
    expect(calls[0]!.url).toContain("expo_token");
  });

  it("throws on a failed request", async () => {
    const store = seatAlertStore(env, (async () => new Response("no", { status: 500 })) as unknown as typeof fetch);
    await expect(store.listActiveWatches("202701")).rejects.toThrow(/500/);
  });
});
