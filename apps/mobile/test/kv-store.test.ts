import { describe, expect, it } from "vitest";
import { kvGet, kvSet } from "@turboterp/app-core/key-value-store";
import { createKeyValueStore, type SyncStorage } from "../src/kv-store";

function fakeStorage(): SyncStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItemSync: (k) => data.get(k) ?? null,
    setItemSync: (k, v) => void data.set(k, v),
    removeItemSync: (k) => void data.delete(k),
  };
}

describe("createKeyValueStore", () => {
  it("round-trips a value and removes it", () => {
    const fake = fakeStorage();
    const store = createKeyValueStore(fake);
    expect(store.get("a")).toBeNull();
    store.set("a", "1");
    expect(store.get("a")).toBe("1");
    expect(fake.data.get("a")).toBe("1");
    store.remove("a");
    expect(store.get("a")).toBeNull();
  });

  it("works with app-core's safe helpers, which treat null as remove", () => {
    const store = createKeyValueStore(fakeStorage());
    kvSet(store, "k", "v");
    expect(kvGet(store, "k")).toBe("v");
    kvSet(store, "k", null);
    expect(kvGet(store, "k")).toBeNull();
  });

  it("lets the helpers swallow a throwing storage", () => {
    const store = createKeyValueStore({
      getItemSync: () => {
        throw new Error("locked");
      },
      setItemSync: () => {
        throw new Error("locked");
      },
      removeItemSync: () => {
        throw new Error("locked");
      },
    });
    expect(kvGet(store, "k")).toBeNull();
    expect(() => kvSet(store, "k", "v")).not.toThrow();
  });
});
