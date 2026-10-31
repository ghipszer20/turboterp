import { createKeyValueStore } from "./kv-store";

// The web export only exists for screenshots: use the browser's localStorage instead of expo-sqlite,
// whose web build needs a wasm worker Metro can't resolve here. Metro picks this file over storage.ts on web.
const memory = new Map<string, string>();
const local = typeof localStorage === "undefined" ? null : localStorage;

/** The app's persistent key-value store (the Advisor's state, preferences). */
export const kvStore = createKeyValueStore({
  getItemSync: (key) => (local ? local.getItem(key) : (memory.get(key) ?? null)),
  setItemSync: (key, value) => (local ? local.setItem(key, value) : void memory.set(key, value)),
  removeItemSync: (key) => (local ? local.removeItem(key) : void memory.delete(key)),
});
