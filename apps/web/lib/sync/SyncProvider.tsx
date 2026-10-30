"use client";

import { useEffect, useRef } from "react";
import { KeepWhichCopy } from "@/app/advisor/KeepWhichCopy";
import { getConsent, updateConsent } from "@/app/advisor/store";
import { syncConsent } from "@/lib/advisor/consent-send";
import { authConfigured, getAuthClient } from "@/lib/auth/client";
import { useSession } from "@/lib/auth/use-session";
import { getAppSync } from "./app-sync";
import { setConsentSavedListener } from "./hooks";

let consentBusy = false;

/** Send (or link) the signed agreement when it needs it. Quiet on any failure. */
async function runConsentSync() {
  const record = getConsent();
  if (!record || consentBusy) return;
  consentBusy = true;
  try {
    let userId: string | null = null;
    let token: string | null = null;
    if (authConfigured()) {
      try {
        const { data } = await (await getAuthClient()).auth.getSession();
        userId = data.session?.user.id ?? null;
        token = data.session?.access_token ?? null;
      } catch {
        // send without an account
      }
    }
    const next = await syncConsent(record, { userId, token });
    if (next) updateConsent(next);
  } finally {
    consentBusy = false;
  }
}

/** Mounted once in the root layout: starts account sync when signed in, sends the agreement record. */
export function SyncProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const configured = authConfigured();
  const sessionKey = configured ? `${session.status}:${session.userId}` : "none";
  const consentFor = useRef<string | null>(null);

  useEffect(() => {
    setConsentSavedListener(() => void runConsentSync());
    return () => setConsentSavedListener(null);
  }, []);

  // On load (once per sign-in state): an unsent agreement goes out; after sign-in it is linked.
  useEffect(() => {
    if (configured && session.status === "loading") return;
    if (consentFor.current === sessionKey) return;
    consentFor.current = sessionKey;
    void runConsentSync();
  }, [configured, session.status, sessionKey]);

  useEffect(() => {
    if (!configured || session.status !== "signed-in" || !session.userId) return;
    const { engine } = getAppSync();
    void engine.start(session.userId);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void engine.checkRemote();
      else void engine.flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      engine.stop(false);
    };
  }, [configured, session.status, session.userId]);

  return (
    <>
      {children}
      {configured ? <KeepWhichCopy /> : null}
    </>
  );
}
