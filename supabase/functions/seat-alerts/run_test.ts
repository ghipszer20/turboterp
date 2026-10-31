import { assert, assertEquals } from "jsr:@std/assert@1";
import type { SeatRow } from "../../../packages/course-data/src/soc.ts";
import type { SeatsFile } from "../../../packages/course-data/src/soc-refresh.ts";
import { signWatchToken, verifyWatchToken } from "../../../apps/web/lib/seat-alerts/api.ts";
import type { SeatState, Watch } from "../../../apps/web/lib/seat-alerts/logic.ts";
import type { DeviceSub } from "../../../apps/web/lib/seat-alerts/store.ts";
import { handleSeatAlerts } from "./handler.ts";
import type { PushPayload } from "./push.ts";
import { sendPush } from "./push.ts";
import { courseOrder, MAX_REQUESTS, runSeatAlerts, type RunDeps } from "./run.ts";

const NOW = new Date("2026-10-04T12:00:00Z");
const TERM = "202701";

const watch = (n: number, courseId: string, deviceId = `d${n}`): Watch => ({ id: `w${n}`, deviceId, term: TERM, courseId, sectionId: null, lastAlertAt: null, doneAt: null });
// 4 letters + 3 digits: i -> "AAAA100" style ids, unique for i < 456976.
const cid = (i: number) => `${String.fromCharCode(65 + Math.floor(i / 17576) % 26)}${String.fromCharCode(65 + Math.floor(i / 676) % 26)}${String.fromCharCode(65 + Math.floor(i / 26) % 26)}${String.fromCharCode(65 + (i % 26))}101`;

function harness(watches: Watch[], opts: { states?: SeatState[]; file?: SeatsFile | null; live?: (ids: string[]) => SeatRow[]; pushResult?: "ok" | "gone" | "failed"; expoResult?: (token: string) => "ok" | "gone" | "failed" } = {}) {
  const states = new Map((opts.states ?? []).map((s) => [`${s.courseId}-${s.sectionId}`, s]));
  const log = { requests: [] as string[][], pushes: [] as { device: string; payload: PushPayload }[], alerted: [] as string[], deleted: [] as string[], sleeps: 0, saves: [] as number[], loads: 0, expo: [] as string[][], expoPayloads: [] as PushPayload[] };
  const deps: RunDeps = {
    load: () => { log.loads++; return Promise.resolve({ term: TERM, watches, states: new Map(states) }); },
    store: {
      saveStates: (_t, list) => { log.saves.push(list.length); for (const s of list) states.set(`${s.courseId}-${s.sectionId}`, s); return Promise.resolve(); },
      markAlerted: (ids) => { log.alerted.push(...ids); return Promise.resolve(); },
      subscriptionsFor: (ids): Promise<DeviceSub[]> => Promise.resolve(ids.map((id) => id.startsWith("ios") ? { deviceId: id, expoToken: `ExponentPushToken[${id}]` } : { deviceId: id, endpoint: `https://push.example/${id}`, p256dh: "p", auth: "a" })),
      deleteDevice: (id) => { log.deleted.push(id); return Promise.resolve(); },
    },
    fetchSeats: (_t, ids) => {
      log.requests.push(ids);
      if (!opts.live) return Promise.resolve(ids.map((id): SeatRow => [id, "0101", 30, 0, 0, 0]));
      return Promise.resolve(opts.live(ids));
    },
    seatsFile: () => Promise.resolve(opts.file ?? null),
    push: (sub, payload) => { log.pushes.push({ device: sub.deviceId, payload }); return Promise.resolve(opts.pushResult ?? "ok"); },
    pushExpo: (msgs) => { log.expo.push(msgs.map((m) => m.token)); log.expoPayloads.push(...msgs.map((m) => m.payload)); return Promise.resolve(msgs.map((m) => opts.expoResult?.(m.token) ?? "ok")); },
    signToken: (id) => `tok-${id}`,
    sleep: () => { log.sleeps++; return Promise.resolve(); },
    clock: () => 0,
  };
  return { deps, log, states };
}
const state = (courseId: string, open: number): SeatState => ({ courseId, sectionId: "0101", open, waitlist: 0, holdfile: 0, checkedAt: "2026-10-04T11:57:00Z" });
const seatsFile = (entries: Record<string, [number, number, number, number]>, generatedAt = "2026-10-04T11:58:00Z"): SeatsFile => ({ v: 1, term: TERM, generatedAt, seats: entries });

