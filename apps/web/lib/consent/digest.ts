import type { SupabaseEnv } from "../email/rate-limit";
import type { EmailMessage, SendResult } from "../email/send";

// Server-only. The daily agreement-records email: yesterday's signatures as a CSV, plus a free-tier usage check.

export type DigestRow = {
  recorded_at: string;
  accepted_at: string;
  version: string;
  user_id: string | null;
  device_id: string;
  name_hash: string;
};
export type Usage = { db_bytes: number; documents: number; consents: number; accounts: number };

const DB_LIMIT_BYTES = 500e6;
const WARN_AT = 0.7;
const DAY_MS = 86_400_000;
const HEADER = "recorded_at,accepted_at,version,account_id,device_id,name_hash";

const cell = (v: string | null) => {
  const s = v ?? "";
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** The previous UTC day relative to `now`. */
export function previousUtcDay(now: Date) {
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const from = new Date(end - DAY_MS);
  return { day: from.toISOString().slice(0, 10), from: from.toISOString(), to: new Date(end).toISOString() };
}

export function buildConsentDigest(rows: DigestRow[], usage: Usage, day: string): { subject: string; text: string; csv: string } {
  const csv =
    [HEADER, ...rows.map((r) => [r.recorded_at, r.accepted_at, r.version, r.user_id, r.device_id, r.name_hash].map(cell).join(","))].join("\n") +
    "\n";
  const pct = Math.round((usage.db_bytes / DB_LIMIT_BYTES) * 100);
  const warn = usage.db_bytes / DB_LIMIT_BYTES >= WARN_AT;
  const subject = `${warn ? "WARNING database at " + pct + "% - " : ""}TurboTerp agreement records for ${day}`;
  const text = [
    rows.length === 0 ? `No new agreements on ${day}.` : `${rows.length} new agreement${rows.length === 1 ? "" : "s"} on ${day} (CSV attached).`,
    "",
    "Usage against the free tier:",
    `Database: ${(usage.db_bytes / 1e6).toFixed(1)} MB of 500 MB (${pct}%)${warn ? " - WARNING, over 70%" : ""}`,
    `Synced documents: ${usage.documents}`,
    `Agreement records: ${usage.consents}`,
    `Accounts: ${usage.accounts}`,
  ].join("\n");
  return { subject, text, csv };
}

export type DigestDeps = {
  recordsEmail: string | undefined;
  fetchRows: (fromIso: string, toIso: string) => Promise<DigestRow[]>;
  fetchUsage: () => Promise<Usage>;
  send: (msg: EmailMessage) => Promise<SendResult>;
  now: () => Date;
};

/** Sends the digest. Never throws: a failure here must not fail the snapshot job. */
export async function runDailyDigest(deps: DigestDeps): Promise<"sent" | "skipped" | "failed"> {
  if (!deps.recordsEmail) return "skipped";
  try {
    const { day, from, to } = previousUtcDay(deps.now());
    const [rows, usage] = await Promise.all([deps.fetchRows(from, to), deps.fetchUsage()]);
    const d = buildConsentDigest(rows, usage, day);
    const res = await deps.send({
      to: deps.recordsEmail,
      subject: d.subject,
      text: d.text,
      attachment: { name: `agreements-${day}.csv`, base64: Buffer.from(d.csv).toString("base64") },
    });
    return res.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

export function supabaseDigestSource(env: SupabaseEnv, fetchFn: typeof fetch = fetch) {
  const headers = { apikey: env.serviceKey, Authorization: `Bearer ${env.serviceKey}`, "content-type": "application/json" };
  return {
    async fetchRows(fromIso: string, toIso: string): Promise<DigestRow[]> {
      const q = `recorded_at=gte.${encodeURIComponent(fromIso)}&recorded_at=lt.${encodeURIComponent(toIso)}&order=recorded_at.asc&select=recorded_at,accepted_at,version,user_id,device_id,name_hash`;
      const res = await fetchFn(`${env.url}/rest/v1/consent_records?${q}`, { headers });
      if (!res.ok) throw new Error(`consent_records ${res.status}`);
      const rows = (await res.json()) as unknown;
      if (!Array.isArray(rows)) throw new Error("consent_records: unexpected answer");
      return rows as DigestRow[];
    },
    async fetchUsage(): Promise<Usage> {
      const res = await fetchFn(`${env.url}/rest/v1/rpc/usage_stats`, { method: "POST", headers, body: "{}" });
      if (!res.ok) throw new Error(`usage_stats ${res.status}`);
      return (await res.json()) as Usage;
    },
  };
}
