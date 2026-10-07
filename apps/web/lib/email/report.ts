import { isEmail } from "../auth/email";
import { checkAndRecord, hashKey, type SendStore } from "./rate-limit";
import type { EmailMessage, SendResult } from "./send";

// Server-only handler for POST /api/report, with its dependencies injected.

export type ReportInput = { what: string; page: string; replyTo?: string };

export function validateReport(body: unknown): { ok: true; value: ReportInput } | { ok: false } {
  if (typeof body !== "object" || body === null) return { ok: false };
  const b = body as Record<string, unknown>;
  const optional = (v: unknown) => (v === undefined || v === null ? "" : typeof v === "string" ? v.trim() : null);
  const what = typeof b.what === "string" ? b.what.trim() : "";
  const page = optional(b.page);
  const replyTo = optional(b.replyTo);
  if (what.length < 1 || what.length > 5000) return { ok: false };
  if (page === null || page.length > 200) return { ok: false };
  if (replyTo === null || (replyTo !== "" && !isEmail(replyTo))) return { ok: false };
  return { ok: true, value: { what, page, ...(replyTo ? { replyTo } : {}) } };
}

export type ReportDeps = {
  send: (msg: EmailMessage) => Promise<SendResult>;
  /** null when the Supabase service settings are missing. */
  store: SendStore | null;
  to: string | undefined;
  now: () => Date;
};

const json = (body: unknown, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const NOT_CONFIGURED = () => json({ error: "not-configured" }, 503);

export async function handleReport(request: Request, deps: ReportDeps): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad-request" }, 400);
  }
  // Hidden trap field: bots fill it in. Pretend it worked and send nothing.
  if (typeof body === "object" && body !== null && (body as Record<string, unknown>).website) return json({ ok: true }, 200);

  const v = validateReport(body);
  if (!v.ok) return json({ error: "bad-request" }, 400);
  if (!deps.to || !deps.store) return NOT_CONFIGURED();

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const now = deps.now();
  const verdict = await checkAndRecord(deps.store, "report", hashKey(ip), now);
  if (verdict === "limited") return json({ error: "rate-limited" }, 429);
  if (verdict === "error") return json({ error: "unavailable" }, 503);

  const { what, page, replyTo } = v.value;
  const result = await deps.send({
    to: deps.to,
    subject: `TurboTerp report: ${what.slice(0, 60)}`,
    text: [`What happened:\n${what}`, `Page: ${page || "(not given)"}`, `Reply email: ${replyTo ?? "(not given)"}`, `Sent: ${now.toISOString()}`].join("\n\n"),
    replyTo,
  });
  if (result.ok) return json({ ok: true }, 200);
  if (result.reason === "not-configured") return NOT_CONFIGURED();
  return json({ error: "send-failed" }, 502);
}
