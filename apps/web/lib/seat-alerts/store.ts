import type { SupabaseEnv } from "../email/rate-limit";
import { seatKey, type SeatState, type Watch } from "./logic";

// Server-only. Supabase REST with the service role (tables: supabase/migrations/0009_seat_alerts.sql, 0010_seat_alert_devices.sql).

export type PushSub = { endpoint: string; p256dh: string; auth: string };
export type DeviceSub = PushSub & { deviceId: string };

export type SeatAlertStore = ReturnType<typeof seatAlertStore>;

type WatchRow = { id: string; device_id: string; term: string; course_id: string; section_id: string | null; last_alert_at: string | null; done_at: string | null };
type StateRow = { course_id: string; section_id: string; open: number; waitlist: number; holdfile: number; checked_at: string };

const enc = encodeURIComponent;
const WATCH_COLS = "id,device_id,term,course_id,section_id,last_alert_at,done_at";
const toWatch = (x: WatchRow): Watch => ({ id: x.id, deviceId: x.device_id, term: x.term, courseId: x.course_id, sectionId: x.section_id, lastAlertAt: x.last_alert_at, doneAt: x.done_at });

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
      const r = await rows<WatchRow>(`seat_watches?term=eq.${enc(term)}&done_at=is.null&select=id,device_id,term,course_id,section_id,last_alert_at,done_at`);
      return r.map((x) => ({ id: x.id, deviceId: x.device_id, term: x.term, courseId: x.course_id, sectionId: x.section_id, lastAlertAt: x.last_alert_at, doneAt: x.done_at }));
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

    async subscriptionsFor(deviceIds: string[]): Promise<DeviceSub[]> {
      if (deviceIds.length === 0) return [];
      const r = await rows<{ id: string; endpoint: string; p256dh: string; auth: string }>(`alert_devices?id=in.(${deviceIds.map(enc).join(",")})&select=id,endpoint,p256dh,auth`);
      return r.map((x) => ({ deviceId: x.id, endpoint: x.endpoint, p256dh: x.p256dh, auth: x.auth }));
    },

    async createDevice(d: { secretHash: string; sub: PushSub }): Promise<string> {
      const res = await call("alert_devices", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ secret_hash: d.secretHash, endpoint: d.sub.endpoint, p256dh: d.sub.p256dh, auth: d.sub.auth }),
      });
      const body = (await res.json()) as { id?: string }[];
      if (!Array.isArray(body) || !body[0]?.id) throw new Error("seat-alerts: no row returned");
      return body[0].id;
    },

    async getDevice(id: string): Promise<{ id: string; secretHash: string } | null> {
      const r = await rows<{ id: string; secret_hash: string }>(`alert_devices?id=eq.${enc(id)}&select=id,secret_hash`);
      return r[0] ? { id: r[0].id, secretHash: r[0].secret_hash } : null;
    },

    async updateDeviceSub(id: string, sub: PushSub): Promise<void> {
      await call(`alert_devices?id=eq.${enc(id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth }) });
    },

    /** Deleting a device cascades to its watches. */
    async deleteDevice(id: string): Promise<void> {
      await call(`alert_devices?id=eq.${enc(id)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
    },

    async deleteDeviceByEndpoint(endpoint: string, exceptId?: string): Promise<void> {
      await call(`alert_devices?endpoint=eq.${enc(endpoint)}${exceptId ? `&id=neq.${enc(exceptId)}` : ""}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
    },

    /** Every watch of one device (all terms, active and done), oldest first. */
    async listWatches(deviceId: string): Promise<Watch[]> {
      return (await rows<WatchRow>(`seat_watches?device_id=eq.${enc(deviceId)}&select=${WATCH_COLS}&order=created_at.asc`)).map(toWatch);
    },

    async getWatch(id: string): Promise<Watch | null> {
      const r = await rows<WatchRow>(`seat_watches?id=eq.${enc(id)}&select=${WATCH_COLS}`);
      return r[0] ? toWatch(r[0]) : null;
    },

    async createWatch(deviceId: string, term: string, courseId: string, sectionId: string | null): Promise<Watch> {
      const res = await call("seat_watches", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ device_id: deviceId, term, course_id: courseId, section_id: sectionId }),
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
