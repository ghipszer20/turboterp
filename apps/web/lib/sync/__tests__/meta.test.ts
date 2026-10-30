import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SYNC_KEY, createMetaStore } from "../meta";

function stubStorage(data: Record<string, string> = {}) {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => data[k] ?? null,
      setItem: (k: string, v: string) => void (data[k] = v),
      removeItem: (k: string) => void delete data[k],
    },
  });
  return data;
}

describe("meta store", () => {
  beforeEach(() => stubStorage());
  afterEach(() => vi.unstubAllGlobals());

  it("starts empty", () => expect(createMetaStore().load()).toEqual({ userId: null, revs: {} }));

  it("round-trips", () => {
    const m = createMetaStore();
    m.save({ userId: "u", revs: { plan: 2 } });
    expect(createMetaStore().load()).toEqual({ userId: "u", revs: { plan: 2 } });
  });

  it("ignores garbage and bad revs", () => {
    const data = stubStorage({ [SYNC_KEY]: "{nope" });
    expect(createMetaStore().load()).toEqual({ userId: null, revs: {} });
    data[SYNC_KEY] = JSON.stringify({ userId: 5, revs: { plan: "x", schedule: 3, other: 1 } });
    expect(createMetaStore().load()).toEqual({ userId: null, revs: { schedule: 3 } });
  });

  it("clear removes the key", () => {
    const data = stubStorage();
    const m = createMetaStore();
    m.save({ userId: "u", revs: {} });
    m.clear();
    expect(data[SYNC_KEY]).toBeUndefined();
  });

  it("survives blocked storage, keeping the value in memory", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {
          throw new Error("blocked");
        },
        removeItem: () => {
          throw new Error("blocked");
        },
      },
    });
    const m = createMetaStore();
    expect(m.load()).toEqual({ userId: null, revs: {} });
    m.save({ userId: "u", revs: { plan: 1 } });
    expect(m.load()).toEqual({ userId: "u", revs: { plan: 1 } });
    expect(() => m.clear()).not.toThrow();
    expect(m.load()).toEqual({ userId: null, revs: {} });
  });
});
