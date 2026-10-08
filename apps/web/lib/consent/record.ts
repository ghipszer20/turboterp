import { createHmac } from "node:crypto";
import { CONSENT_VERSION } from "../advisor/consent";
import { checkAndRecord, hashKey, type SendStore, type SupabaseEnv } from "../email/rate-limit";

// Server-only handler for POST /api/consent, with its dependencies injected.
// Stores a keyed hash of the typed name, never the name itself.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DAY_MS = 86_400_000;

const normalise = (name: string) => name.trim().replace(/\s+/g, " ").toLowerCase();

/** HMAC-SHA256 hex of the name (trimmed, spaces collapsed, lowercased). Keyed so guessing names can't reverse it. */
export const nameHash = (name: string, secret: string) => createHmac("sha256", secret).update(normalise(name)).digest("hex");

export type ConsentRow = { userId: string | null; deviceId: string; version: string; acceptedAt: string; nameHash: string };

export type ConsentStore = {
  /** Attaches the user to an existing unlinked row for this device and version. True when a row was linked. */
  link(deviceId: string, version: string, userId: string): Promise<boolean>;
  insert(row: ConsentRow): Promise<void>;
};

export type ConsentDeps = {
  getUser: (token: string) => Promise<{ id: string; email: string } | null>;
  store: ConsentStore;
  limits: SendStore;
  secret: string;
  now: () => Date;
};

const json = (body: unknown, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function handleConsentRecord(request: Request, deps: ConsentDeps, ip = ""): Promise<Response> {
  if (!deps.secret) return json({ error: "not-configured" }, 503);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad-request" }, 400);
  }
  if (typeof body !== "object" || body === null) return json({ error: "bad-request" }, 400);
  const { name, version, acceptedAt, deviceId } = body as Record<string, unknown>;
  const accepted = typeof acceptedAt === "string" ? new Date(acceptedAt) : null;
  if (
    typeof name !== "string" ||
    normalise(name).length < 2 ||
    name.length > 200 ||
    version !== CONSENT_VERSION ||
    typeof deviceId !== "string" ||
    !UUID.test(deviceId) ||
    !accepted ||
    Number.isNaN(accepted.getTime()) ||
    Math.abs(accepted.getTime() - deps.now().getTime()) > DAY_MS
  ) {
    return json({ error: "bad-request" }, 400);
  }

  const verdict = await checkAndRecord(deps.limits, "consent", hashKey(ip || "unknown"), deps.now());
  if (verdict === "limited") return json({ error: "rate-limited" }, 429);
  if (verdict === "error") return json({ error: "unavailable" }, 503);

  const token = /^Bearer\s+(\S+)$/i.exec(request.headers.get("authorization") ?? "")?.[1];
  try {
    const user = token ? await deps.getUser(token).catch(() => null) : null;
    if (user && (await deps.store.link(deviceId, version, user.id))) return json({ ok: true }, 200);
    await deps.store.insert({
      userId: user?.id ?? null,
      deviceId,
      version,
      acceptedAt: accepted.toISOString(),
      nameHash: nameHash(name, deps.secret),
    });
  } catch {
    return json({ error: "unavailable" }, 503);
  }
  return json({ ok: true }, 200);
}

/** Supabase REST implementation (service role). */
export function supabaseConsentStore(env: SupabaseEnv, fetchFn: typeof fetch = fetch): ConsentStore {
  const table = `${env.url}/rest/v1/consent_records`;
  const headers = { apikey: env.serviceKey, Authorization: `Bearer ${env.serviceKey}`, "content-type": "application/json" };
  return {
    async link(deviceId, version, userId) {
      const q = `device_id=eq.${encodeURIComponent(deviceId)}&version=eq.${encodeURIComponent(version)}&user_id=is.null&select=id`;
      const res = await fetchFn(`${table}?${q}`, {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) throw new Error(`consent_records link failed: ${res.status}`);
      const rows = (await res.json()) as unknown;
      return Array.isArray(rows) && rows.length > 0;
    },
    async insert(row) {
      const res = await fetchFn(table, {
        method: "POST",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify({
          user_id: row.userId,
          device_id: row.deviceId,
          version: row.version,
          accepted_at: row.acceptedAt,
          name_hash: row.nameHash,
        }),
      });
      if (!res.ok) throw new Error(`consent_records insert failed: ${res.status}`);
    },
  };
}
