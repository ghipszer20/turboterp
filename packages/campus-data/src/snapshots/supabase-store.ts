// Snapshots in Supabase: a private Storage bucket for most keys, and the snapshot_hot table for the
// "hot" ones (below), through the plain REST APIs (fetch, no client library). Server-only: it holds the
// service-role key, so never import this from a "use client" file.
//
// Why two places: every Storage request writes ~4.4 KB of Supabase logs, a PostgREST request ~1 KB, and the
// Free plan ingests 1 GB of logs a month. The keys written or read on every cron run are therefore in a table.

import { checkKey, defaultSnapshotDir, FileSnapshotStore, SNAPSHOT_SCHEMA, type Snapshot, type SnapshotStore } from "./store.ts";

/** The most entries one Storage list request returns. */
const PAGE = 1000;

/** Keys kept in the snapshot_hot table: the seats row, the current term, room availability and its status. */
export function isHotKey(key: string): boolean {
  return /^schedule\/[^/]+\/seats$/.test(key) || key === "schedule/current" || key.startsWith("rooms/") || key.startsWith("status/rooms/");
}
/** Prefixes whose listing can include hot keys. */
const mayHoldHotKeys = (prefix: string) => /^(rooms|status|schedule)(\/|$)/.test(prefix);

export type SupabaseSnapshotStoreOptions = {
  url: string;
  serviceKey: string;
  bucket?: string;
  fetch?: typeof globalThis.fetch;
};

/** Key "dining/2026-09-25/19" → object <bucket>/dining/2026-09-25/19.json, wrapped like the file store's files. */
export class SupabaseSnapshotStore implements SnapshotStore {
  private readonly base: string;
  private readonly rest: string;
  private readonly serviceKey: string;
  private readonly bucket: string;
  private readonly fetchFn: typeof globalThis.fetch;

  constructor(opts: SupabaseSnapshotStoreOptions) {
    const root = opts.url.replace(/\/+$/, "");
    this.base = `${root}/storage/v1/object`;
    this.rest = `${root}/rest/v1/snapshot_hot`;
    this.serviceKey = opts.serviceKey;
    this.bucket = opts.bucket ?? "snapshots";
    this.fetchFn = opts.fetch ?? globalThis.fetch;
  }

  private auth(headers: Record<string, string> = {}): Record<string, string> {
    return { Authorization: `Bearer ${this.serviceKey}`, apikey: this.serviceKey, ...headers };
  }

  private send(method: string, path: string, json?: string, headers: Record<string, string> = {}): Promise<Response> {
    return this.fetchFn(`${this.base}/${path}`, {
      method,
      headers: this.auth({ ...(json === undefined ? {} : { "content-type": "application/json" }), ...headers }),
      body: json,
    });
  }

  private table(method: string, query: string, json?: string, headers: Record<string, string> = {}): Promise<Response> {
    return this.fetchFn(`${this.rest}${query}`, {
      method,
      headers: this.auth({ ...(json === undefined ? {} : { "content-type": "application/json" }), ...headers }),
      body: json,
    });
  }

  private object(key: string): string {
    checkKey(key);
    return `${this.bucket}/${key}.json`;
  }

  async get<T>(key: string): Promise<Snapshot<T> | null> {
    if (!isHotKey(key)) return this.storageGet<T>(key);
    checkKey(key);
    const res = await this.table("GET", `?key=eq.${encodeURIComponent(key)}&select=updated_at,data`);
    if (!res.ok) throw failure("get", key, res);
    const rows = (await res.json()) as { updated_at: string; data: T }[];
    if (rows[0]) return { updatedAt: new Date(rows[0].updated_at).toISOString(), data: rows[0].data };
    // Written before the table existed: take the Storage copy and move it into the table, once.
    const old = await this.storageGet<T>(key);
    if (old) await this.put(key, old);
    return old;
  }

  async put<T>(key: string, snapshot: Snapshot<T>): Promise<void> {
    if (!isHotKey(key)) return this.storagePut(key, snapshot);
    checkKey(key);
    const res = await this.table(
      "POST",
      "?on_conflict=key",
      JSON.stringify({ key, updated_at: snapshot.updatedAt, data: snapshot.data }),
      { Prefer: "resolution=merge-duplicates,return=minimal" },
    );
    if (!res.ok) throw failure("put", key, res);
  }

