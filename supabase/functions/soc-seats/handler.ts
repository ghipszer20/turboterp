import type { SnapshotStore } from "@turboterp/campus-data/snapshots";
import { refreshSeatsChunk, SEAT_CHUNKS, type RefreshDeps } from "../../../packages/course-data/src/soc-refresh.ts";
import { authorizeCron, json } from "../_shared/auth.ts";

// One chunk (0..SEAT_CHUNKS-1) of the 5-minute seats refresh. Called by pg_cron, four times per run.
// The chunk number is `?chunk=N` or {"chunk": N} in the JSON body.

export type SeatsHandlerDeps = {
  cronSecret: string | undefined;
  store: () => SnapshotStore;
  refresh: () => RefreshDeps;
  now: () => Date;
};

async function chunkOf(req: Request): Promise<number | null> {
  let raw: unknown = new URL(req.url).searchParams.get("chunk");
  if (raw === null && req.method === "POST") {
    try {
      raw = ((await req.json()) as { chunk?: unknown }).chunk;
    } catch { /* no body */ }
  }
  const n = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw;
  return typeof n === "number" && Number.isInteger(n) && n >= 0 && n < SEAT_CHUNKS ? n : null;
}

export async function handleSeats(req: Request, deps: SeatsHandlerDeps): Promise<Response> {
  const auth = await authorizeCron(req.headers.get("x-cron-secret"), deps.cronSecret);
  if (auth === "not-configured") return json({ error: "CRON_SECRET is not set" }, 503);
  if (auth === "unauthorized") return json({ error: "Unauthorized" }, 401);
  const chunk = await chunkOf(req);
  if (chunk === null) return json({ error: `chunk must be an integer 0-${SEAT_CHUNKS - 1}` }, 400);

  const started = performance.now();
  try {
    const report = await refreshSeatsChunk(deps.store(), deps.refresh(), deps.now(), chunk);
    const out = { ...report, ms: Math.round(performance.now() - started) };
    console.log(JSON.stringify({ job: "soc-seats", chunk, done: out.done, processed: out.processed, failed: out.failed, skipped: out.skipped, usedFullParse: out.usedFullParse, ms: out.ms }));
    for (const f of report.failures) console.error(`soc-seats chunk ${chunk}: ${f.key}: ${f.error}`);
    return json(out);
  } catch (err) {
    console.error("soc-seats failed:", err);
    return json({ job: "soc-seats", chunk, error: err instanceof Error ? err.message : String(err), ms: Math.round(performance.now() - started) }, 500);
  }
}
