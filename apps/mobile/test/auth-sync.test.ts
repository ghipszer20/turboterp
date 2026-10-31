import { describe, expect, it, vi } from "vitest";
import type { KeyValueStore } from "@turboterp/app-core/key-value-store";
import { emptySaved, SAVED_KEY } from "@turboterp/app-core/schedule/saved";
import type { DocKind, Remote, SaveResult } from "@turboterp/app-core/sync/remote";
import { createMobileSync } from "../src/auth/sync";

const mem = (): KeyValueStore & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return { data, get: (k) => data.get(k) ?? null, set: (k, v) => void data.set(k, v), remove: (k) => void data.delete(k) };
};

function fakeRemote(server: Partial<Record<DocKind, [unknown, number]>> = {}) {
  const docs = new Map<DocKind, { body: unknown; rev: number }>();
  for (const [k, v] of Object.entries(server)) docs.set(k as DocKind, { body: v![0], rev: v![1] });
  const remote: Remote = {
    fetchRevs: async () => [...docs].map(([kind, d]) => ({ kind, rev: d.rev })),
    fetchDoc: async (k) => docs.get(k) ?? null,
    saveDoc: vi.fn(async (k, body, expected): Promise<SaveResult> => {
      const cur = docs.get(k);
      if ((cur?.rev ?? null) !== expected) return { ok: false, reason: "conflict" };
      const rev = (cur?.rev ?? 0) + 1;
      docs.set(k, { body, rev });
      return { ok: true, rev };
    }),
  };
  return { remote, docs };
}

const sched = (term: string) => emptySaved(term);

describe("createMobileSync", () => {
  it("downloads the account's copy when this phone has none (no question)", async () => {
    const kv = mem();
    const { remote } = fakeRemote({ schedule: [sched("202608"), 3] });
    const s = createMobileSync({ kv, remote });
    await s.engine.start("u1");
    expect(s.getAsks()).toEqual([]);
    expect(JSON.parse(kv.data.get(SAVED_KEY)!).term).toBe("202608");
  });

  it("asks once when both copies exist and differ, then keeps the chosen one", async () => {
    const kv = mem();
    kv.data.set(SAVED_KEY, JSON.stringify(sched("202601")));
    const { remote, docs } = fakeRemote({ schedule: [sched("202608"), 3] });
    const s = createMobileSync({ kv, remote });
    const changed = vi.fn();
    s.subscribeAsks(changed);
    await s.engine.start("u1");
    expect(s.getAsks()).toHaveLength(1);
    expect(s.getAsks()[0].kind).toBe("schedule");
    expect(changed).toHaveBeenCalled();
    await s.resolve("schedule", "local");
    expect(s.getAsks()).toEqual([]);
    expect((docs.get("schedule")!.body as { term: string }).term).toBe("202601");
    expect(docs.get("schedule")!.rev).toBe(4);
  });

  it("keeping the account's copy replaces the phone's", async () => {
    const kv = mem();
    kv.data.set(SAVED_KEY, JSON.stringify(sched("202601")));
    const { remote } = fakeRemote({ schedule: [sched("202608"), 3] });
    const s = createMobileSync({ kv, remote });
    await s.engine.start("u1");
    await s.resolve("schedule", "remote");
    expect(JSON.parse(kv.data.get(SAVED_KEY)!).term).toBe("202608");
  });

  it("uploads a phone-only copy and a later edit after the save delay", async () => {
    vi.useFakeTimers();
    try {
      const kv = mem();
      kv.data.set(SAVED_KEY, JSON.stringify(sched("202601")));
      const { remote, docs } = fakeRemote();
      const s = createMobileSync({ kv, remote });
      await s.engine.start("u1");
      expect(docs.get("schedule")?.rev).toBe(1);
      kv.data.set(SAVED_KEY, JSON.stringify(sched("202602")));
      s.localChanged("schedule");
      await vi.advanceTimersByTimeAsync(3500);
      expect((docs.get("schedule")!.body as { term: string }).term).toBe("202602");
    } finally {
      vi.useRealTimers();
    }
  });

  it("stopAndClear removes the synced copies from the phone", async () => {
    const kv = mem();
    const { remote } = fakeRemote({ schedule: [sched("202608"), 1] });
    const s = createMobileSync({ kv, remote });
    await s.engine.start("u1");
    s.stopAndClear();
    expect(kv.data.get(SAVED_KEY) ?? null).toBeNull();
  });
});
