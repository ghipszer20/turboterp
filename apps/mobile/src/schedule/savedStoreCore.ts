// One in-memory copy of the term's saved schedule (web format, kv key `turboterp-schedule`) shared by
// the search screen and the builder, so neither overwrites the other's changes. Writes go straight
// through to the kv store. Pure (the store is injected) so it runs in Node tests.
import { parseSaved, SAVED_KEY, serializeSaved, type SavedSchedule } from "@turboterp/app-core/schedule/saved";

export type KvLike = { get(key: string): string | null; set(key: string, value: string): void };

export type SavedStore = {
  get(term: string): SavedSchedule;
  update(term: string, fn: (s: SavedSchedule) => SavedSchedule): SavedSchedule;
  subscribe(listener: () => void): () => void;
};

export function createSavedStore(kv: KvLike): SavedStore {
  const cells = new Map<string, SavedSchedule>();
  const listeners = new Set<() => void>();

  function get(term: string): SavedSchedule {
    let saved = cells.get(term);
    if (!saved) {
      let raw: string | null = null;
      try {
        raw = kv.get(SAVED_KEY);
      } catch {
        raw = null;
      }
      saved = parseSaved(raw, term);
      cells.set(term, saved);
    }
    return saved;
  }

  return {
    get,
    update(term, fn) {
      const next = fn(get(term));
      cells.set(term, next);
      try {
        kv.set(SAVED_KEY, serializeSaved(next));
      } catch {
        // Still works for this session when the store is unavailable.
      }
      for (const l of listeners) l();
      return next;
    },
    subscribe(l) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}
