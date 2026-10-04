// SupabaseSnapshotStore and openSnapshotStore against an in-memory fake of the Storage REST API.

import { describe, expect, it } from "vitest";
import {
  FileSnapshotStore,
  openSnapshotStore,
  SNAPSHOT_SCHEMA,
  SupabaseSnapshotStore,
} from "../src/snapshots/index.ts";

const URL_ = "https://proj.supabase.co";

function fakeStorage(opts: { fail?: number } = {}) {
  const objects = new Map<string, string>();
  const requests: { method: string; url: string; headers: Record<string, string>; body?: string }[] = [];
  const fetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    const method = init?.method ?? "GET";
    const headers = (init?.headers ?? {}) as Record<string, string>;
    const body = init?.body as string | undefined;
    requests.push({ method, url, headers, body });
    if (opts.fail) return new Response("boom", { status: opts.fail });
    const rel = url.slice(`${URL_}/storage/v1/object/`.length);
    if (method === "POST" && rel.startsWith("list/")) {
      const bucket = rel.slice(5);
      const { prefix, limit, offset } = JSON.parse(body!);
      const dir = `${bucket}/${prefix}/`;
      const seen = new Map<string, { name: string; id: string | null }>();
      for (const k of [...objects.keys()].sort()) {
        if (!k.startsWith(dir)) continue;
        const [head, ...tail] = k.slice(dir.length).split("/");
        seen.set(head, { name: head, id: tail.length ? null : "id-" + head });
      }
      return Response.json([...seen.values()].slice(offset, offset + limit));
    }
    if (method === "POST") {
      objects.set(rel, body!);
      return Response.json({});
    }
    if (method === "DELETE") {
      for (const p of JSON.parse(body!).prefixes) objects.delete(`${rel}/${p}`);
      return Response.json([]);
    }
    const found = objects.get(rel);
    return found === undefined ? new Response("{}", { status: 400 }) : new Response(found);
  };
  return { objects, requests, fetch: fetch as typeof globalThis.fetch };
}

const make = (f = fakeStorage()) => ({
  f,
  store: new SupabaseSnapshotStore({ url: URL_, serviceKey: "k", fetch: f.fetch }),
});

