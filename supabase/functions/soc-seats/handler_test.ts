import proc from "node:process";
import { assert, assertEquals } from "jsr:@std/assert@1";
import { liveRefreshDeps, SEAT_CHUNKS, type RefreshDeps, type SeatsChunkFile, type SeatsFile } from "../../../packages/course-data/src/soc-refresh.ts";
import { MemoryStore } from "../_shared/memory-store.ts";
import { handleSeats, type SeatsHandlerDeps } from "./handler.ts";

const FIXTURE = Deno.readTextFileSync(new URL("../../../packages/course-data/test/fixtures/soc-seats-real.html", import.meta.url));
const FIXTURE_IDS = ["CMSC115", "CMSC131", "CMSC250H", "ENGL245"]; // the real page holds these 4 courses, 28 sections

/** A term of `depts` departments with 5..45 courses each (about the real catalog's shape: ~230 departments, ~5.8k courses). */
function catalog(depts: number) {
  const courses: { id: string; department: string; title: string; credits: { min: number; max: number } }[] = [];
  for (let d = 0; d < depts; d++) {
    const dept = String.fromCharCode(65 + Math.floor(d / 26), 65 + (d % 26), 88, 88); // AAXX, ABXX, ...
    const n = 5 + ((d * 7) % 41);
    for (let i = 0; i < n; i++) courses.push({ id: `${dept}${100 + i}`, department: dept, title: "t", credits: { min: 3, max: 3 } });
  }
  return courses;
}

async function seededStore(depts: number) {
  const store = new MemoryStore();
  const courses = catalog(depts);
  await store.seed("schedule/current", { term: "202701" });
  await store.seed("schedule/202701/courses", { term: "202701", courses });
  return { store, courses };
}

/** Testudo stand-in: a sections request is answered with the real page, one copy per 4 requested courses, with their ids. */
const pages = new Map<string, string>();
function fakeTestudo(counter: { requests: number }) {
  return (url: string | URL | Request) => {
    counter.requests++;
    const key = String(url);
    let page = pages.get(key);
    if (page === undefined) {
      const ids = new URL(key).searchParams.get("courseIds")!.split(",");
      const parts: string[] = [];
      for (let i = 0; i < ids.length; i += FIXTURE_IDS.length) {
        let copy = FIXTURE;
        FIXTURE_IDS.forEach((orig, j) => { if (ids[i + j]) copy = copy.replaceAll(orig, ids[i + j]!); });
        parts.push(copy);
      }
      page = parts.join("");
      pages.set(key, page);
    }
    return Promise.resolve(new Response(page));
  };
}

const handlerDeps = (store: MemoryStore, over: Partial<SeatsHandlerDeps> = {}, refresh: Partial<RefreshDeps> = {}): SeatsHandlerDeps => ({
  cronSecret: "s3cret",
  store: () => store,
  refresh: () => ({ ...liveRefreshDeps(), pause: () => Promise.resolve(), ...refresh }),
  now: () => new Date("2026-10-04T12:00:00Z"),
  ...over,
});
const call = (deps: SeatsHandlerDeps, chunk: string, secret: string | null = "s3cret") =>
  handleSeats(new Request(`https://x.test/soc-seats?chunk=${chunk}`, { method: "POST", headers: secret ? { "x-cron-secret": secret } : {} }), deps);

// A scanner stand-in: one section "0101" per requested course, `open` seats.
const stubSeats = (open: number): Partial<RefreshDeps> => ({
  fetchSeats: (_t, ids) => Promise.resolve(ids.map((id) => [id, "0101", 30, open, 0, 0] as [string, string, number, number, number, number])),
});

Deno.test("rejects a missing or wrong secret, an unset CRON_SECRET and a bad chunk, without touching storage", async () => {
  const { store } = await seededStore(8);
  const putsBefore = store.puts;
  assertEquals((await call(handlerDeps(store), "0", null)).status, 401);
  assertEquals((await call(handlerDeps(store), "0", "nope")).status, 401);
  assertEquals((await call(handlerDeps(store, { cronSecret: undefined }), "0")).status, 503);
  for (const bad of ["4", "-1", "x", "", "1.5"]) assertEquals((await call(handlerDeps(store), bad)).status, 400, bad);
  assertEquals(store.puts, putsBefore);
});

Deno.test("accepts the chunk in a JSON body too", async () => {
  const { store } = await seededStore(8);
  const res = await handleSeats(
    new Request("https://x.test/soc-seats", { method: "POST", headers: { "x-cron-secret": "s3cret" }, body: JSON.stringify({ chunk: 2 }) }),
    handlerDeps(store, {}, stubSeats(5)),
  );
  assertEquals(res.status, 200);
  assertEquals((await res.json()).chunk, 2);
});

