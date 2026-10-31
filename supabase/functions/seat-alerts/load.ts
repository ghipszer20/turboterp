import { seatKey, type SeatState, type Watch } from "../../../apps/web/lib/seat-alerts/logic.ts";
import type { AlertState } from "./run.ts";

// ONE PostgREST request per run: the security-definer function public.seat_alert_load() (supabase/migrations/0016_edge_jobs.sql)
// returns the newest watched term, its active watches and their saved seat states.

type Loaded = {
  term: string | null;
  watches: { id: string; device_id: string; term: string; course_id: string; section_id: string | null; last_alert_at: string | null }[];
  states: { course_id: string; section_id: string; open: number; waitlist: number; holdfile: number; checked_at: string }[];
};

export async function loadAlertState(env: { url: string; serviceKey: string }, fetchFn: typeof fetch = fetch): Promise<AlertState> {
  const res = await fetchFn(`${env.url}/rest/v1/rpc/seat_alert_load`, {
    method: "POST",
    headers: { apikey: env.serviceKey, Authorization: `Bearer ${env.serviceKey}`, "content-type": "application/json" },
    body: "{}",
  });
  if (!res.ok) throw new Error(`seat_alert_load failed: ${res.status}`);
  const body = (await res.json()) as Loaded;
  const watches: Watch[] = (body.watches ?? []).map((w) => ({ id: w.id, deviceId: w.device_id, term: w.term, courseId: w.course_id, sectionId: w.section_id, lastAlertAt: w.last_alert_at, doneAt: null }));
  const states = new Map<string, SeatState>();
  for (const s of body.states ?? []) states.set(seatKey(s.course_id, s.section_id), { courseId: s.course_id, sectionId: s.section_id, open: s.open, waitlist: s.waitlist, holdfile: s.holdfile, checkedAt: s.checked_at });
  return { term: body.term ?? null, watches, states };
}
