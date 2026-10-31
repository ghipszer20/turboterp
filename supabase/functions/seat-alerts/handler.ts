import { authorizeCron, json } from "../_shared/auth.ts";
import { runSeatAlerts, type RunDeps } from "./run.ts";

// The every-minute Seat Alerts job, called by pg_cron (see supabase/migrations/0016_edge_jobs.sql).

export type AlertsHandlerDeps = {
  cronSecret: string | undefined;
  vapidConfigured: () => boolean;
  /** Built per call so `now` and the signing secret are fresh. */
  runDeps: (now: Date) => RunDeps;
  now: () => Date;
};

export async function handleSeatAlerts(req: Request, deps: AlertsHandlerDeps): Promise<Response> {
  const auth = await authorizeCron(req.headers.get("x-cron-secret"), deps.cronSecret);
  if (auth === "not-configured") return json({ error: "CRON_SECRET is not set" }, 503);
  if (auth === "unauthorized") return json({ error: "Unauthorized" }, 401);
  if (!deps.vapidConfigured()) return json({ error: "not-configured" }, 503);

  const started = performance.now();
  const now = deps.now();
  try {
    const report = await runSeatAlerts(deps.runDeps(now), now);
    const out = { ...report, ms: Math.round(performance.now() - started) };
    console.log(JSON.stringify({ job: "seat-alerts", ...out }));
    return json(out);
  } catch (err) {
    console.error("seat-alerts failed:", err);
    return json({ error: err instanceof Error ? err.message : String(err), ms: Math.round(performance.now() - started) }, 500);
  }
}
