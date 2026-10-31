// The signed agreement's store and sender without React Native imports (unit-testable in Node).
// Same storage key and record format as the web (apps/web/app/advisor/store.ts).
import { CONSENT_STORAGE_KEY, parseConsent, type ConsentRecord } from "@turboterp/app-core/consent";
import { syncConsent, type ConsentSession } from "@turboterp/app-core/consent-send";
import { kvGet, kvSet, type KeyValueStore } from "@turboterp/app-core/key-value-store";
import { apiHeaders, apiUrl, config, type AppConfig } from "../config";

export interface ConsentStore {
  get(): ConsentRecord | null;
  subscribe(listener: () => void): () => void;
  /** The student signed: stores the record (with a device id) and tells the sender. */
  save(record: ConsentRecord): void;
  /** Store a record as is (the server confirmed it was recorded or linked). Not a signature. */
  update(record: ConsentRecord): void;
}

export function createConsentStore(deps: { kv: KeyValueStore; onSaved: () => void; newId?: () => string }): ConsentStore {
  let record: ConsentRecord | null | undefined;
  const listeners = new Set<() => void>();
  const newId = deps.newId ?? (() => globalThis.crypto.randomUUID());
  const store: ConsentStore = {
    get: () => (record === undefined ? (record = parseConsent(kvGet(deps.kv, CONSENT_STORAGE_KEY))) : record),
    subscribe(l) {
      listeners.add(l);
      return () => void listeners.delete(l);
    },
    update(next) {
      kvSet(deps.kv, CONSENT_STORAGE_KEY, JSON.stringify(next));
      record = next;
      listeners.forEach((l) => l());
    },
    save(next) {
      store.update({ ...next, deviceId: next.deviceId ?? newId() });
      deps.onSaved();
    },
  };
  return store;
}

/** POST the record to /api/consent at the API base, carrying the site-lock header. */
export function sendConsentRecord(
  record: ConsentRecord,
  session: ConsentSession,
  fetchFn: typeof fetch = fetch,
  cfg: AppConfig = config,
): Promise<ConsentRecord | null> {
  const wrapped = ((path: string, init?: RequestInit) =>
    fetchFn(apiUrl(path, cfg), {
      ...init,
      headers: { ...(init?.headers as Record<string, string> | undefined), ...apiHeaders(cfg) },
    })) as unknown as typeof fetch;
  return syncConsent(record, session, wrapped);
}
