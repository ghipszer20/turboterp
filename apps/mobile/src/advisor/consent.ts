// The app's signed-agreement store and the quiet sender (React Native side).
import { useEffect, useSyncExternalStore } from "react";
import { hasConsent, type ConsentRecord } from "@turboterp/app-core/consent";
import { authConfigured, config } from "../config";
import { getAuthClient } from "../auth/client";
import { kvStore } from "../storage";
import { createConsentStore, sendConsentRecord } from "./consent-core";

let busy = false;

/** Send (or link) the signed agreement when it needs it. Quiet on any failure. */
export async function runConsentSync(): Promise<void> {
  const record = consentStore.get();
  if (!record || busy) return;
  busy = true;
  try {
    let userId: string | null = null;
    let token: string | null = null;
    if (authConfigured(config)) {
      try {
        const { data } = await (await getAuthClient()).auth.getSession();
        userId = data.session?.user.id ?? null;
        token = data.session?.access_token ?? null;
      } catch {
        // send without an account
      }
    }
    const next = await sendConsentRecord(record, { userId, token });
    if (next) consentStore.update(next);
  } finally {
    busy = false;
  }
}

export const consentStore = createConsentStore({ kv: kvStore, onSaved: () => void runConsentSync() });

export const useConsent = (): ConsentRecord | null => useSyncExternalStore(consentStore.subscribe, consentStore.get, consentStore.get);

/** True once the student has signed the current wording. Also retries an unsent record on mount. */
export function useHasConsent(): boolean {
  const record = useConsent();
  useEffect(() => void runConsentSync(), []);
  return hasConsent(record);
}
