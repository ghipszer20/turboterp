import type { AcademicEvent } from "@turboterp/campus-data";
import { seatHotWindows } from "@turboterp/campus-data/seat-windows";
import type { SupabaseEnv } from "./email/rate-limit";

// Server-only. The daily job copies the registration/adjustment dates of the academic calendar into the
// seat_hot_windows table; pg_cron reads it to decide how often to call the seats function
// (supabase/migrations/0016_edge_jobs.sql, packages/campus-data/src/seat-windows.ts).

/** Replace all windows in one atomic RPC. With no events the table is left as it was. */
export async function syncSeatHotWindows(env: SupabaseEnv, events: AcademicEvent[], fetchFn: typeof fetch = fetch): Promise<"written" | "skipped" | "failed"> {
  const windows = seatHotWindows(events);
  if (windows.length === 0) return "skipped";
  const res = await fetchFn(`${env.url}/rest/v1/rpc/replace_seat_hot_windows`, {
    method: "POST",
    headers: { apikey: env.serviceKey, Authorization: `Bearer ${env.serviceKey}`, "content-type": "application/json" },
    body: JSON.stringify({ p_windows: windows.map((w) => ({ starts_at: w.startsAt, ends_at: w.endsAt })) }),
  });
  return res.ok ? "written" : "failed";
}
