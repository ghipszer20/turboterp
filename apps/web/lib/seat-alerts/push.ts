import webpush from "web-push";
import type { PushSub } from "./store";

// Server-only. VAPID keys live only in env (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT).

export type PushResult = "ok" | "gone" | "failed";
type Send = (sub: { endpoint: string; keys: { p256dh: string; auth: string } }, payload: string) => Promise<{ statusCode: number }>;

export function vapidConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT);
}

let vapidSet = false;
function ensureVapid() {
  if (vapidSet) return;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  vapidSet = true;
}

const defaultSend: Send = (sub, payload) => {
  ensureVapid();
  return webpush.sendNotification(sub, payload, { TTL: 900 });
};

/** "gone" (404 or 410) means the browser dropped the subscription: delete it. */
export type PushPayload = { title: string; body: string; url?: string; watchId?: string; token?: string };

export async function sendPush(sub: PushSub, payload: PushPayload, send: Send = defaultSend): Promise<PushResult> {
  try {
    const res = await send({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload));
    return res.statusCode >= 200 && res.statusCode < 300 ? "ok" : "failed";
  } catch (err) {
    const code = (err as { statusCode?: number }).statusCode;
    return code === 404 || code === 410 ? "gone" : "failed";
  }
}
