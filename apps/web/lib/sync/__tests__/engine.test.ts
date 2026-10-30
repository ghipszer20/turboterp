import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { createSyncEngine } from "../engine";
import type { DocKind, Remote, SaveResult } from "../remote";
import type { MetaStore, SyncMeta } from "../meta";

const KINDS: DocKind[] = ["plan", "schedule", "registration"];

function setup(opts: { local?: Partial<Record<DocKind, string>>; server?: Partial<Record<DocKind, [unknown, number]>>; meta?: SyncMeta } = {}) {
  const server = new Map<DocKind, { body: unknown; rev: number }>();
  for (const [k, v] of Object.entries(opts.server ?? {})) server.set(k as DocKind, { body: v![0], rev: v![1] });
  const local: Record<string, string | null> = { plan: null, schedule: null, registration: null, ...opts.local };
  let saveOverride: SaveResult | null = null;

  const remote = {
    fetchRevs: vi.fn(async () => [...server].map(([kind, d]) => ({ kind, rev: d.rev }))),
    fetchDoc: vi.fn(async (k: DocKind) => server.get(k) ?? null),
    saveDoc: vi.fn(async (k: DocKind, body: unknown, expected: number | null): Promise<SaveResult> => {
      if (saveOverride) return saveOverride;
      const cur = server.get(k);
      if ((cur?.rev ?? null) !== expected) return { ok: false, reason: "conflict" };
      const rev = (cur?.rev ?? 0) + 1;
      server.set(k, { body, rev });
      return { ok: true, rev };
    }),
  } satisfies Remote;

  let metaVal: SyncMeta = opts.meta ?? { userId: null, revs: {} };
  const meta: MetaStore & { clear: ReturnType<typeof vi.fn> } = {
    load: () => metaVal,
    save: (m) => void (metaVal = m),
    clear: vi.fn(() => void (metaVal = { userId: null, revs: {} })),
  };

  const valid = { value: true };
  const docs = Object.fromEntries(
    KINDS.map((k) => [
      k,
      {
        read: () => local[k],
        replace: vi.fn((raw: string | null) => void (local[k] = raw)),
        validate: vi.fn(() => valid.value),
      },
    ]),
  ) as unknown as Record<
    DocKind,
    { read(): string | null; replace: Mock<(raw: string | null) => void>; validate: Mock<(raw: string) => boolean> }
  >;

  let onlineCb: (() => void) | null = null;
  const onAsk = vi.fn();
  const onError = vi.fn();
  const engine = createSyncEngine({
    remote,
    meta,
    docs,
    now: () => Date.now(),
    setTimer: (fn, ms) => setTimeout(fn, ms),
    clearTimer: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
    listenOnline: (cb) => {
      onlineCb = cb;
      return () => void (onlineCb = null);
    },
    onAsk,
    onError,
  });
  return {
    engine, remote, meta, docs, local, server, valid, onAsk, onError,
    getMeta: () => metaVal,
    setSave: (r: SaveResult | null) => void (saveOverride = r),
    fireOnline: () => onlineCb?.(),
  };
}

