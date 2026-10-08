// The registration prep state in localStorage as an external store, shared by the Schedule
// panel and the Today countdown card.

import { localChanged } from "@/lib/sync/hooks";
import { PREP_KEY, parsePrep, serializePrep, type Prep } from "./registration";

const listeners = new Set<() => void>();
let cache: string | null | undefined;

function read(): string | null {
  try {
    return window.localStorage.getItem(PREP_KEY);
  } catch {
    return null;
  }
}

export const prepStore = {
  subscribe(onChange: () => void): () => void {
    listeners.add(onChange);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== PREP_KEY) return;
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
  getServerSnapshot: (): string | null => null,
  update(fn: (p: Prep) => Prep): void {
    prepStore.replace(serializePrep(fn(parsePrep(prepStore.getSnapshot()))));
    localChanged("registration");
  },
  /** Set or (with null) remove the stored prep without counting it as a student edit; account sync uses this. */
  replace(raw: string | null): void {
    cache = raw;
    try {
      if (raw === null) window.localStorage.removeItem(PREP_KEY);
      else window.localStorage.setItem(PREP_KEY, raw);
    } catch {
      // storage blocked: kept in memory for this page
    }
    for (const l of listeners) l();
  },
};
