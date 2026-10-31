import type { SnapshotStore } from "@turboterp/campus-data/snapshots";
import { refreshSeats, type RefreshDeps } from "../../../packages/course-data/src/soc-refresh.ts";
import { authorizeCron, json } from "../_shared/auth.ts";

// The seats refresh: ONE call per run. WHEN it runs is decided in SQL (the pg_cron command in
// supabase/migrations/0016_edge_jobs.sql only calls it every 5 minutes inside a hot window, else every 15).
// Logs are kept small (Supabase's log ingestion is the binding limit): nothing on a run with no term,
// one short line when work happened, detail only on failure.

export type SeatsHandlerDeps = {
  cronSecret: string | undefined;
  store: () => SnapshotStore;
  refresh: () => RefreshDeps;
  now: () => Date;
};

export async function handleSeats(req: Request, deps: SeatsHandlerDeps): Promise<Response> {
  const auth = await authorizeCron(req.headers.get("x-cron-secret"), deps.cronSecret);
  if (auth === "not-configured") return json({ error: "CRON_SECRET is not set" }, 503);
  if (auth === "unauthorized") return json({ error: "Unauthorized" }, 401);

  const started = performance.now();
  try {
    const report = await refreshSeats(deps.store(), deps.refresh(), deps.now());
    const ms = Math.round(performance.now() - started);
    if (report.processed > 0) {
      console.log(`soc-seats ${report.ok}/${report.processed} depts${report.done ? "" : " (cut short)"}${report.usedFullParse ? " full-parse" : ""} ${Math.round(ms / 1000)}s`);
    }
    for (const f of report.failures) console.error(`soc-seats: ${f.key}: ${f.error}`);
    return json({ ...report, ms });
  } catch (err) {
    console.error("soc-seats failed:", err);
    return json({ job: "soc-seats", error: err instanceof Error ? err.message : String(err), ms: Math.round(performance.now() - started) }, 500);
  }
}
