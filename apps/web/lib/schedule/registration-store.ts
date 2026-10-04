// The registration prep state in localStorage as an external store, shared by the Schedule
// panel and the Today countdown card.

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
    const raw = serializePrep(fn(parsePrep(prepStore.getSnapshot())));
    cache = raw;
    try {
      window.localStorage.setItem(PREP_KEY, raw);
    } catch {
      // storage blocked: kept in memory for this page
    }
    for (const l of listeners) l();
  },
};
