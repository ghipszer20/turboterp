// Browser side of Seat Alerts: push environment, permission, subscription and the API calls.
// The framework-free parts (support decisions, status line, API calls) live in @turboterp/app-core/seat-alerts/client.
// Server contract: docs/project/seat-alerts-plan.md Task 2. Authorization is the device token (device.ts); there is no sign-in.

import { createSeatAlertsApi, type PermissionState, type PushEnv } from "@turboterp/app-core/seat-alerts/client";
import { clearDeviceToken, loadDeviceToken, saveDeviceToken } from "./device";

export { alertsStatus, bellMode, pushSupport } from "@turboterp/app-core/seat-alerts/client";
export type { AlertsStatus, ApiResult, PermissionState, PushEnv, PushSupport } from "@turboterp/app-core/seat-alerts/client";

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

export const permissionStatus = (): PermissionState => ("Notification" in window ? Notification.permission : "denied");

/** Calls `cb` when the student comes back to the page (e.g. after allowing notifications in site settings). Returns a cleanup. */
export function onReturnToPage(
  cb: () => void,
  doc: EventTarget & { visibilityState: DocumentVisibilityState } = document,
  win: EventTarget = window,
): () => void {
  const onVisible = () => {
    if (doc.visibilityState === "visible") cb();
  };
  doc.addEventListener("visibilitychange", onVisible);
  win.addEventListener("focus", cb);
  return () => {
    doc.removeEventListener("visibilitychange", onVisible);
    win.removeEventListener("focus", cb);
  };
}

function keyBytes(b64: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

const api = createSeatAlertsApi({ fetch: (url, init) => fetch(url, init), getToken: () => loadDeviceToken() });
export const { listWatches, addWatch, finishWatch, removeWatch } = api;

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
  const saved = await api.request<{ token?: string }>("/api/seat-alerts/device", { method: "POST", body: { endpoint: json.endpoint, keys: json.keys } });
  if (!saved.ok || !saved.data.token) return "Couldn't turn on alerts. Try again.";
  saveDeviceToken(saved.data.token);
  return null;
}

export async function unsubscribe(): Promise<void> {
  const sub = await currentSubscription();
  await api.removeDevice();
  clearDeviceToken();
  await sub?.unsubscribe().catch(() => false);
}