Deno.test("iOS devices get one batched Expo push with the Drop/Add url in the payload; web devices still get web push", async () => {
  const ws = [watch(1, "AAAA100", "ios1"), watch(2, "AAAA100", "ios2"), watch(3, "AAAA100", "web3")];
  const h = harness(ws, { states: [state("AAAA100", 0)], live: (ids) => ids.map((id): SeatRow => [id, "0101", 30, 2, 0, 0]) });
  const report = await runSeatAlerts(h.deps, NOW);
  assertEquals(report.alerts, 3);
  assertEquals(h.log.expo, [["ExponentPushToken[ios1]", "ExponentPushToken[ios2]"]]);
  assertEquals(h.log.pushes.map((p) => p.device), ["web3"]);
  assert(h.log.expoPayloads[0]!.url!.includes("dropAdd?termId=202701"));
  assertEquals(h.log.expoPayloads[0]!.watchId, "w1");
  assertEquals(h.log.alerted.sort(), ["w1", "w2", "w3"]);
});

Deno.test("an Expo DeviceNotRegistered deletes that device (once); failed Expo sends are not marked alerted", async () => {
  const ws = [watch(1, "AAAA100", "ios1"), watch(2, "BBBB100", "ios1"), watch(3, "AAAA100", "ios2")];
  const h = harness(ws, {
    states: [state("AAAA100", 0), state("BBBB100", 0)],
    live: (ids) => ids.map((id): SeatRow => [id, "0101", 30, 2, 0, 0]),
    expoResult: (t) => (t.includes("ios1") ? "gone" : "failed"),
  });
  const report = await runSeatAlerts(h.deps, NOW);
  assertEquals(h.log.deleted, ["ios1"]);
  assertEquals(report.gone, 2);
  assertEquals(report.alerts, 0);
  assertEquals(h.log.alerted, []);
});

Deno.test("an opening nobody watches from iOS makes no Expo request", async () => {
  const h = harness([watch(1, "AAAA100", "web1")], { states: [state("AAAA100", 0)], live: (ids) => ids.map((id): SeatRow => [id, "0101", 30, 2, 0, 0]) });
  await runSeatAlerts(h.deps, NOW);
  assertEquals(h.log.expo.length, 0);
  assertEquals(h.log.pushes.length, 1);
});

Deno.test("courseOrder: most-watched first, ties alphabetical", () => {
  const ws = [watch(1, "ZZZZ100"), watch(2, "AAAA100"), watch(3, "MMMM100"), watch(4, "MMMM100"), watch(5, "ZZZZ100"), watch(6, "ZZZZ100")];
  assertEquals(courseOrder(ws), ["ZZZZ100", "MMMM100", "AAAA100"]);
});

Deno.test("never makes more than 40 Testudo requests; the most-watched courses are the ones checked", async () => {
  // 1700 courses (more than 40 requests x 40 courses). Course i is watched (i % 3) + 1 times, plus one "hot" course watched 50 times.
  const ws: Watch[] = [];
  let n = 0;
  for (let i = 0; i < 1700; i++) for (let k = 0; k <= i % 3; k++) ws.push(watch(n++, cid(i)));
  for (let k = 0; k < 50; k++) ws.push(watch(n++, "ZZZZ999"));
  const h = harness(ws);
  const report = await runSeatAlerts(h.deps, NOW);
  assertEquals(report.requests, MAX_REQUESTS);
  assertEquals(h.log.requests.length, MAX_REQUESTS);
  assertEquals(report.checkedLive, 1600);
  assertEquals(report.courses, 1701);
  assertEquals(h.log.requests[0]![0], "ZZZZ999"); // watched 50 times
  // Everything checked live is at least as watched as everything not checked.
  const count = new Map<string, number>();
  for (const w of ws) count.set(w.courseId, (count.get(w.courseId) ?? 0) + 1);
  const checked = new Set(h.log.requests.flat());
  const minChecked = Math.min(...[...checked].map((c) => count.get(c)!));
  const maxUnchecked = Math.max(...[...count].filter(([c]) => !checked.has(c)).map(([, v]) => v));
  assert(minChecked >= maxUnchecked, `${minChecked} < ${maxUnchecked}`);
  assertEquals(h.log.sleeps, MAX_REQUESTS - 1);
});