const J = (v: unknown) => JSON.stringify(v);

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("saving", () => {
  it("three changes within 3 s make one save", async () => {
    const t = setup({ local: { plan: J({ a: 1 }) }, meta: { userId: "u", revs: {} } });
    await t.engine.start("u");
    t.remote.saveDoc.mockClear();
    t.engine.localChanged("plan");
    await vi.advanceTimersByTimeAsync(1000);
    t.engine.localChanged("plan");
    await vi.advanceTimersByTimeAsync(1000);
    t.engine.localChanged("plan");
    await vi.advanceTimersByTimeAsync(2999);
    expect(t.remote.saveDoc).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(t.remote.saveDoc).toHaveBeenCalledTimes(1);
  });

  it("flush saves at once and records the returned rev", async () => {
    const t = setup({ meta: { userId: "u", revs: {} } });
    await t.engine.start("u");
    t.local.plan = J({ a: 2 });
    t.engine.localChanged("plan");
    await t.engine.flush();
    expect(t.remote.saveDoc).toHaveBeenCalledWith("plan", { a: 2 }, null);
    expect(t.getMeta().revs.plan).toBe(1);
    await vi.advanceTimersByTimeAsync(5000);
    expect(t.remote.saveDoc).toHaveBeenCalledTimes(1);
  });

  it("conflict saves this device's copy over the server's newer one, without asking", async () => {
    const t = setup({ meta: { userId: "u", revs: { plan: 1 } }, server: { plan: [{ a: 1 }, 1] } });
    await t.engine.start("u");
    t.local.plan = J({ a: 2 });
    t.server.set("plan", { body: { a: 9 }, rev: 2 });
    t.engine.localChanged("plan");
    await t.engine.flush();
    expect(t.onAsk).not.toHaveBeenCalled();
    expect(t.server.get("plan")).toEqual({ body: { a: 2 }, rev: 3 });
    expect(t.getMeta().revs.plan).toBe(3);
    expect(t.local.plan).toBe(J({ a: 2 }));
  });

  it("a conflict that conflicts again is retried on the next check, not looped", async () => {
    const t = setup({ meta: { userId: "u", revs: { plan: 1 } }, server: { plan: [{ a: 1 }, 1] } });
    await t.engine.start("u");
    t.local.plan = J({ a: 2 });
    t.setSave({ ok: false, reason: "conflict" });
    t.engine.localChanged("plan");
    await t.engine.flush();
    expect(t.remote.saveDoc).toHaveBeenCalledTimes(2);
    expect(t.onAsk).not.toHaveBeenCalled();
    t.setSave(null);
    vi.setSystemTime(Date.now() + 61_000);
    await t.engine.checkRemote();
    expect(t.remote.saveDoc).toHaveBeenCalledTimes(3);
    expect(t.server.get("plan")!.body).toEqual({ a: 2 });
  });

  it("too-large reports, keeps local, and does not retry", async () => {
    const t = setup({ meta: { userId: "u", revs: {} } });
    await t.engine.start("u");
    t.local.plan = J({ a: 1 });
    t.setSave({ ok: false, reason: "too-large" });
    t.engine.localChanged("plan");
    await t.engine.flush();
    await vi.advanceTimersByTimeAsync(600_000);
    t.fireOnline();
    await vi.advanceTimersByTimeAsync(10);
    expect(t.onError).toHaveBeenCalledWith("plan", "too-large");
    expect(t.remote.saveDoc).toHaveBeenCalledTimes(1);
    expect(t.local.plan).toBe(J({ a: 1 }));
  });

  it("offline retries when the online event fires", async () => {
    const t = setup({ meta: { userId: "u", revs: {} } });
    await t.engine.start("u");
    t.local.plan = J({ a: 1 });
    t.setSave({ ok: false, reason: "offline" });
    t.engine.localChanged("plan");
    await t.engine.flush();
    expect(t.remote.saveDoc).toHaveBeenCalledTimes(1);
    t.setSave(null);
    t.fireOnline();
    await vi.advanceTimersByTimeAsync(10);
    expect(t.remote.saveDoc).toHaveBeenCalledTimes(2);
    expect(t.getMeta().revs.plan).toBe(1);
  });
});

describe("checking the server", () => {
  it("equal rev makes no fetchDoc call", async () => {
    const t = setup({ meta: { userId: "u", revs: { plan: 3 } }, server: { plan: [{ a: 1 }, 3] }, local: { plan: J({ a: 1 }) } });
    await t.engine.start("u");
    expect(t.remote.fetchRevs).toHaveBeenCalled();
    expect(t.remote.fetchDoc).not.toHaveBeenCalled();
  });

  it("newer remote with unchanged local downloads and replaces", async () => {
    const t = setup({ meta: { userId: "u", revs: { plan: 1 } }, server: { plan: [{ a: 2 }, 2] }, local: { plan: J({ a: 1 }) } });
    await t.engine.start("u");
    expect(t.docs.plan.replace).toHaveBeenCalledWith(J({ a: 2 }));
    expect(t.getMeta().revs.plan).toBe(2);
    expect(t.onAsk).not.toHaveBeenCalled();
  });

  it("newer remote with unsaved local edits uploads them instead of asking", async () => {
    const t = setup({ meta: { userId: "u", revs: { plan: 1 } }, server: { plan: [{ a: 1 }, 1] }, local: { plan: J({ a: 1 }) } });
    await t.engine.start("u");
    t.engine.localChanged("plan");
    t.server.set("plan", { body: { a: 2 }, rev: 2 });
    vi.setSystemTime(Date.now() + 61_000);
    await t.engine.checkRemote();
    expect(t.onAsk).not.toHaveBeenCalled();
    expect(t.docs.plan.replace).not.toHaveBeenCalled();
    expect(t.server.get("plan")).toEqual({ body: { a: 1 }, rev: 3 });
  });

  it("an unsaved edit survives a reload: newer remote then uploads it, never asks", async () => {
    const t = setup({
      meta: { userId: "u", revs: { plan: 1 }, dirty: ["plan"] },
      server: { plan: [{ a: 2 }, 2] },
      local: { plan: J({ a: 1 }) },
    });
    await t.engine.start("u");
    expect(t.onAsk).not.toHaveBeenCalled();
    expect(t.docs.plan.replace).not.toHaveBeenCalled();
    expect(t.server.get("plan")).toEqual({ body: { a: 1 }, rev: 3 });
  });

  it("a downloaded body that fails validate is not applied", async () => {
    const t = setup({ meta: { userId: "u", revs: { plan: 1 } }, server: { plan: [{ bad: true }, 2] }, local: { plan: J({ a: 1 }) } });
    t.valid.value = false;
    await t.engine.start("u");
    expect(t.docs.plan.replace).not.toHaveBeenCalled();
    expect(t.onError).toHaveBeenCalledWith("plan", "error");
    expect(t.local.plan).toBe(J({ a: 1 }));
  });

  it("checkRemote is throttled to once per 60 s", async () => {
    const t = setup({ meta: { userId: "u", revs: {} } });
    await t.engine.start("u");
    t.remote.fetchRevs.mockClear();
    await t.engine.checkRemote();
    expect(t.remote.fetchRevs).not.toHaveBeenCalled();
    vi.setSystemTime(Date.now() + 60_000);
    await t.engine.checkRemote();
    expect(t.remote.fetchRevs).toHaveBeenCalledTimes(1);
    await t.engine.checkRemote();
    expect(t.remote.fetchRevs).toHaveBeenCalledTimes(1);
  });
});

