import proc from "node:process";
import { assert, assertEquals } from "jsr:@std/assert@1";
import { liveRefreshDeps, type RefreshDeps, type SeatsFile } from "../../../packages/course-data/src/soc-refresh.ts";
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

/** A store holding the current term and the previous seats row (one section "0101" per course, 1 seat open). */
async function seededStore(depts: number, withRow = true) {
  const store = new MemoryStore();
  const courses = catalog(depts);
  await store.seed("schedule/current", { term: "202701" });
  if (withRow) {
    const seats: SeatsFile["seats"] = {};
    for (const c of courses) seats[`${c.id}-0101`] = [1, 0, 0, 30];
    await store.seed("schedule/202701/seats", { v: 1, term: "202701", generatedAt: "2026-10-01T00:00:00.000Z", seats });
  } else {
    await store.seed("schedule/202701/courses", { term: "202701", courses });
  }
  store.requests = 0;
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
  refresh: () => ({ ...liveRefreshDeps(), pause: () => Promise.resolve(), concurrency: 3, budgetMs: 120_000, ...refresh }),
  now: () => new Date("2026-10-04T12:00:00Z"),
  ...over,
});
const call = (deps: SeatsHandlerDeps, secret: string | null = "s3cret") =>
  handleSeats(new Request("https://x.test/soc-seats", { method: "POST", headers: secret ? { "x-cron-secret": secret } : {} }), deps);

// A scanner stand-in: one section "0101" per requested course, `open` seats.
const stubSeats = (open: number): Partial<RefreshDeps> => ({
  fetchSeats: (_t, ids) => Promise.resolve(ids.map((id) => [id, "0101", 30, open, 0, 0] as [string, string, number, number, number, number])),
});

/** Capture console output of a call. */
async function quiet<T>(fn: () => Promise<T>): Promise<{ result: T; out: string[]; err: string[] }> {
  const out: string[] = [];
  const err: string[] = [];
  const [log, error] = [console.log, console.error];
  console.log = (...a) => out.push(a.join(" "));
  console.error = (...a) => err.push(a.join(" "));
  try {
    return { result: await fn(), out, err };
  } finally {
    [console.log, console.error] = [log, error];
  }
}

Deno.test("rejects a missing or wrong secret and an unset CRON_SECRET, without touching storage", async () => {
  const { store } = await seededStore(8);
  assertEquals((await call(handlerDeps(store), null)).status, 401);
  assertEquals((await call(handlerDeps(store), "nope")).status, 401);
  assertEquals((await call(handlerDeps(store, { cronSecret: undefined }))).status, 503);
  assertEquals(store.requests, 0);
});

Deno.test("one call refreshes the whole row with at most 4 store requests (3 with a row)", async () => {
  const { store, courses } = await seededStore(40);
  const { result, out, err } = await quiet(() => call(handlerDeps(store, {}, stubSeats(5))));
  assertEquals(result.status, 200);
  assertEquals(store.requests, 3); // current term, seats row, seats row written
  const file = await store.data<SeatsFile>("schedule/202701/seats");
  assertEquals(Object.keys(file!.seats).sort(), courses.map((c) => `${c.id}-0101`).sort());
  assert(Object.values(file!.seats).every((v) => v[0] === 5));
  assertEquals(out.length, 1); // one short line
  assert(out[0]!.length < 80, out[0]);
  assertEquals(err, []);
});

Deno.test("with no row yet (first ever run) it is still at most 4 store requests", async () => {
  const { store, courses } = await seededStore(40, false);
  await quiet(() => call(handlerDeps(store, {}, stubSeats(5))));
  assert(store.requests <= 4, `${store.requests} store requests`);
  assertEquals(Object.keys((await store.data<SeatsFile>("schedule/202701/seats"))!.seats).length, courses.length);
});

Deno.test("a run with no current term does nothing and prints nothing", async () => {
  const store = new MemoryStore();
  const { result, out, err } = await quiet(() => call(handlerDeps(store)));
  assertEquals(result.status, 200);
  assertEquals([out, err], [[], []]);
});

Deno.test("a failing department keeps its counts, is reported on stderr, and the rest still refresh", async () => {
  const { store } = await seededStore(8);
  const bad = catalog(8)[0]!.department;
  const { err } = await quiet(() =>
    call(handlerDeps(store, {}, { fetchSeats: (_t, ids) => (ids[0]!.startsWith(bad) ? Promise.reject(new Error("503")) : Promise.resolve(ids.map((id) => [id, "0101", 30, 5, 0, 0] as [string, string, number, number, number, number]))) })),
  );
  assert(err.some((l) => l.includes(bad)));
  const seats = (await store.data<SeatsFile>("schedule/202701/seats"))!.seats;
  assertEquals(seats[`${bad}100-0101`]![0], 1);
  assertEquals(Object.values(seats).filter((v) => v[0] === 5).length > 0, true);
});

Deno.test("scanBroken in the row makes the run use the full parse", async () => {
  const { store } = await seededStore(0);
  await store.seed("schedule/202701/seats", { v: 1, term: "202701", generatedAt: "x", seats: { "CMSC115-0101": [0, 0, 0, 1] }, scanBroken: { at: "x", mismatches: 1 } });
  const counter = { requests: 0 };
  const orig = globalThis.fetch;
  globalThis.fetch = fakeTestudo(counter) as typeof fetch;
  try {
    const { result } = await quiet(() => call(handlerDeps(store, {}, { fetchSeats: undefined, pause: () => Promise.resolve() })));
    assertEquals((await result.json()).usedFullParse, true);
  } finally {
    globalThis.fetch = orig;
  }
});

/** CPU, wall-clock-independent request counts and store requests for one realistic run. */
Deno.test("measure: CPU and store requests per seats run with the real HTML fixture", async () => {
  const orig = globalThis.fetch;
  const counter = { requests: 0 };
  globalThis.fetch = fakeTestudo(counter) as typeof fetch;
  try {
    const run = async () => {
      const { store, courses } = await seededStore(230);
      const cpuNow = () => { const u = proc.cpuUsage(); return (u.user + u.system) / 1000; };
      const before = counter.requests;
      const t0 = cpuNow();
      const { result } = await quiet(() => call(handlerDeps(store)));
      const cpu = cpuNow() - t0;
      const storeRequests = store.requests; // before the test reads the row back
      assertEquals(result.status, 200);
      const file = await store.data<SeatsFile>("schedule/202701/seats");
      return { cpu, testudo: counter.requests - before, storeRequests, courses: courses.length, sections: Object.keys(file!.seats).length };
    };
    await run(); // warm: builds and caches the pages, loads cheerio
    const r = await run();
    const WALL_PER_REQUEST_MS = 900 + 300; // measured fetch+decode (plan section 3) plus the 300 ms pause
    console.log(JSON.stringify({ ...r, cpuMs: Math.round(r.cpu), estWallS: Math.round((r.testudo * WALL_PER_REQUEST_MS) / 3 / 1000) }));
    assert(r.cpu < 1500, `run CPU ${r.cpu} ms is over the 1.5 s guard (the Edge limit is 2 s)`);
    assertEquals(r.storeRequests, 3);
  } finally {
    globalThis.fetch = orig;
  }
});
