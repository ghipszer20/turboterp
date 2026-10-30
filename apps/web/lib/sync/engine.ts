// The sync engine: debounced saves and revision tracking. Nothing here touches the UI or storage
// directly; the app passes in small adapters (see Deps) so tests can fake everything.
//
// While signed in the engine never asks: the newest change wins. A save that hits a revision conflict
// reads the server's current revision and saves this device's copy over it (one retry; a second
// conflict waits for the next change or check). On a check, a newer server copy is downloaded unless
// this device has unsaved edits, which are uploaded instead.
// The only question is at start(), when this browser's copy and the account's copy have never been
// synced with each other (no known revision for this user) and both exist and differ: onAsk, then
// resolve(kind, "local" | "remote") replaces the other side's copy.

import { DOC_KINDS, decideOnFocus, decideOnSignIn, type DocKind } from "./decide";
import type { MetaStore } from "./meta";
import type { Remote } from "./remote";

export type ErrorReason = "conflict" | "too-large" | "offline" | "auth" | "error";

export type Deps = {
  remote: Remote;
  meta: MetaStore;
  docs: Record<DocKind, { read(): string | null; replace(raw: string | null): void; validate(raw: string): boolean }>;
  now(): number;
  setTimer(fn: () => void, ms: number): unknown;
  clearTimer(handle: unknown): void;
  /** Subscribe to the browser's "online" event; returns an unsubscribe. */
  listenOnline(cb: () => void): () => void;
  /** Never synced with each other, and both copies exist and differ: the app asks which one to keep. */
  onAsk(kind: DocKind, local: string, remote: string): void;
  onError(kind: DocKind, reason: ErrorReason): void;
};

export const SAVE_DELAY_MS = 3000;
export const CHECK_INTERVAL_MS = 60_000;

