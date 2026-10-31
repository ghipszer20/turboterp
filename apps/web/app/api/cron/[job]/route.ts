import type { NextRequest } from "next/server";
import { connection } from "next/server";
import { revalidateTag } from "next/cache";
import { campusTagsForKeys } from "@/lib/campus-tags";
import { buildSnapshots, openSnapshotStore, pruneSnapshots, refreshDining, refreshFast } from "@turboterp/campus-data/snapshots";
import { liveRefreshDeps, refreshCourses, refreshSections } from "@turboterp/course-data/soc-refresh";
import { authorizeCron, cronJob } from "@/lib/cron";
import { runDailyDigest, supabaseDigestSource } from "@/lib/consent/digest";
import { supabaseEnv } from "@/lib/email/rate-limit";
import { sendEmail } from "@/lib/email/send";
import { syncSeatHotWindows } from "@/lib/seat-hot-windows";
import type { AcademicEvent } from "@turboterp/campus-data";
import type { SnapshotStore } from "@turboterp/campus-data/snapshots";

/** Copies the calendar's registration and adjustment dates into seat_hot_windows (the seats job's schedule). Never fails the job. */
async function syncHotWindows(store: SnapshotStore) {
  const env = supabaseEnv();
  if (!env) return;
  try {
    const events = (await store.get<AcademicEvent[]>("calendar/academic"))?.data ?? [];
    if ((await syncSeatHotWindows(env, events)) === "failed") console.error("seat hot windows sync failed");
  } catch (err) {
    console.error("seat hot windows sync failed:", err);
  }
}

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
    if (job === "soc-sections" || job === "soc-courses") {
      const refresh = job === "soc-sections" ? refreshSections : refreshCourses;
      const r = await refresh(store, liveRefreshDeps(), now);
      return Response.json(
        { ...r, ms: Math.round(performance.now() - started) },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const report = await (job === "daily" ? buildSnapshots : job === "dining" ? refreshDining : refreshFast)(store, now);
    if (job === "daily") {
      await pruneSnapshots(store, now);
      await syncHotWindows(store);
      await sendDailyDigest(now);
    }
    // Rebuild the cached pages whose data was just rewritten.
    for (const tag of campusTagsForKeys(report.results.filter((r) => r.ok).map((r) => r.key))) revalidateTag(tag, "max");
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
