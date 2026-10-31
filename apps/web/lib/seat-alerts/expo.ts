// Expo push (iOS app) for Seat Alerts. Server-only, no Node or Deno specifics, so the Next route and the
// Supabase Edge Function share it. Types are local on purpose: the Edge import map maps "./push" to nothing.

export const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
export const EXPO_BATCH = 100;

export type ExpoPayload = { title: string; body: string; url?: string; watchId?: string; token?: string };
export type ExpoMessage = { token: string; payload: ExpoPayload };
export type ExpoResult = "ok" | "gone" | "failed";

/** `ExponentPushToken[...]` (or the older `ExpoPushToken[...]`). */
export const isExpoToken = (t: unknown): t is string => typeof t === "string" && t.length <= 200 && /^Expo(nent)?PushToken\[[A-Za-z0-9_-]{8,}\]$/.test(t);

const toMessage = (m: ExpoMessage) => ({
  to: m.token,
  title: m.payload.title,
  body: m.payload.body,
  sound: "default",
  priority: "high",
  ttl: 900,
  // Tapping opens Drop/Add: the app reads `url` from the notification data.
  data: { url: m.payload.url, watchId: m.payload.watchId, token: m.payload.token },
});

/** Sends in batches of 100 (one request each). "gone" = Expo says DeviceNotRegistered: delete the device. Never throws. */
export async function sendExpoBatch(messages: ExpoMessage[], fetchFn: typeof fetch = fetch): Promise<ExpoResult[]> {
  const out: ExpoResult[] = [];
  for (let i = 0; i < messages.length; i += EXPO_BATCH) {
    const chunk = messages.slice(i, i + EXPO_BATCH);
    try {
      const res = await fetchFn(EXPO_PUSH_URL, {
        method: "POST",
        headers: { accept: "application/json", "content-type": "application/json" },
        body: JSON.stringify(chunk.map(toMessage)),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const body = (await res.json()) as { data?: { status?: string; details?: { error?: string } }[] };
      const tickets = body.data;
      if (!Array.isArray(tickets) || tickets.length !== chunk.length) throw new Error("unexpected answer");
      for (const t of tickets) out.push(t.status === "ok" ? "ok" : t.details?.error === "DeviceNotRegistered" ? "gone" : "failed");
    } catch (err) {
      // Never the token (it identifies the device).
      console.error("seat alert expo push failed:", String((err as Error)?.message ?? err).slice(0, 200));
      for (let k = 0; k < chunk.length; k++) out.push("failed");
    }
  }
  return out;
}

export async function sendExpoPush(token: string, payload: ExpoPayload, fetchFn: typeof fetch = fetch): Promise<ExpoResult> {
  return (await sendExpoBatch([{ token, payload }], fetchFn))[0]!;
}
