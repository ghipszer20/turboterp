"use client";

import { useEffect, useState } from "react";
import { authConfigured, getAuthClient } from "./client";
import { decideSession, type SessionState } from "./session-state";

/** Current sign-in state. When auth isn't configured it stays "loading"; callers check authConfigured() first. */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>(() => decideSession(undefined));
  useEffect(() => {
    if (!authConfigured()) return;
    let off: (() => void) | undefined;
    let cancelled = false;
    getAuthClient()
      .then((c) => {
        if (cancelled) return;
        c.auth.getSession().then(({ data }) => {
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
