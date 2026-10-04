// Snapshots in a private Supabase Storage bucket, through the Storage REST API (plain fetch, no
// client library). Server-only: it holds the service-role key, so never import this from a
// "use client" file.

import { checkKey, defaultSnapshotDir, FileSnapshotStore, SNAPSHOT_SCHEMA, type Snapshot, type SnapshotStore } from "./store.ts";

/** The most entries one Storage list request returns. */
const PAGE = 1000;

export type SupabaseSnapshotStoreOptions = {
  url: string;
  serviceKey: string;
  bucket?: string;
  fetch?: typeof globalThis.fetch;
};

/** Key "dining/2026-09-25/19" → object <bucket>/dining/2026-09-25/19.json, wrapped like the file store's files. */
export class SupabaseSnapshotStore implements SnapshotStore {
  private readonly base: string;
  private readonly serviceKey: string;
  private readonly bucket: string;
  private readonly fetchFn: typeof globalThis.fetch;

  constructor(opts: SupabaseSnapshotStoreOptions) {
    this.base = `${opts.url.replace(/\/+$/, "")}/storage/v1/object`;
    this.serviceKey = opts.serviceKey;
    this.bucket = opts.bucket ?? "snapshots";
    this.fetchFn = opts.fetch ?? globalThis.fetch;
  }

  private send(method: string, path: string, json?: string, headers: Record<string, string> = {}): Promise<Response> {
    return this.fetchFn(`${this.base}/${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.serviceKey}`,
        apikey: this.serviceKey,
        ...(json === undefined ? {} : { "content-type": "application/json" }),
        ...headers,
      },
      body: json,
    });
  }

  private object(key: string): string {
    checkKey(key);
    return `${this.bucket}/${key}.json`;
  }

  async get<T>(key: string): Promise<Snapshot<T> | null> {
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

  async put<T>(key: string, snapshot: Snapshot<T>): Promise<void> {
    const body = JSON.stringify({ schema: SNAPSHOT_SCHEMA, key, updatedAt: snapshot.updatedAt, data: snapshot.data });
    const res = await this.send("POST", this.object(key), body, { "x-upsert": "true" });
    if (!res.ok) throw failure("put", key, res);
  }

  /** Storage lists one folder level per request, so folders (entries with no id) are walked in turn. */
  async list(prefix: string): Promise<string[]> {
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

  async delete(key: string): Promise<void> {
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
