// The small synchronous key-value store the Advisor's persisted state goes through. The web app
// passes a localStorage-backed one; the iOS app passes expo-sqlite/kv-store. Stored keys and
// formats are unchanged. Implementations may throw (blocked storage); use the safe helpers below.
export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

/** Read a key; null when it is missing or the store throws. */
export function kvGet(store: KeyValueStore, key: string): string | null {
  try {
    return store.get(key);
  } catch {
    return null;
  }
}

/** Write a key (null removes it); a throwing store is ignored, so state lasts for the session only. */
export function kvSet(store: KeyValueStore, key: string, value: string | null): void {
  try {
    if (value === null) store.remove(key);
    else store.set(key, value);
  } catch {
    // Storage blocked: nothing persists.
  }
}