describe("SupabaseSnapshotStore", () => {
  it("returns null for a key that was never written", async () => {
    expect(await make().store.get("libraries/hours")).toBeNull();
  });

  it("reads back what was put and stores the wrapper JSON with upsert and auth headers", async () => {
    const { f, store } = make();
    await store.put("dining/2026-09-25/19", { updatedAt: "2026-09-25T09:00:00.000Z", data: { meals: ["Lunch"] } });
    expect(await store.get("dining/2026-09-25/19")).toEqual({
      updatedAt: "2026-09-25T09:00:00.000Z",
      data: { meals: ["Lunch"] },
    });
    const put = f.requests[0];
    expect(put.method).toBe("POST");
    expect(put.url).toBe(`${URL_}/storage/v1/object/snapshots/dining/2026-09-25/19.json`);
    expect(put.headers["x-upsert"]).toBe("true");
    expect(put.headers["content-type"]).toBe("application/json");
    expect(JSON.parse(put.body!)).toEqual({
      schema: SNAPSHOT_SCHEMA,
      key: "dining/2026-09-25/19",
      updatedAt: "2026-09-25T09:00:00.000Z",
      data: { meals: ["Lunch"] },
    });
    for (const r of f.requests) {
      expect(r.headers.Authorization).toBe("Bearer k");
      expect(r.headers.apikey).toBe("k");
    }
  });

  it("replaces an existing snapshot", async () => {
    const { store } = make();
    await store.put("libraries/hours", { updatedAt: "a", data: "old" });
    await store.put("libraries/hours", { updatedAt: "b", data: "new" });
    expect((await store.get("libraries/hours"))?.data).toBe("new");
  });

  it("treats another schema version, or unparseable JSON, as missing", async () => {
    const { f, store } = make();
    f.objects.set(
      "snapshots/a/b.json",
      JSON.stringify({ schema: SNAPSHOT_SCHEMA + 1, key: "a/b", updatedAt: "x", data: [] }),
    );
    f.objects.set("snapshots/a/c.json", "{ not json");
    expect(await store.get("a/b")).toBeNull();
    expect(await store.get("a/c")).toBeNull();
  });

  it("rejects invalid keys", async () => {
    const { store } = make();
    await expect(store.put("../evil", { updatedAt: "x", data: 1 })).rejects.toThrow(/invalid snapshot key/i);
    await expect(store.get("a//b")).rejects.toThrow(/invalid snapshot key/i);
    await expect(store.list("a//b")).rejects.toThrow(/invalid snapshot key/i);
    await expect(store.delete("../x")).rejects.toThrow(/invalid snapshot key/i);
  });

  it("lists keys under a prefix recursively, without .json", async () => {
    const { store } = make();
    await store.put("rooms/2026-09-25/6745-23066", { updatedAt: "x", data: 1 });
    await store.put("rooms/2026-09-26/6745-23066", { updatedAt: "x", data: 1 });
    await store.put("dining/2026-09-25/19", { updatedAt: "x", data: 1 });
    expect((await store.list("rooms")).sort()).toEqual(["rooms/2026-09-25/6745-23066", "rooms/2026-09-26/6745-23066"]);
    expect(await store.list("dining")).toEqual(["dining/2026-09-25/19"]);
    expect(await store.list("nothing")).toEqual([]);
  });

  it("pages through lists longer than 1000 entries", async () => {
    const { f, store } = make();
    for (let i = 0; i < 1203; i++) f.objects.set(`snapshots/big/k${i}.json`, "{}");
    const keys = await store.list("big");
    expect(keys).toHaveLength(1203);
    expect(new Set(keys).size).toBe(1203);
    expect(f.requests.filter((r) => r.url.includes("/list/"))).toHaveLength(2);
  });

  it("deletes a key, and deleting a missing key does not throw", async () => {
    const { store } = make();
    await store.put("dining/2026-09-25/19", { updatedAt: "x", data: 1 });
    await store.delete("dining/2026-09-25/19");
    expect(await store.get("dining/2026-09-25/19")).toBeNull();
    await expect(store.delete("dining/2026-09-25/19")).resolves.toBeUndefined();
  });

  it("throws with status and key on other failures", async () => {
    const { store } = make(fakeStorage({ fail: 500 }));
    await expect(store.get("a/b")).rejects.toThrow(/500.*a\/b/);
    await expect(store.put("a/b", { updatedAt: "x", data: 1 })).rejects.toThrow(/500.*a\/b/);
    await expect(store.list("a")).rejects.toThrow(/500/);
    await expect(store.delete("a/b")).rejects.toThrow(/500.*a\/b/);
  });
});

describe("openSnapshotStore", () => {
  it("uses Supabase when the service key and a URL are set", () => {
    expect(openSnapshotStore({ SUPABASE_SERVICE_ROLE_KEY: "k", SUPABASE_URL: URL_ })).toBeInstanceOf(
      SupabaseSnapshotStore,
    );
    expect(openSnapshotStore({ SUPABASE_SERVICE_ROLE_KEY: "k", NEXT_PUBLIC_SUPABASE_URL: URL_ })).toBeInstanceOf(
      SupabaseSnapshotStore,
    );
  });

  it("falls back to the file store otherwise", () => {
    const s = openSnapshotStore({ TURBOTERP_SNAPSHOT_DIR: "/data/snaps" });
    expect(s).toBeInstanceOf(FileSnapshotStore);
    expect((s as FileSnapshotStore).dir).toBe("/data/snaps");
    expect(openSnapshotStore({ SUPABASE_URL: URL_, TURBOTERP_SNAPSHOT_DIR: "/d" })).toBeInstanceOf(FileSnapshotStore);
    expect(openSnapshotStore({ SUPABASE_SERVICE_ROLE_KEY: "k", TURBOTERP_SNAPSHOT_DIR: "/d" })).toBeInstanceOf(
      FileSnapshotStore,
    );
  });
});
