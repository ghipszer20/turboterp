import type { KeyValueStore } from "@turboterp/app-core/key-value-store";

/** The slice of expo-sqlite/kv-store we use (its default export is the synchronous Storage). */
export interface SyncStorage {
  getItemSync(key: string): string | null;
  setItemSync(key: string, value: string): void;
  removeItemSync(key: string): void;
}

/** app-core's KeyValueStore over a synchronous storage (expo-sqlite/kv-store in the app). */
export function createKeyValueStore(storage: SyncStorage): KeyValueStore {
  return {
    get: (key) => storage.getItemSync(key),
    set: (key, value) => storage.setItemSync(key, value),
    remove: (key) => storage.removeItemSync(key),
  };
}
