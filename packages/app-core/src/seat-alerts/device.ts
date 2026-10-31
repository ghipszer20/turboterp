// Device registration for the iOS app. A device is "<deviceId>.<secret>" from POST /api/seat-alerts/device:
// 201 for a new device, 200 when a known device re-registers (it sends its token and a fresh push token).

import type { SeatAlertsApi } from "./client";

export type TokenStore = {
  get(): Promise<string | null>;
  set(token: string): Promise<void>;
};

export type RegisterResult = { ok: true; token: string; isNew: boolean } | { ok: false; error: string };

/** Register (or re-register) this iPhone with its Expo push token, and keep the credential the server returns. */
export async function registerIosDevice(api: SeatAlertsApi, store: TokenStore, expoToken: string): Promise<RegisterResult> {
  const saved = await api.request<{ token?: string }>("/api/seat-alerts/device", { method: "POST", body: { platform: "ios", expoToken } });
  if (!saved.ok || !saved.data.token) return { ok: false, error: saved.ok ? "no-token" : saved.error };
  const previous = await store.get();
  if (previous !== saved.data.token) await store.set(saved.data.token);
  return { ok: true, token: saved.data.token, isNew: previous === null };
}
