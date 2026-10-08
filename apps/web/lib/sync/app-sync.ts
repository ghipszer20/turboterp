// The one sync engine for this page, built from the app's real pieces. Client only.
import { getAuthClient } from "../auth/client";
import { DOC_KINDS, type DocKind } from "./decide";
import { createDocAdapters } from "./adapters";
import { createSyncEngine } from "./engine";
import { setLocalChangedListener } from "./hooks";
import { createMetaStore, type MetaStore } from "./meta";
import { createRemote } from "./remote";
import { createSaveStatus } from "./status";

export type Ask = { kind: DocKind; local: string | null; remote: string | null };

function build() {
  const baseMeta = createMetaStore();
  const status = createSaveStatus(() => baseMeta.load().dirty ?? []);
  // Every meta write (dirty set changes, new revs) can change the status line.
  const meta: MetaStore = {
    load: () => baseMeta.load(),
    save: (m) => (baseMeta.save(m), status.notify()),
    clear: () => (baseMeta.clear(), status.notify()),
  };

  let asks: readonly Ask[] = [];
  const askSubs = new Set<() => void>();
  const setAsks = (next: readonly Ask[]) => {
    asks = next;
    askSubs.forEach((s) => s());
  };

  const engine = createSyncEngine({
    remote: createRemote(getAuthClient),
    meta,
    docs: createDocAdapters(),
    now: () => Date.now(),
    setTimer: (fn, ms) => setTimeout(fn, ms),
    clearTimer: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
    listenOnline: (cb) => {
      window.addEventListener("online", cb);
      return () => window.removeEventListener("online", cb);
    },
    onAsk: (kind, local, remote) => setAsks([...asks.filter((a) => a.kind !== kind), { kind, local, remote }]),
    onError: (kind) => status.onError(kind),
  });

  setLocalChangedListener((kind) => {
    engine.localChanged(kind);
    status.localChanged(kind);
  });

  return {
    engine,
    status,
    getAsks: () => asks,
    subscribeAsks(fn: () => void) {
      askSubs.add(fn);
      return () => void askSubs.delete(fn);
    },
    /** The student's answer in the chooser (already confirmed). */
    async resolve(kind: DocKind, keep: "local" | "remote") {
      setAsks(asks.filter((a) => a.kind !== kind));
      await engine.resolve(kind, keep);
    },
    /** Sign out: the synced copies leave this browser first (shared computers), then the session ends. */
    async signOutAndClear() {
      engine.stop(true);
      status.reset();
      setAsks([]);
      const client = await getAuthClient();
      await client.auth.signOut();
    },
  };
}

let instance: ReturnType<typeof build> | null = null;
export const getAppSync = () => (instance ??= build());
export { DOC_KINDS };
