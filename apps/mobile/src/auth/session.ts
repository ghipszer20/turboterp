import { useEffect, useState } from "react";
import { authConfigured, getAuthClient } from "./client";

export type SessionStatus = "loading" | "signed-out" | "signed-in";
export type SessionState = { status: SessionStatus; email: string | null; userId: string | null; provider: string | null };

type Sess = { user: { id?: string; email?: string | null; app_metadata?: { provider?: string } } };

/** `undefined` = not read yet, `null` = nobody is signed in. Mirrors the web's decideSession. */
export function decideSession(session: Sess | null | undefined): SessionState {
  if (session === undefined) return { status: "loading", email: null, userId: null, provider: null };
  if (session === null) return { status: "signed-out", email: null, userId: null, provider: null };
  return {
    status: "signed-in",
    email: session.user.email ?? null,
    userId: session.user.id ?? null,
    provider: session.user.app_metadata?.provider ?? null,
  };
}

/** Current sign-in state. When accounts aren't configured it stays "signed-out", so nothing waits on it. */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>(() => decideSession(authConfigured() ? undefined : null));
  useEffect(() => {
    if (!authConfigured()) return;
    let off: (() => void) | undefined;
    let cancelled = false;
    getAuthClient()
      .then((c) => {
        if (cancelled) return;
        void c.auth.getSession().then(({ data }) => {
          if (!cancelled) setState(decideSession(data.session));
        });
        const { data } = c.auth.onAuthStateChange((_e, session) => setState(decideSession(session)));
        off = () => data.subscription.unsubscribe();
      })
      .catch(() => {
        if (!cancelled) setState(decideSession(null));
      });
    return () => {
      cancelled = true;
      off?.();
    };
  }, []);
  return state;
}
