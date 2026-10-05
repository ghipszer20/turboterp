export type SessionStatus = "loading" | "signed-out" | "signed-in";
export type SessionState = { status: SessionStatus; email: string | null };

/** `undefined` = the session hasn't been read yet, `null` = nobody is signed in. */
export function decideSession(session: { user: { email?: string | null } } | null | undefined): SessionState {
  if (session === undefined) return { status: "loading", email: null };
  if (session === null) return { status: "signed-out", email: null };
  return { status: "signed-in", email: session.user.email ?? null };
}

/** What the Advisor header shows: nothing (no accounts configured, or still loading), a "Sign in" offer, or the account. */
export function accountControl(configured: boolean, status: SessionStatus): "none" | "sign-in" | "account" {
  if (!configured || status === "loading") return "none";
  return status === "signed-in" ? "account" : "sign-in";
}
