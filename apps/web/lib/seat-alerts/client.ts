// Browser side of Seat Alerts: push support, permission, subscription and the API calls.
// Server contract: docs/project/seat-alerts-plan.md Task 2. Authorization is the Supabase access token.

import { getAuthClient } from "@/lib/auth/client";
import type { WatchesResponse, WatchRow } from "./view";

export type PushSupport = "supported" | "ios-needs-home-screen" | "unsupported";
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

export function currentPushEnv(): PushEnv {
  const nav = navigator as Navigator & { standalone?: boolean };
  return {
    userAgent: nav.userAgent,
    maxTouchPoints: nav.maxTouchPoints,
    hasServiceWorker: "serviceWorker" in nav,
    hasPushManager: "PushManager" in window,
    hasNotification: "Notification" in window,
    standalone: nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches,
  };
}

export type PermissionState = "default" | "granted" | "denied";
export const permissionStatus = (): PermissionState => ("Notification" in window ? Notification.permission : "denied");

export type AlertsStatus = { kind: "on" | "off" | "blocked" | "unavailable"; text: string; guide: boolean };

/** The status line: alerts on for this device, off, blocked in browser settings, or unavailable. */
export function alertsStatus(support: PushSupport, permission: PermissionState, subscribed: boolean): AlertsStatus {
  if (support === "ios-needs-home-screen") return { kind: "unavailable", text: "Alerts need TurboTerp on your Home Screen", guide: true };
  if (support === "unsupported") return { kind: "unavailable", text: "This browser can't receive alerts", guide: false };
  if (permission === "denied") return { kind: "blocked", text: "Notifications are blocked for TurboTerp in this browser", guide: false };
  if (permission === "granted" && subscribed) return { kind: "on", text: "Alerts are on for this device", guide: false };
  return { kind: "off", text: "Alerts are off for this device", guide: false };
}

function keyBytes(b64: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export async function accessToken(): Promise<string | null> {
  try {
    const client = await getAuthClient();
    const { data } = await client.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

async function call<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<ApiResult<T>> {
  const token = await accessToken();
  if (!token) return { ok: false, status: 401, error: "signed-out" };
  try {
    const res = await fetch(path, {
      method: init.method ?? "GET",
      headers: { authorization: `Bearer ${token}`, ...(init.body ? { "content-type": "application/json" } : {}) },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    return res.ok ? { ok: true, data: json as T } : { ok: false, status: res.status, error: json.error ?? `http-${res.status}` };
  } catch {
    return { ok: false, status: 0, error: "network" };
  }
}

export const listWatches = () => call<WatchesResponse>("/api/seat-alerts/watches");
export const addWatch = (courseId: string, sectionId: string | null) =>
  call<{ watch: WatchRow }>("/api/seat-alerts/watches", { method: "POST", body: { courseId, sectionId } });
export const finishWatch = (id: string) => call<unknown>(`/api/seat-alerts/watches/${id}/done`, { method: "POST" });
export const removeWatch = (id: string) => call<unknown>(`/api/seat-alerts/watches/${id}`, { method: "DELETE" });
export const sendTestAlert = () => call<{ sent: number; gone: number }>("/api/seat-alerts/test", { method: "POST" });

export async function currentSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator)) return null;
  const reg = await navigator.serviceWorker.getRegistration("/sw.js").catch(() => undefined);
  return (await reg?.pushManager.getSubscription()) ?? null;
}

/** Ask permission, subscribe this device and register it with the server. Returns an error text or null. */
export async function subscribe(): Promise<string | null> {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) return "Alerts aren't set up on the server yet.";
  if ((await Notification.requestPermission()) !== "granted") return "Notifications weren't allowed.";
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key) }));
  const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  const saved = await call("/api/seat-alerts/subscription", { method: "POST", body: { endpoint: json.endpoint, keys: json.keys } });
  return saved.ok ? null : "Couldn't turn on alerts. Try again.";
}

export async function unsubscribe(): Promise<void> {
  const sub = await currentSubscription();
  if (!sub) return;
  await call("/api/seat-alerts/subscription", { method: "DELETE", body: { endpoint: sub.endpoint } });
  await sub.unsubscribe().catch(() => false);
}
