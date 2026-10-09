import type { SupabaseEnv } from "../email/rate-limit";
import { seatKey, type SeatState, type Watch } from "./logic";

// Server-only. Supabase REST with the service role (tables: supabase/migrations/0009_seat_alerts.sql).

export type PushSub = { endpoint: string; p256dh: string; auth: string };
export type UserPushSub = PushSub & { userId: string };

export type SeatAlertStore = ReturnType<typeof seatAlertStore>;

type WatchRow = { id: string; user_id: string; term: string; course_id: string; section_id: string | null; last_alert_at: string | null; done_at: string | null };
type StateRow = { course_id: string; section_id: string; open: number; waitlist: number; holdfile: number; checked_at: string };

const enc = encodeURIComponent;
const WATCH_COLS = "id,user_id,term,course_id,section_id,last_alert_at,done_at";
const toWatch = (x: WatchRow): Watch => ({ id: x.id, userId: x.user_id, term: x.term, courseId: x.course_id, sectionId: x.section_id, lastAlertAt: x.last_alert_at, doneAt: x.done_at });

export function seatAlertStore(env: SupabaseEnv, fetchFn: typeof fetch = fetch) {
  const base = `${env.url}/rest/v1`;
  const headers = { apikey: env.serviceKey, Authorization: `Bearer ${env.serviceKey}`, "content-type": "application/json" };
  const call = async (path: string, init: RequestInit = {}) => {
    const res = await fetchFn(`${base}/${path}`, { ...init, headers: { ...headers, ...init.headers } });
    if (!res.ok) throw new Error(`seat-alerts ${init.method ?? "GET"} ${path.split("?")[0]} failed: ${res.status}`);
    return res;
  };
  const rows = async <T>(path: string): Promise<T[]> => {
    const body = (await (await call(path)).json()) as unknown;
    if (!Array.isArray(body)) throw new Error("seat-alerts: unexpected answer");
    return body as T[];
  };

  return {
    async listActiveWatches(term: string): Promise<Watch[]> {
      const r = await rows<WatchRow>(`seat_watches?term=eq.${enc(term)}&done_at=is.null&select=id,user_id,term,course_id,section_id,last_alert_at,done_at`);
      return r.map((x) => ({ id: x.id, userId: x.user_id, term: x.term, courseId: x.course_id, sectionId: x.section_id, lastAlertAt: x.last_alert_at, doneAt: x.done_at }));
    },

    /** Saved states for these courses, keyed `${courseId}-${sectionId}`. */
    async getStates(term: string, courseIds: string[]): Promise<Map<string, SeatState>> {
      const out = new Map<string, SeatState>();
      if (courseIds.length === 0) return out;
      const r = await rows<StateRow>(`seat_state?term=eq.${enc(term)}&course_id=in.(${courseIds.map(enc).join(",")})&select=course_id,section_id,open,waitlist,holdfile,checked_at`);
      for (const x of r) out.set(seatKey(x.course_id, x.section_id), { courseId: x.course_id, sectionId: x.section_id, open: x.open, waitlist: x.waitlist, holdfile: x.holdfile, checkedAt: x.checked_at });
      return out;
    },

    async saveStates(term: string, states: SeatState[]): Promise<void> {
      if (states.length === 0) return;
      await call("seat_state?on_conflict=term,course_id,section_id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(states.map((s) => ({ term, course_id: s.courseId, section_id: s.sectionId, open: s.open, waitlist: s.waitlist, holdfile: s.holdfile, checked_at: s.checkedAt }))),
      });
    },

    async markAlerted(watchIds: string[], at: Date): Promise<void> {
      if (watchIds.length === 0) return;
      await call(`seat_watches?id=in.(${watchIds.map(enc).join(",")})`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ last_alert_at: at.toISOString() }),
      });
    },

    async subscriptionsFor(userIds: string[]): Promise<UserPushSub[]> {
      if (userIds.length === 0) return [];
      const r = await rows<{ user_id: string; endpoint: string; p256dh: string; auth: string }>(`push_subscriptions?user_id=in.(${userIds.map(enc).join(",")})&select=user_id,endpoint,p256dh,auth`);
      return r.map((x) => ({ userId: x.user_id, endpoint: x.endpoint, p256dh: x.p256dh, auth: x.auth }));
    },

    async deleteSubscription(endpoint: string): Promise<void> {
      await call(`push_subscriptions?endpoint=eq.${enc(endpoint)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
    },

    /** Every watch of one user (all terms, active and done), oldest first. */
    async listWatches(userId: string): Promise<Watch[]> {
      return (await rows<WatchRow>(`seat_watches?user_id=eq.${enc(userId)}&select=${WATCH_COLS}&order=created_at.asc`)).map(toWatch);
    },

    async getWatch(id: string): Promise<Watch | null> {
      const r = await rows<WatchRow>(`seat_watches?id=eq.${enc(id)}&select=${WATCH_COLS}`);
      return r[0] ? toWatch(r[0]) : null;
    },

    async createWatch(userId: string, term: string, courseId: string, sectionId: string | null): Promise<Watch> {
      const res = await call("seat_watches", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ user_id: userId, term, course_id: courseId, section_id: sectionId }),
      });
      const body = (await res.json()) as WatchRow[];
      if (!Array.isArray(body) || !body[0]) throw new Error("seat-alerts: no row returned");
      return toWatch(body[0]);
    },

    async markDone(id: string, at: Date): Promise<void> {
      await call(`seat_watches?id=eq.${enc(id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ done_at: at.toISOString() }) });
    },

    async deleteWatch(id: string): Promise<void> {
      await call(`seat_watches?id=eq.${enc(id)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
    },

    /** Upserts on the endpoint, so a device that changes account moves to the new user. */
    async upsertSubscription(userId: string, sub: PushSub): Promise<void> {
      await call("push_subscriptions?on_conflict=endpoint", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ user_id: userId, endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth }),
      });
    },

    async deleteSubscriptionFor(userId: string, endpoint: string): Promise<void> {
      await call(`push_subscriptions?endpoint=eq.${enc(endpoint)}&user_id=eq.${enc(userId)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
    },

    async getCursor():Promise<string | null> {
      const r = await rows<{ next_course: string | null }>("seat_alert_cursor?id=eq.1&select=next_course");
      return r[0]?.next_course ?? null;
    },

    async setCursor(next: string | null): Promise<void> {
      await call("seat_alert_cursor?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ id: 1, next_course: next, updated_at: new Date().toISOString() }),
      });
    },
  };
}