Deno.test("a course past the cap that opens in the seats file still alerts", async () => {
  const ws: Watch[] = [];
  for (let i = 0; i < 1700; i++) ws.push(watch(i, cid(i)));
  const lastCourse = cid(1699); // least watched (ties alphabetical): beyond the 1600 checked live
  const h = harness(ws, {
    states: [state(lastCourse, 0)],
    file: seatsFile({ [`${lastCourse}-0101`]: [4, 0, 0, 30] }),
  });
  const report = await runSeatAlerts(h.deps, NOW);
  assertEquals(report.fromSeatsFile, 100);
  assert(!h.log.requests.flat().includes(lastCourse));
  assertEquals(report.openings, 1);
  assertEquals(h.log.pushes.length, 1);
  assertEquals(h.log.pushes[0]!.device, "d1699");
  assertEquals(h.log.pushes[0]!.payload.title, `${lastCourse} 0101 has 4 open seats`);
  assertEquals(h.log.pushes[0]!.payload.token, "tok-w1699");
  assertEquals(h.log.alerted, ["w1699"]);
});

Deno.test("the seats file is not read when the cap covers every watched course", async () => {
  let reads = 0;
  const h = harness([watch(1, "CMSC131")]);
  h.deps.seatsFile = () => { reads++; return Promise.resolve(null); };
  await runSeatAlerts(h.deps, NOW);
  assertEquals(reads, 0);
});

Deno.test("an opening found live alerts, retries count against the cap, and a failed batch falls back to the seats file", async () => {
  const ws = [watch(1, "CMSC131"), watch(2, "MATH140")];
  const live = harness(ws, { states: [state("CMSC131", 0)], live: (ids) => ids.map((id): SeatRow => [id, "0101", 30, id === "CMSC131" ? 2 : 0, 0, 0]) });
  const r1 = await runSeatAlerts(live.deps, NOW);
  assertEquals([r1.requests, r1.openings, r1.alerts], [1, 1, 1]);

  const failing = harness(ws, { states: [state("MATH140", 0)], file: seatsFile({ "MATH140-0101": [1, 0, 0, 30] }) });
  failing.deps.fetchSeats = () => { failing.log.requests.push(["x"]); return Promise.reject(new Error("503")); };
  const r2 = await runSeatAlerts(failing.deps, NOW);
  assertEquals([r2.requests, r2.failedBatches, r2.checkedLive, r2.fromSeatsFile], [2, 1, 0, 2]);
  assertEquals(r2.openings, 1); // MATH140 via the file
});

Deno.test("seats-file counts older than a state already saved are ignored (no undoing a live check)", async () => {
  const ws = [watch(1, "CMSC131")];
  const failing = harness(ws, { states: [{ ...state("CMSC131", 3), checkedAt: "2026-10-04T11:59:30Z" }], file: seatsFile({ "CMSC131-0101": [0, 0, 0, 30] }, "2026-10-04T11:58:00Z") });
  failing.deps.fetchSeats = () => Promise.reject(new Error("503"));
  await runSeatAlerts(failing.deps, NOW);
  assertEquals(failing.states.get("CMSC131-0101")!.open, 3);
});

Deno.test("a token signed by the real signWatchToken verifies with verifyWatchToken", () => {
  const token = signWatchToken("w1", "cron-secret", NOW);
  assert(verifyWatchToken("w1", token, "cron-secret", NOW));
  assert(!verifyWatchToken("w2", token, "cron-secret", NOW));
});

Deno.test("sendPush maps 404 and 410 to gone, other errors to failed, 2xx to ok", async () => {
  const sub = { endpoint: "https://p.example/x", p256dh: "p", auth: "a" };
  const payload = { title: "t", body: "b" };
  assertEquals(await sendPush(sub, payload, () => Promise.resolve({ statusCode: 201 })), "ok");
  assertEquals(await sendPush(sub, payload, () => Promise.reject({ statusCode: 410 })), "gone");
  assertEquals(await sendPush(sub, payload, () => Promise.reject({ statusCode: 404 })), "gone");
  assertEquals(await sendPush(sub, payload, () => Promise.reject({ statusCode: 500, body: "x" })), "failed");
});

Deno.test("a run where nothing changed makes exactly one database request (the load) and no write", async () => {
  const ws = [watch(1, "CMSC131"), watch(2, "MATH140")];
  const h = harness(ws, { states: [state("CMSC131", 0), state("MATH140", 0)] });
  const report = await runSeatAlerts(h.deps, NOW);
  assertEquals([h.log.loads, h.log.saves.length, report.openings, report.alerts], [1, 0, 0, 0]);
});

