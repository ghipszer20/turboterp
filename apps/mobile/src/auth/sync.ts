// Account sync on the phone: app-core's engine over the app's key-value store and a Supabase remote.
// Same behavior as the web (apps/web/lib/sync/app-sync.ts): the newest change wins, and the only
// question is one "Replace it?" when the phone's copy and the account's copy have never been synced.
import type { KeyValueStore } from "@turboterp/app-core/key-value-store";
import { kvGet, kvSet } from "@turboterp/app-core/key-value-store";
import { DOC_KINDS, type DocKind } from "@turboterp/app-core/sync/decide";
import { createSyncEngine } from "@turboterp/app-core/sync/engine";
import { createMetaStore, type MetaStore } from "@turboterp/app-core/sync/meta";
import type { Remote } from "@turboterp/app-core/sync/remote";
import { createSaveStatus } from "@turboterp/app-core/sync/status";
import { isValidSaved, SAVED_KEY } from "@turboterp/app-core/schedule/saved";
import { PLAN_STORAGE_KEY, parsePlan } from "@turboterp/app-core/storage";

export type Ask = { kind: DocKind; local: string | null; remote: string };

export interface SyncDeps {
  kv: KeyValueStore;
  remote: Remote;
  now?: () => number;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (h: unknown) => void;
  /** Fires when the phone is back online or the app returns to the foreground. */
  listenOnline?: (cb: () => void) => () => void;
}

export function createDocAdapters(kv: KeyValueStore) {
  const doc = (key: string, validate: (raw: string) => boolean) => ({
    read: () => kvGet(kv, key),
    replace: (raw: string | null) => kvSet(kv, key, raw), // not a student edit: no re-save
    validate,
  });
  return {
    plan: doc(PLAN_STORAGE_KEY, (raw) => parsePlan(raw) !== null),
    schedule: doc(SAVED_KEY, isValidSaved),
  };
}

export function createMobileSync(deps: SyncDeps) {
  const baseMeta = createMetaStore(deps.kv);
  const status = createSaveStatus(() => baseMeta.load().dirty ?? []);
  const meta: MetaStore = {
    load: () => baseMeta.load(),
    save: (m) => (baseMeta.save(m), status.notify()),
    clear: () => (baseMeta.clear(), status.notify()),
  };

  let asks: readonly Ask[] = [];
  const subs = new Set<() => void>();
  const setAsks = (next: readonly Ask[]) => {
    asks = next;
    subs.forEach((s) => s());
  };

  const engine = createSyncEngine({
    remote: deps.remote,
    meta,
    docs: createDocAdapters(deps.kv),
    now: deps.now ?? (() => Date.now()),
    setTimer: deps.setTimer ?? ((fn, ms) => setTimeout(fn, ms)),
    clearTimer: deps.clearTimer ?? ((h) => clearTimeout(h as ReturnType<typeof setTimeout>)),
    listenOnline: deps.listenOnline ?? (() => () => undefined),
    onAsk: (kind, local, remote) => setAsks([...asks.filter((a) => a.kind !== kind), { kind, local, remote }]),
    onError: (kind) => status.onError(kind),
  });

  return {
    engine,
    status,
    getAsks: () => asks,
    subscribeAsks(fn: () => void) {
      subs.add(fn);
      return () => void subs.delete(fn);
    },
    /** Call after the student (not the account) changed a document. */
    localChanged(kind: DocKind) {
      engine.localChanged(kind);
      status.localChanged(kind);
    },
    /** The answer in the "Replace it?" dialog (the dialog is the confirmation). */
    async resolve(kind: DocKind, keep: "local" | "remote") {
      setAsks(asks.filter((a) => a.kind !== kind));
      await engine.resolve(kind, keep);
    },
    /** Sign out: synced copies leave this phone first, then the caller ends the session. */
    stopAndClear() {
      engine.stop(true);
      status.reset();
      setAsks([]);
    },
  };
}

export { DOC_KINDS };