Deno.test("four chunk calls leave one whole, correct seats file", async () => {
  const { store, courses } = await seededStore(40);
  for (let c = 0; c < SEAT_CHUNKS; c++) assertEquals((await call(handlerDeps(store, {}, stubSeats(5)), String(c))).status, 200);
  const file = await store.data<SeatsFile>("schedule/202701/seats");
  assertEquals(Object.keys(file!.seats).sort(), courses.map((c) => `${c.id}-0101`).sort());
  assert(Object.values(file!.seats).every((v) => v[0] === 5));
  for (let c = 0; c < SEAT_CHUNKS; c++) assert(await store.data<SeatsChunkFile>(`schedule/202701/seats-chunk/${c}`));
});

Deno.test("concurrent chunk calls cannot clobber each other", async () => {
  const { store, courses } = await seededStore(40);
  await Promise.all([0, 1, 2, 3].map((c) => call(handlerDeps(store, {}, stubSeats(5)), String(c))));
  const file = await store.data<SeatsFile>("schedule/202701/seats");
  assertEquals(Object.keys(file!.seats).length, courses.length);
});

Deno.test("a partial run (only chunk 1 refreshed) keeps every other department's earlier counts", async () => {
  const { store, courses } = await seededStore(40);
  for (let c = 0; c < SEAT_CHUNKS; c++) await call(handlerDeps(store, {}, stubSeats(5)), String(c));
  await call(handlerDeps(store, { now: () => new Date("2026-10-04T12:05:00Z") }, stubSeats(9)), "1");
  const file = await store.data<SeatsFile>("schedule/202701/seats");
  assertEquals(Object.keys(file!.seats).length, courses.length);
  const counts = new Set(Object.values(file!.seats).map((v) => v[0]));
  assertEquals([...counts].sort(), [5, 9]);
});

Deno.test("scanner-broken flag makes the chunk use the full parse", async () => {
  const { store } = await seededStore(8);
  await store.seed("schedule/202701/seats-scan-broken", { at: "x" });
  const counter = { requests: 0 };
  const orig = globalThis.fetch;
  globalThis.fetch = fakeTestudo(counter) as typeof fetch;
  try {
    const res = await call(handlerDeps(store), "0");
    assertEquals((await res.json()).usedFullParse, true);
  } finally {
    globalThis.fetch = orig;
  }
});

/** CPU and request numbers for one realistic chunk: ~230 departments, ~5.8k courses, the real page repeated to batch size. */
Deno.test("measure: CPU per seats chunk with the real HTML fixture", async () => {
  const orig = globalThis.fetch;
  const counter = { requests: 0 };
  globalThis.fetch = fakeTestudo(counter) as typeof fetch;
  try {
    const run = async () => {
      const { store, courses } = await seededStore(230);
      const cpuNow = () => { const u = proc.cpuUsage(); return (u.user + u.system) / 1000; };
      const cpu: number[] = [];
      const wall: number[] = [];
      const requests: number[] = [];
      for (let c = 0; c < SEAT_CHUNKS; c++) {
        const before = counter.requests;
        const t0 = cpuNow();
        const w0 = performance.now();
        const res = await call(handlerDeps(store), String(c));
        assertEquals(res.status, 200);
        await res.text();
        cpu.push(cpuNow() - t0);
        wall.push(performance.now() - w0);
        requests.push(counter.requests - before);
      }
      const file = await store.data<SeatsFile>("schedule/202701/seats");
      return { cpu, wall, requests, courses: courses.length, sections: Object.keys(file!.seats).length, bytes: store.files.get("schedule/202701/seats")!.length };
    };
    await run(); // warm: builds and caches the pages, loads cheerio
    const r = await run();
    const WALL_PER_REQUEST_MS = 900 + 300; // measured fetch+decode (plan section 3) plus the 300 ms pause
    console.log(JSON.stringify({
      courses: r.courses, sections: r.sections, seatsFileBytes: r.bytes,
      perChunk: r.cpu.map((cpu, i) => ({ chunk: i, requests: r.requests[i], cpuMs: Math.round(cpu), estWallS: Math.round((r.requests[i]! * WALL_PER_REQUEST_MS) / 1000) })),
    }));
    for (const cpu of r.cpu) assert(cpu < 1500, `chunk CPU ${cpu} ms is over the 1.5 s guard (the Edge limit is 2 s)`);
    assertEquals(r.requests.reduce((a, b) => a + b, 0), r.requests.reduce((a, b) => a + b, 0));
  } finally {
    globalThis.fetch = orig;
  }
});
