import { describe, expect, it } from "vitest";
import { createChunkedStorage, type SecureBackend } from "../src/auth/secure-storage";

function fake(): SecureBackend & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItemAsync: async (k) => data.get(k) ?? null,
    setItemAsync: async (k, v) => void data.set(k, v),
    deleteItemAsync: async (k) => void data.delete(k),
  };
}

describe("createChunkedStorage", () => {
  it("round-trips a value over the 2 KB limit in pieces under it", async () => {
    const backend = fake();
    const s = createChunkedStorage(backend);
    const big = "x".repeat(5000);
    await s.setItem("sb-abc-auth-token", big);
    expect(await s.getItem("sb-abc-auth-token")).toBe(big);
    for (const v of backend.data.values()) expect(v.length).toBeLessThanOrEqual(1500);
    expect(backend.data.size).toBe(5); // 4 chunks + head
  });
  it("leaves no stale chunks when the value shrinks, and removes everything", async () => {
    const backend = fake();
    const s = createChunkedStorage(backend, 10);
    await s.setItem("k", "a".repeat(55));
    await s.setItem("k", "short");
    expect(await s.getItem("k")).toBe("short");
    expect(backend.data.size).toBe(2);
    await s.removeItem("k");
    expect(backend.data.size).toBe(0);
    expect(await s.getItem("k")).toBeNull();
  });
  it("returns null for a missing key or a torn write", async () => {
    const backend = fake();
    const s = createChunkedStorage(backend, 10);
    expect(await s.getItem("none")).toBeNull();
    await s.setItem("k", "b".repeat(25));
    backend.data.delete("k.1");
    expect(await s.getItem("k")).toBeNull();
  });
  it("reads a whole value stored by an older build", async () => {
    const backend = fake();
    backend.data.set("k", '{"a":1}');
    expect(await createChunkedStorage(backend).getItem("k")).toBe('{"a":1}');
  });
  it("sanitises keys SecureStore would reject", async () => {
    const backend = fake();
    await createChunkedStorage(backend).setItem("a:b/c", "v");
    expect([...backend.data.keys()].every((k) => /^[A-Za-z0-9._-]+$/.test(k))).toBe(true);
  });
});
