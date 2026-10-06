// Browser-side wording for the "Email to me" result, from the /api/email/plan status.
export function emailErrorText(status: number, code?: string): string {
  if (status === 429) return "You've emailed your plan 5 times today. Try again tomorrow.";
  if (status === 503 && code === "not-configured") return "Emailing isn't available yet.";
  if (status === 401) return "Sign in again to email your plan.";
  return "Couldn't email your plan. Try again.";
}
