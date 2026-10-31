// Framework-free part of the Seat Alerts client, shared by the web and the iOS app: push-support
// decisions, the status line, and the API calls (fetch, base URL and device token are injected).
// Server contract: docs/project/seat-alerts-plan.md Task 2. Authorization is the device token; there is no sign-in.

import type { PushSupport, WatchesResponse, WatchRow } from "./view";

export type { PushSupport };
export type PushEnv = {
  userAgent: string;
  maxTouchPoints?: number;
  hasServiceWorker: boolean;
  hasPushManager: boolean;
  hasNotification: boolean;
  /** Running from the Home Screen (display-mode: standalone or navigator.standalone). */
  standalone: boolean;
};

const isIos = (e: PushEnv) => /iPhone|iPad|iPod/.test(e.userAgent) || (/Macintosh/.test(e.userAgent) && (e.maxTouchPoints ?? 0) > 1);

export function pushSupport(e: PushEnv): PushSupport {
  const capable = e.hasServiceWorker && e.hasPushManager && e.hasNotification;
  if (isIos(e)) return e.standalone && capable ? "supported" : e.standalone ? "unsupported" : "ios-needs-home-screen";
  return capable ? "supported" : "unsupported";
}

/** What a bell does: ask for permission and watch, link to the Seat Alerts page (iPhone Safari tabs can't get push), or not show. */
export function bellMode(support: PushSupport): "watch" | "link" | "hidden" {
  return support === "supported" ? "watch" : support === "ios-needs-home-screen" ? "link" : "hidden";
}

export type PermissionState = "default" | "granted" | "denied";

export type AlertsStatus = { kind: "on" | "off" | "blocked" | "unavailable"; text: string; guide: boolean };

/** The status line: alerts on for this device, off, blocked in browser settings, or unavailable. */
export function alertsStatus(support: PushSupport, permission: PermissionState, subscribed: boolean): AlertsStatus {
  if (support === "ios-needs-home-screen") return { kind: "unavailable", text: "Alerts need TurboTerp on your Home Screen", guide: true };
  if (support === "unsupported") return { kind: "unavailable", text: "This browser can't receive alerts", guide: false };
  if (permission === "denied") return { kind: "blocked", text: "Notifications are blocked for TurboTerp in this browser", guide: false };
  if (permission === "granted" && subscribed) return { kind: "on", text: "Alerts are on for this device", guide: false };
  return { kind: "off", text: "Alerts are off for this device", guide: false };
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

export type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; body?: string },
) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

export type SeatAlertsApiOptions = {
  fetch: FetchLike;
  /** "" on the web (same origin); the API origin in the app. */
  baseUrl?: string;
  /** Extra headers on every request (the app's site-lock header). */
  headers?: () => Record<string, string>;
  /** The saved "<deviceId>.<secret>", or null before the device registered. */
  getToken: () => string | null | Promise<string | null>;
};

export function createSeatAlertsApi(o: SeatAlertsApiOptions) {
  async function request<T>(path: string, token: string | null, init: { method?: string; body?: unknown } = {}): Promise<ApiResult<T>> {
    try {
      const res = await o.fetch(`${o.baseUrl ?? ""}${path}`, {
        method: init.method ?? "GET",
        headers: {
          ...(o.headers?.() ?? {}),
          ...(token ? { authorization: `Device ${token}` } : {}),
          ...(init.body ? { "content-type": "application/json" } : {}),
        },
        body: init.body ? JSON.stringify(init.body) : undefined,
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      return res.ok ? { ok: true, data: json as T } : { ok: false, status: res.status, error: json.error ?? `http-${res.status}` };
    } catch {
      return { ok: false, status: 0, error: "network" };
    }
  }
  async function call<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<ApiResult<T>> {
    const token = await o.getToken();
    if (!token) return { ok: false, status: 401, error: "no-device" };
    return request<T>(path, token, init);
  }
  return {
    /** A call that sends the device token when there is one (registration works without it). */
    request: async <T>(path: string, init: { method?: string; body?: unknown } = {}) => request<T>(path, (await o.getToken()) ?? null, init),
    listWatches: () => call<WatchesResponse>("/api/seat-alerts/watches"),
    addWatch: (courseId: string, sectionId: string | null) =>
      call<{ watch: WatchRow }>("/api/seat-alerts/watches", { method: "POST", body: { courseId, sectionId } }),
    finishWatch: (id: string) => call<unknown>(`/api/seat-alerts/watches/${id}/done`, { method: "POST" }),
    removeWatch: (id: string) => call<unknown>(`/api/seat-alerts/watches/${id}`, { method: "DELETE" }),
    removeDevice: () => call<unknown>("/api/seat-alerts/device", { method: "DELETE" }),
  };
}
export type SeatAlertsApi = ReturnType<typeof createSeatAlertsApi>;