Deno.test("a changed count is written in one batched request; first sightings are written too", async () => {
  const ws = [watch(1, "CMSC131"), watch(2, "MATH140")];
  const h = harness(ws, { states: [state("CMSC131", 0)], live: (ids) => ids.map((id): SeatRow => [id, "0101", 30, id === "CMSC131" ? 3 : 0, 0, 0]) });
  await runSeatAlerts(h.deps, NOW);
  assertEquals(h.log.saves, [2]); // CMSC131 changed, MATH140 is new
});

Deno.test("nobody watching anything: loads once, fetches nothing", async () => {
  const h = harness([]);
  h.deps.load = () => Promise.resolve({ term: null, watches: [], states: new Map() });
  const report = await runSeatAlerts(h.deps, NOW);
  assertEquals([report.requests, h.log.requests.length], [0, 0]);
});

Deno.test("loadAlertState makes one RPC request and maps its rows", async () => {
  const { loadAlertState } = await import("./load.ts");
  const calls: { url: string; body: string }[] = [];
  const fake = ((url: string, init: RequestInit) => {
    calls.push({ url, body: String(init.body) });
    return Promise.resolve(Response.json({
      term: TERM,
      watches: [{ id: "w1", device_id: "d1", term: TERM, course_id: "CMSC131", section_id: null, last_alert_at: null }],
      states: [{ course_id: "CMSC131", section_id: "0101", open: 2, waitlist: 1, holdfile: 0, checked_at: "2026-10-04T11:00:00Z" }],
    }));
  }) as unknown as typeof fetch;
  const s = await loadAlertState({ url: "https://p.supabase.co", serviceKey: "k" }, fake);
  assertEquals(calls.length, 1);
  assertEquals(calls[0]!.url, "https://p.supabase.co/rest/v1/rpc/seat_alert_load");
  assertEquals(s.term, TERM);
  assertEquals(s.watches[0], { id: "w1", deviceId: "d1", term: TERM, courseId: "CMSC131", sectionId: null, lastAlertAt: null, doneAt: null });
  assertEquals(s.states.get("CMSC131-0101")!.open, 2);
  const empty = await loadAlertState({ url: "https://p.supabase.co", serviceKey: "k" }, (() => Promise.resolve(Response.json({ term: null, watches: [], states: [] }))) as unknown as typeof fetch);
  assertEquals([empty.term, empty.watches.length], [null, 0]);
});

Deno.test("handler prints nothing for a quiet run and one short line when an opening was found", async () => {
  const h = harness([watch(1, "CMSC131")], { states: [state("CMSC131", 0)] });
  const deps = { cronSecret: "s", vapidConfigured: () => true, runDeps: () => h.deps, now: () => NOW };
  const logs: string[] = [];
  const orig = console.log;
  console.log = (...a) => logs.push(a.join(" "));
  try {
    await handleSeatAlerts(new Request("https://x.test", { method: "POST", headers: { "x-cron-secret": "s" } }), deps);
    assertEquals(logs, []);
    const h2 = harness([watch(1, "CMSC131")], { states: [state("CMSC131", 0)], live: (ids) => ids.map((id): SeatRow => [id, "0101", 30, 4, 0, 0]) });
    await handleSeatAlerts(new Request("https://x.test", { method: "POST", headers: { "x-cron-secret": "s" } }), { ...deps, runDeps: () => h2.deps });
    assertEquals(logs.length, 1);
    assert(logs[0]!.length < 80);
  } finally {
    console.log = orig;
  }
});

Deno.test("handler: needs the cron secret and VAPID keys; otherwise runs", async () => {
  const h = harness([]);
  const deps = (over = {}) => ({ cronSecret: "s", vapidConfigured: () => true, runDeps: () => h.deps, now: () => NOW, ...over });
  const req = (secret?: string) => new Request("https://x.test/seat-alerts", { method: "POST", headers: secret ? { "x-cron-secret": secret } : {} });
  assertEquals((await handleSeatAlerts(req(), deps())).status, 401);
  assertEquals((await handleSeatAlerts(req("bad"), deps())).status, 401);
  assertEquals((await handleSeatAlerts(req("s"), deps({ cronSecret: undefined }))).status, 503);
  assertEquals((await handleSeatAlerts(req("s"), deps({ vapidConfigured: () => false }))).status, 503);
  const ok = await handleSeatAlerts(req("s"), deps());
  assertEquals(ok.status, 200);
  assertEquals((await ok.json()).requests, 0);
});
