// Accounts take any email address (owner, 2026-10-04: TurboTerp is an unofficial student project,
// not tied to a UMD account). This is only a typo check; Supabase confirms the address by emailing the link.

export function isEmail(email: string): boolean {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) return false;
  const [name, domain] = parts;
  if (name === "" || /\s/.test(name) || /\s/.test(domain)) return false;
  const labels = domain.split(".");
  return labels.length >= 2 && labels.every((l) => l !== "");
}

export function emailProblem(email: string): string | null {
  return isEmail(email) ? null : "Enter a valid email address.";
}

/** What to tell the student when the sign-in email couldn't be sent. */
export function sendProblem(error: unknown): string {
  const e = (error ?? {}) as { status?: number; code?: string };
  return e.status === 429 || e.code === "over_email_send_rate_limit"
    ? "Too many sign-in emails were just sent. Wait a few minutes, then try again."
    : "We couldn't send the link. Try again in a moment.";
}

/** The emailed one-time code, without the spaces or dashes people copy along with it. */
export function normalizeCode(input: string): string {
  return input.replace(/[\s-]/g, "");
}

/** Supabase's code length setting can be 6 to 10 digits. */
export function codeProblem(code: string): string | null {
  return /^\d{6,10}$/.test(normalizeCode(code)) ? null : "Enter the digits from the email (6 to 10 numbers).";
}

/** What to tell the student when the typed code was refused. */
export function verifyProblem(error: unknown): string {
  const e = (error ?? {}) as { status?: number; code?: string };
  if (e.status === 429) return sendProblem(error);
  if (e.code === "otp_expired" || e.status === 400 || e.status === 403) return "That code didn't work. Check it, or send a new email.";
  return "We couldn't check the code. Try again in a moment.";
}
