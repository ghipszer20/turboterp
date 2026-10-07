import { FOOTER } from "../advisor/export/plan-export";
import { checkAndRecord, hashKey, type SendStore, type SupabaseEnv } from "./rate-limit";
import type { EmailMessage, SendResult } from "./send";

// Server-only handler for POST /api/email/plan, with its dependencies injected.

export const MAX_PDF_BYTES = 2 * 1024 * 1024;
export const MAX_SUMMARY_LINES = 40;
export const MAX_LINE_CHARS = 200;

export type PlanEmailInput = { pdfBase64: string; summary: string[] };

export function validatePlanEmail(body: unknown): { ok: true; value: PlanEmailInput } | { ok: false } {
  if (typeof body !== "object" || body === null) return { ok: false };
  const b = body as Record<string, unknown>;
  const { pdfBase64, summary } = b;
  if (typeof pdfBase64 !== "string" || pdfBase64.length === 0) return { ok: false };
  if (!Array.isArray(summary) || summary.length > MAX_SUMMARY_LINES) return { ok: false };
  if (!summary.every((l) => typeof l === "string" && l.length <= MAX_LINE_CHARS)) return { ok: false };
  // Cheap bound before decoding: base64 is 4 chars per 3 bytes.
  if (pdfBase64.length > Math.ceil((MAX_PDF_BYTES * 4) / 3) + 4) return { ok: false };
  const bytes = Buffer.from(pdfBase64, "base64");
  if (bytes.length > MAX_PDF_BYTES || bytes.subarray(0, 5).toString("latin1") !== "%PDF-") return { ok: false };
  return { ok: true, value: { pdfBase64, summary: summary as string[] } };
}

export type PlanUser = { id: string; email: string };

export type PlanEmailDeps = {
  /** Resolves a Supabase access token to its user, or null when the token is bad. */
  getUser: (token: string) => Promise<PlanUser | null>;
  send: (msg: EmailMessage) => Promise<SendResult>;
  /** null when the Supabase service settings are missing. */
  store: SendStore | null;
  now: () => Date;
};

const json = (body: unknown, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function handlePlanEmail(request: Request, deps: PlanEmailDeps): Promise<Response> {
  const token = /^Bearer\s+(\S+)$/i.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!token) return json({ error: "unauthorized" }, 401);
  let user: PlanUser | null;
  try {
    user = await deps.getUser(token);
  } catch {
    return json({ error: "unavailable" }, 503);
  }
  if (!user || !user.email) return json({ error: "unauthorized" }, 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad-request" }, 400);
  }
  const v = validatePlanEmail(body);
  if (!v.ok) return json({ error: "bad-request" }, 400);
  if (!deps.store) return json({ error: "unavailable" }, 503);

  const verdict = await checkAndRecord(deps.store, "plan", hashKey(user.id), deps.now());
  if (verdict === "limited") return json({ error: "rate-limited" }, 429);
  if (verdict === "error") return json({ error: "unavailable" }, 503);

  const result = await deps.send({
    to: user.email,
    subject: "Your TurboTerp 4-year plan",
    text: [...v.value.summary, "", FOOTER].join("\n"),
    attachment: { name: "turboterp-plan.pdf", base64: v.value.pdfBase64 },
  });
  if (result.ok) return json({ ok: true, email: user.email }, 200);
  if (result.reason === "not-configured") return json({ error: "not-configured" }, 503);
  return json({ error: "send-failed" }, 502);
}

/** Checks an access token against Supabase Auth's REST endpoint (GET /auth/v1/user). */
export function supabaseGetUser(env: SupabaseEnv, fetchFn: typeof fetch = fetch): PlanEmailDeps["getUser"] {
  return async (token) => {
    const res = await fetchFn(`${env.url}/auth/v1/user`, { headers: { apikey: env.serviceKey, Authorization: `Bearer ${token}` } });
    if (res.status === 401 || res.status === 403) return null;
    if (!res.ok) throw new Error(`auth ${res.status}`);
    const u = (await res.json()) as { id?: unknown; email?: unknown };
    return typeof u.id === "string" && typeof u.email === "string" ? { id: u.id, email: u.email } : null;
  };
}
