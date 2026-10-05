// Accounts take any email address (owner, 2026-10-04: TurboTerp is an unofficial student project,
// not tied to a UMD account). This is only a typo check; Supabase confirms the address by emailing the link.

export function isEmail(email: string): boolean {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) return false;
  const [name, domain] = parts;
  if (name === "" || /s/.test(name) || /s/.test(domain)) return false;
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