export function createSyncEngine(deps: Deps) {
  const { remote, meta, docs } = deps;
  let active = false;
  let lastCheck = -Infinity;
  let unlistenOnline: (() => void) | null = null;
  const dirty = new Set<DocKind>();
  // Unsaved edits survive a reload: the dirty set is mirrored into the sync meta.
  const persistDirty = () => {
    const { dirty: _old, ...m } = meta.load();
    void _old;
    meta.save(dirty.size ? { ...m, dirty: [...dirty] } : m);
  };
  const markDirty = (kind: DocKind) => {
    dirty.add(kind);
    persistDirty();
  };
  const markClean = (kind: DocKind) => {
    dirty.delete(kind);
    persistDirty();
  };
  const asking = new Set<DocKind>();
  const retryOnline = new Set<DocKind>();
  // Saves that hit a conflict twice in a row: tried again on the next check.
  const conflicted = new Set<DocKind>();
  const timers = new Map<DocKind, unknown>();

  const setRev = (kind: DocKind, rev: number) => {
    const m = meta.load();
    meta.save({ ...m, revs: { ...m.revs, [kind]: rev } });
  };
  const ask = (kind: DocKind, local: string, remoteRaw: string) => {
    asking.add(kind);
    deps.onAsk(kind, local, remoteRaw);
  };
  const cancelTimer = (kind: DocKind) => {
    if (timers.has(kind)) deps.clearTimer(timers.get(kind));
    timers.delete(kind);
  };

  /** Apply a downloaded body if it passes the validator; otherwise keep the local copy. */
  function apply(kind: DocKind, doc: { body: unknown; rev: number }): boolean {
    const raw = JSON.stringify(doc.body);
    if (!docs[kind].validate(raw)) {
      deps.onError(kind, "error");
      return false;
    }
    docs[kind].replace(raw);
    setRev(kind, doc.rev);
    markClean(kind);
    return true;
  }

  async function save(kind: DocKind, retried = false): Promise<void> {
    cancelTimer(kind);
    if (!active || asking.has(kind)) return;
    const raw = docs[kind].read();
    if (raw === null) {
      markClean(kind);
      return;
    }
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      deps.onError(kind, "error");
      return;
    }
    const res = await remote.saveDoc(kind, body, meta.load().revs[kind] ?? null);
    if (!active) return;
    if (res.ok) {
      retryOnline.delete(kind);
      conflicted.delete(kind);
      setRev(kind, res.rev);
      if (docs[kind].read() === raw) markClean(kind);
      else schedule(kind); // changed while saving
      return;
    }
    if (res.reason === "conflict") {
      // Somebody saved in between. This device's copy is the newest change: save over the server's.
      if (retried) {
        conflicted.add(kind);
        return;
      }
      const cur = await remote.fetchDoc(kind).catch(() => null);
      if (!active) return;
      if (cur) setRev(kind, cur.rev);
      else {
        const m = meta.load();
        const { [kind]: _drop, ...rest } = m.revs;
        void _drop;
        meta.save({ ...m, revs: rest });
      }
      return save(kind, true);
    } else if (res.reason === "offline") {
      retryOnline.add(kind);
    } else {
      deps.onError(kind, res.reason); // too-large, auth, error: no automatic retry
    }
  }

  function schedule(kind: DocKind) {
    cancelTimer(kind);
    timers.set(kind, deps.setTimer(() => void save(kind), SAVE_DELAY_MS));
  }

  /** One pass over the server's revs for a known account. */
  async function pass(): Promise<void> {
    let revs;
    try {
      revs = await remote.fetchRevs();
    } catch {
      return; // offline or server trouble: try again next time
    }
    for (const kind of DOC_KINDS) {
      if (!active || asking.has(kind)) continue;
      if (conflicted.has(kind) && dirty.has(kind)) {
        await save(kind);
        continue;
      }
      const remoteRev = revs.find((r) => r.kind === kind)?.rev;
      const action = decideOnFocus(meta.load().revs[kind], remoteRev, dirty.has(kind));
      if (action === "nothing") continue;
      if (action === "upload") {
        await save(kind); // a stale revision conflicts once, then saves over the server's copy
        continue;
      }
      const doc = await remote.fetchDoc(kind).catch(() => null);
      if (doc) apply(kind, doc);
    }
  }

  async function start(userId: string): Promise<void> {
    active = true;
    unlistenOnline?.();
    unlistenOnline = deps.listenOnline(() => {
      for (const kind of [...retryOnline]) void save(kind);
    });
    const prev = meta.load();
    const sameUser = prev.userId === userId;
    const known = sameUser ? prev.revs : {};
    dirty.clear();
    for (const k of sameUser ? (prev.dirty ?? []) : []) dirty.add(k);
    meta.save({ userId, revs: { ...known }, ...(dirty.size ? { dirty: [...dirty] } : {}) });
    lastCheck = deps.now();

    let revs;
    try {
      revs = await remote.fetchRevs();
    } catch {
      return;
    }
    for (const kind of DOC_KINDS) {
      if (!active) return;
      const local = docs[kind].read();
      const remoteRev = revs.find((r) => r.kind === kind)?.rev;
      // Same version as last time: nothing to download (protects the download budget).
      if (known[kind] !== undefined && decideOnFocus(known[kind], remoteRev, dirty.has(kind)) === "nothing") continue;
      const doc = remoteRev === undefined ? null : await remote.fetchDoc(kind).catch(() => null);
      if (remoteRev !== undefined && !doc) continue;

      if (known[kind] !== undefined) {
        // This browser has synced this document with this account before: the newest change wins.
        const action = decideOnFocus(known[kind], doc?.rev, dirty.has(kind));
        if (action === "download" && doc) apply(kind, doc);
        else if (action === "upload") await save(kind);
        continue;
      }
      // Never synced with each other: the only case that may ask.
      const remoteRaw = doc ? JSON.stringify(doc.body) : null;
      const action = decideOnSignIn(local, remoteRaw);
      if (action === "download" && doc) apply(kind, doc);
      else if (action === "ask" && local !== null && remoteRaw !== null) ask(kind, local, remoteRaw);
      else if (action === "upload") {
        markDirty(kind);
        await save(kind);
      } else if (doc) setRev(kind, doc.rev); // identical: just remember the version
    }
  }

  return {
    start,

    localChanged(kind: DocKind): void {
      if (!active) return;
      markDirty(kind);
      if (!asking.has(kind)) schedule(kind);
    },

    async flush(): Promise<void> {
      await Promise.all([...dirty].map((kind) => save(kind)));
    },

    async checkRemote(): Promise<void> {
      if (!active) return;
      const t = deps.now();
      if (t - lastCheck < CHECK_INTERVAL_MS) return;
      lastCheck = t;
      await pass();
    },

    async resolve(kind: DocKind, keep: "local" | "remote"): Promise<void> {
      asking.delete(kind);
      const doc = await remote.fetchDoc(kind).catch(() => null);
      if (keep === "remote") {
        if (doc) apply(kind, doc); // keep the account's copy, replace this device's
        return;
      }
      // Keep local: save over the server's current version, which we just looked at.
      const m = meta.load();
      const { [kind]: _drop, ...rest } = m.revs;
      void _drop;
      meta.save({ ...m, revs: doc ? { ...rest, [kind]: doc.rev } : rest });
      markDirty(kind);
      await save(kind);
    },

    stop(clearLocal: boolean): void {
      active = false;
      for (const kind of [...timers.keys()]) cancelTimer(kind);
      unlistenOnline?.();
      unlistenOnline = null;
      dirty.clear();
      asking.clear();
      retryOnline.clear();
      conflicted.clear();
      if (clearLocal) {
        for (const kind of DOC_KINDS) docs[kind].replace(null);
        meta.clear();
      }
    },
  };
}
