import { beforeEach, describe, expect, it } from "vitest";
import type { KeyValueStore } from "../key-value-store";
import { SYNC_KEY, createMetaStore } from "./meta";

let data: Record<string, string> = {};
const kv: KeyValueStore = {
  get: (k) => data[k] ?? null,
  set: (k, v) => void (data[k] = v),
  remove: (k) => void delete data[k],
};
function stubStorage(init: Record<string, string> = {}) {
  data = init;
  return data;
}

describe("meta store", () => {
  beforeEach(() => stubStorage());

  it("starts empty", () => expect(createMetaStore(kv).load()).toEqual({ userId: null, revs: {} }));

  it("round-trips", () => {
    const m = createMetaStore(kv);
    m.save({ userId: "u", revs: { plan: 2 } });
    expect(createMetaStore(kv).load()).toEqual({ userId: "u", revs: { plan: 2 } });
  });

  it("ignores garbage and bad revs", () => {
    const data = stubStorage({ [SYNC_KEY]: "{nope" });
    expect(createMetaStore(kv).load()).toEqual({ userId: null, revs: {} });
    data[SYNC_KEY] = JSON.stringify({ userId: 5, revs: { plan: "x", schedule: 3, other: 1 } });
    expect(createMetaStore(kv).load()).toEqual({ userId: null, revs: { schedule: 3 } });
  });

  it("clear removes the key", () => {
    const data = stubStorage();
    const m = createMetaStore(kv);
    m.save({ userId: "u", revs: {} });
    m.clear();
    expect(data[SYNC_KEY]).toBeUndefined();
  });

  it("survives blocked storage, keeping the value in memory", () => {
    const blocked: KeyValueStore = {
      get: () => {
        throw new Error("blocked");
      },
      set: () => {
        throw new Error("blocked");
      },
      remove: () => {
        throw new Error("blocked");
      },
    };
    const m = createMetaStore(blocked);
    expect(m.load()).toEqual({ userId: null, revs: {} });
    m.save({ userId: "u", revs: { plan: 1 } });
    expect(m.load()).toEqual({ userId: "u", revs: { plan: 1 } });
    expect(() => m.clear()).not.toThrow();
    expect(m.load()).toEqual({ userId: null, revs: {} });
  });
});
