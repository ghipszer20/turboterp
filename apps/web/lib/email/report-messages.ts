// Client-safe: turns the /api/report answer into the plain-language text the form shows.

export function reportOutcome(status: number, error: string | null): { ok: boolean; message: string } {
  if (status === 200) return { ok: true, message: "Sent. Thanks!" };
  if (status === 429) return { ok: false, message: "Too many reports from here just now. Try again later." };
  if (status === 503 && error === "not-configured") {
    return { ok: false, message: "Sending reports isn't available yet. Your text is still here." };
  }
  if (status === 400) return { ok: false, message: "Check your report and your email address, then try again." };
  return { ok: false, message: "We couldn't send that. Your text is still here. Try again in a moment." };
}