  async list(prefix: string): Promise<string[]> {
    const keys = await this.storageList(prefix);
    if (!mayHoldHotKeys(prefix)) return keys;
    // Table keys under the prefix: "<prefix>/" <= key < "<prefix>0" ("0" is the character after "/").
    const res = await this.table("GET", `?select=key&key=gte.${encodeURIComponent(`${prefix}/`)}&key=lt.${encodeURIComponent(`${prefix}0`)}&limit=${PAGE}`);
    if (!res.ok) throw failure("list", prefix, res);
    const found = ((await res.json()) as { key: string }[]).map((r) => r.key).filter(isHotKey);
    return [...new Set([...keys, ...found])];
  }

  async delete(key: string): Promise<void> {
    if (isHotKey(key)) {
      checkKey(key);
      const res = await this.table("DELETE", `?key=eq.${encodeURIComponent(key)}`, undefined, { Prefer: "return=minimal" });
      if (!res.ok) throw failure("delete", key, res);
    }
    // Also any copy still in Storage (hot keys written before the table existed), or a plain Storage key.
    await this.storageDelete(key);
  }

  private async storageGet<T>(key: string): Promise<Snapshot<T> | null> {
    const res = await this.send("GET", this.object(key));
    if (res.status === 404 || res.status === 400) return null; // Storage answers 400 for a missing object
    if (!res.ok) throw failure("get", key, res);
    let env: Partial<Snapshot<T>> & { schema?: number };
    try {
      env = JSON.parse(await res.text());
    } catch {
      return null; // corrupt: callers treat it as "no snapshot", like the file store
    }
    if (env?.schema !== SNAPSHOT_SCHEMA || typeof env.updatedAt !== "string") return null;
    return { updatedAt: env.updatedAt, data: env.data as T };
  }

  private async storagePut<T>(key: string, snapshot: Snapshot<T>): Promise<void> {
    const body = JSON.stringify({ schema: SNAPSHOT_SCHEMA, key, updatedAt: snapshot.updatedAt, data: snapshot.data });
    const res = await this.send("POST", this.object(key), body, { "x-upsert": "true" });
    if (!res.ok) throw failure("put", key, res);
  }

  /** Storage lists one folder level per request, so folders (entries with no id) are walked in turn. */
  private async storageList(prefix: string): Promise<string[]> {
    checkKey(prefix);
    const keys: string[] = [];
    const folders = [prefix];
    for (let folder = folders.shift(); folder !== undefined; folder = folders.shift()) {
      for (let offset = 0, full = true; full; offset += PAGE) {
        const res = await this.send("POST", `list/${this.bucket}`, JSON.stringify({ prefix: folder, limit: PAGE, offset }));
        if (!res.ok) throw failure("list", folder, res);
        const entries = (await res.json()) as { name: string; id: string | null }[];
        for (const { name, id } of entries) {
          if (id === null) folders.push(`${folder}/${name}`);
          else if (name.endsWith(".json")) keys.push(`${folder}/${name.slice(0, -".json".length)}`);
        }
        full = entries.length === PAGE;
      }
    }
    return keys;
  }

  private async storageDelete(key: string): Promise<void> {
    checkKey(key);
    const res = await this.send("DELETE", this.bucket, JSON.stringify({ prefixes: [`${key}.json`] }));
    if (!res.ok) throw failure("delete", key, res);
  }
}

const failure = (op: string, key: string, res: Response) => new Error(`Supabase ${op} failed for "${key}": HTTP ${res.status}`);

/** The Supabase store when the service key and the project URL are set, else the local file store. */
export function openSnapshotStore(
  env: Record<string, string | undefined> = process.env,
  cwd: string = process.cwd(),
): SnapshotStore {
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceKey) return new SupabaseSnapshotStore({ url, serviceKey });
  return new FileSnapshotStore(defaultSnapshotDir(cwd, env));
}
