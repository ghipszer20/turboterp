// Sign-in is for UMD students, whose mailboxes are @terpmail.umd.edu (owner, 2026-10-04: not
// plain @umd.edu). The server enforces the same rule (supabase/migrations).

const STUDENT_DOMAIN = "terpmail.umd.edu";

export function isUmdEmail(email: string): boolean {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) return false;
  const [name, domain] = parts;
  return name !== "" && !/\s/.test(name) && domain === STUDENT_DOMAIN;
}

export function emailProblem(email: string): string | null {
  return isUmdEmail(email) ? null : "Use your @terpmail.umd.edu address.";
}

/** What to tell the student when the sign-in email couldn't be sent. */
export function sendProblem(error: unknown): string {
  const e = (error ?? {}) as { status?: number; code?: string };
  return e.status === 429 || e.code === "over_email_send_rate_limit"
    ? "Too many sign-in emails were just sent. Wait a few minutes, then try again."
    : "We couldn't send the link. Try again in a moment.";
}
