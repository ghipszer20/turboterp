import { createHash } from "node:crypto";

// Server-only. Per-key send limits, stored in the email_sends table (supabase/migrations/0006_email_sends.sql).
// Keys are SHA-256 hashes (of the IP for reports, the user id for plan emails), never the raw value.

export type SendKind = "report" | "plan";

export const LIMITS: Record<SendKind, { max: number; windowMs: number }> = {
  report: { max: 5, windowMs: 3600_000 },
  plan: { max: 5, windowMs: 86_400_000 },
};

const DAY_MS = 86_400_000;

export const hashKey = (raw: string) => createHash("sha256").update(raw).digest("hex");

export type SendStore = {
  /** Sends of this kind by this key since `since`. */
  count(kind: SendKind, key: string, since: Date): Promise<number>;
  record(kind: SendKind, key: string, now: Date): Promise<void>;
};

/** Decides and records. A store error returns "error": the caller must refuse the send (fail closed). */
export async function checkAndRecord(
  store: SendStore,
  kind: SendKind,
  key: string,
  now: Date,
): Promise<"ok" | "limited" | "error"> {
  const { max, windowMs } = LIMITS[kind];
  try {
    const n = await store.count(kind, key, new Date(now.getTime() - windowMs));
    if (n >= max) return "limited";
    await store.record(kind, key, now);
    return "ok";
  } catch {
    return "error";
  }
}

export type SupabaseEnv = { url: string; serviceKey: string };

export function supabaseEnv(env: NodeJS.ProcessEnv = process.env): SupabaseEnv | null {
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  return url && serviceKey ? { url: url.replace(/\/$/, ""), serviceKey } : null;
}

export function supabaseSendStore(env: SupabaseEnv, fetchFn: typeof fetch = fetch): SendStore {
  const table = `${env.url}/rest/v1/email_sends`;
  const headers = { apikey: env.serviceKey, Authorization: `Bearer ${env.serviceKey}`, "content-type": "application/json" };
  const call = async (url: string, init: RequestInit) => {
    const res = await fetchFn(url, { ...init, headers: { ...headers, ...init.headers } });
    if (!res.ok) throw new Error(`email_sends ${init.method ?? "GET"} failed: ${res.status}`);
    return res;
  };
  return {
    async count(kind, key, since) {
      const q = `kind=eq.${encodeURIComponent(kind)}&key=eq.${encodeURIComponent(key)}&at=gte.${encodeURIComponent(since.toISOString())}&select=at`;
      const rows = (await (await call(`${table}?${q}`, { method: "GET" })).json()) as unknown;
      if (!Array.isArray(rows)) throw new Error("email_sends: unexpected answer");
      return rows.length;
    },
    async record(kind, key, now) {
      await call(table, {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ kind, key, at: now.toISOString() }),
      });
      // Housekeeping: drop rows older than a day whenever a new one is written.
      await call(`${table}?at=lt.${encodeURIComponent(new Date(now.getTime() - DAY_MS).toISOString())}`, { method: "DELETE" });
    },
  };
}
