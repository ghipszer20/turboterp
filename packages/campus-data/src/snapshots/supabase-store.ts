// Snapshots in a private Supabase Storage bucket, via the Storage REST API (plain fetch).
// Server-only: it holds the service-role key. Never import this from a "use client" file.

import {
  defaultSnapshotDir,
  FileSnapshotStore,
  SNAPSHOT_SCHEMA,
  type Snapshot,
  type SnapshotStore,
} from "./store.ts";

const KEY = /^[a-z0-9][a-z0-9_-]*(?:\/[a-z0-9][a-z0-9_-]*)*$/i;
const PAGE = 1000;

function checkKey(key: string): void {
  if (!KEY.test(key)) throw new Error(`Invalid snapshot key: ${JSON.stringify(key)}`);
}

export type SupabaseSnapshotStoreOptions = {
  url: string;
  serviceKey: string;
  bucket?: string;
  fetch?: typeof globalThis.fetch;
};

export class SupabaseSnapshotStore implements SnapshotStore {
  private readonly url: string;
  private readonly serviceKey: string;
  private readonly bucket: string;
  private readonly fetchFn: typeof globalThis.fetch;

  constructor(opts: SupabaseSnapshotStoreOptions) {
    this.url = opts.url.replace(/\/+$/, "");
    this.serviceKey = opts.serviceKey;
    this.bucket = opts.bucket ?? "snapshots";
    this.fetchFn = opts.fetch ?? globalThis.fetch;
  }

  private request(method: string, path: string, extra: Record<string, string> = {}, body?: string): Promise<Response> {
    const headers = { Authorization: `Bearer ${this.serviceKey}`, apikey: this.serviceKey, ...extra };
    return this.fetchFn(`${this.url}/storage/v1/object/${path}`, { method, headers, body });
  }

  private objectPath(key: string): string {
    checkKey(key);
    return `${this.bucket}/${key}.json`;
  }

  private fail(op: string, key: string, res: Response): Error {
    return new Error(`Supabase ${op} failed for "${key}": HTTP ${res.status}`);
  }

  async get<T>(key: string): Promise<Snapshot<T> | null> {
    const res = await this.request("GET", this.objectPath(key));
    if (res.status === 404 || res.status === 400) return null;
    if (!res.ok) throw this.fail("get", key, res);
    let env: { schema?: number; updatedAt?: unknown; data: T };
    try {
      env = JSON.parse(await res.text());
    } catch {
      return null; // corrupt: callers treat it as "no snapshot"
    }
    if (env?.schema !== SNAPSHOT_SCHEMA || typeof env.updatedAt !== "string") return null;
    return { updatedAt: env.updatedAt, data: env.data };
  }

  async put<T>(key: string, snapshot: Snapshot<T>): Promise<void> {
    const path = this.objectPath(key);
    const body = JSON.stringify({ schema: SNAPSHOT_SCHEMA, key, updatedAt: snapshot.updatedAt, data: snapshot.data });
    const res = await this.request("POST", path, { "x-upsert": "true", "content-type": "application/json" }, body);
    if (!res.ok) throw this.fail("put", key, res);
  }

  async list(prefix: string): Promise<string[]> {
    checkKey(prefix);
    const keys: string[] = [];
    const walk = async (folder: string): Promise<void> => {
      for (let offset = 0; ; offset += PAGE) {
        const res = await this.request(
          "POST",
          `list/${this.bucket}`,
          { "content-type": "application/json" },
          JSON.stringify({ prefix: folder, limit: PAGE, offset }),
        );
        if (!res.ok) throw this.fail("list", folder, res);
        const entries = (await res.json()) as { name: string; id: string | null }[];
        for (const entry of entries) {
          const entryKey = `${folder}/${entry.name}`;
          if (entry.id === null) await walk(entryKey);
          else if (entry.name.endsWith(".json")) keys.push(entryKey.slice(0, -".json".length));
        }
        if (entries.length < PAGE) return;
      }
    };
    await walk(prefix);
    return keys;
  }

  async delete(key: string): Promise<void> {
    checkKey(key);
    const res = await this.request(
      "DELETE",
      this.bucket,
      { "content-type": "application/json" },
      JSON.stringify({ prefixes: [`${key}.json`] }),
    );
    if (!res.ok) throw this.fail("delete", key, res);
  }
}

/** Supabase when the service key and URL are set, else the file store. */
export function openSnapshotStore(
  env: Record<string, string | undefined> = process.env,
  cwd: string = process.cwd(),
): SnapshotStore {
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceKey) return new SupabaseSnapshotStore({ url, serviceKey });
  return new FileSnapshotStore(defaultSnapshotDir(cwd, env));
}
