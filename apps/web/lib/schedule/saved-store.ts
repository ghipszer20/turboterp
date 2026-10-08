// The saved schedule in localStorage, as an external store (useSyncExternalStore), so every
// component sees the same value and other tabs' changes arrive too.

import { localChanged } from "@/lib/sync/hooks";
import { SAVED_KEY } from "./saved";

/** What the server (and the first client render) sees: storage isn't readable yet. */
export const NOT_LOADED = "\u0000not-loaded";

const listeners = new Set<() => void>();
let cache: string | null | undefined;

function read(): string | null {
  try {
    return window.localStorage.getItem(SAVED_KEY);
  } catch {
    return null; // storage blocked: the schedule lasts for this page only
  }
}

export const savedStore = {
  subscribe(onChange: () => void): () => void {
    listeners.add(onChange);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== SAVED_KEY) return;
      cache = undefined;
      onChange();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot(): string | null {
    if (cache === undefined) cache = read();
    return cache;
  },
  getServerSnapshot(): string | null {
    return NOT_LOADED;
  },
  write(raw: string): void {
    savedStore.replace(raw);
    localChanged("schedule");
  },
  /** Set or (with null) remove the stored schedule without counting it as a student edit; account sync uses this. */
  replace(raw: string | null): void {
    cache = raw;
    try {
      if (raw === null) window.localStorage.removeItem(SAVED_KEY);
      else window.localStorage.setItem(SAVED_KEY, raw);
    } catch {
      // storage blocked: keep it in memory
    }
    for (const l of listeners) l();
  },
};
