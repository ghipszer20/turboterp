// The "turboterp-sync" localStorage key: which account this browser last synced with and the
// server version (rev) of each document it last saved or downloaded.

import type { DocKind } from "./decide";

export const SYNC_KEY = "turboterp-sync";

export type SyncMeta = { userId: string | null; revs: Partial<Record<DocKind, number>> };
export type MetaStore = { load(): SyncMeta; save(m: SyncMeta): void; clear(): void };

const KINDS: DocKind[] = ["plan", "schedule", "registration"];
const empty = (): SyncMeta => ({ userId: null, revs: {} });

function parse(raw: string | null): SyncMeta {
  if (!raw) return empty();
  try {
    const v = JSON.parse(raw) as { userId?: unknown; revs?: Record<string, unknown> };
    const revs: SyncMeta["revs"] = {};
    for (const k of KINDS) {
      const r = v.revs?.[k];
      if (typeof r === "number" && Number.isFinite(r)) revs[k] = r;
    }
    return { userId: typeof v.userId === "string" ? v.userId : null, revs };
  } catch {
    return empty();
  }
}

/** Reads and writes localStorage; if storage is blocked the value is kept in memory for this page. */
export function createMetaStore(): MetaStore {
  let memory: SyncMeta | null = null;
  return {
    load() {
      if (memory) return memory;
      try {
        return parse(window.localStorage.getItem(SYNC_KEY));
      } catch {
        return empty();
      }
    },
    save(m) {
      memory = m;
      try {
        window.localStorage.setItem(SYNC_KEY, JSON.stringify(m));
        memory = null;
      } catch {
        // blocked: stays in memory
      }
    },
    clear() {
      memory = null;
      try {
        window.localStorage.removeItem(SYNC_KEY);
      } catch {
        // blocked
      }
    },
  };
}
