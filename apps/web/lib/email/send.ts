// Server-only: sends plain-text mail through Brevo's HTTP API (no SDK). Settings and fetch are injectable so tests never send real mail.

export type EmailSettings = { apiKey?: string; from?: string };
export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  attachment?: { name: string; base64: string };
};
export type SendResult = { ok: true } | { ok: false; reason: "not-configured" | "rejected" | "network" };
export type SendDeps = { fetch?: typeof fetch; settings?: EmailSettings };

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

export function envEmailSettings(): EmailSettings {
  return { apiKey: process.env.BREVO_API_KEY, from: process.env.EMAIL_FROM };
}

export async function sendEmail(msg: EmailMessage, deps: SendDeps = {}): Promise<SendResult> {
  const { apiKey, from } = deps.settings ?? envEmailSettings();
  if (!apiKey || !from) return { ok: false, reason: "not-configured" };
  const body = {
    sender: { name: "TurboTerp", email: from },
    to: [{ email: msg.to }],
    subject: msg.subject,
    textContent: msg.text,
    ...(msg.replyTo ? { replyTo: { email: msg.replyTo } } : {}),
    ...(msg.attachment ? { attachment: [{ name: msg.attachment.name, content: msg.attachment.base64 }] } : {}),
  };
  try {
    const res = await (deps.fetch ?? fetch)(BREVO_URL, {
      method: "POST",
      headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok ? { ok: true } : { ok: false, reason: "rejected" };
  } catch {
    return { ok: false, reason: "network" };
  }
}
