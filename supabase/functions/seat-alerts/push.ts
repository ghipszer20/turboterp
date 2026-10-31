import webpush from "npm:web-push@3.6.7";
import type { PushSub } from "../../../apps/web/lib/seat-alerts/store.ts";

// Port of apps/web/lib/seat-alerts/push.ts. VAPID keys live only in Edge Function secrets
// (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT). The same file also stands in for
// "../../../apps/web/lib/seat-alerts/push" in this function's import map (api.ts imports its types).

export type PushResult = "ok" | "gone" | "failed";
export type PushPayload = { title: string; body: string; url?: string; watchId?: string; token?: string };
export type Send = (sub: { endpoint: string; keys: { p256dh: string; auth: string } }, payload: string) => Promise<{ statusCode: number }>;

export const vapidConfigured = (get: (name: string) => string | undefined = (n) => Deno.env.get(n)): boolean =>
  Boolean(get("VAPID_PUBLIC_KEY") && get("VAPID_PRIVATE_KEY") && get("VAPID_SUBJECT"));

let vapidSet = false;
const defaultSend: Send = (sub, payload) => {
  if (!vapidSet) {
    webpush.setVapidDetails(Deno.env.get("VAPID_SUBJECT")!, Deno.env.get("VAPID_PUBLIC_KEY")!, Deno.env.get("VAPID_PRIVATE_KEY")!);
    vapidSet = true;
  }
  return webpush.sendNotification(sub, payload, { TTL: 900 });
};

/** "gone" (404 or 410) means the browser dropped the subscription: delete it. */
export async function sendPush(sub: PushSub, payload: PushPayload, send: Send = defaultSend): Promise<PushResult> {
  try {
    const res = await send({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload));
    return res.statusCode >= 200 && res.statusCode < 300 ? "ok" : "failed";
  } catch (err) {
    const { statusCode: code, body, message } = err as { statusCode?: number; body?: string; message?: string };
    if (code === 404 || code === 410) return "gone";
    // Logged so a bad VAPID setup shows in the function logs; never the endpoint (it identifies the device).
    console.error("seat alert push failed:", code ?? "-", String(body || message).slice(0, 200));
    return "failed";
  }
}
