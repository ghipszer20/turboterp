import type { NextRequest } from "next/server";
import { connection } from "next/server";
import { buildSnapshots, openSnapshotStore, pruneSnapshots, refreshFast } from "@turboterp/campus-data/snapshots";
import { liveRefreshDeps, refreshCourses, refreshSeats } from "@turboterp/course-data/soc-refresh";
import { authorizeCron, cronJob } from "@/lib/cron";
import { runDailyDigest, supabaseDigestSource } from "@/lib/consent/digest";
import { supabaseEnv } from "@/lib/email/rate-limit";
import { sendEmail } from "@/lib/email/send";

/** The agreement-records email. Never fails the snapshot job; skipped when RECORDS_EMAIL or Supabase is unset. */
async function sendDailyDigest(now: Date) {
  const env = supabaseEnv();
  const recordsEmail = process.env.RECORDS_EMAIL;
  if (!env || !recordsEmail) return;
  const result = await runDailyDigest({ recordsEmail, ...supabaseDigestSource(env), send: (m) => sendEmail(m), now: () => now });
  if (result === "failed") console.error("daily records digest failed");
}

// Scheduled refresh, called by Supabase cron (supabase/migrations/0003_cron_refresh.sql)
// with `Authorization: Bearer $CRON_SECRET`. See packages/campus-data/SNAPSHOTS.md.
export const maxDuration = 300;

async function run(request: NextRequest, context: { params: Promise<{ job: string }> }) {
  await connection(); // never prerendered or cached
  const job = cronJob((await context.params).job);
  if (!job) return Response.json({ error: "Unknown job" }, { status: 404 });

  const auth = authorizeCron(request.headers.get("authorization"), process.env.CRON_SECRET);
  if (auth === "not-configured") return Response.json({ error: "CRON_SECRET is not set" }, { status: 503 });
  if (auth === "unauthorized") return Response.json({ error: "Unauthorized" }, { status: 401 });

  const started = performance.now();
  try {
    const store = openSnapshotStore();
    const now = new Date();
    if (job === "soc-seats" || job === "soc-courses") {
      const refresh = job === "soc-seats" ? refreshSeats : refreshCourses;
      const r = await refresh(store, liveRefreshDeps(), now);
      return Response.json(
        { ...r, ms: Math.round(performance.now() - started) },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const report = await (job === "daily" ? buildSnapshots : refreshFast)(store, now);
    if (job === "daily") {
      await pruneSnapshots(store, now);
      await sendDailyDigest(now);
    }
    const failures = report.results.flatMap((r) => (r.ok ? [] : [{ key: r.key, error: r.error }]));
    return Response.json(
      {
        job,
        ok: report.results.length - failures.length,
        failed: failures.length,
        ms: Math.round(performance.now() - started),
        failures,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error(err);
    return Response.json(
      { job, error: err instanceof Error ? err.message : String(err), ms: Math.round(performance.now() - started) },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export const GET = run;
export const POST = run;
