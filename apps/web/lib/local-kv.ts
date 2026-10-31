// The browser's localStorage as the key-value store app-core's logic expects.
import type { KeyValueStore } from "@turboterp/app-core/key-value-store";

export const localKv: KeyValueStore = {
  get: (key) => window.localStorage.getItem(key),
  set: (key, value) => window.localStorage.setItem(key, value),
  remove: (key) => window.localStorage.removeItem(key),
};