describe("sign-in", () => {
  it("first sign-in with only local data uploads it", async () => {
    const t = setup({ local: { plan: J({ a: 1 }) } });
    await t.engine.start("u");
    expect(t.remote.saveDoc).toHaveBeenCalledWith("plan", { a: 1 }, null);
    expect(t.getMeta()).toEqual({ userId: "u", revs: { plan: 1 } });
  });

  it("first sign-in with only remote data downloads it", async () => {
    const t = setup({ server: { schedule: [{ s: 1 }, 4] } });
    await t.engine.start("u");
    expect(t.local.schedule).toBe(J({ s: 1 }));
    expect(t.getMeta().revs.schedule).toBe(4);
  });

  it("different copies ask, and resolve applies the choice", async () => {
    const t = setup({ local: { plan: J({ a: 1 }) }, server: { plan: [{ a: 2 }, 5] } });
    await t.engine.start("u");
    expect(t.onAsk).toHaveBeenCalledWith("plan", J({ a: 1 }), J({ a: 2 }));
    expect(t.remote.saveDoc).not.toHaveBeenCalled();
    await t.engine.resolve("plan", "local");
    expect(t.remote.saveDoc).toHaveBeenCalledWith("plan", { a: 1 }, 5);
    expect(t.getMeta().revs.plan).toBe(6);
  });

  it("resolve remote replaces the local copy", async () => {
    const t = setup({ local: { plan: J({ a: 1 }) }, server: { plan: [{ a: 2 }, 5] } });
    await t.engine.start("u");
    await t.engine.resolve("plan", "remote");
    expect(t.local.plan).toBe(J({ a: 2 }));
    expect(t.getMeta().revs.plan).toBe(5);
  });

  it("a different userId in meta with an empty account uploads silently", async () => {
    const t = setup({ local: { plan: J({ a: 1 }) }, meta: { userId: "other", revs: { plan: 7 } } });
    await t.engine.start("u");
    expect(t.onAsk).not.toHaveBeenCalled();
    expect(t.remote.saveDoc).toHaveBeenCalledWith("plan", { a: 1 }, null);
    expect(t.getMeta()).toEqual({ userId: "u", revs: { plan: 1 } });
  });

  it("a different userId in meta with a differing account copy asks", async () => {
    const t = setup({ local: { plan: J({ a: 1 }) }, server: { plan: [{ a: 2 }, 5] }, meta: { userId: "other", revs: { plan: 5 } } });
    await t.engine.start("u");
    expect(t.onAsk).toHaveBeenCalledWith("plan", J({ a: 1 }), J({ a: 2 }));
    expect(t.remote.saveDoc).not.toHaveBeenCalled();
  });

  it("equal copies with no known rev just remember the rev", async () => {
    const t = setup({ local: { plan: J({ b: 2, a: 1 }) }, server: { plan: [{ a: 1, b: 2 }, 5] } });
    await t.engine.start("u");
    expect(t.onAsk).not.toHaveBeenCalled();
    expect(t.remote.saveDoc).not.toHaveBeenCalled();
    expect(t.getMeta().revs.plan).toBe(5);
  });
});

describe("stop", () => {
  it("stop(true) clears the local documents and the sync meta, and stops timers", async () => {
    const t = setup({ meta: { userId: "u", revs: { plan: 1 } }, local: { plan: J({ a: 1 }) } });
    await t.engine.start("u");
    t.engine.localChanged("plan");
    t.engine.stop(true);
    for (const k of KINDS) expect(t.docs[k].replace).toHaveBeenCalledWith(null);
    expect(t.meta.clear).toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(5000);
    expect(t.remote.saveDoc).not.toHaveBeenCalled();
  });

  it("stop(false) keeps local data", async () => {
    const t = setup({ meta: { userId: "u", revs: {} }, local: { plan: J({ a: 1 }) } });
    await t.engine.start("u");
    t.engine.stop(false);
    expect(t.docs.plan.replace).not.toHaveBeenCalled();
    expect(t.meta.clear).not.toHaveBeenCalled();
  });
});
