// Hot snapshot keys (seats, rooms, room status, schedule/current) live in the snapshot_hot table, reached through
// PostgREST; everything else stays in Storage. Fakes of both APIs.

import { describe, expect, it } from "vitest";
import { isHotKey, SNAPSHOT_SCHEMA, SupabaseSnapshotStore } from "../src/snapshots/index.ts";

const URL_ = "https://proj.supabase.co";

function fakes() {
  const objects = new Map<string, string>();
  const table = new Map<string, { updated_at: string; data: unknown }>();
  const requests: { method: string; url: string; body?: string; headers: Record<string, string> }[] = [];
  const fetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    const method = init?.method ?? "GET";
    const body = init?.body as string | undefined;
    const headers = (init?.headers ?? {}) as Record<string, string>;
    requests.push({ method, url, body, headers });
    if (url.startsWith(`${URL_}/rest/v1/snapshot_hot`)) {
      const q = new URL(url).searchParams;
      if (method === "POST") {
        const row = JSON.parse(body!) as { key: string; updated_at: string; data: unknown };
        table.set(row.key, { updated_at: row.updated_at, data: row.data });
        return new Response(null, { status: 201 });
      }
      if (method === "DELETE") {
        table.delete(q.get("key")!.replace(/^eq\./, ""));
        return new Response(null, { status: 204 });
      }
      if (q.get("key")?.startsWith("eq.")) {
        const row = table.get(q.get("key")!.slice(3));
        // PostgREST returns timestamptz as "+00:00"
        return Response.json(row ? [{ updated_at: row.updated_at.replace("Z", "+00:00"), data: row.data }] : []);
      }
      const lo = q.getAll("key").find((v) => v.startsWith("gte."))!.slice(4);
      const hi = q.getAll("key").find((v) => v.startsWith("lt."))!.slice(3);
      return Response.json([...table.keys()].filter((k) => k >= lo && k < hi).map((key) => ({ key })));
    }
    const rel = url.slice(`${URL_}/storage/v1/object/`.length);
    if (method === "POST" && rel.startsWith("list/")) {
      const { prefix } = JSON.parse(body!);
      const dir = `snapshots/${prefix}/`;
      const seen = new Map<string, { name: string; id: string | null }>();
      for (const k of [...objects.keys()].sort()) {
        if (!k.startsWith(dir)) continue;
        const [head = "", ...tail] = k.slice(dir.length).split("/");
        seen.set(head, { name: head, id: tail.length ? null : "id-" + head });
      }
      return Response.json([...seen.values()]);
    }
    if (method === "POST") { objects.set(rel, body!); return Response.json({}); }
    if (method === "DELETE") { for (const p of JSON.parse(body!).prefixes) objects.delete(`${rel}/${p}`); return Response.json([]); }
    const found = objects.get(rel);
    return found === undefined ? new Response("{}", { status: 400 }) : new Response(found);
  };
  return { objects, table, requests, fetch: fetch as typeof globalThis.fetch };
}
const make = () => {
  const f = fakes();
  return { f, store: new SupabaseSnapshotStore({ url: URL_, serviceKey: "k", fetch: f.fetch }) };
};

describe("isHotKey", () => {
  it("is true for the seats row, rooms, room status and the current term only", () => {
    for (const k of ["schedule/202701/seats", "schedule/current", "rooms/catalog", "rooms/2026-10-30/6745-23066", "status/rooms/2026-10-30/6745-23066", "status/rooms/catalog"]) expect(isHotKey(k), k).toBe(true);
    for (const k of ["schedule/202701/sections/CMSC", "schedule/202701/index", "dining/2026-10-30/19", "status/dining/2026-10-30/19", "libraries/hours", "calendar/academic", "schedule/202701/seats-chunk/0"]) expect(isHotKey(k), k).toBe(false);
  });
});

describe("hot keys in the snapshot_hot table", () => {
  it("put is one upsert request to PostgREST, and get reads it back with an ISO timestamp", async () => {
    const { f, store } = make();
    await store.put("schedule/202701/seats", { updatedAt: "2026-10-30T12:00:00.000Z", data: { v: 1, seats: { "CMSC131-0101": [1, 0, 0, 30] } } });
    expect(f.requests).toHaveLength(1);
    const put = f.requests[0]!;
    expect(put.method).toBe("POST");
    expect(put.url).toBe(`${URL_}/rest/v1/snapshot_hot?on_conflict=key`);
    expect(put.headers.Prefer).toBe("resolution=merge-duplicates,return=minimal");
    expect(put.headers.Authorization).toBe("Bearer k");
    expect(f.objects.size).toBe(0); // nothing in Storage
    expect(await store.get("schedule/202701/seats")).toEqual({ updatedAt: "2026-10-30T12:00:00.000Z", data: { v: 1, seats: { "CMSC131-0101": [1, 0, 0, 30] } } });
    expect(f.requests).toHaveLength(2); // one more request: the get
  });

  it("non-hot keys never touch the table", async () => {
    const { f, store } = make();
    await store.put("dining/2026-10-30/19", { updatedAt: "x", data: 1 });
    await store.get("dining/2026-10-30/19");
    expect(f.requests.every((r) => r.url.includes("/storage/v1/"))).toBe(true);
  });

  it("a miss falls back to the old Storage object and copies it into the table once", async () => {
    const { f, store } = make();
    f.objects.set("snapshots/rooms/catalog.json", JSON.stringify({ schema: SNAPSHOT_SCHEMA, key: "rooms/catalog", updatedAt: "2026-10-01T00:00:00.000Z", data: { rooms: [] } }));
    expect(await store.get("rooms/catalog")).toEqual({ updatedAt: "2026-10-01T00:00:00.000Z", data: { rooms: [] } });
    expect(f.table.has("rooms/catalog")).toBe(true);
    const before = f.requests.length;
    await store.get("rooms/catalog");
    expect(f.requests.length).toBe(before + 1); // table only now
  });

  it("a miss in both is null", async () => {
    expect(await make().store.get("schedule/202701/seats")).toBeNull();
  });

  it("list merges Storage keys with table keys, without duplicates", async () => {
    const { f, store } = make();
    f.objects.set("snapshots/rooms/2026-10-01/1-2.json", "{}");
    await store.put("rooms/2026-10-02/1-2", { updatedAt: "x", data: 1 });
    await store.put("rooms/2026-10-01/1-2", { updatedAt: "x", data: 1 });
    expect((await store.list("rooms")).sort()).toEqual(["rooms/2026-10-01/1-2", "rooms/2026-10-02/1-2"]);
    expect(await store.list("dining")).toEqual([]);
  });

  it("delete removes the row and any leftover Storage object", async () => {
    const { f, store } = make();
    f.objects.set("snapshots/rooms/2026-10-01/1-2.json", "{}");
    await store.put("rooms/2026-10-01/1-2", { updatedAt: "x", data: 1 });
    await store.delete("rooms/2026-10-01/1-2");
    expect(f.table.size).toBe(0);
    expect(f.objects.size).toBe(0);
    expect(await store.get("rooms/2026-10-01/1-2")).toBeNull();
  });

  it("throws with status and key on failure", async () => {
    const store = new SupabaseSnapshotStore({ url: URL_, serviceKey: "k", fetch: (async () => new Response("no", { status: 500 })) as typeof fetch });
    await expect(store.get("schedule/202701/seats")).rejects.toThrow(/seats.*500/);
    await expect(store.put("schedule/202701/seats", { updatedAt: "x", data: 1 })).rejects.toThrow(/seats.*500/);
  });
});
